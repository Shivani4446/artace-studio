// WooCommerce signs webhook payloads with X-WC-Webhook-Signature: base64
// HMAC-SHA256 of the raw request body — base64, not hex, which is why this
// can't reuse utils/razorpay.ts's hex-only helper.

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const safeCompare = (left: string, right: string): boolean => {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
};

export const verifyWooCommerceWebhookSignature = async ({
  body,
  signature,
}: {
  body: string;
  signature: string;
}): Promise<boolean> => {
  const secret = process.env.WOOCOMMERCE_ORDER_WEBHOOK_SECRET || "";
  if (!secret) {
    throw new Error("WooCommerce order webhook secret is missing. Set WOOCOMMERCE_ORDER_WEBHOOK_SECRET.");
  }

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
  const signatureBytes = await subtle.sign("HMAC", key, encoder.encode(body));
  const expectedSignature = bytesToBase64(new Uint8Array(signatureBytes));

  return safeCompare(expectedSignature, signature);
};
