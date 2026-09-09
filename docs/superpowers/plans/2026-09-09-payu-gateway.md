# PayU Second Payment Gateway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the customer choose PayU instead of Razorpay at checkout — PayU's standard hosted, hash-based redirect flow — with identical Loyalty/Gift Card/coupon behavior regardless of which gateway they pick.

**Architecture:** `/api/checkout` gains a `paymentGateway` field; everything before "the WooCommerce order exists" (line items, discounts, order creation) stays identical, only the final step branches — Razorpay's existing path is untouched, PayU's new path computes a SHA-512 hash and returns form fields for the client to redirect with. A new shared `finalizeOrderAfterPayment` function (extracted from the existing Razorpay verify route, not new logic) is called by both Razorpay's verify route and a new PayU callback route, so Loyalty/Gift Card crediting never has two copies to keep in sync.

**Tech Stack:** Next.js App Router (edge runtime), WebCrypto (`SHA-512` digest, no HMAC needed — PayU's hash is a plain digest).

**Spec:** `docs/superpowers/specs/2026-09-09-payu-gateway-design.md`

## Global Constraints

- **No PayU credential value anywhere in this plan or the resulting code.** Only environment variable names: `PAYU_MERCHANT_KEY`, `PAYU_SALT`. The user adds real values to `.env.local` and Cloudflare Pages themselves.
- **Production credentials directly** — the user chose not to use PayU's sandbox first. No task in this plan spends real money or completes a real PayU transaction without the user's own explicit action.
- **The response (reverse) hash formula is unconfirmed with full certainty** — derived by reversing the independently-confirmed request hash structure, per the spec's honest confidence-level note. Task 5's verification step exists specifically to catch a wrong hash before it's trusted, not to rubber-stamp it.
- **The Razorpay flow's behavior must not change.** Task 2's refactor is verified as behavior-preserving before anything PayU-specific is built on top of it.
- **No test framework beyond the Playwright e2e suite.** Verification per task: `npx tsc --noEmit`, plus a live check appropriate to the task.
- **Never run `git commit`/`git push`.**
- **Never run `next build`, `next dev`, `next start`, or `npx playwright test` in this project directory without asking the user first, every time** — a `next build` run concurrently with the user's own live dev server has crashed it twice in this engagement already, since both share the same `.next` directory. This is a standing constraint for every task below with a live-check step, not just a one-time caveat.

---

### Task 1: PayU hash utility

**Files:**
- Create: `utils/payu.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces: `PAYU_PAYMENT_URL` (constant); `generatePayuRequestHash(input: { txnid: string; amount: string; productinfo: string; firstname: string; email: string }): Promise<{ hash: string; merchantKey: string }>`; `verifyPayuResponseHash(input: { status: string; email: string; firstname: string; productinfo: string; amount: string; txnid: string; hash: string }): Promise<boolean>` — both consumed by Task 3 and Task 4.

- [x] **Step 1: Write the utility**

```ts
// utils/payu.ts

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
 * Formula: 6 real fields, 5 empty UDF slots, 5 empty reserved slots, then
 * the salt — 17 elements, 16 pipes. This codebase never populates
 * udf1-udf5, but the empty-string slots are required by the formula
 * regardless — omitting them produces a hash PayU will reject.
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
 * (salt first, then status, then the same 10 empty segments, then email/
 * firstname/productinfo/amount/txnid/key) — see the spec's Context section
 * for why this specific formula's exact segment count is a derivation, not
 * an independently-confirmed source, and why Task 5 verifies it against a
 * real transaction before it's trusted in production.
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
```

- [ ] **Step 2: Add the env var placeholders**

In `.env.example`, add near the other payment-gateway secrets (`RAZORPAY_KEY_ID` etc.):

```
PAYU_MERCHANT_KEY=
PAYU_SALT=
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Verify the hash function against a real worked example with a checkable hash output**

This needs no server, no `.env.local` changes — a throwaway script that mirrors the exact array construction from Step 1 and checks it against a complete worked example that includes PayU's own real, published SHA-512 output (not just an input string, which is not independently checkable):

```js
// scratchpad/verify-payu-hash.mjs — delete after running
import { webcrypto } from "node:crypto";
globalThis.crypto = webcrypto;

const sha512Hex = async (message) => {
  const digest = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(message));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

// Real worked example (key=C0Dr8m, txnid=12345, amount=10,
// productinfo=Shopping, firstname=Test, email=test@test.com, udf2=abc,
// udf4=15, salt=3sf0jURk) with a real, published SHA-512 output —
// independently checkable, unlike an input string alone.
const EXPECTED_HASH = "ffcdbf04fa5beefdcc2dd476c18bc410f02b3968e7f4f54e8f43f1e1a310bb32e3b4dec9305232bb89db5b1d0c009a53bcace6f4bd8ec2f695baf3d43ba730ce";

// Exact same array shape as generatePayuRequestHash in Step 1.
const raw = [
  "C0Dr8m", "12345", "10", "Shopping", "Test", "test@test.com",
  "", "abc", "", "15", "", // udf1-udf5 (udf2="abc", udf4="15" per the example)
  "", "", "", "", "", // 5 reserved empty segments
  "3sf0jURk",
].join("|");
console.log("Constructed string:", raw);
console.log("Computed hash:", await sha512Hex(raw));
console.log("Expected hash:", EXPECTED_HASH);
console.log("MATCH:", (await sha512Hex(raw)) === EXPECTED_HASH);
```

Expected: `MATCH: true` — this confirms the array construction in Step 1 reproduces PayU's own real, published hash output byte-for-byte, the strongest form of verification available (stronger than matching an input string alone, since a wrong segment count could coincidentally produce a matching string while still being semantically wrong — verifying against the actual hash output rules that out).

- [ ] **Task complete — ready for review.**

---

### Task 2: Extract shared finalize-order logic (Razorpay refactor, behavior-preserving)

**Files:**
- Create: `lib/checkout/finalize-order.ts`
- Modify: `lib/api-route-handlers/checkout/verify/route.ts`

**Interfaces:**
- Consumes: everything already imported by today's `verify/route.ts` (creditPoints, debitPoints, calculatePointsEarned, CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID, createGiftCard, redeemGiftCard, sendGiftCardEmail, GIFT_CARD_PRODUCT_ID, updateWooCommerceOrder, mergeWooMetaData, parseAmountToMinorUnits).
- Produces: `finalizeOrderAfterPayment(input: { orderId: number; wooOrder: WooOrderSummary; transactionId: string; gatewayMeta: Record<string, string> }): Promise<{ finalizedOrder: WooOrderSummary; generatedGiftCardCode?: string }>` — consumed by both this task's refactored verify route and Task 4's new PayU callback route.

This is a pure refactor of already-shipped, already-tested code — no new business logic. `transactionId` becomes WooCommerce's own `transaction_id` field (Razorpay's payment ID today; PayU's `mihpayid` in Task 4); `gatewayMeta` becomes whatever gateway-specific meta keys get merged in (Razorpay's `_artace_razorpay_order_id`/`_artace_razorpay_payment_id`/`_artace_razorpay_signature` today; PayU's `_artace_payu_mihpayid` in Task 4).

- [ ] **Step 1: Write the shared function**

```ts
// lib/checkout/finalize-order.ts
import {
  mergeWooMetaData,
  parseAmountToMinorUnits,
  updateWooCommerceOrder,
  type WooOrderSummary,
} from "@/utils/woocommerce-checkout";
import { creditPoints, debitPoints, calculatePointsEarned } from "@/lib/rewards/ledger";
import { CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID } from "@/lib/custom-portraits/pricing";
import { createGiftCard, redeemGiftCard } from "@/lib/gift-cards/ledger";
import { sendGiftCardEmail } from "@/lib/gift-cards/email";
import { GIFT_CARD_PRODUCT_ID } from "@/lib/gift-cards/constants";

export const finalizeOrderAfterPayment = async (input: {
  orderId: number;
  wooOrder: WooOrderSummary;
  transactionId: string;
  gatewayMeta: Record<string, string>;
}): Promise<{ finalizedOrder: WooOrderSummary; generatedGiftCardCode?: string }> => {
  const { orderId, wooOrder, transactionId, gatewayMeta } = input;

  const paidMinor = parseAmountToMinorUnits(wooOrder.total);
  const paidCurrency = wooOrder.currency || "INR";

  const finalizedOrder = await updateWooCommerceOrder(orderId, {
    set_paid: true,
    status: "processing",
    transaction_id: transactionId,
    meta_data: mergeWooMetaData(wooOrder.metaData, {
      ...gatewayMeta,
      _artace_payment_state: "success",
      ...(wooOrder.total ? { _artace_paid_total: wooOrder.total } : {}),
      ...(paidMinor ? { _artace_paid_amount_minor: String(paidMinor) } : {}),
      ...(paidCurrency ? { _artace_paid_currency: paidCurrency } : {}),
    }),
  });

  let generatedGiftCardCode: string | undefined;

  const isCustomPortraitOrder = wooOrder.lineItems.some(
    (item) => item.productId === CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID
  );

  if (!isCustomPortraitOrder && wooOrder.customerId > 0) {
    try {
      const pointsEarned = calculatePointsEarned(Number(wooOrder.total));
      if (pointsEarned > 0) {
        await creditPoints({
          wpCustomerId: String(wooOrder.customerId),
          wcOrderId: orderId,
          points: pointsEarned,
          description: `Order #${wooOrder.orderNumber}`,
        });
      }

      const pointsToRedeem = Number(
        wooOrder.metaData.find((item) => item.key === "_artace_points_to_redeem")?.value || 0
      );
      if (pointsToRedeem > 0) {
        await debitPoints({
          wpCustomerId: String(wooOrder.customerId),
          wcOrderId: orderId,
          points: pointsToRedeem,
          description: `Redeemed on Order #${wooOrder.orderNumber}`,
        });
      }
    } catch {
      // Never let a rewards-ledger failure affect the checkout response.
    }
  }

  const redeemedGiftCardCode = wooOrder.metaData.find((item) => item.key === "_artace_gift_card_code")?.value;
  const redeemedGiftCardAmount = Number(
    wooOrder.metaData.find((item) => item.key === "_artace_gift_card_amount")?.value || 0
  );
  if (redeemedGiftCardCode && redeemedGiftCardAmount > 0) {
    try {
      await redeemGiftCard({ code: redeemedGiftCardCode, wcOrderId: orderId, amount: redeemedGiftCardAmount });
    } catch {
      // Never let a redemption failure affect the checkout response.
    }
  }

  const isGiftCardOrder = wooOrder.lineItems.some((item) => item.productId === GIFT_CARD_PRODUCT_ID);
  if (isGiftCardOrder) {
    try {
      const { code } = await createGiftCard({
        amount: Number(wooOrder.total),
        purchaserEmail: wooOrder.billingEmail,
        wcOrderId: orderId,
      });
      generatedGiftCardCode = code;
      await sendGiftCardEmail({ to: wooOrder.billingEmail, code, amount: Number(wooOrder.total) });
    } catch {
      // Never let gift-card generation/email failure affect the checkout response.
    }
  }

  return { finalizedOrder, generatedGiftCardCode };
};
```

- [ ] **Step 2: Refactor the verify route to call it**

In `lib/api-route-handlers/checkout/verify/route.ts`, replace imports:

```ts
import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayPaymentSignature } from "@/utils/razorpay";
import {
  ensurePositiveInt,
  getWooCommerceOrder,
  mapWooOrderStatusToPaymentState,
  sanitizeText,
} from "@/utils/woocommerce-checkout";
import { finalizeOrderAfterPayment } from "@/lib/checkout/finalize-order";
```

(`mergeWooMetaData`, `parseAmountToMinorUnits`, `updateWooCommerceOrder`, `creditPoints`, `debitPoints`, `calculatePointsEarned`, `CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID`, `createGiftCard`, `redeemGiftCard`, `sendGiftCardEmail`, `GIFT_CARD_PRODUCT_ID` are no longer imported here — they moved to `finalize-order.ts`.)

Replace everything from `const paymentState = ...` through the end of the `if (isFirstTimeFinalization)` block with:

```ts
    const paymentState = mapWooOrderStatusToPaymentState(wooOrder.status);

    const isFirstTimeFinalization = !(
      paymentState === "success" && wooOrder.transactionId === razorpayPaymentId
    );

    let finalizedOrder = wooOrder;
    let generatedGiftCardCode: string | undefined;

    if (isFirstTimeFinalization) {
      const result = await finalizeOrderAfterPayment({
        orderId,
        wooOrder,
        transactionId: razorpayPaymentId,
        gatewayMeta: {
          _artace_razorpay_order_id: razorpayOrderId,
          _artace_razorpay_payment_id: razorpayPaymentId,
          _artace_razorpay_signature: razorpaySignature,
        },
      });
      finalizedOrder = result.finalizedOrder;
      generatedGiftCardCode = result.generatedGiftCardCode;
    }
```

The final `return NextResponse.json({...})` block stays exactly as it is today (it already reads from `finalizedOrder`/`generatedGiftCardCode`, which are still in scope with the same names).

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Verify Razorpay's behavior is genuinely unchanged**

Ask the user first before running this (per Global Constraints — it runs the full Playwright suite, which does a `next build`). Once confirmed safe to proceed:

```bash
npx playwright test --reporter=line
```

Expected: all existing tests pass (checkout, custom portraits, lead capture, rewards, gift cards, view-in-your-room) — this is the proof that extracting the shared function didn't change Razorpay's real behavior. This task adds no new test of its own; the existing suite already covers everything this refactor touches.

- [ ] **Task complete — ready for review.**

---

### Task 3: Extending `/api/checkout` with the PayU branch

**Files:**
- Modify: `lib/api-route-handlers/checkout/route.ts`

**Interfaces:**
- Consumes: `PAYU_PAYMENT_URL`, `generatePayuRequestHash` (Task 1).
- Produces: `CheckoutRequestBody.paymentGateway?: "razorpay" | "payu"`; response shape gains an optional `payu: {...}` object alongside the existing `razorpay: {...}` one (only one is ever present per response, depending on the gateway chosen).

- [ ] **Step 1: Add the import and request field**

```ts
import { PAYU_PAYMENT_URL, generatePayuRequestHash } from "@/utils/payu";
import { buildSiteUrl } from "@/lib/site";
```

Add to `CheckoutRequestBody`:

```ts
paymentGateway?: "razorpay" | "payu";
```

- [ ] **Step 2: Resolve the gateway near the other request-derived values**

Right after `const couponCode = sanitizeText(body.couponCode).toLowerCase();` (or any similarly early spot before order creation):

```ts
const paymentGateway = body.paymentGateway === "payu" ? "payu" : "razorpay";
```

- [ ] **Step 3: Branch after order creation, before the Razorpay-specific code**

Find `const amount = parseAmountToMinorUnits(wooOrder.total); if (!amount) { throw new Error(...); }` — this check stays common to both gateways (both need a valid numeric total). Immediately after it, insert the branch. The existing code below this point (from `const razorpayOrder = await createRazorpayOrder(...)` to the final `return NextResponse.json({...})` in the try block) becomes the `else` (Razorpay) branch; the referral-tracking code (`referralCode`/`referringAffiliate`/`recordAffiliateConversion`) stays common to both, computed once before the branch:

```ts
    const referralCode = request.cookies.get(AFFILIATE_REF_COOKIE_NAME)?.value || "";
    const referringAffiliate = referralCode
      ? await findApprovedAffiliateByCode(referralCode)
      : null;

    if (referringAffiliate) {
      const orderTotalNumber = Number(wooOrder.total);
      if (Number.isFinite(orderTotalNumber)) {
        await recordAffiliateConversion(referringAffiliate, wooOrder.orderId, orderTotalNumber);
      }
    }

    const commonMetaUpdates = {
      _artace_checkout_origin: request.nextUrl.origin,
      ...(referringAffiliate ? { "Referred By": referringAffiliate.referral_code } : {}),
      ...(pointsToRedeem > 0 ? { _artace_points_to_redeem: String(pointsToRedeem) } : {}),
      ...(giftCardApplied > 0
        ? { _artace_gift_card_code: giftCardCodeNormalized, _artace_gift_card_amount: String(giftCardApplied) }
        : {}),
    };

    if (paymentGateway === "payu") {
      const txnid = `woo_${wooOrder.orderId}`;
      const productinfo = `Order #${wooOrder.orderNumber}`;

      const { hash, merchantKey } = await generatePayuRequestHash({
        txnid,
        amount: wooOrder.total,
        productinfo,
        firstname: billing.firstName,
        email: billing.email,
      });

      const updatedWooOrder = await updateWooCommerceOrder(wooOrder.orderId, {
        meta_data: mergeWooMetaData(wooOrder.metaData, {
          ...commonMetaUpdates,
          _artace_payu_txnid: txnid,
        }),
      });

      return NextResponse.json({
        success: true,
        orderId: updatedWooOrder.orderId,
        orderKey: updatedWooOrder.orderKey,
        orderNumber: updatedWooOrder.orderNumber,
        status: updatedWooOrder.status,
        total: updatedWooOrder.total,
        currency: updatedWooOrder.currency,
        payu: {
          actionUrl: PAYU_PAYMENT_URL,
          key: merchantKey,
          txnid,
          amount: updatedWooOrder.total,
          productinfo,
          firstname: billing.firstName,
          email: billing.email,
          phone: billing.phone,
          surl: buildSiteUrl("/api/checkout/payu-callback"),
          furl: buildSiteUrl("/api/checkout/payu-callback"),
          hash,
        },
      });
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
        ...commonMetaUpdates,
        _artace_razorpay_order_id: razorpayOrder.id,
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
```

This replaces the existing code from `const referralCode = ...` through the end of the try block's Razorpay-only `return NextResponse.json({...})` — the Razorpay path's own final response object is unchanged from today, just now reached via the `else` side of the branch. Remove the old standalone `const referralCode =`/`const referringAffiliate =`/`if (referringAffiliate) {...}`/`const updatedWooOrder = await updateWooCommerceOrder(...)` block that previously came right after `createRazorpayOrder` — it's now the shared block above the branch, computed once.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Verify both branches live — ask the user first (this task's check needs a dev server)**

Confirm with the user before starting a dev server, per Global Constraints. Once confirmed:

```bash
netstat -ano | grep ":3000" | grep LISTENING
npx next dev -p 3072
```

Then, with a real logged-in session cookie:

```bash
curl -s -X POST http://localhost:3072/api/checkout -H "Content-Type: application/json" -H "Cookie: <real session cookie>" \
  -d '{"lineItems":[{"productId": 1140, "quantity": 1}], "billing": {"firstName":"Test","lastName":"User","email":"test@example.com","phone":"9999999999","address1":"123 Test St","city":"Pune","state":"Maharashtra","postcode":"411001","country":"IN"}, "paymentGateway": "payu"}'
```

Expected: `200` with a `payu` object containing `actionUrl`, `key`, `txnid`, `hash`, etc. Then repeat with `"paymentGateway": "razorpay"` (or omitted entirely) and confirm the response still has a `razorpay` object shaped exactly as before this task. Delete the resulting test order(s) via the Admin API afterward (`DELETE /wc/v3/orders/<id>?force=true`) — these are never paid, safe to remove.

- [ ] **Task complete — ready for review.**

---

### Task 4: The PayU callback route

**Files:**
- Create: `lib/api-route-handlers/checkout/payu-callback/route.ts`
- Modify: `app/api/[[...path]]/route.ts`

**Interfaces:**
- Consumes: `verifyPayuResponseHash` (Task 1); `finalizeOrderAfterPayment` (Task 2).
- Produces: `POST /api/checkout/payu-callback` → an HTTP redirect (never JSON — this receives a real browser POST from PayU, not a fetch).

- [ ] **Step 1: Write the route**

```ts
// lib/api-route-handlers/checkout/payu-callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getWooCommerceOrder } from "@/utils/woocommerce-checkout";
import { verifyPayuResponseHash } from "@/utils/payu";
import { finalizeOrderAfterPayment } from "@/lib/checkout/finalize-order";
import { buildSiteUrl } from "@/lib/site";

export const runtime = "edge";

const failureRedirect = () => NextResponse.redirect(buildSiteUrl("/checkout?payuError=1"));

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return failureRedirect();
  }

  const status = String(formData.get("status") || "");
  const txnid = String(formData.get("txnid") || "");
  const hash = String(formData.get("hash") || "");
  const mihpayid = String(formData.get("mihpayid") || "");
  const email = String(formData.get("email") || "");
  const firstname = String(formData.get("firstname") || "");
  const productinfo = String(formData.get("productinfo") || "");
  const amount = String(formData.get("amount") || "");

  const orderIdMatch = txnid.match(/^woo_(\d+)$/);
  const orderId = orderIdMatch ? Number(orderIdMatch[1]) : 0;

  if (!orderId || !hash) {
    return failureRedirect();
  }

  try {
    const isValidHash = await verifyPayuResponseHash({ status, email, firstname, productinfo, amount, txnid, hash });
    if (!isValidHash) {
      return failureRedirect();
    }

    const wooOrder = await getWooCommerceOrder(orderId);
    const storedTxnid = wooOrder.metaData.find((item) => item.key === "_artace_payu_txnid")?.value || "";
    if (storedTxnid !== txnid) {
      return failureRedirect();
    }

    if (status !== "success") {
      return failureRedirect();
    }

    const alreadyFinalized = wooOrder.metaData.some((item) => item.key === "_artace_payu_mihpayid");
    if (!alreadyFinalized) {
      await finalizeOrderAfterPayment({
        orderId,
        wooOrder,
        transactionId: mihpayid,
        gatewayMeta: { _artace_payu_mihpayid: mihpayid },
      });
    }

    return NextResponse.redirect(buildSiteUrl(`/checkout/success?orderId=${orderId}&orderKey=${wooOrder.orderKey}`));
  } catch {
    return failureRedirect();
  }
}
```

- [ ] **Step 2: Register the route**

In `app/api/[[...path]]/route.ts`, add the import in alphabetical order (right after `checkoutPincodeRoute`'s import location — "payu-callback" sorts between "checkout/coupon" and "checkout/pincode"):

```ts
import * as checkoutPayuCallbackRoute from "@/lib/api-route-handlers/checkout/payu-callback/route";
```

And the `ROUTES` entry in the matching alphabetical spot (between the existing `"checkout/coupon"` and `"checkout/pincode"` entries):

```ts
"checkout/payu-callback": {
  POST: (request) => checkoutPayuCallbackRoute.POST(request),
},
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Task complete — ready for review.** (Real verification needs a real PayU redirect round-trip, which needs Task 5's UI to exist first — deferred to Task 5's live-check step rather than faked here with a synthetic POST that can't have a real, PayU-issued hash.)

---

### Task 5: Checkout UI — gateway choice + PayU redirect + error handling

**Files:**
- Modify: `app/checkout/checkout-client.tsx`

**Interfaces:**
- Consumes: `POST /api/checkout` with `paymentGateway: "payu"` (Task 3), returning `{ payu: {...} }`.

- [ ] **Step 1: Add the PayU checkout handler**

Near the existing `handleCheckout` function, add:

```ts
const [isPayuRedirecting, setIsPayuRedirecting] = useState(false);

const handlePayuCheckout = async () => {
  if (checkoutStage !== "idle") return;

  setCheckoutError(null);
  setCheckoutStage("creating");

  try {
    if (authStatus !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent("/checkout")}`);
      return;
    }

    // Reuses the exact same lineItems-building logic already in handleCheckout
    // above — the implementer should factor that block (from `const lineItems =`
    // through its `.filter(...)`) into a small local helper both handlers call,
    // rather than duplicating it a second time in this function.
    const lineItems = buildCheckoutLineItems();
    if (lineItems.length === 0) {
      throw new Error("Your cart is empty or contains invalid products.");
    }

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lineItems,
        billing: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          address1: form.address1,
          address2: form.address2,
          city: form.city,
          state: form.state,
          postcode: form.postcode,
          country: form.country,
        },
        customerNote: form.customerNote,
        couponCode: appliedCoupon?.code || undefined,
        pointsToRedeem: pointsToRedeem > 0 ? pointsToRedeem : undefined,
        giftCardCode: giftCardAmount > 0 ? giftCardCode : undefined,
        paymentGateway: "payu",
      }),
    });

    const payload = await response.json();
    if (!response.ok || !payload.success || !payload.payu) {
      throw new Error(payload.error || "Unable to start your PayU payment.");
    }

    setIsPayuRedirecting(true);

    const form_ = document.createElement("form");
    form_.method = "POST";
    form_.action = payload.payu.actionUrl;
    const fields: Record<string, string> = {
      key: payload.payu.key,
      txnid: payload.payu.txnid,
      amount: payload.payu.amount,
      productinfo: payload.payu.productinfo,
      firstname: payload.payu.firstname,
      email: payload.payu.email,
      phone: payload.payu.phone,
      surl: payload.payu.surl,
      furl: payload.payu.furl,
      hash: payload.payu.hash,
    };
    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form_.appendChild(input);
    }
    document.body.appendChild(form_);
    form_.submit();
  } catch (err) {
    setCheckoutStage("idle");
    setCheckoutError(err instanceof Error ? err.message : "Unable to start your PayU payment.");
  }
};
```

**Note for the implementer, not a placeholder to guess at**: the exact field list and precise structure of `handleCheckout`'s existing `lineItems`-building block (currently inline in that function) should be extracted into a shared `buildCheckoutLineItems()` local function both handlers call — the implementer has that exact existing code already open in the same file (it's the `.map(...)`/`.filter(...)` block building `lineItems` at the top of today's `handleCheckout`) and should factor it out verbatim, not retype it from this description.

- [ ] **Step 2: Replace the single button with two, and add the redirecting state**

Find the existing "Pay with Razorpay" button and add a PayU button alongside it:

```tsx
<div className="flex flex-col gap-3 sm:flex-row">
  <button
    type="button"
    onClick={handleCheckout}
    disabled={checkoutStage !== "idle" || isPayuRedirecting}
    className="inline-flex flex-1 items-center justify-center rounded-[12px] bg-[#1a1a1a] px-7 py-3 text-[16px] font-medium text-white transition-colors hover:bg-black disabled:opacity-60"
  >
    {getPayButtonLabel(checkoutStage, isRazorpayReady)}
  </button>
  <button
    type="button"
    onClick={handlePayuCheckout}
    disabled={checkoutStage !== "idle" || isPayuRedirecting}
    className="inline-flex flex-1 items-center justify-center rounded-[12px] border border-[#1a1a1a] px-7 py-3 text-[16px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#f5f0e8] disabled:opacity-60"
  >
    {isPayuRedirecting ? "Redirecting to PayU…" : "Pay with PayU"}
  </button>
</div>
```

- [ ] **Step 3: Handle the `payuError` redirect param**

Near the top of the component, add:

```ts
useEffect(() => {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (params.get("payuError")) {
    setCheckoutError("Your PayU payment could not be completed. Please try again.");
    // Clean the param out of the URL so a page refresh doesn't re-show it.
    params.delete("payuError");
    const nextUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
  }
}, []);
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Verify the button UI live — ask the user first**

Confirm with the user before starting a dev server (Global Constraints). Once confirmed, on a fresh port, load `/checkout` with a real cart and confirm both buttons render side by side, and that clicking neither one before the other causes any layout issue.

- [ ] **Task complete — ready for review.** **The real end-to-end PayU redirect + a real transaction is explicitly the user's own action** — per the spec, production credentials mean the first real test involves real money, which this plan does not do on the user's behalf. Once the user has added real `PAYU_MERCHANT_KEY`/`PAYU_SALT` to their environment and is ready, they should: click "Pay with PayU," complete one real (even small) payment, and confirm they land on `/checkout/success` with the order correctly marked paid, Loyalty points credited, and (if applicable) gift card debited — exactly mirroring how every other real-money flow in this engagement has been handed to the user for final confirmation.

---

## Self-Review

**1. Spec coverage** — Decision 1 (hash utility) → Task 1. Decision 2 (extending `/api/checkout`) → Task 3. Decision 3 (shared finalize logic) → Task 2. Decision 4 (callback route) → Task 4. Decision 5 (checkout UI) → Task 5. Decision 6 (non-goals: sandbox, Razorpay changes, recurring payments) → confirmed no task touches any of these; Task 2's refactor is explicitly verified as behavior-preserving via the existing test suite, not a Razorpay change.

**2. Placeholder scan** — one deliberate note, not a placeholder: Task 5 Step 1 asks the implementer to factor out an existing, already-visible block (`lineItems` construction) rather than retype it — this is the same "verbatim, not retyped" instruction pattern already used successfully in the View in Your Room plan for the Razorpay-widget boilerplate, not a "TBD."

**3. Type consistency** — `finalizeOrderAfterPayment`'s signature in Task 2 matches its two call sites exactly (Task 2's own refactored verify route, and Task 4's callback route): `{ orderId, wooOrder, transactionId, gatewayMeta }` in, `{ finalizedOrder, generatedGiftCardCode }` out. `generatePayuRequestHash`/`verifyPayuResponseHash`'s parameter names in Task 1 match their Task 3/Task 4 call sites exactly. The `payu` response object's field names in Task 3 match exactly what Task 5's `fields` object reads.

**4. Scope check** — one coherent subsystem; not split further.

**5. Ambiguity check** — the two real ambiguities the spec flagged for "the implementer to confirm" (the success-page's exact query param names, and whether `checkoutError` is URL-driven) were already resolved during the spec's own self-review by reading the real files — Task 4 and Task 5 reflect the verified answers (`orderId`/`orderKey` params; `checkoutError` is plain `useState`, needing new `payuError`-param-reading code) directly, not as open questions.
