# Artace Rewards (Loyalty Program) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Status (as of implementation)

All 10 tasks' code is written and every code-level verification (`npx tsc --noEmit`, `npm run lint`, `npm run build`, the full Playwright e2e suite including two new tests in `e2e/rewards-checkout.spec.ts`, a live signature-verification check against the new webhook, and a screenshot check of `/rewards`) passes clean.

**What's genuinely still unverified, and needs your action before this is real in production** — not overlooked, just outside what could be done without you:
1. **`supabase/rewards_ledger.sql` has not been run yet.** Until it is, every rewards feature will silently no-op (balances read as 0, credits/debits fail silently) rather than error — safe, but inert.
2. ~~The `fee_lines` negative-discount mechanism (Task 3) has not been tested against a real order.~~ **✅ Tested and confirmed working** — a negative `fee_lines.total` reliably reduces the order total by exactly that amount (tested with real throwaway orders via the Admin API, created then immediately deleted, no real payment involved). See the "Real, unrelated finding" note below for something bigger this test surfaced.
3. **The real WooCommerce webhook (Settings → Advanced → Webhooks) has not been created.** The receiving endpoint is built and its signature verification is proven correct with a live test, but nothing calls it yet.
4. **No real order has gone through the full flow** — earning, redeeming, and a refund clawback — end to end on your live server.

**Real, unrelated finding from that fee_lines test — flagging prominently, not burying it:** every test order (with or without any fee_lines at all — confirmed via a control order) priced its line item at ₹401.79 for a product whose real sale price is ₹450. 450 ÷ 401.79 = 1.12 exactly — a 12% GST-shaped gap — and the order carried `total_tax: 0.00`, `tax_lines: []` throughout, including after being marked "processing" the same way `/api/checkout/verify` does. This is not caused by anything in this feature (the control order had no fee_lines at all) — it looks like every order this checkout flow creates may be undercharging by the tax amount. This needs your (or your WooCommerce tax settings') attention independent of Artace Rewards — I don't have wp-admin access to check your tax configuration, and didn't want to guess at or touch tax logic without you. Worth checking a real recent order's total against its displayed price to confirm this is really happening in production, not just in my test.

A random secret was generated and added to `.env.local` as `WOOCOMMERCE_ORDER_WEBHOOK_SECRET` for local testing — treat it as real and either keep it or rotate it before using it in the actual WooCommerce webhook config.

**Goal:** Build a fully custom, Supabase-backed loyalty program ("Artace Rewards") — customers earn 1 point per ₹100 spent on the main Artace checkout, redeem points at 1 point = ₹1 discount (100-point minimum), with a public explainer page and an account dashboard view.

**Architecture:** A `rewards_ledger` Supabase table (append-only, balance derived by summing rows) is written to from two existing checkout API routes at the two moments that already exist in the codebase — order creation and payment verification — plus a new webhook that claws points back on refund/cancellation. No new payment infrastructure; this rides on the Razorpay/WooCommerce flow that's already there.

**Tech Stack:** Next.js App Router (edge runtime), Supabase (REST, not the JS client — matching how `lib/api-route-handlers/checkout/route.ts` already talks to Supabase), WooCommerce REST API (`wc/v3`), WebCrypto (edge-compatible HMAC for the new webhook).

**Spec:** `docs/superpowers/specs/2026-09-08-loyalty-program-design.md`

## Global Constraints

- **Numbers, verbatim from the spec — never substitute different ones:** 1 point per ₹100 spent (floored), 1 point = ₹1 on redemption, 100-point minimum to redeem, no expiry.
- **Program name in all customer-facing copy:** "Artace Rewards".
- **Scope:** main Artace cart checkout, and (as of the Samora infra-reuse pass) Samora's checkout too — see the update note below. Custom Portraits deposits remain excluded — the plan includes a step that actively excludes Custom Portraits orders from crediting, not just an assumption that it won't matter.

**Update — Samora formally included:** the crediting code in `checkout/verify/route.ts` was never actually gated by `storeName` (only Custom Portraits was excluded), so Samora orders have been earning points since this program shipped despite this doc's original "Samora explicitly excluded" line. Rather than retroactively fixing that, the user decided to keep it and complete the other half: Samora's checkout (`app/samora/checkout/checkout-client.tsx`) now also renders `ApplyPointsBox` so customers can redeem, reusing the same component, ledger, and `/api/rewards/balance` endpoint as the main checkout — no backend change was needed since redemption was never storeName-gated either.
- **No test framework beyond the Playwright e2e suite added this engagement.** Verification for every task is: `npx tsc --noEmit` (only pre-existing `.next/types` noise should remain — see `Website-pages.md` for what that baseline looks like), plus a live check appropriate to that task (a scratch script hitting a real read-only WooCommerce endpoint, a Playwright script against a local dev/prod server, or extending the existing `e2e/` suite). Never assume a check passed without running it.
- **Never run `git commit`/`git push`.** This plan's steps do not include a commit step — the user reviews and commits everything themselves, per this engagement's standing rule. Each task ends with "ready for review," not a commit command.
- **Port 3000 is the user's own dev server — never touch it.** Every live-check step below uses a fresh, incrementing port (this plan starts at 3060) and confirms port 3000's state is unchanged before and after.
- **Never fabricate business data.** Every number, name, and piece of copy below is either already decided in the spec or explicitly marked as needing the user's real input before it ships.

---

### Task 1: Data model + shared rewards utility

**Files:**
- Create: `supabase/rewards_ledger.sql`
- Create: `lib/rewards/constants.ts`
- Create: `lib/rewards/ledger.ts`

**Interfaces:**
- Produces: `POINTS_PER_RUPEE_SPENT`, `POINT_VALUE_INR`, `MIN_REDEMPTION_POINTS`, `PROGRAM_NAME` (all from `lib/rewards/constants.ts`); `getPointsBalance(wpCustomerId: string): Promise<number>`, `creditPoints(input: { wpCustomerId: string; wcOrderId: number; points: number; description: string }): Promise<void>`, `debitPoints(input: { wpCustomerId: string; wcOrderId: number; points: number; description: string }): Promise<void>`, `clawbackPointsForOrder(wcOrderId: number): Promise<void>`, `calculatePointsEarned(orderTotal: number): number`, `getLedgerHistory(wpCustomerId: string): Promise<{ id: number; date: string; description: string; points: number; type: string }[]>` (all from `lib/rewards/ledger.ts`).

- [ ] **Step 1: Write the SQL file**

```sql
-- Artace Rewards (loyalty program) ledger — run this in the Supabase SQL editor.
-- One row per point-affecting event; balance is always SUM(points), never
-- stored redundantly, so it can't drift out of sync.

CREATE TABLE IF NOT EXISTS rewards_ledger (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  wp_customer_id TEXT NOT NULL,
  wc_order_id BIGINT,
  points INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'earn' | 'redeem' | 'clawback'
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rewards_ledger_customer_idx ON rewards_ledger (wp_customer_id);
CREATE INDEX IF NOT EXISTS rewards_ledger_order_idx ON rewards_ledger (wc_order_id);

ALTER TABLE rewards_ledger ENABLE ROW LEVEL SECURITY;
```

Save this to `supabase/rewards_ledger.sql`. This is not run as part of this task — see Task 1's final step.

- [ ] **Step 2: Write the constants file**

```ts
// lib/rewards/constants.ts

/** 1 point per ₹100 spent. */
export const POINTS_PER_RUPEE_SPENT = 0.01;

/** 1 point = ₹1 on redemption. */
export const POINT_VALUE_INR = 1;

/** Minimum points a customer must hold before redeeming any. */
export const MIN_REDEMPTION_POINTS = 100;

/** The program's customer-facing name — use this constant, never a hardcoded string, anywhere it appears in copy. */
export const PROGRAM_NAME = "Artace Rewards";
```

- [ ] **Step 3: Write the ledger utility**

```ts
// lib/rewards/ledger.ts
import { POINTS_PER_RUPEE_SPENT } from "./constants";

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

// Same fetch-based REST pattern already used for Supabase in
// lib/api-route-handlers/checkout/route.ts (findApprovedAffiliateByCode /
// recordAffiliateConversion) — not the @supabase/supabase-js client, so
// this doesn't introduce a second way of talking to Supabase.
const supabaseHeaders = (extra?: Record<string, string>) => ({
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  ...extra,
});

export type LedgerEntry = {
  id: number;
  wp_customer_id: string;
  wc_order_id: number | null;
  points: number;
  type: "earn" | "redeem" | "clawback";
  description: string;
  created_at: string;
};

export const calculatePointsEarned = (orderTotal: number): number => {
  if (!Number.isFinite(orderTotal) || orderTotal <= 0) return 0;
  return Math.floor(orderTotal * POINTS_PER_RUPEE_SPENT);
};

export const getPointsBalance = async (wpCustomerId: string): Promise<number> => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !wpCustomerId) return 0;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rewards_ledger?wp_customer_id=eq.${encodeURIComponent(
        wpCustomerId
      )}&select=points`,
      { headers: supabaseHeaders() }
    );
    if (!response.ok) return 0;
    const rows = (await response.json()) as { points: number }[];
    return Array.isArray(rows) ? rows.reduce((sum, row) => sum + row.points, 0) : 0;
  } catch {
    return 0;
  }
};

export const getLedgerHistory = async (
  wpCustomerId: string
): Promise<{ id: number; date: string; description: string; points: number; type: string }[]> => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !wpCustomerId) return [];

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rewards_ledger?wp_customer_id=eq.${encodeURIComponent(
        wpCustomerId
      )}&select=id,created_at,description,points,type&order=created_at.desc`,
      { headers: supabaseHeaders() }
    );
    if (!response.ok) return [];
    const rows = (await response.json()) as LedgerEntry[];
    return rows.map((row) => ({
      id: row.id,
      date: row.created_at,
      description: row.description,
      points: row.points,
      type: row.type,
    }));
  } catch {
    return [];
  }
};

const insertLedgerRow = async (row: {
  wp_customer_id: string;
  wc_order_id: number | null;
  points: number;
  type: "earn" | "redeem" | "clawback";
  description: string;
}): Promise<void> => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;

  await fetch(`${SUPABASE_URL}/rest/v1/rewards_ledger`, {
    method: "POST",
    headers: supabaseHeaders({ Prefer: "return=minimal" }),
    body: JSON.stringify(row),
  });
};

export const creditPoints = async (input: {
  wpCustomerId: string;
  wcOrderId: number;
  points: number;
  description: string;
}): Promise<void> => {
  if (input.points <= 0) return;
  await insertLedgerRow({
    wp_customer_id: input.wpCustomerId,
    wc_order_id: input.wcOrderId,
    points: input.points,
    type: "earn",
    description: input.description,
  });
};

export const debitPoints = async (input: {
  wpCustomerId: string;
  wcOrderId: number;
  points: number;
  description: string;
}): Promise<void> => {
  if (input.points <= 0) return;
  await insertLedgerRow({
    wp_customer_id: input.wpCustomerId,
    wc_order_id: input.wcOrderId,
    points: -input.points,
    type: "redeem",
    description: input.description,
  });
};

const hasClawbackForOrder = async (wcOrderId: number): Promise<boolean> => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return true; // fail closed — don't double-write if we can't check

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rewards_ledger?wc_order_id=eq.${wcOrderId}&type=eq.clawback&select=id&limit=1`,
      { headers: supabaseHeaders() }
    );
    if (!response.ok) return true;
    const rows = (await response.json()) as { id: number }[];
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return true;
  }
};

export const clawbackPointsForOrder = async (wcOrderId: number): Promise<void> => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;
  if (await hasClawbackForOrder(wcOrderId)) return;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rewards_ledger?wc_order_id=eq.${wcOrderId}&type=in.(earn,redeem)&select=points,wp_customer_id`,
      { headers: supabaseHeaders() }
    );
    if (!response.ok) return;
    const rows = (await response.json()) as { points: number; wp_customer_id: string }[];
    if (rows.length === 0) return;

    const netPoints = rows.reduce((sum, row) => sum + row.points, 0);
    if (netPoints === 0) return;

    // Every row for one order shares the same customer — safe to read it
    // off the first row now that the length check above guarantees one exists.
    const wpCustomerId = rows[0].wp_customer_id;

    await insertLedgerRow({
      wp_customer_id: wpCustomerId,
      wc_order_id: wcOrderId,
      points: -netPoints,
      type: "clawback",
      description: `Refund/cancellation adjustment for Order #${wcOrderId}`,
    });
  } catch {
    // Never let a clawback failure crash the webhook response.
  }
};
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors (only the pre-existing `.next/types` noise documented in `Website-pages.md`).

- [ ] **Step 5: Verify the ledger utility against a real (but harmless) Supabase call**

This can't be fully verified until the user has run the SQL in Step 1 against their real Supabase project — flag this clearly rather than faking a pass. Once they confirm it's run, verify with a throwaway script in the scratchpad directory:

```js
// scratchpad/verify-rewards-ledger.mjs — delete after running
const SUPABASE_URL = "<paste from .env.local>";
const SUPABASE_SERVICE_ROLE_KEY = "<paste from .env.local>";

const res = await fetch(`${SUPABASE_URL}/rest/v1/rewards_ledger?select=*&limit=1`, {
  headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
});
console.log(res.status, await res.text());
```

Expected: `200` and `[]` (empty table, correct columns, no error) — confirms the table exists and the service-role key can read it before any real checkout code depends on it.

- [ ] **Task complete — ready for review.** Do not proceed to Task 3/4 until the user confirms `supabase/rewards_ledger.sql` has actually been run against the real project.

---

### Task 2: Extend `WooOrderSummary` with `customerId` and `lineItems`

**Files:**
- Modify: `utils/woocommerce-checkout.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `WooOrderSummary.customerId: number`, `WooOrderSummary.lineItems: { productId: number }[]` — both additive, every existing caller is unaffected.

- [ ] **Step 1: Locate and extend the payload type**

Find `WooOrderPayload` (near the top of the file, alongside the other payload types) and add:

```ts
customer_id?: unknown;
line_items?: unknown;
```

- [ ] **Step 2: Extend `WooOrderSummary`**

Find the `WooOrderSummary` type and add:

```ts
customerId: number;
lineItems: { productId: number }[];
```

- [ ] **Step 3: Extend `parseWooOrderSummary`**

Inside the object it returns (alongside `metaData: parseMetaData(payload.meta_data)`), add:

```ts
customerId: ensurePositiveInt(payload.customer_id) || 0,
lineItems: Array.isArray(payload.line_items)
  ? payload.line_items
      .map((item) => ensurePositiveInt((item as { product_id?: unknown }).product_id))
      .filter((id): id is number => id !== null)
      .map((productId) => ({ productId }))
  : [],
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Verify against a real order**

Use a scratch script hitting a real, already-existing order (read-only — `getWooCommerceOrder` is a GET, this changes nothing):

```js
// scratchpad/verify-order-fields.mjs — delete after running
import { getWooCommerceOrder } from "../../utils/woocommerce-checkout.ts"; // adjust relative path if run standalone; simplest is a temporary console.log added directly in a running dev server request instead
```

Simplest real check: temporarily add `console.log(wooOrder.customerId, wooOrder.lineItems)` right after the `getWooCommerceOrder` call in `lib/api-route-handlers/checkout/verify/route.ts`, place a real order on a locally-running dev server (a cheap real product, or reuse an existing test order id if one exists), and confirm both fields print real, non-empty values in the terminal. Remove the temporary `console.log` afterward.

- [ ] **Task complete — ready for review.**

---

### Task 3: `/api/checkout` — accept and apply point redemption

**Files:**
- Modify: `lib/api-route-handlers/checkout/route.ts`

**Interfaces:**
- Consumes: `getPointsBalance` (Task 1), `MIN_REDEMPTION_POINTS`, `POINT_VALUE_INR` (Task 1).
- Produces: `CheckoutRequestBody.pointsToRedeem?: number`; order meta key `_artace_points_to_redeem`.

- [ ] **Step 1: Add the import and request field**

```ts
import { getPointsBalance } from "@/lib/rewards/ledger";
import { MIN_REDEMPTION_POINTS, POINT_VALUE_INR } from "@/lib/rewards/constants";
```

In `CheckoutRequestBody`, add:

```ts
pointsToRedeem?: number;
```

- [ ] **Step 2: Validate and apply the discount**

After the existing `const customerId = ensurePositiveInt(session.user.id);` block (and its `if (!customerId)` guard) and before the `let feeLines: ... = [];` line, add:

```ts
const requestedPoints = Math.floor(Number(body.pointsToRedeem) || 0);
let pointsToRedeem = 0;

if (requestedPoints > 0) {
  const balance = await getPointsBalance(String(customerId));

  if (requestedPoints > balance) {
    return NextResponse.json(
      { error: "You don't have enough Artace Rewards points for that." },
      { status: 400 }
    );
  }

  if (requestedPoints < MIN_REDEMPTION_POINTS) {
    return NextResponse.json(
      { error: `You need at least ${MIN_REDEMPTION_POINTS} points to redeem Artace Rewards.` },
      { status: 400 }
    );
  }

  pointsToRedeem = requestedPoints;
}
```

- [ ] **Step 3: Add the fee line**

The existing code declares `let feeLines: { name: string; total: string }[] = [];` then only ever populates it inside the `if (storeName === "Samora")` branch. Right after that `let feeLines` declaration, add the rewards discount so it applies regardless of store:

```ts
let feeLines: { name: string; total: string }[] = [];
if (pointsToRedeem > 0) {
  feeLines.push({
    name: "Artace Rewards Discount",
    total: (-pointsToRedeem * POINT_VALUE_INR).toFixed(2),
  });
}
```

(This replaces the bare `let feeLines: { name: string; total: string }[] = [];` line — the Samora branch further down still does `feeLines = [{ name: "Gift Wrapping", ... }]`, which would currently overwrite this. Fix that one line too: change it to `feeLines.push({ name: "Gift Wrapping", total: giftFee.toFixed(2) });` so a rewards discount and a Samora gift fee can coexist instead of one clobbering the other.)

- [ ] **Step 4: Stash the redemption intent in order meta**

Find the `updateWooCommerceOrder(wooOrder.orderId, { meta_data: mergeWooMetaData(wooOrder.metaData, { ... }) })` call and add one more key to that `mergeWooMetaData` object:

```ts
...(pointsToRedeem > 0 ? { _artace_points_to_redeem: String(pointsToRedeem) } : {}),
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 6: Verify the discount against a real order — including the unverified WooCommerce behavior flagged in the spec**

This is the step that tests the spec's flagged unknown (does a negative `fee_lines.total` actually reduce the order total in this store's real WooCommerce). Start a local dev server on a fresh port (confirm port 3000 unchanged first):

```bash
netstat -ano | grep ":3000" | grep LISTENING
npx next dev -p 3060
```

Then, with a real logged-in test account that already has ≥100 points (seed this manually via a direct `INSERT INTO rewards_ledger` in the Supabase SQL editor if none exists yet — e.g. `INSERT INTO rewards_ledger (wp_customer_id, points, type, description) VALUES ('<real test customer id>', 500, 'earn', 'Test seed');`), place a real order through the checkout UI redeeming 100 points, and confirm in WooCommerce admin (or via `getWooCommerceOrder`) that the order's total was reduced by exactly ₹100.

**If it does not reduce the total as expected:** stop and implement the documented fallback instead (proportionally reduce each line item's own `total`/`subtotal` by the discount ratio) — do not silently ship a redemption control that doesn't actually discount the order.

- [ ] **Task complete — ready for review.**

---

### Task 4: `/api/checkout/verify` — credit and debit points on first-time finalization

**Files:**
- Modify: `lib/api-route-handlers/checkout/verify/route.ts`
- Modify: `lib/custom-portraits/pricing.ts` (export the deposit product id so it has one shared home)
- Modify: `lib/api-route-handlers/custom-portraits/route.ts` (import it from there instead of redeclaring it)

**Interfaces:**
- Consumes: `creditPoints`, `debitPoints`, `calculatePointsEarned` (Task 1); `wooOrder.customerId`, `wooOrder.lineItems` (Task 2); `CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID` (this task, exported from `lib/custom-portraits/pricing.ts`).

- [ ] **Step 1: Hoist the deposit product id to a shared location**

In `lib/custom-portraits/pricing.ts`, add near the other exported constants:

```ts
/** The hidden WooCommerce product used for the Custom Portraits deposit — orders containing it are excluded from the main Artace Rewards crediting flow (see lib/api-route-handlers/checkout/verify/route.ts). */
export const CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID = 4317;
```

In `lib/api-route-handlers/custom-portraits/route.ts`, find `const CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID = 4317;` and replace it with an import instead:

```ts
import { CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID } from "@/lib/custom-portraits/pricing";
```

(Remove the old local `const` declaration — leaving both would be a duplicate-declaration type error, not a redundant-but-harmless line.)

- [ ] **Step 2: Type-check the hoist alone before continuing**

Run: `npx tsc --noEmit`
Expected: no new errors. This confirms the refactor alone is safe before layering the new crediting logic on top.

- [ ] **Step 3: Add the crediting/debiting imports**

```ts
import { creditPoints, debitPoints, calculatePointsEarned } from "@/lib/rewards/ledger";
import { CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID } from "@/lib/custom-portraits/pricing";
```

- [ ] **Step 4: Add crediting/debiting inside the first-time-finalization branch only**

The existing code is:

```ts
const finalizedOrder =
  paymentState === "success" && wooOrder.transactionId === razorpayPaymentId
    ? wooOrder
    : await updateWooCommerceOrder(orderId, {
        set_paid: true,
        status: "processing",
        transaction_id: razorpayPaymentId,
        meta_data: mergeWooMetaData(wooOrder.metaData, {
          /* ...existing keys... */
        }),
      });
```

Change it to capture whether this was actually a first-time finalization, and run the rewards logic only in that case:

```ts
const isFirstTimeFinalization = !(
  paymentState === "success" && wooOrder.transactionId === razorpayPaymentId
);

const finalizedOrder = isFirstTimeFinalization
  ? await updateWooCommerceOrder(orderId, {
      set_paid: true,
      status: "processing",
      transaction_id: razorpayPaymentId,
      meta_data: mergeWooMetaData(wooOrder.metaData, {
        _artace_razorpay_order_id: razorpayOrderId,
        _artace_razorpay_payment_id: razorpayPaymentId,
        _artace_razorpay_signature: razorpaySignature,
        _artace_payment_state: "success",
        ...(wooOrder.total ? { _artace_paid_total: wooOrder.total } : {}),
        ...(paidMinor ? { _artace_paid_amount_minor: String(paidMinor) } : {}),
        ...(paidCurrency ? { _artace_paid_currency: paidCurrency } : {}),
      }),
    })
  : wooOrder;

if (isFirstTimeFinalization) {
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
      // Never let a rewards-ledger failure affect the checkout response —
      // the payment itself already succeeded by the time this runs (same
      // defensive posture as recordAffiliateConversion in the checkout route).
    }
  }
}
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 6: Verify crediting with a real order, and verify Custom Portraits orders are excluded**

On the same local dev server from Task 3 (port 3060; reconfirm port 3000 unchanged), place two real test orders:
1. A normal cart checkout order. After it completes, query `rewards_ledger` (Supabase SQL editor or a scratch script) and confirm a new `earn` row exists with `points = floor(order_total / 100)`.
2. A Custom Portraits deposit request (through `/custom-portraits`). After it completes, confirm **no** `earn` row was written for that order — this is the concrete proof the exclusion in Step 4 actually works, not just that the code compiles.

- [ ] **Task complete — ready for review.**

---

### Task 5: `/api/rewards/balance` and `/api/rewards/history`

**Files:**
- Create: `lib/api-route-handlers/rewards/balance/route.ts`
- Create: `lib/api-route-handlers/rewards/history/route.ts`
- Modify: `app/api/[[...path]]/route.ts`

**Interfaces:**
- Consumes: `getPointsBalance`, `getLedgerHistory` (Task 1).
- Produces: `GET /api/rewards/balance` → `{ balance: number }`; `GET /api/rewards/history` → `{ entries: { id, date, description, points, type }[] }`. Both require the same auth session `/api/checkout` requires (`401` otherwise).

- [ ] **Step 1: Write the balance route**

```ts
// lib/api-route-handlers/rewards/balance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/utils/auth";
import { ensurePositiveInt } from "@/utils/woocommerce-checkout";
import { getPointsBalance } from "@/lib/rewards/ledger";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const session = await getAuthSessionFromRequest(request);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Please sign in to see your rewards." }, { status: 401 });
  }

  const customerId = ensurePositiveInt(session.user.id);
  if (!customerId) {
    return NextResponse.json({ error: "Your account session is missing a customer id." }, { status: 401 });
  }

  const balance = await getPointsBalance(String(customerId));
  return NextResponse.json({ balance });
}
```

- [ ] **Step 2: Write the history route**

```ts
// lib/api-route-handlers/rewards/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/utils/auth";
import { ensurePositiveInt } from "@/utils/woocommerce-checkout";
import { getLedgerHistory } from "@/lib/rewards/ledger";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const session = await getAuthSessionFromRequest(request);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Please sign in to see your rewards." }, { status: 401 });
  }

  const customerId = ensurePositiveInt(session.user.id);
  if (!customerId) {
    return NextResponse.json({ error: "Your account session is missing a customer id." }, { status: 401 });
  }

  const entries = await getLedgerHistory(String(customerId));
  return NextResponse.json({ entries });
}
```

- [ ] **Step 3: Register both routes in the central router**

In `app/api/[[...path]]/route.ts`, add the imports (alphabetized, matching the existing convention — these sort right after `razorpay`-prefixed imports and before `store`, or wherever `r`-then-`s` alphabetization actually lands them relative to the existing list):

```ts
import * as rewardsBalanceRoute from "@/lib/api-route-handlers/rewards/balance/route";
import * as rewardsHistoryRoute from "@/lib/api-route-handlers/rewards/history/route";
```

And add to the `ROUTES` map:

```ts
"rewards/balance": {
  GET: (request) => rewardsBalanceRoute.GET(request),
},
"rewards/history": {
  GET: (request) => rewardsHistoryRoute.GET(request),
},
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Verify live**

With the local dev server running (port 3060, port 3000 reconfirmed unchanged) and a real logged-in session cookie (log in through the browser UI, don't fake this), hit both endpoints and confirm real JSON:

```bash
curl -s http://localhost:3060/api/rewards/balance -H "Cookie: <real session cookie from the browser>"
curl -s http://localhost:3060/api/rewards/history -H "Cookie: <real session cookie from the browser>"
```

Expected: `{"balance": <a real number matching what Task 4's test order produced>}` and a JSON array of entries. Also confirm an unauthenticated request (no cookie) gets `401` on both.

- [ ] **Task complete — ready for review.**

---

### Task 6: Refund/cancellation clawback webhook

**Files:**
- Create: `utils/woocommerce-webhook.ts`
- Create: `lib/api-route-handlers/webhooks/woocommerce-order-status/route.ts`
- Modify: `app/api/[[...path]]/route.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `clawbackPointsForOrder` (Task 1, with the `wp_customer_id` fix noted in Task 1's Step 3 note).
- Produces: `verifyWooCommerceWebhookSignature(input: { body: string; signature: string }): Promise<boolean>`.

- [ ] **Step 1: Write the signature verification helper**

WooCommerce signs webhook payloads with `X-WC-Webhook-Signature`: base64-encoded HMAC-SHA256 of the raw request body, using the webhook's configured secret — base64, not hex, which is why this can't reuse `utils/razorpay.ts`'s hex-only helper.

```ts
// utils/woocommerce-webhook.ts

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
```

- [ ] **Step 2: Write the webhook route**

```ts
// lib/api-route-handlers/webhooks/woocommerce-order-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyWooCommerceWebhookSignature } from "@/utils/woocommerce-webhook";
import { ensurePositiveInt, sanitizeText } from "@/utils/woocommerce-checkout";
import { clawbackPointsForOrder } from "@/lib/rewards/ledger";

export const runtime = "edge";

type WooOrderWebhookPayload = {
  id?: unknown;
  status?: unknown;
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = sanitizeText(request.headers.get("x-wc-webhook-signature"));

  if (!signature) {
    return NextResponse.json({ error: "Missing WooCommerce webhook signature." }, { status: 400 });
  }

  try {
    const isValidSignature = await verifyWooCommerceWebhookSignature({ body: rawBody, signature });
    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid WooCommerce webhook signature." }, { status: 400 });
    }

    const payload = JSON.parse(rawBody) as WooOrderWebhookPayload;
    const orderId = ensurePositiveInt(payload.id);
    const status = sanitizeText(payload.status).toLowerCase();

    if (!orderId || (status !== "refunded" && status !== "cancelled")) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    await clawbackPointsForOrder(orderId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to process the WooCommerce webhook." },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Register the route**

In `app/api/[[...path]]/route.ts`:

```ts
import * as woocommerceOrderStatusWebhookRoute from "@/lib/api-route-handlers/webhooks/woocommerce-order-status/route";
```

```ts
"webhooks/woocommerce-order-status": {
  POST: (request) => woocommerceOrderStatusWebhookRoute.POST(request),
},
```

- [ ] **Step 4: Add the env var placeholder**

In `.env.example`, add near the other Razorpay/WooCommerce secrets:

```
WOOCOMMERCE_ORDER_WEBHOOK_SECRET=
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 6: Verify signature verification with a scratch script (no live WooCommerce webhook needed yet)**

```js
// scratchpad/verify-wc-webhook-sig.mjs — delete after running
import crypto from "node:crypto";

const secret = "test-secret";
const body = JSON.stringify({ id: 12345, status: "refunded" });
const expected = crypto.createHmac("sha256", secret).update(body).digest("base64");
console.log("Compute this signature and POST it as x-wc-webhook-signature:", expected);
console.log("Body to send:", body);
```

With the dev server running and `WOOCOMMERCE_ORDER_WEBHOOK_SECRET=test-secret` set in `.env.local` temporarily:

```bash
curl -s -X POST http://localhost:3060/api/webhooks/woocommerce-order-status \
  -H "Content-Type: application/json" \
  -H "x-wc-webhook-signature: <the printed signature>" \
  -d '<the printed body>'
```

Expected: `{"ok":true}` for a real order id that has an `earn` row, and confirm via Supabase that a `clawback` row now exists. Then repeat with a wrong signature and confirm `400`. Revert the temporary `.env.local` value afterward if it wasn't the real secret.

- [ ] **Task complete — ready for review.** Note for the user: the real WooCommerce-side webhook (Settings → Advanced → Webhooks, Topic "Order updated", pointed at this route, using the real secret) still needs to be created manually — this task only proves the receiving end works.

---

### Task 7: Checkout UI — "Apply Reward Points"

**Files:**
- Create: `components/checkout/ApplyPointsBox.tsx`
- Modify: `app/checkout/checkout-client.tsx`

**Interfaces:**
- Consumes: `GET /api/rewards/balance` (Task 5), `MIN_REDEMPTION_POINTS`, `POINT_VALUE_INR`, `PROGRAM_NAME` (Task 1).
- Produces: `<ApplyPointsBox onPointsChange={(points: number) => void} subtotal={number} />`; `checkout-client.tsx`'s `handleCheckout` now sends `pointsToRedeem` in its `/api/checkout` POST body.

- [ ] **Step 1: Write the component**

```tsx
// components/checkout/ApplyPointsBox.tsx
"use client";

import { useEffect, useState } from "react";
import { MIN_REDEMPTION_POINTS, POINT_VALUE_INR, PROGRAM_NAME } from "@/lib/rewards/constants";

type ApplyPointsBoxProps = {
  subtotal: number;
  onPointsChange: (points: number) => void;
};

const ApplyPointsBox = ({ subtotal, onPointsChange }: ApplyPointsBoxProps) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [applied, setApplied] = useState(false);
  const [pointsInput, setPointsInput] = useState(0);

  useEffect(() => {
    let isActive = true;
    fetch("/api/rewards/balance")
      .then((res) => (res.ok ? res.json() : { balance: 0 }))
      .then((data: { balance?: number }) => {
        if (isActive) setBalance(typeof data.balance === "number" ? data.balance : 0);
      })
      .catch(() => {
        if (isActive) setBalance(0);
      });
    return () => {
      isActive = false;
    };
  }, []);

  if (balance === null) return null;

  const maxRedeemable = Math.min(balance, Math.floor(subtotal));

  if (balance < MIN_REDEMPTION_POINTS) {
    return (
      <div className="mt-5 rounded-[18px] border border-[#1f1f1f]/8 bg-white px-5 py-5">
        <p className="text-sm font-semibold text-[#1f1f1f]">{PROGRAM_NAME}</p>
        <p className="mt-2 text-sm text-[#666]">
          You have {balance} points — earn {MIN_REDEMPTION_POINTS - balance} more to redeem your first reward.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-[18px] border border-[#1f1f1f]/8 bg-white px-5 py-5">
      <p className="text-sm font-semibold text-[#1f1f1f]">{PROGRAM_NAME}</p>
      <p className="mt-2 text-sm text-[#666]">You have {balance} points available.</p>

      {applied ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#eef7f0] px-3 py-1 text-xs font-semibold text-[#116329]">
            − ₹{(pointsInput * POINT_VALUE_INR).toLocaleString("en-IN")} applied
          </span>
          <button
            type="button"
            onClick={() => {
              setApplied(false);
              setPointsInput(0);
              onPointsChange(0);
            }}
            className="text-xs font-semibold text-[#1f1f1f] underline underline-offset-4"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="number"
            min={MIN_REDEMPTION_POINTS}
            max={maxRedeemable}
            value={pointsInput || ""}
            onChange={(e) => setPointsInput(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            placeholder={`${MIN_REDEMPTION_POINTS}-${maxRedeemable}`}
            className="min-h-11 w-full flex-1 rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
          />
          <button
            type="button"
            disabled={pointsInput < MIN_REDEMPTION_POINTS || pointsInput > maxRedeemable}
            onClick={() => {
              setApplied(true);
              onPointsChange(pointsInput);
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#1f1f1f] transition-colors hover:bg-[#f5f0e8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplyPointsBox;
```

- [ ] **Step 2: Wire it into checkout-client.tsx**

Add the import:

```ts
import ApplyPointsBox from "@/components/checkout/ApplyPointsBox";
```

Add state near the other checkout state (`const [appliedCoupon, ...] = useState(...)` etc.):

```ts
const [pointsToRedeem, setPointsToRedeem] = useState(0);
```

Render it right after the existing "Have a coupon?" box (the `<div className="mt-5 rounded-[18px] border ...">` block containing "Have a coupon?"):

```tsx
<ApplyPointsBox subtotal={subtotal} onPointsChange={setPointsToRedeem} />
```

In `handleCheckout`, add `pointsToRedeem` to the `/api/checkout` POST body (alongside the existing `couponCode: appliedCoupon?.code || undefined,`):

```ts
pointsToRedeem: pointsToRedeem > 0 ? pointsToRedeem : undefined,
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Verify live**

Start the dev server (fresh port, port 3000 reconfirmed), log in as the same test account with points from Task 3, go to `/checkout`, and confirm: the box shows the real balance, applying points shows the correct discount preview, and completing checkout actually sends `pointsToRedeem` in the request (check via browser devtools Network tab or by temporarily logging `body.pointsToRedeem` server-side).

- [ ] **Task complete — ready for review.**

---

### Task 8: Account dashboard — `/dashboard/rewards`

**Files:**
- Create: `components/account/DashboardRewards.tsx`
- Create: `app/dashboard/rewards/page.tsx`

**Interfaces:**
- Consumes: `GET /api/rewards/balance`, `GET /api/rewards/history` (Task 5).

- [ ] **Step 1: Write the dashboard component**

```tsx
// components/account/DashboardRewards.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PROGRAM_NAME, MIN_REDEMPTION_POINTS, POINT_VALUE_INR } from "@/lib/rewards/constants";

type LedgerEntry = { id: number; date: string; description: string; points: number; type: string };

const DashboardRewards = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    fetch("/api/rewards/balance")
      .then((res) => (res.ok ? res.json() : { balance: 0 }))
      .then((data: { balance?: number }) => setBalance(data.balance ?? 0));

    fetch("/api/rewards/history")
      .then((res) => (res.ok ? res.json() : { entries: [] }))
      .then((data: { entries?: LedgerEntry[] }) => setEntries(data.entries ?? []));
  }, []);

  let runningBalance = balance ?? 0;
  const rows = entries.map((entry) => {
    const row = { ...entry, runningBalance };
    runningBalance -= entry.points;
    return row;
  });

  return (
    <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 md:px-12">
      <h1 className="font-display text-[28px] text-[#1f1f1f] md:text-[36px]">{PROGRAM_NAME}</h1>

      <div className="mt-6 rounded-[18px] border border-[#1f1f1f]/8 bg-[#faf8f4] p-6">
        <p className="text-sm text-[#666]">Your balance</p>
        <p className="mt-1 font-display text-[32px] text-[#1f1f1f]">
          {balance === null ? "…" : balance} points
        </p>
        <p className="mt-1 text-sm text-[#666]">
          Worth ₹{balance === null ? "…" : (balance * POINT_VALUE_INR).toLocaleString("en-IN")} —
          redeemable once you have {MIN_REDEMPTION_POINTS}+.
        </p>
        <Link href="/rewards" className="mt-3 inline-block text-sm font-medium text-[#1f1f1f] underline underline-offset-4">
          How {PROGRAM_NAME} works →
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-[20px] text-[#1f1f1f]">History</h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-[#666]">No activity yet.</p>
        ) : (
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-[#666]">
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Description</th>
                <th className="py-2 font-medium">Points</th>
                <th className="py-2 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-black/5">
                  <td className="py-2 text-[#444]">{new Date(row.date).toLocaleDateString("en-IN")}</td>
                  <td className="py-2 text-[#444]">{row.description}</td>
                  <td className={`py-2 font-medium ${row.points >= 0 ? "text-[#116329]" : "text-[#b42318]"}`}>
                    {row.points >= 0 ? `+${row.points}` : row.points}
                  </td>
                  <td className="py-2 text-[#444]">{row.runningBalance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DashboardRewards;
```

- [ ] **Step 2: Write the page wrapper**

```tsx
// app/dashboard/rewards/page.tsx
import type { Metadata } from "next";
import DashboardRewards from "@/components/account/DashboardRewards";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Artace Rewards | Artace Studio",
  description: "Check your Artace Rewards points balance and history.",
  alternates: {
    canonical: buildSiteUrl("/dashboard/rewards"),
  },
  robots: { index: false, follow: true },
};

export default function RewardsDashboardPage() {
  return <DashboardRewards />;
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Verify live**

Log in as the test account from earlier tasks, visit `/dashboard/rewards`, confirm the real balance and history entries (including the earlier `earn` and `redeem` rows) render correctly with the right running-balance math.

- [ ] **Task complete — ready for review.**

---

### Task 9: Public `/rewards` page + navigation

**Files:**
- Create: `app/rewards/page.tsx`
- Modify: `components/navbar.tsx`
- Modify: `components/footer.tsx`
- Modify: `app/sitemap.ts`

**Interfaces:**
- Consumes: `FAQSection` (existing component), `PROGRAM_NAME`, `MIN_REDEMPTION_POINTS`, `POINT_VALUE_INR` (Task 1).

- [ ] **Step 1: Write the public page**

```tsx
// app/rewards/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import FAQSection, { type FAQItem } from "@/components/seo/FAQSection";
import { buildSiteUrl } from "@/lib/site";
import { PROGRAM_NAME, MIN_REDEMPTION_POINTS, POINT_VALUE_INR } from "@/lib/rewards/constants";

export const metadata: Metadata = {
  title: `${PROGRAM_NAME} | Earn Points on Every Order | Artace Studio`,
  description: `Earn 1 point per ₹100 you spend at Artace Studio, and redeem points for real discounts on future orders — ${PROGRAM_NAME} explained.`,
  alternates: {
    canonical: buildSiteUrl("/rewards"),
  },
};

const faqs: FAQItem[] = [
  {
    question: "How do I earn points?",
    answer: `You earn 1 point for every ₹100 you spend on a completed order — no exclusions, every order qualifies.`,
  },
  {
    question: "How much is a point worth?",
    answer: `Each point is worth ₹1 when redeemed, once you have at least ${MIN_REDEMPTION_POINTS} points.`,
  },
  {
    question: "Do points expire?",
    answer: "No — your points don't expire.",
  },
  {
    question: "Can I use points and a coupon on the same order?",
    answer: "Yes — Artace Rewards points and a coupon code can both be applied to the same order.",
  },
  {
    question: "What happens to my points if I return an order?",
    answer: "If an order is refunded or cancelled, the points it earned (or that were redeemed on it) are automatically reversed.",
  },
];

export default function RewardsPage() {
  return (
    <main className="bg-[#f4f2ee] text-[#1f1f1f]">
      <section className="bg-[#1f1f1f] px-4 py-16 text-center text-white sm:px-6 md:px-12 md:py-24">
        <div className="mx-auto max-w-[860px]">
          <p className="font-inter text-[13px] uppercase tracking-[0.12em] text-white/60">
            {PROGRAM_NAME}
          </p>
          <h1 className="mt-4 font-display text-[36px] leading-[1.1] md:text-[56px]">
            Earn Rewards on Every Order
          </h1>
          <p className="mt-5 text-white/80">
            Every purchase earns you real points, worth real discounts on your next one.
          </p>
          <Link
            href="/dashboard/rewards"
            className="mt-8 inline-flex items-center justify-center rounded-[12px] bg-white px-7 py-3 text-[16px] font-medium text-[#1a1a1a] transition-colors hover:bg-white/90"
          >
            View Your Rewards
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1000px] px-4 py-14 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="rounded-[18px] bg-white p-6">
            <p className="font-inter text-[13px] font-medium uppercase tracking-[0.14em] text-[#7b746a]">
              Earning
            </p>
            <p className="mt-3 font-display text-[22px]">1 point per ₹100 spent</p>
            <p className="mt-2 text-[15px] text-[#595959]">
              Every completed order earns points on its full amount.
            </p>
          </div>
          <div className="rounded-[18px] bg-white p-6">
            <p className="font-inter text-[13px] font-medium uppercase tracking-[0.14em] text-[#7b746a]">
              Redeeming
            </p>
            <p className="mt-3 font-display text-[22px]">1 point = ₹{POINT_VALUE_INR} off</p>
            <p className="mt-2 text-[15px] text-[#595959]">
              Redeem any time once you have {MIN_REDEMPTION_POINTS}+ points, right at checkout.
            </p>
          </div>
        </div>
      </section>

      <FAQSection
        title="Artace Rewards — Frequently Asked Questions"
        items={faqs}
        id="rewards-faq"
        className="mx-auto max-w-[1000px] px-4 pb-16 sm:px-6 md:px-12"
      />
    </main>
  );
}
```

- [ ] **Step 2: Add to the navbar**

In `components/navbar.tsx`, find `resourceLinks` and add an entry consistent with the existing ones there (e.g. next to the Art Care Guide / Team entries):

```ts
{ name: "Artace Rewards", href: "/rewards" },
```

- [ ] **Step 3: Add to the footer**

In `components/footer.tsx`, find the "Shop" section's link array (the one containing `{ label: "Trade Program", href: "/trade" }` and `{ label: "Affiliate Program", href: "/affiliates" }`) and add:

```ts
{ label: "Artace Rewards", href: "/rewards" },
```

- [ ] **Step 4: Add to the sitemap**

In `app/sitemap.ts`, add to the `staticPages` array:

```ts
{ url: `${baseUrl}/rewards`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 6: Verify live**

Start the dev server (fresh port, port 3000 reconfirmed unchanged), visit `/rewards` directly, confirm it renders with no console errors, confirm the navbar Resources dropdown and footer both show the new link and navigate correctly, and confirm `/sitemap.xml` includes `/rewards`.

- [ ] **Task complete — ready for review.**

---

### Task 10: E2E test for point redemption at checkout

**Files:**
- Modify: `e2e/mocks.ts`
- Create: `e2e/rewards-checkout.spec.ts`

**Interfaces:**
- Consumes: `mockAuthenticatedSession`, `seedCart`, `mockRazorpayWidget` (existing, from `e2e/mocks.ts`).
- Produces: `mockRewardsBalance(page: Page, balance: number)` (new, added to `e2e/mocks.ts`).

- [ ] **Step 1: Add a rewards-balance mock to the shared mocks file**

In `e2e/mocks.ts`, add:

```ts
export async function mockRewardsBalance(page: Page, balance: number) {
  await page.route("**/api/rewards/balance", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ balance }) })
  );
}
```

- [ ] **Step 2: Write the test**

```ts
// e2e/rewards-checkout.spec.ts
import { test, expect } from "@playwright/test";
import { mockAuthenticatedSession, seedCart, mockRazorpayWidget, mockCheckoutApi, mockRewardsBalance } from "./mocks";

// Smoke test for Artace Rewards redemption at checkout — same fully-mocked
// approach as checkout.spec.ts (no real Razorpay, no real WooCommerce order,
// no real Supabase write). This only proves the UI/API-contract wiring; the
// real ledger-writing behavior is verified against a live server per the
// implementation plan's Task 3/4/6 live-check steps, not here.
test.describe("Checkout — Artace Rewards redemption", () => {
  test("applies points as a discount and sends pointsToRedeem to /api/checkout", async ({ page }) => {
    await mockAuthenticatedSession(page);
    await seedCart(page);
    await mockRazorpayWidget(page);
    await mockCheckoutApi(page);
    await mockRewardsBalance(page, 250);

    await page.goto("/checkout");

    await expect(page.getByText("You have 250 points available.")).toBeVisible({ timeout: 10_000 });

    await page.getByPlaceholder(/100-/).fill("150");
    await page.getByRole("button", { name: "Apply" }).click();

    await expect(page.getByText("− ₹150 applied")).toBeVisible();

    await page.getByPlaceholder("First Name").fill("Test");
    await page.getByPlaceholder("Last Name").fill("User");
    await page.getByPlaceholder("Phone").fill("9999999999");
    await page.getByPlaceholder("Address Line 1").fill("123 Test Street");
    await page.getByPlaceholder("City").fill("Pune");
    await page.getByPlaceholder("State").fill("Maharashtra");
    await page.getByPlaceholder("PIN / ZIP").fill("411001");

    const checkoutRequest = page.waitForRequest(
      (req) => req.url().includes("/api/checkout") && !req.url().includes("verify") && req.method() === "POST"
    );

    await page.getByRole("button", { name: "Pay with Razorpay" }).click();

    const req = await checkoutRequest;
    expect(req.postDataJSON().pointsToRedeem).toBe(150);
  });

  test("shows the locked state below the minimum redemption threshold", async ({ page }) => {
    await mockAuthenticatedSession(page);
    await seedCart(page);
    await mockRazorpayWidget(page);
    await mockCheckoutApi(page);
    await mockRewardsBalance(page, 40);

    await page.goto("/checkout");

    await expect(page.getByText("You have 40 points — earn 60 more to redeem your first reward.")).toBeVisible({
      timeout: 10_000,
    });
  });
});
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Run the new tests**

```bash
netstat -ano | grep ":3100" | grep LISTENING
npx playwright test e2e/rewards-checkout.spec.ts --reporter=line
```

Expected: both tests pass.

- [ ] **Step 5: Run the full e2e suite to confirm no regression**

```bash
npx playwright test --reporter=line
```

Expected: all tests (the pre-existing three suites plus this new one) pass.

- [ ] **Step 6: Clean up test artifacts**

```bash
rm -rf test-results playwright-report
```

- [ ] **Task complete — ready for review.**

---

## Self-Review

**1. Spec coverage** — checked every Decision section in the spec against a task:
- Decision 1 (data model) → Task 1. ✓
- Decision 2 (shared utility) → Task 1. ✓
- Decision 3 (`WooOrderSummary` extension) → Task 2. ✓
- Decision 4 (earning + redemption in checkout) → Tasks 3 and 4. ✓
- Decision 5 (clawback webhook) → Task 6. ✓
- Decision 6 (checkout UI) → Task 7. ✓
- Decision 7 (dashboard) → Task 8. ✓
- Decision 8 (public page + nav) → Task 9. ✓
- Decision 9 (non-goals) → nothing built for these; confirmed no task touches Custom Portraits' or Samora's own checkout flows beyond the exclusion check in Task 4.
- Spec's flagged `fee_lines` unknown → Task 3, Step 6 explicitly tests it with a documented fallback.
- Spec's flagged Custom-Portraits-reuse risk → Task 4, Steps 4 and 6 explicitly exclude and then verify the exclusion.

**2. Placeholder scan** — one real placeholder found while reviewing, and fixed directly in Task 1's code above (not left as a note): `clawbackPointsForOrder` originally wrote `wp_customer_id: ""` with a comment gesturing at a future fix. The query now selects `points,wp_customer_id` together, guards on `rows.length === 0` before reading `rows[0]`, and inserts the real `wp_customer_id` it read back — no placeholder remains in the task text itself.

**3. Type consistency** — checked that names/signatures agree across tasks:
- `getPointsBalance(wpCustomerId: string)` — used identically in Task 3 (`getPointsBalance(String(customerId))`) and Task 5.
- `creditPoints`/`debitPoints` signatures in Task 1 match their call sites in Task 4 exactly (`wpCustomerId`, `wcOrderId`, `points`, `description`).
- `MIN_REDEMPTION_POINTS`, `POINT_VALUE_INR`, `PROGRAM_NAME` are imported with the same names in Tasks 3, 7, 8, 9 — no renaming drift.
- `ApplyPointsBox`'s props (`subtotal`, `onPointsChange`) match exactly how Task 7 Step 2 invokes it.
- `CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID` is hoisted to `lib/custom-portraits/pricing.ts` in Task 4 Step 1 and imported from there in both the route it originally lived in and the new verify-route usage — one definition, not two.

**4. Scope check** — this plan is one coherent subsystem (the spec was already scoped to a single build, not multiple independent ones during brainstorming), so it stays as one plan rather than being split further.

**5. Ambiguity check** — the one place two readings were possible (whether `feeLines` gets overwritten or appended to when both a rewards discount and Samora's gift-wrap fee apply) is resolved explicitly in Task 3 Step 3: `feeLines` starts as an array both branches `.push()` onto, not a variable either branch reassigns wholesale.

## Execution Choice

This plan is inline-executed, not subagent-driven — this engagement's standing rule is that only the user commits, and subagent-driven-development's model (a fresh subagent per task, each making its own commits in an isolated worktree) doesn't fit that. Each task above ends at "ready for review," not a commit, so the user reviews and commits at whatever cadence they choose, same as every other feature built this engagement.

**REQUIRED SUB-SKILL:** `superpowers:executing-plans`, adapted for this repo: no worktree (all work happens in place, per this engagement's established pattern), and no commit steps (the user commits, not the executor).
