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

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const toBase64 = (value: string) => {
  if (typeof btoa === "function") {
    return btoa(value);
  }

  const maybeBuffer = globalThis as {
    Buffer?: { from: (v: string, enc?: string) => { toString: (enc: string) => string } };
  };
  if (maybeBuffer.Buffer) {
    return maybeBuffer.Buffer.from(value, "utf8").toString("base64");
  }

  throw new Error("No base64 encoder available.");
};

const safeCompare = (left: string, right: string) => {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < left.length; i++) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return diff === 0;
};

const hmacSha256Hex = async (secret: string, message: string) => {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("WebCrypto is not available to compute an HMAC signature.");
  }

  const encoder = new TextEncoder();
  const key = await subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await subtle.sign("HMAC", key, encoder.encode(message));
  return bytesToHex(new Uint8Array(signature));
};

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
  `Basic ${toBase64(`${keyId}:${keySecret}`)}`;

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

export const verifyRazorpayPaymentSignature = async ({
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

  const expectedSignature = await hmacSha256Hex(keySecret, `${orderId}|${paymentId}`);

  return safeCompare(expectedSignature, signature);
};

export const verifyRazorpayWebhookSignature = async ({
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

  const expectedSignature = await hmacSha256Hex(webhookSecret, body);

  return safeCompare(expectedSignature, signature);
};
