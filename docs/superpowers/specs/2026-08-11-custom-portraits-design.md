# Custom Portraits Page — Design

## Context

The user asked for a new, SEO-rich, conversion-oriented, best-UX page for
Custom Portraits — single, couple, family, and baby portraits — with a
dedicated estimator/booking form: customer uploads a reference photo, gets
a real calculated price estimate, and pays a 10% deposit to "confirm your
portrait," with an explicit assurance that they'll be refunded if they
decide not to go ahead.

This is a sibling offering to the existing `/custom-order` page (which
handles bespoke paintings of any concept, lead-capture only, no payment).
Custom Portraits is narrower in scope (just the 4 portrait types) but goes
further — it collects a real deposit at time of request, which
`/custom-order` never does.

Confirmed with the user before writing this spec:

- **Payment architecture**: one hidden WooCommerce product ("Custom
  Portrait Deposit"), price overridden per order — the same
  `unitPrice`-override mechanism already proven for Prints. Not a fully
  separate non-WooCommerce payment flow.
- **Pricing**: real, exact numbers, not a vague range. Base size 12″×12″
  (144 sq in). Base prices at that size: Single ₹4,500, Couple ₹5,500,
  Family ₹6,800, Baby ₹4,000. For any other size, calculate the requested
  area and scale proportionally from the base price at the base area. This
  applies identically to all four categories.
- **After deposit**: the team manually reviews the uploaded photo,
  finalizes the exact price, and invoices the balance manually. No
  automated balance-payment flow.
- **Refund policy**: manual, team-processed. No Razorpay refund API
  automation — just clear, honest policy language on the page, in the
  form, and on the confirmation screen.

One thing investigated and settled during research, not re-litigated here:
the site's main `/api/checkout` hard-requires a signed-in customer session
(`401` otherwise). Forcing account creation before a first-time SEO
visitor can pay a small deposit would kill conversion, so this feature
gets its own guest-friendly order-creation endpoint (detailed below) built
on the same WooCommerce + Razorpay utilities, rather than adding a
login-bypass to the security-sensitive main checkout route.

No real sample portrait photos exist yet in `public/` (checked directly).
This design does not fabricate "customer portrait" before/after imagery —
the portrait-type showcase uses clean icon/illustration treatment instead.
The user can swap in real completed-commission photos later once some
exist; noted as a natural follow-up, not blocking this build.

## Decisions

### 1. Route and metadata

`/custom-portraits` — new top-level route, sibling to `/custom-order`.

- Title: "Custom Portrait Paintings – Hand-Painted From Your Photo |
  Artace Studio"
- Description mentions all four types, hand-painted, and the real
  starting price ("From ₹4,000").
- `FAQPage` JSON-LD embedded directly in the page (no existing shared
  component emits this; `components/seo/FAQSection.tsx` is presentation
  only), built from the same question/answer text actually rendered on
  the page — real content, not synthetic.

### 2. Page sections (top to bottom)

1. **Hero** — "Custom Portrait Paintings, Painted By Hand From Your
   Photo." Same dark branded hero language as `/reviews` and `/trade`.
   Primary CTA scrolls to the estimator form. Sub-line: "Single, Couple,
   Family & Baby portraits. Get an instant price — pay just 10% to
   confirm."
2. **Trust bar** — same 3 real stat tiles already live on `/reviews` and
   `/trade` (20,000+ Collectors, Google 5.0, Trustpilot 4.5), same real
   logo assets. No new numbers invented.
3. **Portrait types showcase** — 4 cards: Single (from ₹4,500), Couple
   (from ₹5,500), Family (from ₹6,800), Baby (from ₹4,000). Each card:
   icon/illustration, one-line description, starting price, "Get My
   Estimate" button that scrolls to the form with that type pre-selected.
4. **How It Works** — 4 numbered steps: Choose your portrait type & size
   → Get an instant estimate → Pay 10% to confirm your spot → Our artists
   paint it (team reviews your photo, confirms final price, and invoices
   the balance once painting begins). Step 3 carries the refund assurance
   line inline.
5. **The estimator + booking form** — the core new component, detailed in
   §3 below.
6. **Why a hand-painted portrait** — short trust/quality copy section
   (100% hand-painted, named artists, archival materials) — reuses the
   site's existing established voice, no fabricated testimonials.
7. **FAQ** — reuses `components/seo/FAQSection.tsx`. Portrait-specific
   questions: How is my estimate calculated? What sizes are available?
   What happens after I pay the deposit? Is the deposit refundable? How
   long does a custom portrait take? What photo quality do I need to
   provide? Can I request changes before the final painting starts? Do
   you ship internationally? What if I want more than one portrait? Can I
   combine portrait types (e.g. a couple + their baby)?
8. **Final CTA banner** — "Ready to bring your photo to life?" → scrolls
   to the form.

### 3. The estimator + booking form (`CustomPortraitForm`)

New client component, `components/custom-portraits/CustomPortraitForm.tsx`,
styled to match `CustomOrderForm`'s visual language but a distinct,
simpler flow since it ends in payment rather than a lead-capture submit:

1. **Portrait type** — 4 selectable cards (Single/Couple/Family/Baby),
   pre-selected if the visitor arrived via a specific "Get My Estimate"
   button.
2. **Size** — preset buttons (12″×12″, 16″×20″, 24″×36″) plus a "Custom
   size" option revealing width/height number inputs (inches). Live price
   updates on every change.
3. **Live estimate display** — always visible once type + size are set:
   "Estimated Price: ₹X" and "Deposit to pay now (10%): ₹Y", computed
   client-side with the exact formula in §4 for instant feedback. This
   number is a preview only — the server recomputes it authoritatively at
   submit time (§5), so a tampered client value can never change what's
   actually charged.
4. **Reference photo upload** — reuses the existing `/api/upload-image`
   endpoint as-is (same `FormData` `images` field, same 10MB/type
   validation). At least one photo required to proceed.
5. **Contact details** — Full Name, Email, Phone only. No address fields
   — keeps the deposit step low-friction; the team collects shipping
   details later when the balance is invoiced.
6. **Notes** — optional free text for special requests (pose, background,
   framing preference, etc.).
7. **Refund assurance line** — shown directly above the pay button: "Your
   deposit confirms your spot in our artists' queue. If you review the
   final concept and decide not to go ahead, we'll refund your deposit in
   full."
8. **Pay button** — "Pay ₹Y & Confirm My Portrait." Triggers the Razorpay
   checkout widget using the exact same client-side invocation pattern as
   `app/checkout/checkout-client.tsx` (dynamically-loaded
   `checkout.razorpay.com/v1/checkout.js`, `new window.Razorpay({...})`
   with the `orderId`/`keyId`/`amount` the new endpoint returns).
9. **On Razorpay success** — calls the existing, unmodified
   `/api/checkout/verify` endpoint with
   `{orderId, orderKey, razorpayOrderId, razorpayPaymentId,
   razorpaySignature}` (identical contract to the main checkout), then
   shows a confirmation screen: "Your portrait request is confirmed! Our
   team will review your photo and reach out within 24–48 hours with the
   final price and timeline. Deposit paid: ₹Y · Order #___." Repeats the
   refund assurance line.

### 4. Pricing formula (server is authoritative; client mirrors it for live preview)

```
BASE_PRICES = { single: 4500, couple: 5500, family: 6800, baby: 4000 }  // ₹
BASE_AREA_SQIN = 12 * 12  // 144

estimatedPrice = round(BASE_PRICES[type] * (width_in * height_in) / BASE_AREA_SQIN)
depositAmount  = round(estimatedPrice * 0.10)
```

Same formula, same constants, defined once and imported by both the
client component (instant preview) and the new API route (authoritative
calculation at submit time — the client-sent estimate is never trusted
for the actual charge).

### 5. New backend: guest-friendly order-creation endpoint

`lib/api-route-handlers/custom-portraits/route.ts` — `POST`, no
authentication required (unlike `/api/checkout`):

- Validates: `portraitType` ∈ {single, couple, family, baby}; `width`/
  `height` are positive numbers within a sane range (4–72 inches);
  `name`/`email`/`phone` non-empty; `referenceImages` is a non-empty array
  of URLs (already uploaded via `/api/upload-image` before this call).
- Recomputes `estimatedPrice`/`depositAmount` server-side from §4 —
  ignores any price the client sends, if one is even sent.
- Creates a WooCommerce order via `createWooCommerceOrder` (reused
  as-is): guest order (no `customer_id`), `billing` with just
  first/last name (split from the submitted full name), `email`, `phone`,
  `line_items: [{ product_id: CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID,
  quantity: 1, subtotal: depositAmount.toFixed(2), total:
  depositAmount.toFixed(2) }]` — same override shape already proven for
  Prints — `set_paid: false`, `customer_note` summarizing type/size/
  estimate/notes, and `meta_data` recording `Portrait Type`, `Size`,
  `Estimated Price`, `Reference Photos` so the order is fully readable
  from the WooCommerce admin order screen alone.
- Creates a Razorpay order via `createRazorpayOrder` (reused as-is) with
  the identical `notes: {woo_order_id, woo_order_key, woo_order_number}`
  shape the existing webhook and verify endpoints already expect.
- Updates the Woo order's `meta_data` with `_artace_razorpay_order_id`
  (same pattern as `/api/checkout`), so the existing webhook can find it.
- Best-effort inserts one row into the new `custom_portrait_requests`
  Supabase table (§6) — a failure here never blocks the payment flow,
  matching every other lead-capture endpoint's error-tolerance in this
  codebase.
- Sends a Resend notification email to the team at request time (order
  created, awaiting payment) — same immediate-notification pattern as
  Trade/Corporate leads — including the reference photo links and the
  computed estimate, so the team can see it's coming even before payment
  clears. Whether it actually got paid is visible the same way the team
  already checks every other order: WooCommerce order status
  (`pending` → `processing`), which the existing, unmodified webhook and
  verify endpoints already flip correctly — no new payment-status
  notification plumbing needed.
- Returns the same response shape as `/api/checkout`'s success path
  (`orderId`, `orderKey`, `orderNumber`, `razorpay: {keyId, orderId,
  amount, currency, name, description, prefill, notes}`), so the client
  can drive the Razorpay widget with the exact same code shape
  `checkout-client.tsx` already uses.

**Reused completely unmodified:**
`lib/api-route-handlers/checkout/verify/route.ts` (client-triggered
signature verification + order finalization) and
`lib/api-route-handlers/razorpay/webhook/route.ts` (server-side safety
net). Both are already generic over `woo_order_id`/`woo_order_key`, not
tied to the cart checkout flow — confirmed by reading both in full.

### 6. New Supabase table — `custom_portrait_requests`

Mirrors the shape and RLS pattern of `custom_orders`, extended with the
portrait-specific fields:

```sql
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

CREATE POLICY "Allow insert for custom portrait requests"
  ON custom_portrait_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for authenticated users"
  ON custom_portrait_requests FOR SELECT USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_custom_portrait_requests_wc_order_id
  ON custom_portrait_requests (wc_order_id);
CREATE INDEX IF NOT EXISTS idx_custom_portrait_requests_email
  ON custom_portrait_requests (email);
```

Shipped as a `.sql` file under `supabase/` for the user to run by hand —
same established pattern as every other new table this engagement.
`payment_status` starts as `'pending'`; nothing in this build updates it
automatically (the WooCommerce order status is the real source of truth
for payment state, same as every other order on this site) — it exists so
the team can optionally mark it manually while triaging.

### 7. One-time setup: hidden WooCommerce product

A single product, "Custom Portrait Deposit," created once via the
WooCommerce Admin REST API (`POST /wc/v3/products`) — the same
Consumer-Key/Secret-authenticated Admin API already used throughout this
engagement, run as a one-off script the same way earlier category setup
was done:

- `catalog_visibility: "hidden"` — never appears in shop/search/related
  products.
- `status: "publish"` — must be publish (not draft) to be orderable via
  the REST API.
- `virtual: true` — no shipping calculated on the deposit line item
  itself; the physical artwork's shipping is handled later, outside this
  system, when the team manually invoices the balance.
- `regular_price: "1"` — a placeholder; the real charge always comes from
  the per-order `subtotal`/`total` override, the same mechanism already
  proven for Prints. The catalog price is never actually charged.

The resulting numeric product ID is recorded as
`CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID` in the new API route (or an env var,
matching how other one-off product/category IDs are already handled in
this codebase).

## Out of scope

- No automated balance payment or automated refund processing — both are
  manual, team-driven, per the user's explicit choice.
- No customer login/account requirement anywhere in this flow.
- No fabricated sample portrait photography — real completed-commission
  photos can be swapped in later once they exist.
- No changes to `/custom-order`, `/api/checkout`,
  `/api/checkout/verify`, or the Razorpay webhook beyond reading them for
  reuse.

## Standing project constraints (carried forward)

- No `git commit`/`git push` — the user reviews and commits/pushes
  everything themselves.
- No test framework — verification via `npx tsc --noEmit` and live
  dev-server checks on a fresh port. Given the earlier port-3000
  incident, no `npm run build` / `rm -rf .next` while port 3000 may be
  running; prefer asking the user to check the live payment flow on their
  own server (a real Razorpay charge shouldn't be test-fired from a
  throwaway sandbox port) once the code is in place.
