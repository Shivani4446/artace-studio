import crypto from "node:crypto";

type RazorpayOrderPayload = {
  id?: unknown;
  amount?: unknown;
  currency?: unknown;
  receipt?: unknown;
  status?: unknown;
  notes?: Record<string, unknown>;
};

export type RazorpayOrderSummary = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  notes: Record<string, string>;
};

const sanitizeText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

  return { keyId, keySecret, webhookSecret };
};

const parseRazorpayOrder = (payload: RazorpayOrderPayload): RazorpayOrderSummary => ({
  id: sanitizeText(payload.id),
  amount: Number(payload.amount) || 0,
  currency: sanitizeText(payload.currency) || "INR",
  receipt: sanitizeText(payload.receipt),
  status: sanitizeText(payload.status),
  notes: Object.fromEntries(
    Object.entries(payload.notes || {}).map(([key, value]) => [key, sanitizeText(value)])
  ),
});

const buildBasicAuthHeader = (keyId: string, keySecret: string) =>
  `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

const safeCompare = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

export const getRazorpayPublicConfig = () => {
  const { keyId } = getRazorpayConfig();

  if (!keyId) {
    throw new Error("Razorpay key is missing. Set RAZORPAY_KEY_ID.");
  }

  return { keyId };
};

export const createRazorpayOrder = async ({
  amount,
  currency,
  receipt,
  notes,
}: {
  amount: number;
  currency: string;
  receipt: string;
  notes: Record<string, string>;
}) => {
  const { keyId, keySecret } = getRazorpayConfig();

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: buildBasicAuthHeader(keyId, keySecret),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency,
      receipt,
      notes,
    }),
    cache: "no-store",
  });

  const rawText = await response.text();
  let parsed: RazorpayOrderPayload | { error?: { description?: string } } = {};

  try {
    parsed = rawText
      ? (JSON.parse(rawText) as RazorpayOrderPayload | { error?: { description?: string } })
      : {};
  } catch {
    parsed = {};
  }

  if (!response.ok) {
    const apiError =
      sanitizeText((parsed as { error?: { description?: string } }).error?.description) ||
      `Razorpay order creation failed (${response.status}).`;
    throw new Error(apiError);
  }

  const order = parseRazorpayOrder(parsed as RazorpayOrderPayload);

  if (!order.id || !order.amount) {
    throw new Error("Razorpay did not return a valid order payload.");
  }

  return order;
};

export const verifyRazorpayPaymentSignature = ({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}) => {
  const { keySecret } = getRazorpayConfig();

  if (!keySecret) {
    throw new Error("Razorpay secret is missing. Set RAZORPAY_KEY_SECRET.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return safeCompare(expectedSignature, signature);
};

export const verifyRazorpayWebhookSignature = ({
  body,
  signature,
}: {
  body: string;
  signature: string;
}) => {
  const { webhookSecret } = getRazorpayConfig();

  if (!webhookSecret) {
    throw new Error("Razorpay webhook secret is missing. Set RAZORPAY_WEBHOOK_SECRET.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return safeCompare(expectedSignature, signature);
};
