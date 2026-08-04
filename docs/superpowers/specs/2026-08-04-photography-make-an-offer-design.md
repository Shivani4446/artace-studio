# Photography Category + Make an Offer — Design

## Context

Artace Studio wants to launch a new product category, "Photography" —
original digital prints that ship in a tube — sold alongside the existing
painting categories. Photography products need two purchase paths: the
existing "Add to Cart" flow, and a new "Make an Offer" flow where a buyer
proposes a price instead of paying the listed one, with a human on the
Artace Studio team reviewing and following up.

This builds entirely on infrastructure already in this codebase:

- **Variable products/variations.** `components/singleproduct/SingleProduct.tsx`
  already renders size selection generically for any product with a "Size"
  attribute and WooCommerce variations (lines 756-769 and surrounding). A
  Photography product with 8×10 / 16×20 / 24×36 variations configured in
  WooCommerce needs zero new code for size selection — it's the same UI
  every painting with sizes already uses.
- **The "capture a lead, notify a human" pattern**, used today by Custom
  Orders (`lib/api-route-handlers/custom-order/route.ts`): validate the
  payload, `INSERT` into a Supabase table via its REST API
  (`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`), then send a plain-text email
  via Resend (`lib/email/resend.ts`) to the team inbox
  (`CUSTOM_ORDER_TO_EMAIL`-style env var). No WooCommerce order is created
  at submission time. "Make an Offer" reuses this exact pattern with a new
  table and a new route.
- **Supabase table convention**: a `.sql` file under `supabase/` (see
  `supabase/custom_orders.sql`) with `CREATE TABLE IF NOT EXISTS`, RLS
  enabled, an `INSERT`-for-anon policy (so the public-facing API route can
  write) and a `SELECT`-for-authenticated policy (so the team can read
  submissions from the Supabase dashboard). These files are meant to be run
  by hand in the Supabase SQL Editor — nothing in this codebase executes
  DDL programmatically.
- **Checkout's real address fields** (`app/checkout/checkout-client.tsx`,
  lines 19-24): `address1, address2, city, state, postcode, country`
  (`country` defaults `"IN"`). The offer form reuses these exact field
  names for consistency with the rest of the site.
- **Category creation via the WooCommerce Admin API** — the same approach
  already used this engagement to create the BAPPA coupon: a one-off
  authenticated `POST` to `/wp-json/wc/v3/products/categories`.

## Decisions

1. **WooCommerce category**: create "Photography" (slug `photography`) via
   the Admin API. Actual photo products, their sizes, and prices are added
   afterward in WP admin by Artace Studio, same as every other category —
   this project doesn't seed real product content.
2. **"Ships in Tube" / "Original Digital Print" badges** are category-level
   facts, not per-product configuration. Any product whose `categories`
   includes "Photography" (or slug `photography`) shows both as small
   fixed badges near the title/price on its product page — no new
   WooCommerce attributes needed.
3. **"Make an Offer" is gated to the Photography category only.** On a
   Photography product page, "Add to Cart" and a new "Make an Offer" button
   render side by side; every other category is unaffected.
4. **`/make-an-offer?productId=X`, a real page, not a modal** (per your
   choice). It fetches that one product fresh via the Store API by ID
   (name, image, price, slug) so the page works from a direct link with no
   dependency on cart/navigation state. If `productId` is missing or
   doesn't resolve to a real product, show a simple "product not found,
   here's a link back to Photography" state rather than a hard error.
5. **The page's copy is your exact provided text**, verbatim, above the
   form:

   > Found your perfect piece but need some price flexibility? Make an
   > offer, and if the artist says yes, it becomes yours instantly! Submit
   > your offer. Tell us what you can pay, and we'll present it to the
   > artist on your behalf.
   >
   > Get a response within 48 hours. We'll quickly share the artist's
   > decision with you.
   >
   > If accepted, the artwork is immediately yours! We'll process your
   > purchase and start confirming the shipping arrangements.
   >
   > Keep in mind: The artwork remains available to other collectors until
   > your offer is accepted. Promotional codes apply only to full-price
   > purchases. To see a total estimated price, including all applicable
   > customs duties and taxes, proceed to complete the following steps and
   > enter your shipping address.
6. **Form fields**: offer amount (INR, matching the product's own listed
   currency — no cross-currency conversion, this is a soft negotiation, not
   a transaction), name, email, phone, and the full shipping address block
   (`address1, address2, city, state, postcode, country`) reused verbatim
   from checkout's field set.
7. **Submission = capture + notify, not a transaction.** `POST
   /api/photography-offers` (added to the existing catch-all router the
   same way every other `lib/api-route-handlers/*` route is): validates the
   payload, generates an offer ID (`AASOFFER` + 6 digits, mirroring
   `generateOrderId`'s `AASCSTM` pattern), inserts into a new
   `photography_offers` Supabase table, emails the team via
   `sendTransactionalEmail`. No WooCommerce order, no payment, no automated
   accept/reject — a human follows up by phone/email, exactly like custom
   orders today.
8. **Confirmation**: on successful submit, the page swaps to a simple
   "Offer submitted — we'll be in touch within 48 hours" state (no
   redirect, no payment collection).

## Data flow

1. `SingleProduct.tsx` (or wherever the Add to Cart button renders today)
   checks whether the loaded product's categories include Photography; if
   so, renders "Make an Offer" as a `<Link href="/make-an-offer?productId={id}">`
   next to the existing Add to Cart button, and renders the two badges from
   Decision 2.
2. `app/make-an-offer/page.tsx` (new) fetches the product server-side by
   `productId` from the Store API (same fetch pattern used throughout this
   project — `?include={id}` or `/products/{id}`), passes it to a new
   client component for the form.
3. Client form submits to `POST /api/photography-offers`
   (`lib/api-route-handlers/photography-offers/route.ts`, new, registered
   in `app/api/[[...path]]/route.ts`'s `ROUTES` map).
4. The route validates required fields (name, email, phone, offer amount,
   address1, city, state, postcode, productId), generates the offer ID,
   inserts a row into `photography_offers` via Supabase's REST API, emails
   the team via `sendTransactionalEmail`, returns `{ok: true, offerId}`.
5. On success, the client component swaps to the confirmation state
   in-place (no navigation).

`photography_offers` table (new `supabase/photography_offers.sql`, same
shape/policies as `custom_orders.sql`): `id, offer_id, product_id,
product_name, product_slug, offer_amount, name, email, phone, address1,
address2, city, state, postcode, country, user_agent, ip_address,
created_at`.

## Out of scope

- No automated offer accept/reject, no coupon auto-generation, no
  WooCommerce order created by this feature at all — a person on the team
  handles the outcome manually, same as custom orders today.
- No real-time shipping/customs cost calculation on the offer page — the
  "total estimated price" language in the provided copy is aspirational
  framing carried over verbatim; actual cost communication happens when
  the team follows up.
- No changes to the existing Add to Cart flow, cart, or real checkout for
  any category, including Photography (a Photography product bought via
  Add to Cart checks out exactly like any other product today).
- No admin dashboard for viewing/managing offers — the team reads
  submissions via the Supabase dashboard (its `SELECT`-for-authenticated
  policy already supports this) and via the email notification, matching
  how custom orders are handled today.
- Seeding real Photography products/photos is not part of this build —
  Artace Studio adds those in WP admin once the category and site support
  exist.

## Standing project constraints (carried forward)

- No `git commit`/`git push` — the user reviews and commits/pushes
  everything themselves.
- No test framework — verification via `npx tsc --noEmit`, `npm run
  build`, and live dev-server checks (a fresh port, never 3000).
- New Supabase tables are delivered as a `.sql` file for the user to run
  by hand in the Supabase SQL Editor — this project has no mechanism to
  execute DDL programmatically.
