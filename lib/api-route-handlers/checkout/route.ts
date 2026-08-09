import { NextRequest, NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/utils/auth";
import { createRazorpayOrder, getRazorpayPublicConfig } from "@/utils/razorpay";
import {
  createWooCommerceOrder,
  ensurePositiveInt,
  getWooCommercePaymentConfig,
  mergeWooMetaData,
  parseAmountToMinorUnits,
  sanitizeText,
  updateWooCommerceOrder,
} from "@/utils/woocommerce-checkout";
import { calculateDelhiveryShippingRate } from "@/lib/delhivery";
import {
  calculateGiftFee,
  isEligibleForFreeShipping,
  isSamoraExclusiveCoupon,
  SAMORA_SHIPPING_FALLBACK_INR,
} from "@/lib/samora/pricing";
import { fetchLineItemTotals } from "@/lib/samora/pricing.server";
import { AFFILIATE_REF_COOKIE_NAME } from "@/lib/affiliates/constants";

export const runtime = "edge";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env["Project URL"] ||
  "";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env["Anon Key"] ||
  "";

type AffiliateRecord = {
  id: number;
  referral_code: string;
  commission_rate: number;
  status: string;
};

const findApprovedAffiliateByCode = async (
  referralCode: string
): Promise<AffiliateRecord | null> => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/affiliates?referral_code=eq.${encodeURIComponent(
        referralCode
      )}&status=eq.approved&select=id,referral_code,commission_rate,status&limit=1`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    if (!response.ok) return null;
    const rows = (await response.json()) as AffiliateRecord[];
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  } catch {
    return null;
  }
};

const recordAffiliateConversion = async (
  affiliate: AffiliateRecord,
  wcOrderId: number,
  orderTotal: number
): Promise<void> => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;

  const commissionAmount = orderTotal * affiliate.commission_rate;

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/affiliate_conversions`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        affiliate_id: affiliate.id,
        wc_order_id: wcOrderId,
        order_total: orderTotal,
        commission_rate_applied: affiliate.commission_rate,
        commission_amount: commissionAmount,
      }),
    });
  } catch {
    // Never let a commission-logging failure affect the checkout response —
    // the order itself already succeeded by the time this runs.
  }
};

type CheckoutLineItemInput = {
  productId: number;
  variationId?: number;
  quantity: number;
  frameLabel?: string;
  unitPrice?: number;
  orderTypeLabel?: string;
};

type CheckoutAddressInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
};

type CheckoutRequestBody = {
  lineItems: CheckoutLineItemInput[];
  billing: CheckoutAddressInput;
  shipping?: Partial<CheckoutAddressInput>;
  customerNote?: string;
  couponCode?: string;
  // Which storefront initiated checkout — shown as the payee name inside the
  // Razorpay modal. Defaults to Artace Studio so the existing checkout flow
  // (which never sends this field) is unaffected.
  storeName?: string;
  // Samora-only: gift wrapping + real Delhivery shipping are computed below
  // when storeName === "Samora"; Artace's checkout never sends this field.
  isGift?: boolean;
};

const normalizeCountry = (value: string) => {
  const normalized = value.trim().toUpperCase();
  if (normalized.length === 2) return normalized;
  return "IN";
};

const validateAddress = (address: Partial<CheckoutAddressInput>) => {
  const sanitized = {
    firstName: sanitizeText(address.firstName),
    lastName: sanitizeText(address.lastName),
    email: sanitizeText(address.email),
    phone: sanitizeText(address.phone),
    address1: sanitizeText(address.address1),
    address2: sanitizeText(address.address2),
    city: sanitizeText(address.city),
    state: sanitizeText(address.state),
    postcode: sanitizeText(address.postcode),
    country: normalizeCountry(sanitizeText(address.country) || "IN"),
  };

  const missingRequired =
    !sanitized.firstName ||
    !sanitized.lastName ||
    !sanitized.email ||
    !sanitized.phone ||
    !sanitized.address1 ||
    !sanitized.city ||
    !sanitized.state ||
    !sanitized.postcode;

  return { sanitized, missingRequired };
};

export async function POST(request: NextRequest) {
  let body: CheckoutRequestBody;

  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const lineItems = Array.isArray(body.lineItems) ? body.lineItems : [];
  const normalizedLineItems = lineItems
    .map((item) => {
      const productId = ensurePositiveInt(item.productId);
      const quantity = ensurePositiveInt(item.quantity);
      const variationId = ensurePositiveInt(item.variationId);
      const frameLabel = sanitizeText(item.frameLabel);
      const orderTypeLabel = sanitizeText(item.orderTypeLabel);
      if (!productId || !quantity) return null;

      const unitPrice =
        typeof item.unitPrice === "number" && Number.isFinite(item.unitPrice) && item.unitPrice > 0
          ? item.unitPrice
          : null;
      const lineTotal = unitPrice !== null ? (unitPrice * quantity).toFixed(2) : null;

      const metaEntries = [
        ...(frameLabel ? [{ key: "Frame", value: frameLabel }] : []),
        ...(orderTypeLabel ? [{ key: "Order Type", value: orderTypeLabel }] : []),
      ];

      return {
        product_id: productId,
        quantity,
        ...(variationId ? { variation_id: variationId } : {}),
        ...(metaEntries.length ? { meta_data: metaEntries } : {}),
        ...(lineTotal !== null ? { subtotal: lineTotal, total: lineTotal } : {}),
      };
    })
    .filter(
      (
        item
      ): item is {
        product_id: number;
        quantity: number;
        variation_id?: number;
        meta_data?: Array<{ key: string; value: string }>;
        subtotal?: string;
        total?: string;
      } => Boolean(item)
    );

  if (normalizedLineItems.length === 0) {
    return NextResponse.json(
      { error: "Cart is empty or contains invalid products." },
      { status: 400 }
    );
  }

  const { sanitized: billing, missingRequired } = validateAddress(body.billing || {});
  if (missingRequired) {
    return NextResponse.json(
      { error: "Missing required billing details." },
      { status: 400 }
    );
  }

  const couponCode = sanitizeText(body.couponCode).toLowerCase();

  const ALLOWED_STORE_NAMES = new Set(["Artace Studio", "Samora"]);
  const requestedStoreName = sanitizeText(body.storeName);
  const storeName = ALLOWED_STORE_NAMES.has(requestedStoreName)
    ? requestedStoreName
    : "Artace Studio";

  // Samora-exclusive coupons (e.g. RAKHI10) can't be applied from Artace's
  // checkout at all, regardless of cart contents.
  if (couponCode && isSamoraExclusiveCoupon(couponCode) && storeName !== "Samora") {
    return NextResponse.json(
      { error: "That coupon code is only valid on Samora." },
      { status: 400 }
    );
  }

  const shippingSource = body.shipping || body.billing || {};
  const { sanitized: shipping } = validateAddress(shippingSource);
  const session = await getAuthSessionFromRequest(request);

  // New flow: account required before placing an order.
  if (!session?.accessToken) {
    return NextResponse.json(
      { error: "Please sign in or create an account before checkout." },
      { status: 401 }
    );
  }

  const customerId = ensurePositiveInt(session.user.id);
  if (!customerId) {
    return NextResponse.json(
      { error: "Your account session is missing a customer id. Please sign in again." },
      { status: 401 }
    );
  }

  const { paymentMethod, paymentMethodTitle } = getWooCommercePaymentConfig();

  // Gift wrapping + real Delhivery shipping only apply to Samora orders —
  // Artace's checkout (storeName omitted/"Artace Studio") is unaffected.
  let feeLines: { name: string; total: string }[] = [];
  let shippingLines: { method_id: string; method_title: string; total: string }[] = [];
  let effectiveCouponCode = couponCode;

  if (storeName === "Samora") {
    const totalQuantity = normalizedLineItems.reduce((sum, item) => sum + item.quantity, 0);
    const { subtotalInr, totalWeightGrams, allItemsAreSamora } =
      await fetchLineItemTotals(normalizedLineItems);

    // A Samora-exclusive coupon must not discount non-Samora items — reject
    // rather than silently drop it, so the shopper knows why it didn't apply.
    if (couponCode && isSamoraExclusiveCoupon(couponCode) && !allItemsAreSamora) {
      return NextResponse.json(
        {
          error:
            "That coupon only applies to carts containing Samora products only. Remove any non-Samora items to use it.",
        },
        { status: 400 }
      );
    }

    const giftFee = calculateGiftFee(totalQuantity, body.isGift === true);
    if (giftFee > 0) {
      feeLines = [{ name: "Gift Wrapping", total: giftFee.toFixed(2) }];
    }

    const destinationPincode = shipping.postcode || billing.postcode;
    let shippingFee = 0;

    if (!isEligibleForFreeShipping(subtotalInr)) {
      const rate = await calculateDelhiveryShippingRate({
        destPincode: destinationPincode,
        weightGrams: totalWeightGrams,
      });
      shippingFee = rate?.amountInr ?? SAMORA_SHIPPING_FALLBACK_INR;
    }

    shippingLines = [
      { method_id: "delhivery", method_title: "Delhivery", total: shippingFee.toFixed(2) },
    ];
  } else if (couponCode && isSamoraExclusiveCoupon(couponCode)) {
    // Defense in depth — already rejected above, but never let a
    // Samora-exclusive code reach WooCommerce from a non-Samora checkout.
    effectiveCouponCode = "";
  }

  const couponLines = effectiveCouponCode ? [{ code: effectiveCouponCode }] : [];

  try {
    const wooOrder = await createWooCommerceOrder({
      payment_method: paymentMethod,
      payment_method_title: paymentMethodTitle,
      set_paid: false,
      billing: {
        first_name: billing.firstName,
        last_name: billing.lastName,
        address_1: billing.address1,
        address_2: billing.address2,
        city: billing.city,
        state: billing.state,
        postcode: billing.postcode,
        country: billing.country,
        email: billing.email,
        phone: billing.phone,
      },
      shipping: {
        first_name: shipping.firstName || billing.firstName,
        last_name: shipping.lastName || billing.lastName,
        address_1: shipping.address1 || billing.address1,
        address_2: shipping.address2 || billing.address2,
        city: shipping.city || billing.city,
        state: shipping.state || billing.state,
        postcode: shipping.postcode || billing.postcode,
        country: shipping.country || billing.country,
      },
      line_items: normalizedLineItems,
      ...(couponLines.length ? { coupon_lines: couponLines } : {}),
      ...(feeLines.length ? { fee_lines: feeLines } : {}),
      ...(shippingLines.length ? { shipping_lines: shippingLines } : {}),
      customer_note: sanitizeText(body.customerNote),
      customer_id: customerId,
    });

    if (!wooOrder.orderId || !wooOrder.orderKey) {
      throw new Error("WooCommerce did not return a valid order identifier.");
    }

    const amount = parseAmountToMinorUnits(wooOrder.total);
    if (!amount) {
      throw new Error("WooCommerce returned an invalid order total for payment.");
    }

    const razorpayOrder = await createRazorpayOrder({
      amount,
      currency: wooOrder.currency || "INR",
      receipt: `woo_${wooOrder.orderId}`,
      notes: {
        woo_order_id: String(wooOrder.orderId),
        woo_order_key: wooOrder.orderKey,
        woo_order_number: wooOrder.orderNumber,
      },
    });

    const referralCode = request.cookies.get(AFFILIATE_REF_COOKIE_NAME)?.value || "";
    const referringAffiliate = referralCode
      ? await findApprovedAffiliateByCode(referralCode)
      : null;

    const updatedWooOrder = await updateWooCommerceOrder(wooOrder.orderId, {
      meta_data: mergeWooMetaData(wooOrder.metaData, {
        _artace_razorpay_order_id: razorpayOrder.id,
        _artace_checkout_origin: request.nextUrl.origin,
        ...(referringAffiliate ? { "Referred By": referringAffiliate.referral_code } : {}),
      }),
    });

    if (referringAffiliate) {
      const orderTotalNumber = Number(wooOrder.total);
      if (Number.isFinite(orderTotalNumber)) {
        await recordAffiliateConversion(referringAffiliate, wooOrder.orderId, orderTotalNumber);
      }
    }

    const { keyId } = getRazorpayPublicConfig();

    return NextResponse.json({
      success: true,
      orderId: updatedWooOrder.orderId,
      orderKey: updatedWooOrder.orderKey,
      orderNumber: updatedWooOrder.orderNumber,
      status: updatedWooOrder.status,
      total: updatedWooOrder.total,
      currency: updatedWooOrder.currency,
      razorpay: {
        keyId,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: storeName,
        description: `Order #${updatedWooOrder.orderNumber}`,
        prefill: {
          name: `${billing.firstName} ${billing.lastName}`.trim(),
          email: billing.email,
          contact: billing.phone,
        },
        notes: razorpayOrder.notes,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to initialize checkout right now.",
      },
      {
        status:
          error instanceof Error
            ? (() => {
                const match = error.message.match(/\[(\d{3})\]\s/);
                const parsed = match ? Number(match[1]) : 502;
                return Number.isFinite(parsed) && parsed >= 400 && parsed <= 599
                  ? parsed
                  : 502;
              })()
            : 502,
      }
    );
  }
}
