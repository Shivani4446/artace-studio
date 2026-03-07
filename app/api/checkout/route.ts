import { NextResponse } from "next/server";

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://artacestudio.com";

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
};

const sanitizeText = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const normalizeCountry = (value: string) => {
  const normalized = value.trim().toUpperCase();
  if (normalized.length === 2) return normalized;
  return "IN";
};

const ensurePositiveInt = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const integer = Math.floor(parsed);
  return integer > 0 ? integer : null;
};

const getWooCommerceConfig = () => {
  const siteUrl =
    process.env.WOOCOMMERCE_SITE_URL ||
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    DEFAULT_WOOCOMMERCE_SITE_URL;
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  const paymentMethod = process.env.WOOCOMMERCE_PAYMENT_METHOD || "bacs";
  const paymentMethodTitle =
    process.env.WOOCOMMERCE_PAYMENT_METHOD_TITLE || "Direct Bank Transfer";

  return {
    siteUrl: siteUrl.replace(/\/+$/, ""),
    consumerKey,
    consumerSecret,
    paymentMethod,
    paymentMethodTitle,
  };
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

export async function POST(request: Request) {
  const { siteUrl, consumerKey, consumerSecret, paymentMethod, paymentMethodTitle } =
    getWooCommerceConfig();

  if (!consumerKey || !consumerSecret) {
    return NextResponse.json(
      {
        error:
          "WooCommerce API credentials are missing. Set WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET.",
      },
      { status: 500 }
    );
  }

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

  const shippingSource = body.shipping || body.billing || {};
  const { sanitized: shipping } = validateAddress(shippingSource);

  const payload = {
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
    customer_note: sanitizeText(body.customerNote),
  };

  const basicToken = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );

  const response = await fetch(`${siteUrl}/wp-json/wc/v3/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const rawText = await response.text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {};
  } catch {
    parsed = {};
  }

  if (!response.ok) {
    const apiError =
      (typeof parsed.message === "string" && parsed.message) ||
      `WooCommerce order creation failed (${response.status}).`;
    return NextResponse.json({ error: apiError }, { status: 502 });
  }

  const orderId = ensurePositiveInt(parsed.id);
  const orderKey = sanitizeText(parsed.order_key);
  const checkoutPaymentUrl = sanitizeText(parsed.checkout_payment_url);
  const generatedPaymentUrl =
    orderId && orderKey
      ? `${siteUrl}/checkout/order-pay/${orderId}/?pay_for_order=true&key=${orderKey}`
      : "";

  return NextResponse.json({
    success: true,
    orderId,
    orderNumber: sanitizeText(parsed.number) || `${orderId || ""}`,
    status: sanitizeText(parsed.status),
    total: sanitizeText(parsed.total),
    currency: sanitizeText(parsed.currency),
    paymentUrl: checkoutPaymentUrl || generatedPaymentUrl || null,
  });
}
