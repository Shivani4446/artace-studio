const sha512Hex = async (message: string): Promise<string> => {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error("WebCrypto is not available to compute a PayU hash.");

  const encoder = new TextEncoder();
  const digest = await subtle.digest("SHA-512", encoder.encode(message));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const getPayuConfig = () => {
  const merchantKey = process.env.PAYU_MERCHANT_KEY || "";
  const salt = process.env.PAYU_SALT || "";
  if (!merchantKey || !salt) {
    throw new Error("PayU is not configured. Set PAYU_MERCHANT_KEY and PAYU_SALT.");
  }
  return { merchantKey, salt };
};

export const PAYU_PAYMENT_URL = "https://secure.payu.in/_payment";

/**
 * Empirically verified against a complete real worked example (key=C0Dr8m,
 * txnid=12345, amount=10, productinfo=Shopping, firstname=Test,
 * email=test@test.com, udf2=abc, udf4=15, salt=3sf0jURk) whose documented
 * SHA-512 output was reproduced exactly by this construction — see
 * docs/superpowers/specs/2026-09-09-payu-gateway-design.md, Context section.
 * Formula: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5
 * followed by 5 empty reserved segments, then salt — 17 elements, 16 pipes.
 * This codebase never populates udf1-udf5, but the empty-string slots are
 * required by the formula regardless — omitting them produces a hash PayU
 * will reject.
 */
export const generatePayuRequestHash = async (input: {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
}): Promise<{ hash: string; merchantKey: string }> => {
  const { merchantKey, salt } = getPayuConfig();
  const raw = [
    merchantKey,
    input.txnid,
    input.amount,
    input.productinfo,
    input.firstname,
    input.email,
    "", "", "", "", "", // udf1-udf5, always empty
    "", "", "", "", "", // 5 reserved empty segments
    salt,
  ].join("|");
  return { hash: await sha512Hex(raw), merchantKey };
};

/**
 * Reverse-order verification hash for the surl/furl callback. Derived by
 * mathematically reversing the empirically-confirmed request structure above
 * (salt first, then status, then the same 10 empty segments, then
 * email/firstname/productinfo/amount/txnid/key) — see the spec's Context
 * section for why this specific formula's exact segment count is a
 * derivation, not an independently-confirmed source, and why a real
 * transaction should verify it before it's fully trusted in production.
 */
export const verifyPayuResponseHash = async (input: {
  status: string;
  email: string;
  firstname: string;
  productinfo: string;
  amount: string;
  txnid: string;
  hash: string;
}): Promise<boolean> => {
  const { merchantKey, salt } = getPayuConfig();
  const raw = [
    salt,
    input.status,
    "", "", "", "", "", // 5 reserved empty segments
    "", "", "", "", "", // udf5-udf1, always empty
    input.email,
    input.firstname,
    input.productinfo,
    input.amount,
    input.txnid,
    merchantKey,
  ].join("|");
  const expected = await sha512Hex(raw);
  if (expected.length !== input.hash.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ input.hash.charCodeAt(i);
  return diff === 0;
};
