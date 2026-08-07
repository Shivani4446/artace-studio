# Prints Feature — Design

## Context

Every Artace Studio painting is handmade and sold as the original piece.
This adds a second, lower-priced way to buy the same artwork: a fine-art
print reproduction, at 25% of the original's price for that size, plus a
flat ₹350 if the customer wants it framed. This touches three things: a
new WooCommerce category to power a dedicated `/collections/prints`
browsing page, a per-product opt-out field controlling a new "Available in
Print" modal on each product's own page, and — discovered while designing
this — a real gap in how checkout charges for anything priced outside the
catalog, which must be fixed first for print pricing to be trustworthy.

Three things were verified live before designing this:

1. **WooCommerce's REST API silently ignores `meta_key`/`meta_value` query
   params** on the products list endpoint — confirmed by querying with and
   without a meta filter and getting identical results. Custom fields
   (ACF or otherwise) cannot be used to filter a product listing via the
   API. This is why the Prints catalog page is category-driven, not
   ACF-field-driven — a decision reached collaboratively when this
   limitation was raised.
2. **Checkout never sends a price to WooCommerce.** Tracing
   `app/checkout/checkout-client.tsx` → `lib/api-route-handlers/checkout/route.ts`
   → `createWooCommerceOrder`, the line items sent are only
   `{product_id, variation_id, quantity}` (plus a `frameLabel` meta tag).
   WooCommerce computes the order's `total` from its own catalog price for
   that product/variation, and that computed `total` — not anything the
   cart displays — is what gets converted to a Razorpay charge
   (`route.ts`, `parseAmountToMinorUnits(wooOrder.total)`). This is
   already true today for the existing **Order a Custom Size** feature,
   whose client-calculated price is display-only and does not affect what
   is actually charged.
3. **The regular product page already has a "Choose a Frame" selector**
   (`lib/framing/data.ts`, `FRAME_OPTIONS` — 5 styles including "No Frame
   / Rolled Canvas") where framing is "included in the price" today, no
   surcharge. The print modal reuses this exact list; only for prints does
   picking an actual frame add a charge.

## Decisions

### 1. Checkout price-override (built first — everything else depends on it)

Every `CartItem` already carries a `price` field used for the cart's own
display and subtotal (`components/cart/CartProvider.tsx`). For a normal
add-to-bag item, that price already equals WooCommerce's own catalog
price for the chosen variation, so always trusting it changes nothing for
ordinary orders. The fix: forward it through, always, as an explicit
per-line override.

- **Client** (`app/checkout/checkout-client.tsx`): when building each
  checkout line item from a cart item, include `unitPrice: item.price`
  alongside the existing `productId`/`variationId`/`quantity`/`frameLabel`.
- **Server** (`lib/api-route-handlers/checkout/route.ts`):
  `CheckoutLineItemInput` gains `unitPrice?: number`. When present and
  positive, the built line item includes
  `subtotal: (unitPrice * quantity).toFixed(2)` and
  `total: (unitPrice * quantity).toFixed(2)` — WooCommerce's REST API uses
  these directly instead of recalculating from the product's own price
  when both are supplied. `createWooCommerceOrder` itself needs no
  change — it already forwards an arbitrary payload object.
- Samora's checkout (`app/samora/checkout/checkout-client.tsx`) is a
  separate file and is **not** touched — Samora has no custom-size or
  print pricing today.
- **Side effect, called out explicitly**: this also makes **Order a
  Custom Size** charge its already-displayed custom price for the first
  time, rather than silently falling back to the base catalog price. This
  is a behavior change to a live feature, not just new-feature plumbing —
  worth watching for after deploy, though it is a correctness fix (it
  makes the charge match what the customer was shown) rather than a new
  risk.
- **Verification plan**: since this changes real payment amounts, the
  implementation plan includes placing one real test order (Custom Size
  or a print, smallest size, cancelled/refunded after) against the live
  WooCommerce+Razorpay integration to directly confirm the charged amount
  matches the cart's displayed price, not just that the API accepts the
  new field.

### 2. WooCommerce setup

- **New category**: "Prints" (slug `prints`), created via the Admin API,
  the same way the Photography category was created earlier.
- **Bulk assignment**: added to ~90 products — every published product
  *except* the 22 Samora-tagged products, 18 Tote Bags, 4 Tea Coasters,
  and the 1 Photography product (135 published products total). For each
  product, the category is **appended** to its existing categories via a
  read-then-write (fetch current `categories`, PUT the existing list plus
  the new Prints id) — never a bare `{"categories": [{"id": PRINTS_ID}]}`,
  which would silently wipe out the product's real category and default
  it to "All Canvas Paintings" (the exact bug fixed on product 4248
  earlier this engagement).
- **New ACF field**: `available_as_print`, a Yes/No (True/False) field
  added to the product edit screen, default **Yes**. You add this
  yourself in WordPress, same as the 3 photography fields. Read
  server-side via the WooCommerce Admin API's `meta_data`, same pattern
  as `fetchPhotographyDetails`/`fetchProductArtistName`
  (`app/shop/[slug]/page.tsx`). A product with no `available_as_print`
  meta at all (i.e., not yet touched since you added the field) is
  treated as available, matching the "defaults to Yes" intent.

### 3. Single product page — "Available in Print"

- New `fetchPrintEligibility(productId)` in `app/shop/[slug]/page.tsx`,
  mirroring `fetchPhotographyDetails` exactly: one authenticated
  `wc/v3/products/{id}` fetch, reads `available_as_print` from
  `meta_data`, returns `boolean` (default `true` if the key is absent or
  unparseable).
- Passed to `<SingleProduct isAvailableAsPrint={...} />`. When `true`, an
  "Available in Print" button/pill renders near "Add to Bag" (not shown
  for photography products — a photography print is already a print, this
  feature is specifically for reproducing handmade paintings).
- Clicking it opens a new modal (structured like the existing Custom Size
  modal — same `isXModalOpen` state + full-screen overlay pattern already
  in `SingleProduct.tsx`):
  - The product's existing images (same gallery, not a new image set).
  - Size selector reusing the product's existing `sizeOptions` /
    variations — same data source as the regular size selector.
  - Frame selector reusing `FRAME_OPTIONS` as-is (all 5 styles).
  - A live-updating price: `0.25 × (selected size's current price)`, plus
    `₹350` if the selected frame's id is not `"no-frame"`.
  - "Add to Bag" inside the modal calls the cart's existing `addItem`
    with: `title` = `"{Product Name} — Fine Art Print"`, `subtitle` =
    `"Fine Art Print | {size} | {frame}"`, `price` = the computed print
    price (now correctly charged thanks to Decision 1), `frameLabel` =
    the selected frame's label (existing mechanism, surfaces as
    WooCommerce line-item meta), plus one new meta tag identifying it as
    a print (e.g. `Order Type: Fine Art Print`) so it's unmistakable in
    your WooCommerce orders list even before opening the line item.
  - Same `woocommerceProductId` as the original (no separate WooCommerce
    product is created for the print version) — the distinguishing
    information travels entirely through the line item's title, subtitle,
    and meta tags.

### 4. `/collections/prints` page

- No new route or page component — `app/collections/[slug]/page.tsx`
  already works generically for any category slug with products in it
  (confirmed by reading it: it fetches all products, filters by
  `category.slug === decodedSlug`, and renders `CollectionLandingPage`).
  Once the Prints category exists and is populated (Decision 2), this
  page starts working with zero routing changes.
- Two overrides are needed because the generic template assumes "handmade
  original" framing, which is wrong for a prints page:
  - `COLLECTION_SEO_OVERRIDES["prints"]` (in
    `app/collections/[slug]/page.tsx`) — dedicated title/description
    instead of the generic "Explore N handmade prints works..." text.
  - `CollectionLandingPage.tsx`'s `buildProductSubtitle` — already has an
    `isPhotography`-style branch from the earlier photography work; this
    gains an equivalent `categorySlug === "prints"` branch showing "Fine
    Art Print | {size}" instead of "Handmade Painting | {size} |
    {medium}".
  - Card pricing on this page specifically shows the **print price** (25%
    of the original's price), not the original painting price — since
    that's what's actually being sold on this page. This is a
    `categorySlug === "prints"` branch in `toProductCard`
    (`app/collections/[slug]/page.tsx`), multiplying the displayed
    `price`/`regularPrice` by 0.25 before building the card.
  - Clicking a card still goes to the product's normal `/shop/{slug}`
    page (no separate print-only product page — the print purchase
    happens via the modal from Decision 3 on that same page).

## Data flow

1. `app/shop/[slug]/page.tsx`'s `Promise.all` gains
   `fetchPrintEligibility(product.id)` alongside the existing
   `fetchPhotographyDetails`/`fetchProductArtistName` calls, passed to
   `<SingleProduct isAvailableAsPrint={...} />`.
2. `app/checkout/checkout-client.tsx` includes `unitPrice: item.price` on
   every outgoing line item; `lib/api-route-handlers/checkout/route.ts`
   forwards it as `subtotal`/`total` on the WooCommerce line item when
   present.
3. `app/collections/[slug]/page.tsx` gains a `categorySlug === "prints"`
   branch in both `toProductCard` (price × 0.25) and the SEO override map
   — everything else in that file (fetch, sort, FAQ, schema generation)
   is already fully generic and needs no changes.
4. `CollectionLandingPage.tsx`'s `buildProductSubtitle` gains a
   `categorySlug === "prints"` branch alongside its existing
   `isPhotography`-equivalent branch.

## Error handling

- `fetchPrintEligibility` follows the established try/catch-returns-safe-default
  pattern (`fetchPhotographyDetails`) — any fetch failure defaults to
  `true` (available), matching "defaults to Yes," rather than hiding the
  feature on a transient API hiccup.
- The bulk category-assignment script processes products one at a time
  with its own error handling per product (a single product's PUT failure
  doesn't abort the batch) and prints a summary of any product ids that
  failed, so those can be retried or fixed manually rather than silently
  lost.
- The checkout `unitPrice` override is only applied when the value is a
  positive finite number — a missing or invalid `unitPrice` falls back to
  today's behavior (no override, WooCommerce's own catalog price), so a
  bug in computing print/custom-size price fails safe toward "charge the
  catalog price" rather than an invalid charge amount.

## Out of scope

- No separate WooCommerce product/variation is created for print
  versions — everything is modeled as a differently-priced line item on
  the same product, distinguished by title/subtitle/meta only.
- No automatic sync between the ACF field and Prints category membership
  — they are independent, as decided (category is manually curated by
  you; the ACF field is the per-product page gate).
- No changes to Samora's checkout, cart, or catalog.
- No changes to the "Order a Custom Size" feature's own UI or logic —
  Decision 1 changes what it charges, not how it works.
- No auto-opening of the print modal via a query param on first load —
  landing on the normal product page with the "Available in Print" button
  visible is sufficient for v1.

## Standing project constraints (carried forward)

- No `git commit`/`git push` — the user reviews and commits/pushes
  everything themselves.
- No test framework — verification via `npx tsc --noEmit`, `npm run
  build`, and live dev-server checks (a fresh port, never 3000), plus one
  real test order for the checkout pricing fix specifically (see Decision
  1's verification plan).
