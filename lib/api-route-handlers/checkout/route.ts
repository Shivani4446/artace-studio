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

export const runtime = "edge";

type CheckoutLineItemInput = {
  productId: number;
  variationId?: number;
  quantity: number;
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
      if (!productId || !quantity) return null;

      return {
        product_id: productId,
        quantity,
        ...(variationId ? { variation_id: variationId } : {}),
      };
    })
    .filter((item): item is { product_id: number; quantity: number; variation_id?: number } =>
      Boolean(item)
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
  const couponLines = couponCode ? [{ code: couponCode }] : [];

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

    const updatedWooOrder = await updateWooCommerceOrder(wooOrder.orderId, {
      meta_data: mergeWooMetaData(wooOrder.metaData, {
        _artace_razorpay_order_id: razorpayOrder.id,
        _artace_checkout_origin: request.nextUrl.origin,
      }),
    });

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
        name: "Artace Studio",
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
