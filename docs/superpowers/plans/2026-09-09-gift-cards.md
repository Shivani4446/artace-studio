# Gift Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Status (as of implementation)

All 10 tasks' code is written. `npx tsc --noEmit`, `npm run lint`, `npm run build`, and the full Playwright e2e suite (9 tests, including 2 new ones in `e2e/gift-cards.spec.ts`) all pass clean. The hidden "Artace Gift Card" WooCommerce product was created via the Admin API — real id **4413**, confirmed `status: draft`, `tax_status: none`, and confirmed excluded from the public Store API (404). The real Loyalty subtotal-cap bug (Task 1) is fixed and verified against real catalog data. The purchase endpoint, the customer_id=0 exclusion assumption, and the checkout UI were all verified live via throwaway Admin-API test orders (created, inspected, deleted — never a real payment) and screenshots.

**What's genuinely still unverified, and needs your action:**
1. **`supabase/gift_cards.sql` has not been run yet** (confirmed via a live 404 against the table). `rewards_ledger` from the Loyalty program has been run — confirmed via a live read/write test.
2. **No real Razorpay payment has been made.** Every WooCommerce order created during verification was `set_paid: false` and deleted afterward — deliberately, since a real gift card purchase or checkout redemption test spends real money on your live Razorpay account, and that's not something to do without your explicit go-ahead. Once you're ready: purchase one real ₹1,000 gift card through `/gift-cards`, confirm the code arrives by email and matches the confirmation screen, then redeem part of it on a real cart order and confirm the remaining balance decreases correctly (Task 9's Step 6, and Task 6's deferred check).

**Goal:** Let customers purchase a gift card (₹1,000 / ₹2,500 / ₹5,000 / ₹10,000) as a guest, receive a redeemable code by email, and spend it — fully or partially, balance carried forward — at the main Artace checkout, stacking correctly with Artace Rewards points and coupons.

**Architecture:** A `gift_cards` Supabase table (declining balance, mirroring the Loyalty ledger's audit-trail approach) backs a code-based redemption system, independent of WooCommerce's native coupons (which can't decline a balance across multiple uses). Purchase reuses the exact guest-checkout + hidden-product pattern already proven for Custom Portraits. Redemption reuses the `fee_lines` discount mechanism already proven working for Loyalty points. **Task 1 of this plan fixes a real, separate bug found while researching it: the shipped Loyalty points-redemption code never caps against the order subtotal, only the customer's balance** — both features need the same real subtotal, so the fix and the new feature share one utility.

**Tech Stack:** Next.js App Router (edge runtime), Supabase (REST, matching `lib/rewards/ledger.ts`'s pattern), WooCommerce REST API (`wc/v3`), Resend (email delivery, matching `lib/api-route-handlers/trade-leads/route.ts`'s pattern).

**Spec:** `docs/superpowers/specs/2026-09-09-gift-cards-design.md`

## Global Constraints

- **Numbers, verbatim from the spec:** denominations ₹1,000 / ₹2,500 / ₹5,000 / ₹10,000 only. No expiry. No refunds on purchased cards.
- **Redemption is code-based, not account-based** — a gift card code is its own credential; anyone holding it can check its balance or redeem it.
- **Purchase is guest-friendly** — no login required, mirroring Custom Portraits exactly.
- **Gift card purchases never earn Artace Rewards points** — they're guest orders (`customer_id` never set), so this holds automatically via the existing Loyalty crediting condition; verify this rather than assuming it during Task 7.
- **No test framework beyond the Playwright e2e suite.** Verification per task: `npx tsc --noEmit`, plus a live check appropriate to the task — a throwaway Admin-API order (created then deleted with `?force=true`, never a real payment) for anything WooCommerce-pricing-related, or the Playwright suite for UI/API-contract behavior.
- **Never run `git commit`/`git push`.** No task below includes a commit step — the user reviews and commits everything.
- **Port 3000 is the user's own dev server — never touch it.** Every live-check step uses a fresh, incrementing port and confirms port 3000's state is unchanged before and after.
- **Never fabricate business data.** Every number and piece of copy below is either already decided in the spec or explicitly left for the user.

---

### Task 1: Shared catalog-price utility + fix the Loyalty subtotal-cap gap

**Files:**
- Create: `lib/woocommerce/catalog-prices.ts`
- Modify: `lib/samora/pricing.server.ts` (reuse the new shared helper instead of its own inline fetch)
- Create: `lib/checkout/subtotal.ts`
- Modify: `lib/api-route-handlers/checkout/route.ts` (fix the points-redemption cap)

**Interfaces:**
- Produces: `fetchCatalogPrices(productIds: number[]): Promise<Map<number, number>>` (from `lib/woocommerce/catalog-prices.ts`); `calculateOrderSubtotal(lineItems: { product_id: number; quantity: number; subtotal?: string }[]): Promise<number>` (from `lib/checkout/subtotal.ts`) — Task 8 (gift card redemption) also consumes this.

**Real gap found, not part of the original scope but real and worth fixing now:** `lib/api-route-handlers/checkout/route.ts`'s points-redemption validation (added when Loyalty was built) checks `requestedPoints > balance` and the minimum threshold, but never checks `requestedPoints` against what the order is actually worth — a customer with a large balance could apply more points than their cart total, driving the order negative. The UI (`ApplyPointsBox.tsx`) caps this client-side, but the route's own comment says "never trust the client's number," and server-side, nothing currently enforces it.

- [ ] **Step 1: Extract the shared catalog-price fetcher**

`lib/samora/pricing.server.ts`'s `fetchLineItemTotals` already does a batch `wc/v3/products?include=...` lookup — pull just that lookup out into its own file so both Samora and the main checkout can use it, without duplicating WooCommerce fetch logic:

```ts
// lib/woocommerce/catalog-prices.ts
const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";

const toBasicAuthToken = (username: string, password: string) => {
  const raw = `${username}:${password}`;
  if (typeof btoa === "function") return btoa(raw);
  const maybeBuffer = globalThis as {
    Buffer?: { from: (v: string) => { toString: (enc: string) => string } };
  };
  if (maybeBuffer.Buffer) return maybeBuffer.Buffer.from(raw).toString("base64");
  throw new Error("No base64 encoder available.");
};

type WooV3Product = { id: number; price?: string; weight?: string; tags?: { id: number; slug: string }[] };

/**
 * Batch-fetches real catalog prices (and full product records, for callers
 * that need more than price — see fetchLineItemTotals in lib/samora/pricing.server.ts)
 * via the Admin API. Returns an empty map on any failure — callers must treat
 * a missing id as "price unknown," never as zero-and-therefore-free.
 */
export const fetchCatalogProducts = async (
  productIds: number[]
): Promise<Map<number, WooV3Product>> => {
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  const apiBaseUrl = (
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    process.env.WOOCOMMERCE_REST_URL ||
    DEFAULT_WOOCOMMERCE_SITE_URL
  ).replace(/\/+$/, "");

  const uniqueIds = Array.from(new Set(productIds));
  const productsById = new Map<number, WooV3Product>();
  if (!consumerKey || !consumerSecret || uniqueIds.length === 0) return productsById;

  try {
    const basicToken = toBasicAuthToken(consumerKey, consumerSecret);
    const response = await fetch(
      `${apiBaseUrl}/wp-json/wc/v3/products?include=${uniqueIds.join(",")}&per_page=${uniqueIds.length}`,
      { headers: { Authorization: `Basic ${basicToken}` }, cache: "no-store" }
    );
    if (response.ok) {
      const payload = (await response.json()) as WooV3Product[];
      if (Array.isArray(payload)) payload.forEach((product) => productsById.set(product.id, product));
    }
  } catch {
    // Empty map — callers fall back to treating price as unknown.
  }

  return productsById;
};

export const fetchCatalogPrices = async (productIds: number[]): Promise<Map<number, number>> => {
  const products = await fetchCatalogProducts(productIds);
  const prices = new Map<number, number>();
  for (const [id, product] of products) {
    const price = Number(product.price);
    if (Number.isFinite(price)) prices.set(id, price);
  }
  return prices;
};
```

- [ ] **Step 2: Refactor `fetchLineItemTotals` to use it (behavior-preserving)**

In `lib/samora/pricing.server.ts`, replace the inline `toBasicAuthToken`/fetch block with:

```ts
import { fetchCatalogProducts } from "@/lib/woocommerce/catalog-prices";

export const fetchLineItemTotals = async (
  lineItems: { product_id: number; quantity: number }[]
): Promise<{ subtotalInr: number; totalWeightGrams: number; allItemsAreSamora: boolean }> => {
  const uniqueIds = Array.from(new Set(lineItems.map((item) => item.product_id)));
  const productsById = await fetchCatalogProducts(uniqueIds);

  let subtotalInr = 0;
  let totalWeightGrams = 0;
  let allItemsAreSamora = uniqueIds.length > 0;

  for (const item of lineItems) {
    const product = productsById.get(item.product_id);
    const price = Number(product?.price);
    const weightKg = Number(product?.weight);

    subtotalInr += (Number.isFinite(price) ? price : 0) * item.quantity;
    totalWeightGrams +=
      (Number.isFinite(weightKg) && weightKg > 0 ? weightKg * 1000 : SAMORA_DEFAULT_ITEM_WEIGHT_GRAMS) *
      item.quantity;

    if (!product || !hasSamoraTag(product.tags)) {
      allItemsAreSamora = false;
    }
  }

  return { subtotalInr, totalWeightGrams, allItemsAreSamora };
};
```

Remove the now-unused `toBasicAuthToken` and `WooV3Product`/`WooV3Tag` local type definitions from this file (they moved to Task 1 Step 1's new file) and the now-unused `DEFAULT_WOOCOMMERCE_SITE_URL` constant if nothing else in the file still uses it — check before deleting.

- [ ] **Step 3: Write the order-subtotal calculator**

```ts
// lib/checkout/subtotal.ts
import { fetchCatalogPrices } from "@/lib/woocommerce/catalog-prices";

type SubtotalLineItem = { product_id: number; quantity: number; subtotal?: string };

/**
 * The real, authoritative pre-discount order total: uses each line item's
 * own price override when present (custom frame sizing, prints, deposits),
 * and looks up the real WooCommerce catalog price for anything without one.
 * This is what points/gift-card discounts must be capped against — never
 * the client's own cart total, which isn't trusted for a charge decision
 * anywhere else in this codebase either.
 */
export const calculateOrderSubtotal = async (lineItems: SubtotalLineItem[]): Promise<number> => {
  const idsNeedingLookup = lineItems.filter((item) => item.subtotal === undefined).map((item) => item.product_id);
  const catalogPrices = await fetchCatalogPrices(idsNeedingLookup);

  let subtotal = 0;
  for (const item of lineItems) {
    if (item.subtotal !== undefined) {
      const overridden = Number(item.subtotal);
      subtotal += Number.isFinite(overridden) ? overridden : 0;
    } else {
      const price = catalogPrices.get(item.product_id) ?? 0;
      subtotal += price * item.quantity;
    }
  }
  return subtotal;
};
```

- [ ] **Step 4: Fix the Loyalty points cap**

In `lib/api-route-handlers/checkout/route.ts`, add the import:

```ts
import { calculateOrderSubtotal } from "@/lib/checkout/subtotal";
```

Change the points-validation block (the one starting `const requestedPoints = Math.floor(...)`) to also check against the real subtotal. **Compute `orderSubtotal` once, unconditionally, before the points check** — not inside the `if (requestedPoints > 0)` block — both because Task 7 (gift card redemption) needs this same value later in the same function, and a value declared inside that `if` block would be out of scope there, and because computing it twice (once for points, once for gift cards) would mean two redundant WooCommerce catalog-price lookups per request when a customer uses both:

```ts
const orderSubtotal = await calculateOrderSubtotal(normalizedLineItems);

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

  if (requestedPoints * POINT_VALUE_INR > orderSubtotal) {
    return NextResponse.json(
      { error: "You're trying to redeem more points than this order is worth." },
      { status: 400 }
    );
  }

  pointsToRedeem = requestedPoints;
}
```

`orderSubtotal` stays in scope for the rest of the function — Task 7 Step 2 reuses this exact variable, not a recomputed one.

This needs `normalizedLineItems` to already be computed above this point — confirm it is (it's used a few lines below for `totalQuantity`, so it already exists earlier in the function; just move this validation block to after `normalizedLineItems` is defined if it currently isn't already, which the current line numbers suggest it is).

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 6: Verify the subtotal fix and the Samora refactor are both behavior-preserving**

Two throwaway Admin-API test orders (create with `set_paid: false`, inspect, delete with `?force=true` — no real payment, matching the pattern already used to test `fee_lines` for Loyalty):
1. A normal Artace cart order (any real product, no overrides) — confirm `calculateOrderSubtotal` (call it directly in a scratch script, or via a temporary `console.log` in the route) returns the same number as the order's own eventual `total` from WooCommerce.
2. A Samora order (any product tagged for Samora) — confirm `fetchLineItemTotals`'s `subtotalInr`/`allItemsAreSamora` results are unchanged from before the refactor (same inputs, same outputs) — this is a pure refactor, so any difference is a regression to fix before continuing.

Then confirm the actual bug fix live: attempt (via a raw `fetch` to the local dev server's `/api/checkout`, not through the UI, so the client-side cap in `ApplyPointsBox.tsx` doesn't get in the way of testing the server) to redeem more points than a cheap test order is worth, using a test account that has enough balance to do so. Expected: `400` with the new "more points than this order is worth" error.

- [ ] **Task complete — ready for review.**

---

### Task 2: Data model

**Files:**
- Create: `supabase/gift_cards.sql`

**Interfaces:** none (SQL only; Task 4 consumes the schema).

- [ ] **Step 1: Write the SQL file**

```sql
-- Gift cards — run this in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS gift_cards (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  original_amount NUMERIC NOT NULL,
  remaining_balance NUMERIC NOT NULL,
  purchaser_email TEXT NOT NULL,
  wc_order_id BIGINT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'depleted'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gift_cards_code_idx ON gift_cards (code);

CREATE TABLE IF NOT EXISTS gift_card_redemptions (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  gift_card_id BIGINT NOT NULL REFERENCES gift_cards(id),
  wc_order_id BIGINT NOT NULL,
  amount_redeemed NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_redemptions ENABLE ROW LEVEL SECURITY;
```

- [ ] **Task complete — ready for review.** Note for the user: run this alongside `supabase/rewards_ledger.sql` if that hasn't happened yet either.

---

### Task 3: Hidden "Artace Gift Card" WooCommerce product

**Files:** none (a live WooCommerce Admin API operation, same as Custom Portraits' Task 2 in `docs/superpowers/plans/2026-08-11-custom-portraits.md`).

**Interfaces:**
- Produces: a numeric WooCommerce product id, hardcoded as `GIFT_CARD_PRODUCT_ID` in Task 4.

- [ ] **Step 1: Create the product**

```bash
curl -s -u "$WOOCOMMERCE_CONSUMER_KEY:$WOOCOMMERCE_CONSUMER_SECRET" \
  -X POST "https://api.artacestudio.com/wp-json/wc/v3/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Artace Gift Card",
    "type": "simple",
    "status": "draft",
    "virtual": true,
    "sold_individually": true,
    "tax_status": "none",
    "regular_price": "1",
    "short_description": "A digital gift card. The final charge is set per order to the denomination purchased and does not reflect this product'\''s catalog price."
  }'
```

`status: "draft"` (not `"publish"`) and `tax_status: "none"` — both per the spec's Decision 2, matching the already-proven Custom Portraits pattern and deliberately sidestepping the unresolved tax/pricing discrepancy found during Loyalty's testing.

- [ ] **Step 2: Record the id and verify it's excluded from the public catalog**

Record the returned `id` — this becomes `GIFT_CARD_PRODUCT_ID` in Task 4. Confirm via the public Store API that it does not appear:

```bash
curl -s "https://api.artacestudio.com/wp-json/wc/store/v1/products/<the new id>"
```

Expected: a 404 or "not found"-shaped response, same as `CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID` already verified to behave.

- [ ] **Task complete — ready for review.**

---

### Task 4: Shared gift-card utility — `lib/gift-cards/`

**Files:**
- Create: `lib/gift-cards/constants.ts`
- Create: `lib/gift-cards/code.ts`
- Create: `lib/gift-cards/ledger.ts`
- Create: `lib/gift-cards/email.ts`

**Interfaces:**
- Consumes: `GIFT_CARD_PRODUCT_ID` (Task 3's real id).
- Produces: `DENOMINATIONS`, `PROGRAM_NAME` (constants); `generateGiftCardCode(): string`; `createGiftCard(input: { amount: number; purchaserEmail: string; wcOrderId: number }): Promise<{ code: string }>`, `getGiftCardBalance(code: string): Promise<{ found: boolean; remainingBalance: number; status: string }>`, `redeemGiftCard(input: { code: string; wcOrderId: number; amount: number }): Promise<void>` (ledger); `sendGiftCardEmail(input: { to: string; code: string; amount: number }): Promise<void>` (email).

- [ ] **Step 1: Write the constants file**

```ts
// lib/gift-cards/constants.ts

/** Replace with the real id recorded in Task 3, Step 2. */
export const GIFT_CARD_PRODUCT_ID = 0; // TASK 3's real id goes here — do not leave as 0.

export const DENOMINATIONS = [1000, 2500, 5000, 10000] as const;

export const PROGRAM_NAME = "Artace Gift Card";
```

**Do not leave `GIFT_CARD_PRODUCT_ID = 0`** — this is a real placeholder that must be replaced with Task 3's actual returned id before this compiles into anything meaningful; flagged explicitly here rather than silently shipped, since `0` would never match a real order's line items and every gift-card-detection check downstream would silently fail closed (safe, but inert — same failure mode as an unrun SQL migration).

- [ ] **Step 2: Write the code generator**

```ts
// lib/gift-cards/code.ts

// Excludes visually ambiguous characters (0/O, 1/I) since a purchaser may
// read this aloud or retype it from a screenshot.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const randomSegment = (): string =>
  Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

export const generateGiftCardCode = (): string => `ARTACE-${randomSegment()}-${randomSegment()}-${randomSegment()}`;
```

- [ ] **Step 3: Write the ledger utility**

```ts
// lib/gift-cards/ledger.ts
import { generateGiftCardCode } from "./code";

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

const supabaseHeaders = (extra?: Record<string, string>) => ({
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  ...extra,
});

type GiftCardRow = {
  id: number;
  code: string;
  remaining_balance: number;
  status: string;
};

const MAX_CODE_ATTEMPTS = 5;

export const createGiftCard = async (input: {
  amount: number;
  purchaserEmail: string;
  wcOrderId: number;
}): Promise<{ code: string }> => {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const code = generateGiftCardCode();

    const existingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/gift_cards?code=eq.${encodeURIComponent(code)}&select=id&limit=1`,
      { headers: supabaseHeaders() }
    );
    const existing = existingRes.ok ? ((await existingRes.json()) as { id: number }[]) : [];
    if (Array.isArray(existing) && existing.length > 0) continue; // Vanishingly rare collision — retry with a new code.

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/gift_cards`, {
      method: "POST",
      headers: supabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        code,
        original_amount: input.amount,
        remaining_balance: input.amount,
        purchaser_email: input.purchaserEmail,
        wc_order_id: input.wcOrderId,
        status: "active",
      }),
    });
    if (!insertRes.ok) continue;

    return { code };
  }

  throw new Error("Could not generate a unique gift card code after several attempts.");
};

export const getGiftCardBalance = async (
  code: string
): Promise<{ found: boolean; remainingBalance: number; status: string }> => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !code) {
    return { found: false, remainingBalance: 0, status: "" };
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/gift_cards?code=eq.${encodeURIComponent(code)}&select=remaining_balance,status&limit=1`,
      { headers: supabaseHeaders() }
    );
    if (!response.ok) return { found: false, remainingBalance: 0, status: "" };
    const rows = (await response.json()) as { remaining_balance: number; status: string }[];
    if (!Array.isArray(rows) || rows.length === 0) return { found: false, remainingBalance: 0, status: "" };
    return { found: true, remainingBalance: rows[0].remaining_balance, status: rows[0].status };
  } catch {
    return { found: false, remainingBalance: 0, status: "" };
  }
};

export const redeemGiftCard = async (input: {
  code: string;
  wcOrderId: number;
  amount: number;
}): Promise<void> => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || input.amount <= 0) return;

  try {
    // Re-read the current balance immediately before writing — never trust
    // a balance read earlier in the request, same discipline as the Loyalty ledger.
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/gift_cards?code=eq.${encodeURIComponent(input.code)}&select=id,remaining_balance`,
      { headers: supabaseHeaders() }
    );
    if (!response.ok) return;
    const rows = (await response.json()) as GiftCardRow[];
    if (!Array.isArray(rows) || rows.length === 0) return;

    const card = rows[0];
    const newBalance = Math.max(0, card.remaining_balance - input.amount);

    await fetch(`${SUPABASE_URL}/rest/v1/gift_cards?id=eq.${card.id}`, {
      method: "PATCH",
      headers: supabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        remaining_balance: newBalance,
        status: newBalance === 0 ? "depleted" : "active",
      }),
    });

    await fetch(`${SUPABASE_URL}/rest/v1/gift_card_redemptions`, {
      method: "POST",
      headers: supabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        gift_card_id: card.id,
        wc_order_id: input.wcOrderId,
        amount_redeemed: input.amount,
      }),
    });
  } catch {
    // Never let a redemption-logging failure affect the checkout response —
    // same defensive posture as every other ledger write this engagement.
  }
};
```

- [ ] **Step 4: Write the email sender**

```ts
// lib/gift-cards/email.ts
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "";

export const sendGiftCardEmail = async (input: {
  to: string;
  code: string;
  amount: number;
}): Promise<void> => {
  if (!RESEND_API_KEY || !RESEND_FROM || !input.to) return;

  const text = [
    "Thank you for your Artace Gift Card purchase!",
    "",
    `Your code: ${input.code}`,
    `Value: ₹${input.amount.toLocaleString("en-IN")}`,
    "",
    "This code never expires and can be redeemed at checkout on artacestudio.com,",
    "in full or across multiple orders — any unused balance carries forward.",
  ].join("\n");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [input.to],
      subject: "Your Artace Gift Card",
      text,
    }),
  });
};
```

- [ ] **Step 5: Replace the placeholder product id**

Edit `lib/gift-cards/constants.ts` from Step 1, replacing `export const GIFT_CARD_PRODUCT_ID = 0;` with the real id from Task 3.

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Task complete — ready for review.**

---

### Task 5: Purchase flow — `/api/gift-cards`

**Files:**
- Create: `lib/api-route-handlers/gift-cards/route.ts`
- Modify: `app/api/[[...path]]/route.ts` (register the route)

**Interfaces:**
- Consumes: `GIFT_CARD_PRODUCT_ID`, `DENOMINATIONS` (Task 4).
- Produces: `POST /api/gift-cards` → same response shape as `/api/custom-portraits` (`{ success, orderId, orderKey, orderNumber, razorpay: {...} }`), consumed by Task 9's purchase form.

- [ ] **Step 1: Write the route**

```ts
// lib/api-route-handlers/gift-cards/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  createWooCommerceOrder,
  getWooCommercePaymentConfig,
  mergeWooMetaData,
  parseAmountToMinorUnits,
  sanitizeText,
  updateWooCommerceOrder,
} from "@/utils/woocommerce-checkout";
import { createRazorpayOrder, getRazorpayPublicConfig } from "@/utils/razorpay";
import { GIFT_CARD_PRODUCT_ID, DENOMINATIONS } from "@/lib/gift-cards/constants";

export const runtime = "edge";

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

type GiftCardPurchaseRequestBody = {
  amount?: unknown;
  purchaserName?: unknown;
  purchaserEmail?: unknown;
};

export async function POST(request: NextRequest) {
  let body: GiftCardPurchaseRequestBody;

  try {
    body = (await request.json()) as GiftCardPurchaseRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const amount = Number(body.amount);
  const purchaserName = sanitizeText(body.purchaserName);
  const purchaserEmail = sanitizeText(body.purchaserEmail);

  if (!(DENOMINATIONS as readonly number[]).includes(amount)) {
    return NextResponse.json({ error: "Please choose one of the available gift card amounts." }, { status: 400 });
  }
  if (!purchaserName) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!purchaserEmail || !isValidEmail(purchaserEmail)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const parts = purchaserName.split(/\s+/);
  const firstName = parts[0] || purchaserName;
  const lastName = parts.slice(1).join(" ");

  const { paymentMethod, paymentMethodTitle } = getWooCommercePaymentConfig();

  try {
    const wooOrder = await createWooCommerceOrder({
      payment_method: paymentMethod,
      payment_method_title: paymentMethodTitle,
      set_paid: false,
      billing: { first_name: firstName, last_name: lastName, email: purchaserEmail, phone: "" },
      line_items: [
        {
          product_id: GIFT_CARD_PRODUCT_ID,
          quantity: 1,
          subtotal: amount.toFixed(2),
          total: amount.toFixed(2),
        },
      ],
      customer_note: `Artace Gift Card purchase — ₹${amount}`,
    });

    if (!wooOrder.orderId || !wooOrder.orderKey) {
      throw new Error("WooCommerce did not return a valid order identifier.");
    }

    const minorAmount = parseAmountToMinorUnits(wooOrder.total);
    if (!minorAmount) {
      throw new Error("WooCommerce returned an invalid order total for payment.");
    }

    const razorpayOrder = await createRazorpayOrder({
      amount: minorAmount,
      currency: wooOrder.currency || "INR",
      receipt: `giftcard_${wooOrder.orderId}`,
      notes: { woo_order_id: String(wooOrder.orderId), woo_order_key: wooOrder.orderKey, woo_order_number: wooOrder.orderNumber },
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
      razorpay: {
        keyId,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Artace Gift Card",
        description: `Gift Card — ₹${amount}`,
        prefill: { name: purchaserName, email: purchaserEmail, contact: "" },
        notes: razorpayOrder.notes,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start your gift card purchase." },
      { status: 502 }
    );
  }
}
```

- [ ] **Step 2: Register the route**

In `app/api/[[...path]]/route.ts`, add the import in alphabetical order (after `designPartnersRoute`, before `homepageHighlightsRoute` — "gift-cards" sorts between "design-partners" and "homepage"):

```ts
import * as giftCardsRoute from "@/lib/api-route-handlers/gift-cards/route";
```

And the `ROUTES` entry in the matching alphabetical spot:

```ts
"gift-cards": {
  POST: (request) => giftCardsRoute.POST(request),
},
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Verify live with a real (small) throwaway purchase attempt**

Start a local dev server on a fresh port (confirm port 3000 unchanged first), then:

```bash
curl -s -X POST http://localhost:3062/api/gift-cards \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "purchaserName": "Test Buyer", "purchaserEmail": "test@example.com"}'
```

Expected: a `200` with `success: true` and a real `razorpay.orderId`. Then clean up the resulting WooCommerce order via the Admin API (`DELETE /wc/v3/orders/<id>?force=true`) — this request never completes a real payment, so it's safe to just delete afterward rather than leaving a stray pending order.

Also verify rejection: `{"amount": 999, ...}` → `400` (not one of the real denominations).

- [ ] **Task complete — ready for review.**

---

### Task 6: Gift card generation + email at payment verification

**Files:**
- Modify: `lib/api-route-handlers/checkout/verify/route.ts`

**Interfaces:**
- Consumes: `createGiftCard`, `sendGiftCardEmail` (Task 4); `GIFT_CARD_PRODUCT_ID` (Task 4).
- Produces: the verify route's JSON response gains an optional `giftCardCode?: string` field, populated only when this request generated one.

- [ ] **Step 1: Add the imports**

```ts
import { createGiftCard } from "@/lib/gift-cards/ledger";
import { sendGiftCardEmail } from "@/lib/gift-cards/email";
import { GIFT_CARD_PRODUCT_ID } from "@/lib/gift-cards/constants";
```

- [ ] **Step 2: Add the gift-card-purchase branch**

Inside the same `if (isFirstTimeFinalization) { ... }` block Loyalty's crediting logic already lives in (added in the Loyalty program's Task 4), add a sibling branch. This needs a variable the response can read after the block — declare it just above the `if (isFirstTimeFinalization)` block:

```ts
let generatedGiftCardCode: string | undefined;
```

Then, as a new `if` alongside the existing Loyalty crediting `if (!isCustomPortraitOrder && wooOrder.customerId > 0) { ... }` (a sibling, not nested inside it):

```ts
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
```

- [ ] **Step 3: Confirm the Loyalty exclusion holds without changes, then verify it**

Gift card purchases are guest orders (Task 5 never sets `customer_id`), so `wooOrder.customerId > 0` is already `false` for them — the existing Loyalty crediting condition excludes gift card orders automatically, with no change needed to that condition. Confirm this is actually true (not just plausible) with a real throwaway order in Step 5 below, rather than trusting the reasoning alone.

- [ ] **Step 4: Include the code in the response**

Find the final `return NextResponse.json({ success: true, orderId: ..., ... })` and add:

```ts
...(generatedGiftCardCode ? { giftCardCode: generatedGiftCardCode } : {}),
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 6: Verify live end-to-end (still no real payment)**

This can't be fully driven through a real Razorpay payment without spending real money, but the verify route itself can be called directly, the same way Custom Portraits' own verify flow gets exercised — with one real limitation to accept and note, not hide: `verifyRazorpayPaymentSignature` requires a signature that only Razorpay's real checkout can produce, so a *fully* isolated test of this exact route requires either a real payment or temporarily stubbing that check. Do not stub production code to make a test pass — instead:

1. Confirm Task 2's SQL has been run (ask the user if unconfirmed — nothing here works without it).
2. Place one real, small (₹1,000) gift card purchase through the actual `/gift-cards` page once Task 9 exists, as part of that task's own live-check step instead of here. Note that dependency explicitly rather than faking a pass now.
3. For now, confirm via `npx tsc --noEmit` and a code-reading pass that `isGiftCardOrder`'s check uses the same `wooOrder.lineItems`/`GIFT_CARD_PRODUCT_ID` shape already proven correct for the Custom Portraits exclusion (Task 4 of the Loyalty plan already verified `wooOrder.lineItems` populates correctly against a real order).

- [ ] **Task complete — ready for review, with the real end-to-end check deferred to Task 9 as noted above.**

---

### Task 7: Redemption at the main checkout

**Files:**
- Modify: `lib/api-route-handlers/checkout/route.ts`
- Modify: `lib/api-route-handlers/checkout/verify/route.ts`

**Interfaces:**
- Consumes: `getGiftCardBalance`, `redeemGiftCard` (Task 4); `calculateOrderSubtotal` (Task 1).
- Produces: `CheckoutRequestBody.giftCardCode?: string`; order meta keys `_artace_gift_card_code`, `_artace_gift_card_amount`.

- [ ] **Step 1: Add the import and request field**

```ts
import { getGiftCardBalance } from "@/lib/gift-cards/ledger";
```

Add to `CheckoutRequestBody`:

```ts
giftCardCode?: string;
```

- [ ] **Step 2: Validate and apply the gift card discount**

After Task 1's fixed points-validation block (so `orderSubtotal` and `pointsToRedeem` are both already resolved, in scope, and computed exactly once) and before the `const feeLines` declaration, add:

```ts
let giftCardApplied = 0;
let giftCardCodeNormalized = "";

if (body.giftCardCode) {
  giftCardCodeNormalized = sanitizeText(body.giftCardCode).toUpperCase();
  const giftCard = await getGiftCardBalance(giftCardCodeNormalized);

  if (!giftCard.found || giftCard.status !== "active" || giftCard.remainingBalance <= 0) {
    return NextResponse.json(
      { error: "That gift card code isn't valid or has no remaining balance." },
      { status: 400 }
    );
  }

  const remainingAfterPoints = Math.max(0, orderSubtotal - pointsToRedeem);
  giftCardApplied = Math.min(giftCard.remainingBalance, remainingAfterPoints);
}
```

Then add the fee line, alongside the existing points fee line push:

```ts
if (giftCardApplied > 0) {
  feeLines.push({ name: "Gift Card Redemption", total: (-giftCardApplied).toFixed(2) });
}
```

- [ ] **Step 3: Stash the redemption intent in order meta**

Add to the same `mergeWooMetaData` call points redemption already added a key to:

```ts
...(giftCardApplied > 0
  ? { _artace_gift_card_code: giftCardCodeNormalized, _artace_gift_card_amount: String(giftCardApplied) }
  : {}),
```

- [ ] **Step 4: Debit the gift card at verify time**

In `lib/api-route-handlers/checkout/verify/route.ts`, add the import:

```ts
import { redeemGiftCard } from "@/lib/gift-cards/ledger";
```

Inside the same `if (isFirstTimeFinalization)` block, as another step alongside the Loyalty debit (which currently reads `_artace_points_to_redeem`), add:

```ts
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
```

This can live outside the Loyalty `if (!isCustomPortraitOrder && wooOrder.customerId > 0)` condition (a gift card can be redeemed by any logged-in customer regardless of whether they also earn/redeem points on the same order — these are independent discounts, per the spec's stacking decision), but should still be gated by `isFirstTimeFinalization` to avoid double-redeeming on a retried verify call, matching the same idempotency discipline as everything else in this block.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 6: Verify the combined-discount cap live**

A throwaway Admin-API test order (create with a manually-seeded test gift card row and enough Loyalty points balance to exceed the order's value combined, verify the actual applied fee lines never exceed the subtotal, delete afterward) — mirrors the verification approach already proven for the `fee_lines` mechanism itself.

- [ ] **Task complete — ready for review.**

---

### Task 8: Checkout UI — "Redeem a Gift Card" + balance-check endpoint

**Files:**
- Create: `lib/api-route-handlers/gift-cards/balance/route.ts`
- Modify: `app/api/[[...path]]/route.ts`
- Create: `components/checkout/RedeemGiftCardBox.tsx`
- Modify: `app/checkout/checkout-client.tsx`

**Interfaces:**
- Consumes: `getGiftCardBalance` (Task 4).
- Produces: `GET /api/gift-cards/balance?code=...` → `{ found: boolean; remainingBalance: number }` (no auth — the code is the credential); `<RedeemGiftCardBox subtotal={number} onAmountChange={(amount: number, code: string) => void} />`.

- [ ] **Step 1: Write the balance-check route**

```ts
// lib/api-route-handlers/gift-cards/balance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getGiftCardBalance } from "@/lib/gift-cards/ledger";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase() || "";
  if (!code) {
    return NextResponse.json({ found: false, remainingBalance: 0 });
  }

  const result = await getGiftCardBalance(code);
  return NextResponse.json({ found: result.found && result.status === "active", remainingBalance: result.remainingBalance });
}
```

- [ ] **Step 2: Register the route**

```ts
import * as giftCardsBalanceRoute from "@/lib/api-route-handlers/gift-cards/balance/route";
```

```ts
"gift-cards/balance": {
  GET: (request) => giftCardsBalanceRoute.GET(request),
},
```

(Alphabetically, `gift-cards/balance` sorts right after the plain `"gift-cards"` entry from Task 5.)

- [ ] **Step 3: Write the checkout box**

```tsx
// components/checkout/RedeemGiftCardBox.tsx
"use client";

import { useState } from "react";

type RedeemGiftCardBoxProps = {
  subtotal: number;
  onAmountChange: (amount: number, code: string) => void;
};

const RedeemGiftCardBox = ({ subtotal, onAmountChange }: RedeemGiftCardBoxProps) => {
  const [codeInput, setCodeInput] = useState("");
  const [applied, setApplied] = useState<{ code: string; amount: number } | null>(null);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleApply = async () => {
    setError("");
    const normalized = codeInput.trim().toUpperCase();
    if (!normalized) return;

    setIsChecking(true);
    try {
      const res = await fetch(`/api/gift-cards/balance?code=${encodeURIComponent(normalized)}`);
      const data = (await res.json()) as { found?: boolean; remainingBalance?: number };

      if (!data.found || !data.remainingBalance) {
        setError("That gift card code isn't valid or has no remaining balance.");
        return;
      }

      const amountToApply = Math.min(data.remainingBalance, Math.floor(subtotal));
      setApplied({ code: normalized, amount: amountToApply });
      onAmountChange(amountToApply, normalized);
    } catch {
      setError("Couldn't check that code right now — please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="mt-5 rounded-[18px] border border-[#1f1f1f]/8 bg-white px-5 py-5">
      <p className="text-sm font-semibold text-[#1f1f1f]">Redeem a Gift Card</p>

      {applied ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#eef7f0] px-3 py-1 text-xs font-semibold text-[#116329]">
            − ₹{applied.amount.toLocaleString("en-IN")} applied ({applied.code})
          </span>
          <button
            type="button"
            onClick={() => {
              setApplied(null);
              setCodeInput("");
              onAmountChange(0, "");
            }}
            className="text-xs font-semibold text-[#1f1f1f] underline underline-offset-4"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="ARTACE-XXXX-XXXX-XXXX"
            className="min-h-11 w-full flex-1 rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={isChecking || !codeInput.trim()}
            className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#1f1f1f] transition-colors hover:bg-[#f5f0e8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChecking ? "Checking..." : "Apply"}
          </button>
        </div>
      )}

      {error ? <p className="mt-3 text-sm leading-6 text-[#b42318]">{error}</p> : null}
    </div>
  );
};

export default RedeemGiftCardBox;
```

- [ ] **Step 4: Wire it into checkout-client.tsx**

```ts
import RedeemGiftCardBox from "@/components/checkout/RedeemGiftCardBox";
```

State near `pointsToRedeem`:

```ts
const [giftCardAmount, setGiftCardAmount] = useState(0);
const [giftCardCode, setGiftCardCode] = useState("");
```

Render right after `<ApplyPointsBox ... />`:

```tsx
<RedeemGiftCardBox
  subtotal={subtotal}
  onAmountChange={(amount, code) => {
    setGiftCardAmount(amount);
    setGiftCardCode(code);
  }}
/>
```

Add to the `/api/checkout` POST body, alongside `pointsToRedeem`:

```ts
giftCardCode: giftCardAmount > 0 ? giftCardCode : undefined,
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 6: Verify live**

Seed one real test gift card row directly via Supabase (once Task 2's SQL is confirmed run), load `/checkout` on a fresh local dev server, confirm entering that real code shows the correct discount preview, and that removing it clears the applied state.

- [ ] **Task complete — ready for review.**

---

### Task 9: Public `/gift-cards` page (purchase + balance checker) + navigation

**Files:**
- Create: `components/gift-cards/GiftCardPurchaseForm.tsx`
- Create: `components/gift-cards/GiftCardBalanceChecker.tsx`
- Create: `app/gift-cards/page.tsx`
- Modify: `components/navbar.tsx`
- Modify: `components/footer.tsx`
- Modify: `app/sitemap.ts`

**Interfaces:**
- Consumes: `DENOMINATIONS`, `PROGRAM_NAME` (Task 4); `POST /api/gift-cards` (Task 5); `GET /api/gift-cards/balance` (Task 8); `FAQSection` (existing).

- [ ] **Step 1: Write the purchase form**

Structured exactly like `CustomPortraitForm.tsx`'s Razorpay-invocation section (script loading, `RazorpayInstance`/`RazorpayOptions` types, `handler` calling `/api/checkout/verify`) — the implementer should copy that file's Razorpay-script-loading `useEffect` and type definitions verbatim (lines roughly 24-135 of `CustomPortraitForm.tsx` as of the Loyalty program's work) rather than retyping them from scratch, since this plan reproducing that boilerplate a second time risks it drifting from the real, working original. The parts genuinely specific to this component:

```tsx
"use client";

// ... same Razorpay type definitions and script-loading useEffect as CustomPortraitForm.tsx ...

import { useState } from "react";
import { DENOMINATIONS } from "@/lib/gift-cards/constants";

const GiftCardPurchaseForm = () => {
  const [amount, setAmount] = useState<number>(DENOMINATIONS[0]);
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [stage, setStage] = useState<"idle" | "submitting" | "verifying" | "confirmed">("idle");
  const [error, setError] = useState("");
  const [confirmedCode, setConfirmedCode] = useState("");
  // ... isRazorpayReady state + script-loading effect, copied as noted above ...

  const handleSubmit = async () => {
    setError("");
    if (!purchaserName.trim() || !purchaserEmail.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    if (!isRazorpayReady || !window.Razorpay) {
      setError("Payment is still loading. Please try again in a moment.");
      return;
    }

    setStage("submitting");

    try {
      const response = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, purchaserName, purchaserEmail }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success || !payload.razorpay) {
        throw new Error(payload.error || "Unable to start your gift card purchase.");
      }

      const razorpay = new window.Razorpay({
        key: payload.razorpay.keyId,
        amount: payload.razorpay.amount,
        currency: payload.razorpay.currency,
        name: payload.razorpay.name,
        description: payload.razorpay.description,
        order_id: payload.razorpay.orderId,
        prefill: payload.razorpay.prefill,
        notes: payload.razorpay.notes,
        theme: { color: "#1f1f1f" },
        modal: { ondismiss: () => { setStage("idle"); setError("Payment window closed before completion."); } },
        handler: async (razorpayResponse: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            setStage("verifying");
            const verifyResponse = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: payload.orderId,
                orderKey: payload.orderKey,
                razorpayOrderId: razorpayResponse.razorpay_order_id,
                razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                razorpaySignature: razorpayResponse.razorpay_signature,
              }),
            });
            const verifyPayload = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyPayload.success) {
              setStage("idle");
              setError(verifyPayload.error || "Payment completed, but verification failed. Please contact support.");
              return;
            }

            setConfirmedCode(verifyPayload.giftCardCode || "");
            setStage("confirmed");
          } catch {
            setStage("idle");
            setError("Payment completed, but verification failed. Please contact support.");
          }
        },
      });
      razorpay.open();
    } catch (err) {
      setStage("idle");
      setError(err instanceof Error ? err.message : "Unable to start your gift card purchase.");
    }
  };

  if (stage === "confirmed") {
    return (
      <div className="rounded-[18px] bg-white p-8 text-center">
        <p className="font-display text-[22px] text-[#1f1f1f]">Your gift card is ready!</p>
        <p className="mt-3 font-mono text-[20px] tracking-wide text-[#1f1f1f]">{confirmedCode}</p>
        <p className="mt-2 text-sm text-[#666]">We've also emailed this code to {purchaserEmail}.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[18px] bg-white p-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {DENOMINATIONS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setAmount(value)}
            className={`rounded-[12px] border px-4 py-3 text-sm font-semibold transition-colors ${
              amount === value ? "border-[#1f1f1f] bg-[#1f1f1f] text-white" : "border-black/10 text-[#1f1f1f] hover:bg-[#f5f0e8]"
            }`}
          >
            ₹{value.toLocaleString("en-IN")}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={purchaserName}
        onChange={(e) => setPurchaserName(e.target.value)}
        placeholder="Your name"
        className="mt-4 min-h-11 w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] outline-none focus:border-[#1f1f1f]/35"
      />
      <input
        type="email"
        value={purchaserEmail}
        onChange={(e) => setPurchaserEmail(e.target.value)}
        placeholder="Your email"
        className="mt-3 min-h-11 w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] outline-none focus:border-[#1f1f1f]/35"
      />

      {error ? <p className="mt-3 text-sm text-[#b42318]">{error}</p> : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={stage === "submitting" || stage === "verifying"}
        className="mt-5 inline-flex w-full items-center justify-center rounded-[12px] bg-[#1a1a1a] px-7 py-3 text-[16px] font-medium text-white transition-colors hover:bg-black disabled:opacity-60"
      >
        {stage === "idle" ? `Buy Gift Card — ₹${amount.toLocaleString("en-IN")}` : "Processing..."}
      </button>
    </div>
  );
};

export default GiftCardPurchaseForm;
```

- [ ] **Step 2: Write the balance checker**

```tsx
// components/gift-cards/GiftCardBalanceChecker.tsx
"use client";

import { useState } from "react";

const GiftCardBalanceChecker = () => {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ found: boolean; remainingBalance: number } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    setIsChecking(true);
    try {
      const res = await fetch(`/api/gift-cards/balance?code=${encodeURIComponent(normalized)}`);
      setResult(await res.json());
    } catch {
      setResult({ found: false, remainingBalance: 0 });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="rounded-[18px] bg-white p-6">
      <p className="font-display text-[20px] text-[#1f1f1f]">Check Your Balance</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ARTACE-XXXX-XXXX-XXXX"
          className="min-h-11 w-full flex-1 rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] outline-none focus:border-[#1f1f1f]/35"
        />
        <button
          type="button"
          onClick={handleCheck}
          disabled={isChecking || !code.trim()}
          className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#1f1f1f] hover:bg-[#f5f0e8] disabled:opacity-60"
        >
          Check
        </button>
      </div>
      {result ? (
        <p className="mt-3 text-sm text-[#444]">
          {result.found ? `Remaining balance: ₹${result.remainingBalance.toLocaleString("en-IN")}` : "That code wasn't found or has no remaining balance."}
        </p>
      ) : null}
    </div>
  );
};

export default GiftCardBalanceChecker;
```

- [ ] **Step 3: Write the page**

```tsx
// app/gift-cards/page.tsx
import type { Metadata } from "next";
import FAQSection, { type FAQItem } from "@/components/seo/FAQSection";
import GiftCardPurchaseForm from "@/components/gift-cards/GiftCardPurchaseForm";
import GiftCardBalanceChecker from "@/components/gift-cards/GiftCardBalanceChecker";
import { buildSiteUrl } from "@/lib/site";
import { PROGRAM_NAME } from "@/lib/gift-cards/constants";

export const metadata: Metadata = {
  title: `${PROGRAM_NAME} | Give the Gift of Original Art | Artace Studio`,
  description: "Buy an Artace Gift Card in ₹1,000, ₹2,500, ₹5,000, or ₹10,000 — delivered instantly by email, redeemable on any order, no expiry.",
  alternates: { canonical: buildSiteUrl("/gift-cards") },
};

const faqs: FAQItem[] = [
  { question: "How is my gift card delivered?", answer: "Instantly by email after purchase, and shown on the confirmation screen." },
  { question: "Does it expire?", answer: "No — an Artace Gift Card never expires." },
  { question: "Can I use it across multiple orders?", answer: "Yes — any unused balance carries forward for later use." },
  { question: "Can I combine it with Artace Rewards points or a coupon?", answer: "Yes — a gift card, Artace Rewards points, and a coupon code can all be applied to the same order." },
  { question: "Can I get a refund on an unused gift card?", answer: "Gift card purchases are final and not refundable, used or not." },
];

export default function GiftCardsPage() {
  return (
    <main className="bg-[#f4f2ee] text-[#1f1f1f]">
      <section className="bg-[#1f1f1f] px-4 py-16 text-center text-white sm:px-6 md:px-12 md:py-24">
        <div className="mx-auto max-w-[860px]">
          <p className="font-inter text-[13px] uppercase tracking-[0.12em] text-white/60">{PROGRAM_NAME}</p>
          <h1 className="mt-4 font-display text-[36px] leading-[1.1] md:text-[56px]">Give the Gift of Original Art</h1>
          <p className="mt-5 text-white/80">Delivered instantly by email. No expiry. Redeemable on any order.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[700px] px-4 py-14 sm:px-6 md:px-12">
        <GiftCardPurchaseForm />
      </section>

      <section className="mx-auto max-w-[700px] px-4 pb-8 sm:px-6 md:px-12">
        <GiftCardBalanceChecker />
      </section>

      <FAQSection
        title="Gift Cards — Frequently Asked Questions"
        items={faqs}
        id="gift-cards-faq"
        className="mx-auto max-w-[1000px] px-4 pb-16 sm:px-6 md:px-12"
      />
    </main>
  );
}
```

- [ ] **Step 4: Add navigation links**

In `components/navbar.tsx`'s `resourceLinks`, add `{ name: "Gift Cards", href: "/gift-cards" }` (next to the "Artace Rewards" entry added for Loyalty).

In `components/footer.tsx`'s Shop section, add `{ label: "Gift Cards", href: "/gift-cards" }` (next to "Artace Rewards").

In `app/sitemap.ts`'s `staticPages`, add `{ url: \`${baseUrl}/gift-cards\`, lastModified: now, changeFrequency: "monthly", priority: 0.6 }`.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 6: The real end-to-end live check (covers Task 6's deferred item too)**

On a fresh local dev server (port 3000 reconfirmed unchanged), with `WOOCOMMERCE_ORDER_WEBHOOK_SECRET` and real Razorpay keys already configured (they are, from earlier work), place one real ₹1,000 gift card purchase through the actual page and a real (small) Razorpay payment. Confirm: the confirmation screen shows a real code, the email arrives with the same code, and a row exists in `gift_cards` with `remaining_balance = 1000`. Then spend part of it on a real cart order at `/checkout` and confirm the remaining balance decreases by exactly the redeemed amount, not to zero.

- [ ] **Task complete — ready for review.**

---

### Task 10: E2E tests

**Files:**
- Modify: `e2e/mocks.ts`
- Create: `e2e/gift-cards.spec.ts`

**Interfaces:**
- Consumes: existing mocks (`mockAuthenticatedSession`, `seedCart`, `mockRazorpayWidget`, `mockCheckoutApi`).
- Produces: `mockGiftCardBalance(page: Page, response: { found: boolean; remainingBalance: number })` (new).

- [ ] **Step 1: Add the mock**

```ts
export async function mockGiftCardBalance(page: Page, response: { found: boolean; remainingBalance: number }) {
  await page.route("**/api/gift-cards/balance*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(response) })
  );
}
```

- [ ] **Step 2: Write the test**

```ts
// e2e/gift-cards.spec.ts
import { test, expect } from "@playwright/test";
import { mockAuthenticatedSession, seedCart, mockRazorpayWidget, mockCheckoutApi, mockGiftCardBalance } from "./mocks";

test.describe("Checkout — Gift Card redemption", () => {
  test("applies a valid gift card as a discount and sends the code to /api/checkout", async ({ page }) => {
    await mockAuthenticatedSession(page);
    await seedCart(page);
    await mockRazorpayWidget(page);
    await mockCheckoutApi(page);
    await mockGiftCardBalance(page, { found: true, remainingBalance: 2000 });

    await page.goto("/checkout");

    const codeInput = page.getByPlaceholder("ARTACE-XXXX-XXXX-XXXX");
    await codeInput.fill("ARTACE-TEST-CODE-0001");
    await codeInput.locator("..").getByRole("button", { name: "Apply" }).click();

    await expect(page.getByText(/applied \(ARTACE-TEST-CODE-0001\)/)).toBeVisible();

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
    expect(req.postDataJSON().giftCardCode).toBe("ARTACE-TEST-CODE-0001");
  });

  test("shows an error for an invalid code", async ({ page }) => {
    await mockAuthenticatedSession(page);
    await seedCart(page);
    await mockRazorpayWidget(page);
    await mockCheckoutApi(page);
    await mockGiftCardBalance(page, { found: false, remainingBalance: 0 });

    await page.goto("/checkout");

    const codeInput = page.getByPlaceholder("ARTACE-XXXX-XXXX-XXXX");
    await codeInput.fill("ARTACE-BAD1-CODE-0000");
    await codeInput.locator("..").getByRole("button", { name: "Apply" }).click();

    await expect(page.getByText("That gift card code isn't valid or has no remaining balance.")).toBeVisible();
  });
});
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Run the new tests, then the full suite**

```bash
npx playwright test e2e/gift-cards.spec.ts --reporter=line
npx playwright test --reporter=line
```

Expected: both new tests pass, and the full suite (now 9 tests: the original 5 plus Loyalty's 2 plus these 2) passes with no regressions.

- [ ] **Step 5: Clean up test artifacts**

```bash
rm -rf test-results playwright-report
```

- [ ] **Task complete — ready for review.**

---

## Self-Review

**1. Spec coverage** — every Decision in the spec maps to a task: Decision 1 (data model) → Task 2. Decision 2 (hidden product) → Task 3. Decision 3 (shared utility) → Task 4. Decision 4 (purchase flow) → Task 5. Decision 5 (generation + email) → Task 6. Decision 6 (redemption + stacking cap) → Task 1 (the cap fix, shared) + Task 7. Decision 7 (balance-checker + public page + nav) → Tasks 8-9. Decision 8 (non-goals) → nothing built for these, confirmed no task adds recipient-direct delivery, refunds, custom amounts, or admin issuance.

**2. Placeholder scan** — one deliberate, clearly-flagged placeholder exists on purpose: `GIFT_CARD_PRODUCT_ID = 0` in Task 4 Step 1, immediately followed by Step 5 replacing it with Task 3's real id — this is sequencing (the product must exist before its id is known), not an unresolved gap, and is called out explicitly in-line rather than left implicit. No other placeholders found.

**3. Type consistency** — `getGiftCardBalance`'s return shape (`{ found, remainingBalance, status }`) is used consistently in Task 7 (checkout validation) and Task 8 (the public balance endpoint, which narrows it to `{ found, remainingBalance }` for the client — deliberately dropping `status` from the public response since a customer doesn't need to know the internal `active`/`depleted` enum, just whether it's usable). `redeemGiftCard`'s signature matches its Task 7 call site exactly. `DENOMINATIONS` is read the same way (`(DENOMINATIONS as readonly number[]).includes(...)`) everywhere it's validated against.

**4. Scope check** — one coherent subsystem; not split further.

**5. Ambiguity check, and one real gap fixed during this review, not deferred**: the original draft had `orderSubtotal` computed *inside* Task 1's `if (requestedPoints > 0)` block, which meant it was out of scope by the time Task 7 needed it, and would have forced Task 7 to either recompute it (a second, redundant WooCommerce catalog lookup) or reference a variable that plain doesn't exist when a customer redeems a gift card without also redeeming points. Fixed at the root rather than patched around: Task 1 now computes `orderSubtotal` once, unconditionally, before the points check even runs, so it's a single real value in scope for the rest of the function — Task 7 Step 2 above already reflects this corrected version directly, not a placeholder.
