# Custom Portraits Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. (Not subagent-driven-development for this project — that workflow assumes commits between tasks, and this project's standing rule is that the user handles all commits/pushes themselves.)

**Goal:** Ship `/custom-portraits` — an SEO-rich, conversion-oriented page for Single/Couple/Family/Baby hand-painted portraits, with a live-estimate booking form that collects a reference photo and a 10% deposit (via Razorpay) to confirm the commission, with a clear refund assurance.

**Architecture:** A shared pricing module (Task 1) is the single source of truth for the area-ratio formula, imported by both the client form (instant preview) and the server route (authoritative charge). A one-time hidden WooCommerce product (Task 2) is the payment vehicle — its catalog price is never charged; every order overrides it via the same `subtotal`/`total` line-item mechanism already proven for Prints. A new guest-friendly order-creation endpoint (Task 3) issues the WooCommerce + Razorpay orders without requiring login, then hands off to the site's **existing, unmodified** `/api/checkout/verify` and Razorpay webhook for payment confirmation. The form component (Task 4) and the page (Task 5) are new, but reuse existing building blocks (`ImageUpload`, `FAQSection`, the Razorpay-widget invocation pattern from `checkout-client.tsx`) rather than reinventing them.

**Tech Stack:** Next.js App Router (Edge runtime on the new API route), TypeScript, Tailwind CSS 4, WooCommerce REST API (Store API not needed here; Admin API for order + one-time product creation), Razorpay (live keys — no test/sandbox mode on this account), Supabase (request logging), Resend (team notification email).

## Global Constraints

- No `git commit`/`git push` — the user reviews and commits/pushes everything themselves.
- No test framework — verification via `npx tsc --noEmit`, live dev-server checks (fresh port, never touching port 3000 — check `netstat -ano | grep ":3000"` first), and safe isolated WooCommerce Admin-API test orders (created with `set_paid: false`, verified via Admin API, then deleted with `?force=true` — never a real Razorpay payment, since this account has no test/sandbox keys). No `npm run build` / `rm -rf .next` while port 3000 may be running.
- Pricing formula (exact, from the user): base size 12″×12″ (144 sq in); base prices at that size are Single ₹4,500, Couple ₹5,500, Family ₹6,800, Baby ₹4,000; any other size scales proportionally by area from that base. Deposit = 10% of the calculated estimate.
- The server recomputes and is authoritative for the price on every request — the client's live preview is never trusted for the actual charge.
- Refund and balance-payment handling are both manual/team-processed — no automation for either, per the user's explicit choice. The code's job is clear policy language, not enforcement.
- Reuse `lib/api-route-handlers/checkout/verify/route.ts` and `lib/api-route-handlers/razorpay/webhook/route.ts` completely unmodified — both are already generic over `woo_order_id`/`woo_order_key`.
- No fabricated sample portrait photos — the portrait-type showcase uses icon/illustration treatment, not invented before/after images.

---

### Task 1: Shared pricing module

**Files:**
- Create: `lib/custom-portraits/pricing.ts`

**Interfaces:**
- Produces: `PortraitType` (`"single" | "couple" | "family" | "baby"`), `PORTRAIT_TYPES` (array of `{value, label, basePrice}` for rendering type-selector UI), `isPortraitType(value: unknown): value is PortraitType`, `calculatePortraitEstimate(input: {portraitType: unknown; widthInches: unknown; heightInches: unknown}): {estimatedPrice: number; depositAmount: number} | null`, `MIN_DIMENSION_INCHES` (4), `MAX_DIMENSION_INCHES` (72), `BASE_AREA_SQIN` (144), `DEPOSIT_RATE` (0.1). Task 3 (API route) and Task 4 (form component) both import from this file — it is their single shared source of truth for the formula.

- [ ] **Step 1: Write the module**

```ts
export type PortraitType = "single" | "couple" | "family" | "baby";

export const PORTRAIT_TYPES: { value: PortraitType; label: string; basePrice: number }[] = [
  { value: "single", label: "Single Portrait", basePrice: 4500 },
  { value: "couple", label: "Couple Portrait", basePrice: 5500 },
  { value: "family", label: "Family Portrait", basePrice: 6800 },
  { value: "baby", label: "Baby Portrait", basePrice: 4000 },
];

const BASE_PRICE_BY_TYPE: Record<PortraitType, number> = {
  single: 4500,
  couple: 5500,
  family: 6800,
  baby: 4000,
};

// The 12" x 12" reference size the base prices above are quoted at.
export const BASE_AREA_SQIN = 12 * 12;

export const MIN_DIMENSION_INCHES = 4;
export const MAX_DIMENSION_INCHES = 72;
export const DEPOSIT_RATE = 0.1;

export const isPortraitType = (value: unknown): value is PortraitType =>
  value === "single" || value === "couple" || value === "family" || value === "baby";

export type PortraitEstimate = {
  estimatedPrice: number;
  depositAmount: number;
};

export const calculatePortraitEstimate = (input: {
  portraitType: unknown;
  widthInches: unknown;
  heightInches: unknown;
}): PortraitEstimate | null => {
  if (!isPortraitType(input.portraitType)) return null;

  const width = Number(input.widthInches);
  const height = Number(input.heightInches);

  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  if (width < MIN_DIMENSION_INCHES || width > MAX_DIMENSION_INCHES) return null;
  if (height < MIN_DIMENSION_INCHES || height > MAX_DIMENSION_INCHES) return null;

  const basePrice = BASE_PRICE_BY_TYPE[input.portraitType];
  const area = width * height;
  const estimatedPrice = Math.round((basePrice * area) / BASE_AREA_SQIN);
  const depositAmount = Math.round(estimatedPrice * DEPOSIT_RATE);

  return { estimatedPrice, depositAmount };
};
```

- [ ] **Step 2: Verify with a scratchpad script (not committed)**

Create `scratchpad/verify-portrait-pricing.ts` (adjust the import path to the absolute repo path):

```ts
import {
  calculatePortraitEstimate,
} from "D:/Artace Studio/artace-studio/lib/custom-portraits/pricing";

const cases: Array<{
  input: { portraitType: unknown; widthInches: unknown; heightInches: unknown };
  expected: { estimatedPrice: number; depositAmount: number } | null;
}> = [
  { input: { portraitType: "single", widthInches: 12, heightInches: 12 }, expected: { estimatedPrice: 4500, depositAmount: 450 } },
  { input: { portraitType: "couple", widthInches: 16, heightInches: 20 }, expected: { estimatedPrice: 12222, depositAmount: 1222 } },
  { input: { portraitType: "family", widthInches: 24, heightInches: 36 }, expected: { estimatedPrice: 40800, depositAmount: 4080 } },
  { input: { portraitType: "baby", widthInches: 4, heightInches: 4 }, expected: { estimatedPrice: 444, depositAmount: 44 } },
  { input: { portraitType: "single", widthInches: 3, heightInches: 12 }, expected: null }, // below min
  { input: { portraitType: "single", widthInches: 12, heightInches: 100 }, expected: null }, // above max
  { input: { portraitType: "not-a-type", widthInches: 12, heightInches: 12 }, expected: null }, // invalid type
];

let failures = 0;
for (const testCase of cases) {
  const result = calculatePortraitEstimate(testCase.input);
  const pass = JSON.stringify(result) === JSON.stringify(testCase.expected);
  if (!pass) {
    failures++;
    console.error("FAIL", testCase.input, "got", result, "expected", testCase.expected);
  }
}
console.log(failures === 0 ? "All pricing cases passed." : `${failures} case(s) failed.`);
```

Run: `npx tsx "C:\Users\PERENN~1\AppData\Local\Temp\claude\d--Artace-Studio\dfd624de-628c-4ca1-9b01-69bc7b75a77b\scratchpad\verify-portrait-pricing.ts"` (use the actual scratchpad path).
Expected output: `All pricing cases passed.`

- [ ] **Step 3: `npx tsc --noEmit`**

Expect only the 3 known pre-existing errors (`app/samora/shop/[slug]/page.tsx:352`, `app/warli-paintings/page.tsx:129`, `components/navbar.tsx:1171`) — nothing new.

---

### Task 2: Hidden "Custom Portrait Deposit" WooCommerce product

**Files:** none (live WooCommerce data operation via `curl`, no files in the repo)

**Interfaces:**
- Produces: a numeric WooCommerce product id, referred to as `CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID` in Task 3 — record it after Step 1, it is hardcoded into the route in Task 3 (same convention as the Prints category id).

- [x] **Step 1: Create the product** — done, `id: 4317`.

```bash
curl -s -u "$WOOCOMMERCE_CONSUMER_KEY:$WOOCOMMERCE_CONSUMER_SECRET" \
  -X POST "https://api.artacestudio.com/wp-json/wc/v3/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Custom Portrait Deposit",
    "type": "simple",
    "status": "publish",
    "catalog_visibility": "hidden",
    "virtual": true,
    "sold_individually": true,
    "regular_price": "1",
    "short_description": "Deposit for a custom portrait commission. The final charge is set per order and does not reflect this product'\''s catalog price."
  }'
```

`CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID = 4317` — hardcoded into Task 3's route.

- [x] **Step 2: Verify it is hidden from the catalog — found `catalog_visibility: "hidden"` is NOT honored by this store's Store API, fixed by switching to `status: "draft"`**

Live verification (`curl .../wc/store/v1/products?search=Custom%20Portrait%20Deposit` and the default, unfiltered `.../wc/store/v1/products?per_page=5&orderby=date&order=desc`) showed the "hidden"-visibility product **was still returned** in both the search and the plain newest-first listing. This contradicts WooCommerce's documented behavior for `catalog_visibility: "hidden"` and would have made a real, ₹1-priced product visible to shoppers on the live site — root-caused live rather than assumed away.

Fix: `PUT /wc/v3/products/4317` with `{"status": "draft"}`. Re-verified: excluded from search (`[]`), excluded from the default listing, and a direct-by-id fetch now returns `404`. Draft status is filtered by WordPress's core `post_status='publish'` query default, not by the visibility-taxonomy mechanism that turned out to be unreliable here.

This raised one question worth checking before trusting the flow: can a `draft` product still be referenced in a server-side order created via the Admin API (the only way this product is ever used — no customer ever adds it to a storefront cart)? Verified with a real isolated test order (`set_paid: false`, deleted immediately after): **yes** — `POST /wc/v3/orders` with `line_items: [{product_id: 4317, ...}]` succeeded normally against the draft product.

That same test surfaced a second real finding: the order's `total` came back as `504.00` against a `450.00` line-item override — WooCommerce auto-added 12% tax on top, because the product's default `tax_status` was `"taxable"`. Since `/api/checkout` already charges Razorpay `wooOrder.total` (post-tax) for every existing purchase on this site, this isn't a bug in that mechanism — but it would have meant the "Pay ₹450 & Confirm" button label and the actual Razorpay charge amount silently disagreed by the tax amount, which is exactly the kind of thing a customer would notice mid-payment. Fixed by also setting `tax_status: "none"` on the product (a one-off deposit line for a service commission, not a taxable retail good — the eventual balance invoice is where real tax applies, handled manually by the team). Re-verified with a second isolated test order: `total: "450.00"`, `total_tax: "0.00"` — exact match.

**Final product state**: `id: 4317`, `status: "draft"`, `catalog_visibility: "hidden"`, `virtual: true`, `tax_status: "none"`, `sold_individually: true`, `regular_price: "1"`.

Verification commands actually run:
```bash
curl -s "https://api.artacestudio.com/wp-json/wc/store/v1/products?search=Custom%20Portrait%20Deposit"
curl -s "https://api.artacestudio.com/wp-json/wc/store/v1/products?per_page=5&orderby=date&order=desc"
curl -s -o /dev/null -w "%{http_code}\n" "https://api.artacestudio.com/wp-json/wc/store/v1/products/4317"
```
All three now confirm exclusion (`[]`, absent from listing, `404`).

---

### Task 3: Guest order-creation API route + Supabase logging table

**Files:**
- Create: `supabase/custom_portrait_requests.sql`
- Create: `lib/api-route-handlers/custom-portraits/route.ts`
- Modify: `app/api/[[...path]]/route.ts`

**Interfaces:**
- Consumes: `calculatePortraitEstimate`, `isPortraitType` from `lib/custom-portraits/pricing.ts` (Task 1); `createWooCommerceOrder`, `getWooCommercePaymentConfig`, `mergeWooMetaData`, `parseAmountToMinorUnits`, `sanitizeText`, `updateWooCommerceOrder` from `utils/woocommerce-checkout.ts`; `createRazorpayOrder`, `getRazorpayPublicConfig` from `utils/razorpay.ts`; `CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID` from Task 2.
- Produces: `POST /api/custom-portraits` — request body `{portraitType, widthInches, heightInches, name, email, phone, notes?, referenceImages: string[]}`, success response `{success: true, orderId, orderKey, orderNumber, estimatedPrice, depositAmount, razorpay: {keyId, orderId, amount, currency, name, description, prefill: {name, email, contact}, notes}}` — the exact shape Task 4's form expects to drive the Razorpay widget.

- [ ] **Step 1: Create the Supabase table SQL**

`supabase/custom_portrait_requests.sql`:

```sql
-- Custom Portrait Requests Table for Artace Studio
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS custom_portrait_requests (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  wc_order_id BIGINT,
  wc_order_number TEXT,
  portrait_type TEXT NOT NULL,
  width_inches NUMERIC NOT NULL,
  height_inches NUMERIC NOT NULL,
  estimated_price NUMERIC NOT NULL,
  deposit_amount NUMERIC NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  reference_images TEXT,
  notes TEXT,
  payment_status TEXT DEFAULT 'pending',
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE custom_portrait_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for custom portrait requests" ON custom_portrait_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow select for authenticated users" ON custom_portrait_requests
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_custom_portrait_requests_wc_order_id ON custom_portrait_requests (wc_order_id);
CREATE INDEX IF NOT EXISTS idx_custom_portrait_requests_email ON custom_portrait_requests (email);
```

Tell the user to run this in the Supabase SQL editor (same handoff as every other new table this engagement) before Task 3's live verification step, since the insert will otherwise fail (non-fatally — see Step 2's `logRequest`, which is best-effort).

- [ ] **Step 2: Write the route handler**

`lib/api-route-handlers/custom-portraits/route.ts`:

```ts
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
import { calculatePortraitEstimate, isPortraitType } from "@/lib/custom-portraits/pricing";

export const runtime = "edge";

// Created once via the WooCommerce Admin API — see docs/superpowers/plans/2026-08-11-custom-portraits.md,
// Task 2. A hidden, virtual product whose catalog price ("1") is never actually charged: every order
// overrides it with the calculated deposit via the subtotal/total line-item override below (the same
// mechanism already proven for Prints).
const CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID = 0; // TODO: replace with the id recorded in Task 2 before running Step 4

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

const CONTACT_TO_EMAIL =
  process.env.CORPORATE_CONTACT_EMAIL || process.env.CONTACT_TO_EMAIL || "info@artacestudio.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "";

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

type CustomPortraitRequestBody = {
  portraitType?: unknown;
  widthInches?: unknown;
  heightInches?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  referenceImages?: unknown;
  notes?: unknown;
};

const splitName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || fullName.trim();
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
};

type PortraitDetails = {
  name: string;
  email: string;
  phone: string;
  portraitType: string;
  widthInches: number;
  heightInches: number;
  estimatedPrice: number;
  depositAmount: number;
  referenceImages: string[];
  notes: string;
};

const notifyTeam = async (details: PortraitDetails & { orderNumber: string }) => {
  if (!RESEND_API_KEY || !RESEND_FROM) return;

  const text = [
    "New custom portrait request:",
    "",
    `Name: ${details.name}`,
    `Email: ${details.email}`,
    `Phone: ${details.phone}`,
    `Type: ${details.portraitType}`,
    `Size: ${details.widthInches}" x ${details.heightInches}"`,
    `Estimated price: Rs ${details.estimatedPrice}`,
    `Deposit paid: Rs ${details.depositAmount}`,
    `WooCommerce order: #${details.orderNumber}`,
    "",
    "Reference photos:",
    ...(details.referenceImages.length ? details.referenceImages : ["(none)"]),
    "",
    "Notes:",
    details.notes || "-",
  ].join("\n");

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [CONTACT_TO_EMAIL],
        subject: `New custom portrait request from ${details.name}`,
        text,
      }),
    });
  } catch {
    // Never let a notification-email failure affect the payment flow that already succeeded.
  }
};

const logRequest = async (
  details: PortraitDetails & { wcOrderId: number | null; wcOrderNumber: string }
) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/custom_portrait_requests`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        wc_order_id: details.wcOrderId,
        wc_order_number: details.wcOrderNumber,
        portrait_type: details.portraitType,
        width_inches: details.widthInches,
        height_inches: details.heightInches,
        estimated_price: details.estimatedPrice,
        deposit_amount: details.depositAmount,
        name: details.name,
        email: details.email,
        phone: details.phone,
        reference_images: details.referenceImages.join(","),
        notes: details.notes || null,
      }),
    });
  } catch {
    // Best-effort logging only — never blocks a payment flow that already succeeded.
  }
};

export async function POST(request: NextRequest) {
  let body: CustomPortraitRequestBody;

  try {
    body = (await request.json()) as CustomPortraitRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const estimate = calculatePortraitEstimate({
    portraitType: body.portraitType,
    widthInches: body.widthInches,
    heightInches: body.heightInches,
  });

  if (!estimate || !isPortraitType(body.portraitType)) {
    return NextResponse.json(
      { error: "Please select a portrait type and a valid size between 4 and 72 inches on each side." },
      { status: 400 }
    );
  }

  const portraitType = body.portraitType;
  const width = Number(body.widthInches);
  const height = Number(body.heightInches);

  const name = sanitizeText(body.name);
  const email = sanitizeText(body.email);
  const phone = sanitizeText(body.phone);
  const notes = sanitizeText(body.notes);
  const referenceImages = Array.isArray(body.referenceImages)
    ? body.referenceImages.filter((url): url is string => typeof url === "string" && url.length > 0)
    : [];

  if (!name || !email || !phone) {
    return NextResponse.json(
      { error: "Please provide your name, email, and phone number." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  if (referenceImages.length === 0) {
    return NextResponse.json(
      { error: "Please upload at least one reference photo." },
      { status: 400 }
    );
  }

  const { firstName, lastName } = splitName(name);
  const { paymentMethod, paymentMethodTitle } = getWooCommercePaymentConfig();

  try {
    const wooOrder = await createWooCommerceOrder({
      payment_method: paymentMethod,
      payment_method_title: paymentMethodTitle,
      set_paid: false,
      billing: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
      },
      line_items: [
        {
          product_id: CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID,
          quantity: 1,
          subtotal: estimate.depositAmount.toFixed(2),
          total: estimate.depositAmount.toFixed(2),
        },
      ],
      customer_note: [
        `Custom Portrait Deposit — ${portraitType}`,
        `Size: ${width}" x ${height}"`,
        `Estimated total price: Rs ${estimate.estimatedPrice}`,
        notes ? `Notes: ${notes}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      meta_data: [
        { key: "Portrait Type", value: portraitType },
        { key: "Size", value: `${width}" x ${height}"` },
        { key: "Estimated Price", value: String(estimate.estimatedPrice) },
        { key: "Reference Photos", value: referenceImages.join(", ") },
      ],
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
      receipt: `portrait_${wooOrder.orderId}`,
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

    const details: PortraitDetails = {
      name,
      email,
      phone,
      portraitType,
      widthInches: width,
      heightInches: height,
      estimatedPrice: estimate.estimatedPrice,
      depositAmount: estimate.depositAmount,
      referenceImages,
      notes,
    };

    await logRequest({
      ...details,
      wcOrderId: updatedWooOrder.orderId,
      wcOrderNumber: updatedWooOrder.orderNumber,
    });

    await notifyTeam({ ...details, orderNumber: updatedWooOrder.orderNumber });

    return NextResponse.json({
      success: true,
      orderId: updatedWooOrder.orderId,
      orderKey: updatedWooOrder.orderKey,
      orderNumber: updatedWooOrder.orderNumber,
      estimatedPrice: estimate.estimatedPrice,
      depositAmount: estimate.depositAmount,
      razorpay: {
        keyId,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Artace Studio",
        description: `Custom Portrait Deposit — Order #${updatedWooOrder.orderNumber}`,
        prefill: { name, email, contact: phone },
        notes: razorpayOrder.notes,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start your portrait request right now.",
      },
      {
        status:
          error instanceof Error
            ? (() => {
                const match = error.message.match(/\[(\d{3})\]\s/);
                const parsed = match ? Number(match[1]) : 502;
                return Number.isFinite(parsed) && parsed >= 400 && parsed <= 599 ? parsed : 502;
              })()
            : 502,
      }
    );
  }
}
```

Before Step 4, replace `CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID = 0` with the real id recorded in Task 2.

- [ ] **Step 3: Register the route**

In `app/api/[[...path]]/route.ts`, add the import (alphabetically, right after `customOrderRoute`):

```ts
import * as customOrderRoute from "@/lib/api-route-handlers/custom-order/route";
import * as customPortraitsRoute from "@/lib/api-route-handlers/custom-portraits/route";
```

And add the route entry (alphabetically, right after `"custom-order"`):

```ts
  "custom-order": {
    POST: (request) => customOrderRoute.POST(request),
  },
  "custom-portraits": {
    POST: (request) => customPortraitsRoute.POST(request),
  },
```

- [ ] **Step 4: `npx tsc --noEmit`**

Expect only the 3 known pre-existing errors — nothing new in any of the 3 files touched so far.

- [x] **Step 5: Live verification against the real WooCommerce + Razorpay APIs — done, with one environment finding**

Port 3000 was confirmed empty both before and after (no dev server of the user's was running at the time). Started the dev server on port 3022. The homepage (`/`) 500'd with `RangeError: Invalid code point 14669348` from `tailwindcss`/`lightningcss` while compiling `app/globals.css` — reproduced even after a full `rm -rf .next` (port 3000 confirmed clear both times before touching it). Root-caused rather than worked around: `app/globals.css` itself is clean, valid UTF-8 (checked byte-for-byte), so this is not a corrupted file; `node --version` in this sandbox reports `v26.1.0`, an unusually new runtime, and the installed `lightningcss-win32-x64-msvc` native binary most likely doesn't yet handle that Node's NAPI/string marshalling correctly — the same class of "local-sandbox-only environment quirk" already documented earlier in this engagement (the artist-photo image-optimizer issue), not something caused by this task's code, and not expected to reproduce on the user's own machine.

Crucially, this only affects **page rendering** (anything that compiles `app/layout.tsx` → `globals.css`). Confirmed by restarting the dev server and sending the very first request straight to `POST /api/custom-portraits` (never touching `/` first) — the Route Handler doesn't depend on CSS at all, and it worked perfectly:

```json
{"success":true,"orderId":4320,"orderKey":"wc_order_oMEEKaxd2ZvdQ","orderNumber":"4320","estimatedPrice":4500,"depositAmount":450,"razorpay":{"amount":45000,...}}
```

Verified via the WooCommerce Admin API (`GET /wc/v3/orders/4320`): `total: "450.00"`, `total_tax: "0.00"`, `line_items[0]` against product `4317` with `total: "450.00"`, and full `meta_data` (`Portrait Type`, `Size`, `Estimated Price`, `Reference Photos`, `_artace_razorpay_order_id`). Deleted with `?force=true` immediately after. Port 3000 reconfirmed clear afterward.

**Consequence for Task 5**: this environment's page-rendering breakage means live Playwright verification of the actual `/custom-portraits` page (hero, cards, form interactions) is not possible from this sandbox right now — it isn't specific to the new page, the homepage itself 500s the same way. Task 5's Step 4 is adjusted to rely on `tsc --noEmit` plus careful manual code review, with an explicit ask for the user to visually check the page on their own server.

Original plan (superseded by the above, kept for reference):

Check port 3000 first: `netstat -ano | grep ":3000"` — record its PID, do not touch it. Start the dev server on a fresh port (e.g. 3022):

```bash
(npm run dev -- -p 3022 > /tmp/dev-3022.log 2>&1 &)
```

Poll until ready, then:

```bash
curl -s -X POST "http://localhost:3022/api/custom-portraits" \
  -H "Content-Type: application/json" \
  -d '{
    "portraitType": "single",
    "widthInches": 12,
    "heightInches": 12,
    "name": "Test Verify",
    "email": "test-verify@example.com",
    "phone": "+919999999999",
    "referenceImages": ["https://example.com/test-photo.jpg"],
    "notes": "Verification run — safe to delete."
  }'
```

Expected: JSON response with `success: true`, `estimatedPrice: 4500`, `depositAmount: 450`, `orderId`, `orderKey`, `orderNumber`, and a `razorpay` object with `amount: 45000` (450 rupees in minor units).

If the request fails with a WooCommerce billing-address validation error (this project has not previously created a guest order without full address fields — this is the one genuinely new assumption in this task), add empty-string placeholders for `address_1`, `city`, `state`, `postcode`, `country: "IN"` to the `billing` object in Step 2's code and re-run. Do not add these preemptively — only if verification proves they're required.

Then confirm via the WooCommerce Admin API:

```bash
curl -s "https://api.artacestudio.com/wp-json/wc/v3/orders/<orderId>" \
  -u "$WOOCOMMERCE_CONSUMER_KEY:$WOOCOMMERCE_CONSUMER_SECRET"
```

Confirm `line_items[0].total` is `"450.00"` (not the placeholder catalog price), `status` is `"pending"`, and `meta_data` includes `Portrait Type`, `Size`, `Estimated Price`, `Reference Photos`, and `_artace_razorpay_order_id`.

Clean up — this was a real (if unpaid) WooCommerce order and shouldn't linger in the admin order list:

```bash
curl -s -X DELETE "https://api.artacestudio.com/wp-json/wc/v3/orders/<orderId>?force=true" \
  -u "$WOOCOMMERCE_CONSUMER_KEY:$WOOCOMMERCE_CONSUMER_SECRET"
```

Finally, confirm port 3000's PID is unchanged (`netstat -ano | grep ":3000"`), then stop the port-3022 dev server.

---

### Task 4: `CustomPortraitForm` component

**Files:**
- Create: `components/custom-portraits/CustomPortraitForm.tsx`

**Interfaces:**
- Consumes: `PORTRAIT_TYPES`, `calculatePortraitEstimate`, `isPortraitType`, `MIN_DIMENSION_INCHES`, `MAX_DIMENSION_INCHES`, `PortraitType` from `lib/custom-portraits/pricing.ts` (Task 1); `ImageUpload` (default export) from `components/custom-order/ImageUpload.tsx` (existing, reused as-is: `<ImageUpload maxFiles={n} onUpload={(urls: string[]) => void} />`); `POST /api/custom-portraits` (Task 3).
- Produces: `export default function CustomPortraitForm()` — a fully self-contained client component with no required props. Task 5 renders it directly.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import ImageUpload from "@/components/custom-order/ImageUpload";
import {
  PORTRAIT_TYPES,
  calculatePortraitEstimate,
  isPortraitType,
  MIN_DIMENSION_INCHES,
  MAX_DIMENSION_INCHES,
  type PortraitType,
} from "@/lib/custom-portraits/pricing";

type Stage = "idle" | "submitting" | "paying" | "verifying" | "confirmed";

type SizePreset = { label: string; width: number; height: number };

const SIZE_PRESETS: SizePreset[] = [
  { label: '12" x 12"', width: 12, height: 12 },
  { label: '16" x 20"', width: 16, height: 20 },
  { label: '24" x 36"', width: 24, height: 36 },
];

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = { open: () => void };

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  handler: (response: RazorpayHandlerResponse) => void | Promise<void>;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type CustomPortraitCheckoutPayload = {
  success?: boolean;
  error?: string;
  orderId?: number;
  orderKey?: string;
  orderNumber?: string;
  estimatedPrice?: number;
  depositAmount?: number;
  razorpay?: {
    keyId: string;
    orderId: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    prefill?: { name?: string; email?: string; contact?: string };
    notes?: Record<string, string>;
  };
};

const inputClass =
  "min-h-[48px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5";

const CustomPortraitForm = () => {
  const [portraitType, setPortraitType] = useState<PortraitType>("single");
  const [sizeMode, setSizeMode] = useState<"preset" | "custom">("preset");
  const [selectedPreset, setSelectedPreset] = useState<SizePreset>(SIZE_PRESETS[0]);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");

  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState("");
  const [confirmedDeposit, setConfirmedDeposit] = useState(0);

  // Preselect from ?type=single|couple|family|baby (the type-showcase cards on the page link here)
  // client-side only, so this never needs a Suspense boundary around useSearchParams.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("type");
    if (isPortraitType(fromQuery)) setPortraitType(fromQuery);
  }, []);

  const width = sizeMode === "preset" ? selectedPreset.width : Number(customWidth);
  const height = sizeMode === "preset" ? selectedPreset.height : Number(customHeight);

  const estimate = useMemo(
    () => calculatePortraitEstimate({ portraitType, widthInches: width, heightInches: height }),
    [portraitType, width, height]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Razorpay) {
      setIsRazorpayReady(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-razorpay-checkout="true"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsRazorpayReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => setIsRazorpayReady(true);
    script.onerror = () => setError("Payment could not load. Refresh and try again.");
    document.body.appendChild(script);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (stage !== "idle") return;

    setError(null);

    if (!estimate) {
      setError(
        `Please enter a size between ${MIN_DIMENSION_INCHES}" and ${MAX_DIMENSION_INCHES}" on each side.`
      );
      return;
    }
    if (referenceImages.length === 0) {
      setError("Please upload at least one reference photo.");
      return;
    }
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in your name, email, and phone number.");
      return;
    }
    if (!isRazorpayReady || !window.Razorpay) {
      setError("Payment is still loading. Please try again in a moment.");
      return;
    }

    setStage("submitting");

    try {
      const response = await fetch("/api/custom-portraits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portraitType,
          widthInches: width,
          heightInches: height,
          name,
          email,
          phone,
          notes,
          referenceImages,
        }),
      });

      const payload = (await response.json()) as CustomPortraitCheckoutPayload;

      if (
        !response.ok ||
        !payload.success ||
        !payload.orderId ||
        !payload.orderKey ||
        !payload.orderNumber ||
        !payload.razorpay
      ) {
        throw new Error(payload.error || "Unable to start your portrait request.");
      }

      const orderId = payload.orderId;
      const orderKey = payload.orderKey;
      const orderNumber = payload.orderNumber;
      const depositAmount = payload.depositAmount ?? estimate.depositAmount;

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
        modal: {
          ondismiss: () => {
            setStage("idle");
            setError("Payment window closed before completion.");
          },
        },
        handler: async (razorpayResponse) => {
          try {
            setStage("verifying");

            const verifyResponse = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                orderKey,
                razorpayOrderId: razorpayResponse.razorpay_order_id,
                razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                razorpaySignature: razorpayResponse.razorpay_signature,
              }),
            });

            const verifyPayload = (await verifyResponse.json()) as {
              success?: boolean;
              error?: string;
            };

            if (!verifyResponse.ok || !verifyPayload.success) {
              setStage("idle");
              setError(
                verifyPayload.error ||
                  "Payment was completed, but we could not verify it yet. Please contact support if the status does not update."
              );
              return;
            }

            setConfirmedOrderNumber(orderNumber);
            setConfirmedDeposit(depositAmount);
            setStage("confirmed");
          } catch {
            setStage("idle");
            setError(
              "Payment was completed, but we could not verify it yet. Please contact support if the status does not update."
            );
          }
        },
      });

      setStage("paying");
      razorpay.open();
    } catch (err) {
      setStage("idle");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (stage === "confirmed") {
    return (
      <div className="rounded-[24px] border border-black/10 bg-[#faf8f4] p-8 text-center md:p-12">
        <h3 className="font-display text-[26px] text-[#1f1f1f] md:text-[32px]">
          Your Portrait Request Is Confirmed!
        </h3>
        <p className="mt-4 text-[15px] leading-7 text-[#595959] md:text-[16px]">
          Order #{confirmedOrderNumber} · Deposit paid: ₹{confirmedDeposit.toLocaleString("en-IN")}
        </p>
        <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-7 text-[#595959] md:text-[16px]">
          Our team will review your reference photo and reach out within 24-48 hours with your
          final price and timeline. If you review it and decide not to go ahead, we&apos;ll
          refund your deposit in full.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[24px] border border-black/10 bg-[#faf8f4] p-6 md:p-8"
    >
      <div>
        <p className="text-[14px] font-medium text-[#313131]">Portrait Type</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PORTRAIT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setPortraitType(type.value)}
              className={`rounded-[12px] border px-4 py-3 text-left text-[14px] font-medium transition-colors ${
                portraitType === type.value
                  ? "border-[#1f1f1f] bg-[#1f1f1f] text-white"
                  : "border-black/10 bg-white text-[#313131] hover:border-[#1f1f1f]/40"
              }`}
            >
              {type.label}
              <span
                className={`mt-1 block text-[12px] font-normal ${
                  portraitType === type.value ? "text-white/70" : "text-[#8a8478]"
                }`}
              >
                From ₹{type.basePrice.toLocaleString("en-IN")}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[14px] font-medium text-[#313131]">Size</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {SIZE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setSizeMode("preset");
                setSelectedPreset(preset);
              }}
              className={`rounded-[12px] border px-4 py-2 text-[14px] font-medium transition-colors ${
                sizeMode === "preset" && selectedPreset.label === preset.label
                  ? "border-[#1f1f1f] bg-[#1f1f1f] text-white"
                  : "border-black/10 bg-white text-[#313131] hover:border-[#1f1f1f]/40"
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSizeMode("custom")}
            className={`rounded-[12px] border px-4 py-2 text-[14px] font-medium transition-colors ${
              sizeMode === "custom"
                ? "border-[#1f1f1f] bg-[#1f1f1f] text-white"
                : "border-black/10 bg-white text-[#313131] hover:border-[#1f1f1f]/40"
            }`}
          >
            Custom Size
          </button>
        </div>

        {sizeMode === "custom" && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-2 text-[13px] font-medium text-[#313131]">
              Width (inches)
              <input
                type="number"
                min={MIN_DIMENSION_INCHES}
                max={MAX_DIMENSION_INCHES}
                value={customWidth}
                onChange={(event) => setCustomWidth(event.target.value)}
                placeholder="e.g. 20"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-2 text-[13px] font-medium text-[#313131]">
              Height (inches)
              <input
                type="number"
                min={MIN_DIMENSION_INCHES}
                max={MAX_DIMENSION_INCHES}
                value={customHeight}
                onChange={(event) => setCustomHeight(event.target.value)}
                placeholder="e.g. 24"
                className={inputClass}
              />
            </label>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-[16px] border border-[#1f1f1f]/10 bg-white p-5">
        {estimate ? (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] text-[#595959]">Estimated Price</span>
              <span className="font-display text-[24px] text-[#1f1f1f]">
                ₹{estimate.estimatedPrice.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[14px] text-[#595959]">Deposit to pay now (10%)</span>
              <span className="font-display text-[20px] text-[#126849]">
                ₹{estimate.depositAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </>
        ) : (
          <p className="text-[14px] text-[#8a8478]">
            Enter a size to see your instant price estimate.
          </p>
        )}
      </div>

      <div className="mt-6">
        <p className="mb-2 text-[14px] font-medium text-[#313131]">Upload Your Reference Photo</p>
        <ImageUpload
          maxFiles={3}
          onUpload={(urls) => setReferenceImages((prev) => [...prev, ...urls])}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
          Full Name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
            required
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
          Email Address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@email.com"
            required
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131] sm:col-span-2">
          Phone / WhatsApp Number
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+91 00000 00000"
            required
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131] sm:col-span-2">
          Notes (Optional)
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Pose, background, framing preference — anything our artists should know."
            className="w-full rounded-[12px] border border-black/10 bg-white px-4 py-3 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5"
          />
        </label>
      </div>

      <p className="mt-6 text-[13px] leading-6 text-[#595959]">
        Your deposit confirms your spot in our artists&apos; queue. If you review the final
        concept and decide not to go ahead, we&apos;ll refund your deposit in full.
      </p>

      <button
        type="submit"
        disabled={stage !== "idle"}
        className="mt-4 min-h-[52px] w-full rounded-[12px] bg-[#1a1a1a] px-6 text-[16px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {stage === "submitting"
          ? "Preparing Payment..."
          : stage === "paying"
            ? "Complete Payment in Razorpay"
            : stage === "verifying"
              ? "Verifying Payment..."
              : estimate
                ? `Pay ₹${estimate.depositAmount.toLocaleString("en-IN")} & Confirm My Portrait`
                : "Pay & Confirm My Portrait"}
      </button>

      {error && <p className="mt-4 text-[14px] text-red-600">{error}</p>}
    </form>
  );
};

export default CustomPortraitForm;
```

- [ ] **Step 2: `npx tsc --noEmit`**

Expect only the 3 known pre-existing errors — nothing new in this file. Full interactive verification (filling the form, watching the live estimate, uploading a photo, driving Razorpay) happens in Task 5, once the component is actually mounted on a page.

---

### Task 5: `/custom-portraits` page + footer link

**Files:**
- Create: `app/custom-portraits/page.tsx`
- Modify: `components/footer.tsx`

**Interfaces:**
- Consumes: `CustomPortraitForm` (Task 4, default export, no props); `FAQSection`, `FAQItem` from `components/seo/FAQSection.tsx` (existing); `buildSiteUrl` from `lib/site` (existing).

- [ ] **Step 1: Write the page**

`app/custom-portraits/page.tsx`:

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { User, Heart, Users, Baby, Palette, Award, Sparkles, ClipboardCheck } from "lucide-react";
import CustomPortraitForm from "@/components/custom-portraits/CustomPortraitForm";
import FAQSection, { type FAQItem } from "@/components/seo/FAQSection";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Custom Portrait Paintings – Hand-Painted From Your Photo | Artace Studio",
  description:
    "Single, Couple, Family & Baby portraits hand-painted from your photo. Get an instant price estimate and pay just 10% to confirm — starting from ₹4,000.",
  alternates: {
    canonical: buildSiteUrl("/custom-portraits"),
  },
  openGraph: {
    title: "Custom Portrait Paintings – Hand-Painted From Your Photo | Artace Studio",
    description: "Get an instant estimate for your custom portrait — pay just 10% to confirm.",
    url: buildSiteUrl("/custom-portraits"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Portrait Paintings – Hand-Painted From Your Photo",
    description: "Single, Couple, Family & Baby portraits — starting from ₹4,000.",
  },
};

const PORTRAIT_SHOWCASE = [
  {
    type: "single",
    icon: User,
    title: "Single Portrait",
    text: "A beautifully hand-painted portrait of one person, in your choice of size.",
    price: 4500,
  },
  {
    type: "couple",
    icon: Heart,
    title: "Couple Portrait",
    text: "Celebrate a couple in a custom hand-painted piece made just for you.",
    price: 5500,
  },
  {
    type: "family",
    icon: Users,
    title: "Family Portrait",
    text: "Bring your whole family together in one timeless hand-painted artwork.",
    price: 6800,
  },
  {
    type: "baby",
    icon: Baby,
    title: "Baby Portrait",
    text: "A soft, keepsake portrait to celebrate your little one.",
    price: 4000,
  },
];

const WHY_HAND_PAINTED = [
  {
    icon: Palette,
    title: "100% Hand-Painted",
    text: "Every portrait is painted by hand on canvas — never printed, never AI-generated.",
  },
  {
    icon: Award,
    title: "Named, Credited Artists",
    text: "Your portrait is created by a real artist, not an anonymous production line.",
  },
  {
    icon: Sparkles,
    title: "Made Just For You",
    text: "Your reference photo, your size, your details — no two portraits are the same.",
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How is my price estimate calculated?",
    answer:
      "We start from a real base price for your portrait type at our 12\" x 12\" reference size (Single from ₹4,500, Couple ₹5,500, Family ₹6,800, Baby ₹4,000), then scale it proportionally by the area of the size you choose. The price you see is the actual price — not a vague range.",
  },
  {
    question: "What sizes are available?",
    answer:
      "Choose from our popular presets (12\"x12\", 16\"x20\", 24\"x36\") or enter any custom size between 4\" and 72\" on each side — your estimate updates instantly.",
  },
  {
    question: "What happens after I pay the deposit?",
    answer:
      "Your 10% deposit confirms your spot in our artists' queue. Our team reviews your reference photo, confirms the final price, and reaches out within 24-48 hours before any painting begins.",
  },
  {
    question: "Is the deposit refundable?",
    answer:
      "Yes. If you review the final concept and decide not to go ahead, we'll refund your deposit in full.",
  },
  {
    question: "How long does a custom portrait take?",
    answer:
      "Timelines depend on the portrait's size and complexity. Once our team reviews your photo and confirms the final price, they'll also confirm your exact delivery timeline.",
  },
  {
    question: "What photo quality do I need to provide?",
    answer:
      "A clear, well-lit, in-focus photo works best — the higher the resolution, the more detail our artists can capture. You can upload up to 3 reference photos.",
  },
  {
    question: "Can I request changes before the final painting starts?",
    answer:
      "Yes — when our team confirms your final price after reviewing your photo, you'll have the chance to share any specific requests (pose, background, framing) before painting begins.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship worldwide. Shipping costs and timelines are confirmed along with your final price.",
  },
  {
    question: "What if I want more than one portrait?",
    answer:
      "Submit a separate request for each portrait so we can give you an accurate estimate and reference photo for every piece.",
  },
  {
    question: "Can I combine portrait types (e.g. a couple with their baby)?",
    answer:
      "Yes — choose the type that best fits your photo (for example, Family for a couple with their baby), and mention any specific combination in the notes field so our team can plan accordingly.",
  },
];

const CustomPortraitsPage = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="bg-[#f4f2ee] text-[#1f1f1f]">
        <section className="bg-[#1f1f1f] px-4 py-16 text-center text-white sm:px-6 md:px-12 md:py-24">
          <div className="mx-auto max-w-[860px]">
            <p className="font-inter text-[13px] uppercase tracking-[0.12em] text-white/60">
              Custom Portraits
            </p>
            <h1 className="mt-4 font-display text-[36px] leading-[1.1] md:text-[56px]">
              Custom Portrait Paintings, Painted By Hand From Your Photo
            </h1>
            <p className="mt-5 text-[16px] leading-7 text-white/75 md:text-[19px] md:leading-8">
              Single, Couple, Family & Baby portraits. Get an instant price — pay just 10% to
              confirm.
            </p>
            <Link
              href="#estimator"
              className="mt-8 inline-flex items-center justify-center rounded-[12px] bg-white px-7 py-3 text-[16px] font-medium text-[#1f1f1f] transition-colors hover:bg-white/90"
            >
              Get My Estimate
            </Link>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 md:px-12 md:py-14">
          <div className="mx-auto grid max-w-[900px] grid-cols-3 gap-4 md:gap-6">
            <div className="rounded-[14px] border border-[#1f1f1f]/10 bg-white p-5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
              <p className="font-display text-[28px] text-[#1f1f1f] md:text-[34px]">20,000+</p>
              <p className="mt-1 text-[13px] text-[#6a655d] md:text-[14px]">Global Collectors</p>
            </div>
            <div className="rounded-[14px] border border-[#1f1f1f]/10 bg-white p-5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
              <Image
                src="/google-logo.png"
                alt="Google"
                width={28}
                height={28}
                className="mx-auto h-7 w-7"
              />
              <p className="mt-2 font-display text-[28px] text-[#1f1f1f] md:text-[34px]">5.0</p>
              <p className="mt-1 text-[13px] text-[#6a655d] md:text-[14px]">Google Reviews</p>
            </div>
            <div className="rounded-[14px] border border-[#1f1f1f]/10 bg-white p-5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
              <Image
                src="/trustpilot-logo.svg"
                alt="Trustpilot"
                width={90}
                height={22}
                className="mx-auto h-[18px] w-auto"
              />
              <p className="mt-2 font-display text-[28px] text-[#126849] md:text-[34px]">4.5</p>
              <p className="mt-1 text-[13px] text-[#6a655d] md:text-[14px]">Excellent Rating</p>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="text-center font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[42px]">
              Choose Your Portrait
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PORTRAIT_SHOWCASE.map(({ type, icon: Icon, title, text, price }) => (
                <div
                  key={type}
                  className="flex flex-col items-center rounded-[16px] border border-[#1f1f1f]/10 bg-white p-6 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-[19px] leading-[1.2] text-[#313131]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#595959]">{text}</p>
                  <p className="mt-3 font-display text-[18px] text-[#1f1f1f]">
                    From ₹{price.toLocaleString("en-IN")}
                  </p>
                  <Link
                    href={`/custom-portraits?type=${type}#estimator`}
                    className="mt-4 inline-flex items-center justify-center rounded-[10px] bg-[#1a1a1a] px-5 py-2 text-[14px] font-medium text-white transition-colors hover:bg-black"
                  >
                    Get My Estimate
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto max-w-[1100px] text-center">
            <h2 className="font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[42px]">
              How It Works
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: "1", title: "Choose Type & Size", text: "Pick your portrait type and size — presets or fully custom." },
                { step: "2", title: "Get an Instant Estimate", text: "See your real, calculated price the moment you enter a size." },
                { step: "3", title: "Pay 10% to Confirm", text: "Confirm your spot with a 10% deposit. Change your mind after review? Full refund." },
                { step: "4", title: "We Paint It", text: "Our team reviews your photo, confirms the final price, and your artist gets to work." },
              ].map(({ step, title, text }) => (
                <div key={step} className="flex flex-col items-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1f1f1f] font-display text-[18px] text-white">
                    {step}
                  </span>
                  <h3 className="mt-4 font-display text-[19px] text-[#313131]">{title}</h3>
                  <p className="mt-2 max-w-[260px] text-[14px] leading-6 text-[#595959]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="estimator" className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto max-w-[900px]">
            <div className="text-center">
              <ClipboardCheck className="mx-auto h-8 w-8 text-[#1f1f1f]" />
              <h2 className="mt-4 font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[38px]">
                Get Your Instant Estimate
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-[#595959] md:text-[16px]">
                Choose your type and size, upload a reference photo, and pay 10% to confirm your
                portrait.
              </p>
            </div>
            <div className="mt-8">
              <CustomPortraitForm />
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto max-w-[1100px]">
            <h2 className="text-center font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[42px]">
              Why a Hand-Painted Portrait
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {WHY_HAND_PAINTED.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex flex-col items-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-[19px] leading-[1.2] text-[#313131]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#595959]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FAQSection title="Custom Portraits FAQ" items={FAQ_ITEMS} />

        <section className="px-4 py-12 text-center sm:px-6 md:px-12 md:py-16">
          <p className="text-[15px] text-[#595959]">
            Looking for a fully bespoke concept instead of a portrait?{" "}
            <Link href="/custom-order" className="font-medium text-[#1f1f1f] underline underline-offset-2">
              Visit Custom Paintings
            </Link>
          </p>
        </section>
      </main>
    </>
  );
};

export default CustomPortraitsPage;
```

- [ ] **Step 2: Add the footer link**

In `components/footer.tsx`, in the `"Shop"` section's `links` array, add one entry right after `"Corporate & Bulk Orders"` and before `"Trade Program"`:

```ts
      { label: "Corporate & Bulk Orders", href: "/corporate-bulk-orders" },
      { label: "Custom Portraits", href: "/custom-portraits" },
      { label: "Trade Program", href: "/trade" },
```

- [ ] **Step 3: `npx tsc --noEmit`**

Expect only the 3 known pre-existing errors — nothing new in either file touched in this task.

- [x] **Step 4: Live verification — blocked by the same environment issue found in Task 3; substituted with `tsc` + structural code review**

Confirmed port 3000 clear, started the dev server on port 3023, requested `/custom-portraits` directly: `HTTP 500`, same `Invalid code point 14669348` `tailwindcss`/`lightningcss` failure already root-caused in Task 3 (this sandbox's Node `v26.1.0` vs. the installed native binary — affects the shared root layout/`globals.css`, not anything specific to this page). This confirms the failure is environment-wide, not a regression from this task's two files. Stopped the dev server; port 3000 reconfirmed untouched throughout.

Because full DOM rendering is unavailable in this sandbox right now, live Playwright interaction (clicking cards, watching the estimate update, screenshotting the hero/trust-bar/FAQ) could not be performed this session. In its place:

- `npx tsc --noEmit` is clean (only the pre-existing known errors) for both `app/custom-portraits/page.tsx` and `components/footer.tsx` — this catches prop-shape mismatches (`FAQItem[]`, `PORTRAIT_SHOWCASE` fields, `lucide-react` icon imports) with high confidence, since a wrong `FAQSection` prop or a nonexistent icon export would fail type-checking, not just render wrong.
- Structural review against the already-live, proven `/trade` page: `app/custom-portraits/page.tsx` mirrors its exact section pattern (dark hero → 3-tile trust bar reusing the same real logo assets → benefit/type cards → numbered how-it-works → form section → `FAQSection` → footer cross-link), with only content and the addition of `FAQPage` JSON-LD (the same `<script type="application/ld+json" dangerouslySetInnerHTML>` pattern already live on `app/rooms/bedroom/page.tsx` and 17 other pages) changed.
- The `?type=` preselection and pricing math were already verified independently: Task 1's scratchpad script proved the formula (including the exact Couple 10"×10" → ₹3,819 / ₹382 case this step would have clicked through), and Task 4's `tsc` pass confirms `CustomPortraitForm`'s query-param-reading effect and state wiring type-check correctly.

**This step is not fully verified live** — flagged explicitly to the user rather than claimed as done. The user should load `/custom-portraits` on their own server to visually confirm the page, the live estimate updates, and the footer link, before treating this as production-ready.

Do not attempt to click "Pay & Confirm My Portrait" through an actual Razorpay payment during any future verification — this account has no test/sandbox keys, so that step is a real-money transaction and is left for the user to test on their own live server, consistent with this project's standing practice for payment flows.

- [ ] **Step 5: Ask the user to run the new SQL file and confirm the live payment path**

Tell the user: (1) run `supabase/custom_portrait_requests.sql` in the Supabase SQL editor if not already done, (2) the `CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID` placeholder in `lib/api-route-handlers/custom-portraits/route.ts` was replaced with the real id from Task 2 — confirm it's correct, (3) do one real end-to-end test payment on their own server (small deposit, e.g. the smallest single-portrait custom size) to confirm the full Razorpay flow and the confirmation screen, since this is the one part of the feature that literally cannot be verified without a live payment.

---

## Self-review notes

- **Spec coverage:** every section of the design spec (route/metadata, page sections, estimator form, pricing formula, backend endpoint, Supabase table, hidden product, out-of-scope items) maps to a task above. The refund-assurance line appears in three places as designed: the form (Step 1 of Task 4), the confirmation screen (same task), and FAQ item 4 (Task 5).
- **No placeholders:** the one intentional placeholder — `CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID = 0` in Task 3 — is explicitly called out with a `// TODO` and a required manual replacement step tied to Task 2's output before Task 3's Step 4 can run; this is a legitimate cross-task data dependency (the id doesn't exist until Task 2 runs), not a vague "fill in later."
- **Type consistency:** `PortraitType`, `calculatePortraitEstimate`'s return shape (`{estimatedPrice, depositAmount}`), and the `/api/custom-portraits` response shape (`{success, orderId, orderKey, orderNumber, estimatedPrice, depositAmount, razorpay: {...}}`) are defined once in Task 1/Task 3 and reused verbatim (same field names) in Task 4 — checked line-by-line against Task 3's route response.
