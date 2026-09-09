# PayU Second Payment Gateway — Design

## Context

`suggestion.md` §2.7 flagged Razorpay as the only checkout gateway; the user's decision (already recorded there) was not PayPal/EMI but adding **PayU** as a second gateway, customer's choice at checkout, queued behind the three Section 3 features (all now built).

Confirmed with the user before writing this spec:

- **PayU product**: their standard hosted checkout — a hash-based redirect flow (merchant server computes a SHA-512 hash, the customer's browser is redirected to PayU's own hosted payment page, PayU redirects back with a response + reverse hash to verify). Not PayU Biz, not a JS-embeddable widget like Razorpay's.
- **Checkout UI**: two clearly labeled buttons — "Pay with Razorpay" and "Pay with PayU" — replacing today's single button.
- **Environment**: production credentials directly, not PayU's sandbox first. Real payment verification against a live PayU transaction is therefore explicitly the user's own action to take when ready, same as every other real-money step this engagement (Loyalty, Gift Cards) has deferred to the user rather than spending real money without asking.
- **Architecture**: extends the existing `/api/checkout` endpoint with a `paymentGateway` field rather than forking a parallel endpoint — every existing validation, discount (points/gift card/coupon), and order-creation step runs identically regardless of gateway; only what happens after the WooCommerce order exists branches.

**A real, serious incident during this brainstorm, recorded here because it affects how credentials must be handled going forward**: the user pasted what they believed was their PayU "salt" directly into the chat — it was actually a PEM-formatted RSA private key (an entirely different kind of secret, for an unrelated purpose). That value was never used anywhere in this spec or the resulting code, and the user was told to treat it as exposed and rotate whatever system it actually belongs to. **No PayU credential value has been placed in this spec, the plan, or any code — every reference below is to an environment variable name only.** The user must add the real `PAYU_MERCHANT_KEY` and `PAYU_SALT` directly to `.env.local` (and Cloudflare Pages' environment variables for production) themselves — never pasted into chat.

**Hash formulas below are verified against PayU's official documentation and their real Node SDK source, not assumed from memory** — fetched during this brainstorm:
- Request formula: [Generate Hash for PayU Hosted Checkout](https://docs.payu.in/docs/generate-hash-payu-hosted)
- Field list: [Web Integration - PayU Hosted](https://docs.payu.in/docs/prebuilt-checkout-page-integration)
- Response fields: [Working with Response after a Customer Checkout](https://docs.payu.in/docs/working-with-response-after-a-customer-checkout)
- Real SDK source structure: [payu-india/payu-sdk-node, lib/payu/hasher.js](https://github.com/payu-india/payu-sdk-node/blob/main/lib/payu/hasher.js)

**Honest confidence level, not overstated**: an initial reading of PayU's documentation (via automated web-fetch, which summarizes page content through an intermediate model rather than returning raw bytes) produced mutually-contradicting counts of the exact number of empty reserved segments in the *request* hash — this is inherently lossy for exact repeated-character counts like a run of pipes, and cost real time chasing a wrong number. The formula was instead resolved **empirically**: a complete worked example was found with a real, independently-checkable computed hash *output* (not just an input string) — `key=C0Dr8m, txnid=12345, amount=10, productinfo=Shopping, firstname=Test, email=test@test.com, udf2=abc, udf4=15, SALT=3sf0jURk` → `hash=ffcdbf04fa5beefdcc2dd476c18bc410f02b3968e7f4f54e8f43f1e1a310bb32e3b4dec9305232bb89db5b1d0c009a53bcace6f4bd8ec2f695baf3d43ba730ce` — and the segment count was brute-forced against it (0 through 8 reserved segments tried), which produced exactly one match. The *request* hash's exact structure (17 pipe-joined segments, 16 pipes: 6 real fields + 5 empty UDF slots + 5 empty reserved slots + salt) is therefore **empirically confirmed against a real hash output**, the strongest form of verification available, and is trusted. The *response* (reverse) hash's exact empty-segment layout has **not** had the same real-example treatment — no worked reverse-hash example with a checkable output was found. It is derived by mathematically reversing the now-confirmed 17-element request structure (swapping `key`↔`salt`, inserting `status`), which matches PayU's own stated general principle ("the response reverses the request parameter sequence") and is internally consistent — but **this specific detail should still be treated as unconfirmed until validated against one real PayU transaction**, since a wrong pipe count here fails silently: PayU would show the customer a successful payment while this system's hash check rejects it and never marks the order paid. This is called out explicitly in the plan's verification step, not glossed over.

## Decisions

### 1. Hash utility — `utils/payu.ts`

Edge-runtime-compatible (WebCrypto `SHA-512` digest — a plain hash, not HMAC, so no key-import step is needed, unlike the Razorpay/WooCommerce-webhook signature helpers):

```ts
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
 * SHA-512 output was reproduced exactly by this construction — see the
 * spec's Context section. Formula: 6 real fields, 5 empty UDF slots, 5
 * empty reserved slots, then the salt — 17 elements, 16 pipes. This
 * codebase never populates udf1-udf5, but the empty-string slots are required
 * by the formula regardless — omitting them produces a hash PayU will reject.
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
    "", "", "", "", "", // 5 reserved empty segments per PayU's formula
    salt,
  ].join("|");
  return { hash: await sha512Hex(raw), merchantKey };
};

/**
 * Reverse-order verification hash for the surl/furl callback. Derived by
 * mathematically reversing the request hash's empirically-confirmed
 * 17-element structure (salt first, then status, then the same 10 empty
 * segments, then email/firstname/productinfo/amount/txnid/key) — see the
 * spec's Context section for why this specific derivation, not a
 * directly-confirmed source, is what this is based on, and why real
 * verification against a live PayU transaction still matters before
 * trusting this in production.
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
    "", "", "", "", "", // udf5-udf1, always empty (matching the request side)
    input.email,
    input.firstname,
    input.productinfo,
    input.amount,
    input.txnid,
    merchantKey,
  ].join("|");
  const expected = await sha512Hex(raw);
  // Constant-time-ish comparison, matching the pattern already used for the
  // WooCommerce webhook signature check in utils/woocommerce-webhook.ts.
  if (expected.length !== input.hash.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ input.hash.charCodeAt(i);
  return diff === 0;
};
```

### 2. Extending `/api/checkout`

Add to `CheckoutRequestBody`:

```ts
paymentGateway?: "razorpay" | "payu"; // defaults to "razorpay" if omitted, so the existing Razorpay-only checkout-client.tsx call (before Task 6 below updates it) keeps working unmodified.
```

After the WooCommerce order is created (identical code path regardless of gateway — line items, points/gift-card/coupon discounts, everything already built stays untouched), branch only at the point where the response is built:

- **`razorpay` (today's behavior, unchanged)**: create the Razorpay order, return `{ razorpay: {...} }` exactly as now.
- **`payu`**: compute `productinfo` (e.g. `Order #${wooOrder.orderNumber}`), call `generatePayuRequestHash`, and return:
  ```ts
  {
    success: true,
    orderId: updatedWooOrder.orderId,
    orderKey: updatedWooOrder.orderKey,
    orderNumber: updatedWooOrder.orderNumber,
    payu: {
      actionUrl: PAYU_PAYMENT_URL,
      key: merchantKey,
      txnid: `woo_${updatedWooOrder.orderId}`,
      amount: updatedWooOrder.total,
      productinfo: `Order #${updatedWooOrder.orderNumber}`,
      firstname: billing.firstName,
      email: billing.email,
      phone: billing.phone,
      surl: buildSiteUrl("/api/checkout/payu-callback"),
      furl: buildSiteUrl("/api/checkout/payu-callback"),
      hash,
    },
  }
  ```
  `surl` and `furl` point to the *same* callback route — it reads PayU's own `status` field to know which happened, rather than needing two separate routes.

The `txnid` (`woo_<orderId>`) is stored in the order's meta (alongside the existing `_artace_razorpay_order_id`-style keys) as `_artace_payu_txnid`, so the callback route can look the order back up.

### 3. Extracting the shared "finalize order" logic

Today, `/api/checkout/verify`'s `POST` handler inlines everything after signature verification: marking the order paid, crediting Loyalty points, debiting points/gift cards, generating a gift card if applicable. Extract the part that comes *after* "payment is confirmed real" into a shared function both routes call, so PayU orders get identical Loyalty/Gift Card behavior without a second, drifting copy:

New file `lib/checkout/finalize-order.ts`:

```ts
export const finalizeOrderAfterPayment = async (input: {
  orderId: number;
  wooOrder: WooOrderSummary; // the pre-update order, as already fetched by the caller
  razorpayPaymentId?: string; // Razorpay-specific meta; omitted for PayU
  razorpaySignature?: string;
  payuMihpayid?: string; // PayU-specific meta; omitted for Razorpay
}): Promise<WooOrderSummary> => {
  // 1. The exact updateWooCommerceOrder(...) call currently inline in
  //    /api/checkout/verify — set_paid, status, meta_data — parameterized
  //    over which gateway's meta fields to merge in.
  // 2. The exact isCustomPortraitOrder / isGiftCardOrder / Loyalty crediting
  //    and debiting / gift card generation+email blocks, moved verbatim.
  // Returns the finalized order, same as /api/checkout/verify's local
  // `finalizedOrder` does today.
};
```

`/api/checkout/verify` calls this after its Razorpay-specific signature check passes. The new PayU callback route (Decision 4) calls the same function after its own hash check passes. Neither route duplicates the Loyalty/Gift Card logic itself anymore — this is a refactor of already-shipped code, not new business logic, so the plan's verification step for this task is specifically "prove Razorpay's existing behavior is unchanged," not "prove Loyalty/Gift Cards work" a second time (already proven).

### 4. The PayU callback route

New file `lib/api-route-handlers/checkout/payu-callback/route.ts`:

- Receives PayU's POST (`request.formData()`, not JSON — PayU submits a standard HTML form).
- Verifies the hash via `verifyPayuResponseHash`. **Reject before trusting `status` at all** — same discipline as every other webhook/callback in this codebase.
- Looks up the order via `txnid` (parsed back to a numeric order ID), confirms `_artace_payu_txnid` matches.
- If `status === "success"`: calls `finalizeOrderAfterPayment` with `payuMihpayid`, then issues an HTTP redirect (`NextResponse.redirect`, 302) to `buildSiteUrl(`/checkout/success?orderId=${orderId}&orderKey=${orderKey}`)`. **Verified, not assumed**: `app/checkout/success/checkout-success-client.tsx` reads exactly these two params via `useSearchParams().get("orderId")`/`.get("orderKey")` — nothing else. (A separate `writePendingCheckout`/`localStorage` mechanism in `utils/checkout-client.ts` also exists and is called from `checkout-client.tsx`, but `readPendingCheckout` is never called anywhere in the codebase — it's dead, write-only code today. PayU's flow does not need to replicate it; the two URL params are the entire real mechanism.)
- Otherwise: redirects to `/checkout?payuError=1`. **Verified, not assumed**: today's `checkoutError` (`app/checkout/checkout-client.tsx`) is plain `useState`, never URL-driven — a fresh page load after a redirect has no React state to carry over, so this needs one small new piece of client code: on mount, read `payuError` via `useSearchParams()` and call `setCheckoutError(...)` with a real message ("Your PayU payment could not be completed. Please try again.") if present. This is genuinely new, not a reuse of existing wiring — called out explicitly rather than implied to already exist.

This route is registered in the central `app/api/[[...path]]/route.ts` router as `"checkout/payu-callback"`, same convention as every other route.

### 5. Checkout UI

In `app/checkout/checkout-client.tsx`:

- Replace the single "Pay with Razorpay" button with two buttons, side by side: "Pay with Razorpay" (today's exact `handleCheckout` flow, unchanged) and "Pay with PayU" (a new `handlePayuCheckout` that POSTs to `/api/checkout` with `paymentGateway: "payu"`, then builds a hidden `<form>` with the returned `payu` fields as hidden inputs and calls `.submit()` on it — a real full-page navigation, not a fetch).
- A brief "Redirecting to PayU…" state while the form submits, so the customer isn't looking at a frozen page during the navigation.

### 6. Explicitly out of scope for this build

- PayU sandbox/test-mode support — the user chose production credentials directly.
- Any change to the Razorpay flow's own behavior — Decision 3's refactor is verified to be behavior-preserving, not a Razorpay change.
- Recurring/subscription payments, refunds initiated through PayU's API — not asked for.
