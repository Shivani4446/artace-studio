# Product Page Framing Options Design

## Goal

Every painting now ships framed by default (framing price included, not an add-on). Replace the old "ships rolled, frame it locally" messaging with a real framing-style selector on the product page, and make sure the chosen frame actually reaches the WooCommerce order for fulfillment — not just a cosmetic cart display.

## Current State

- `components/singleproduct/SingleProduct.tsx` has a "Choose a Size" selector (~line 1809-1840): a `sizeOptions.map(...)` pill-button picker, each option a bordered button with a radio-dot indicator, `selectedSize` state, defaulting to `sizeOptions[0]`.
- The same file has a `<details>` accordion (~line 1957-1970) whose summary reads "Ships rolled. Frame it locally in your city to hang it" and whose expanded body explains the old unframed-shipping-only model ("Visit any local frame shop for multiple framing options..."). This describes a model that no longer applies now that framing is included.
- A separate "Packaging" info tab (~line 1488-1499) describes packaging for both framed and unframed artworks — this stays accurate since an unframed option is being kept, and is not touched by this change.
- A separate "Shipping and Returns" tab under an `isPhotography` branch (~line 1624-1632) has its own "ships rolled... visit a local frame shop" text for a *different* product type (photography prints) — out of scope, not touched.
- `handleAddToCart` (~line 1150-1176) builds the cart item's composite `id` as `` `${product.id}-${selectedSizeValue || "default"}` `` and a human-readable `subtitle` string (size + category) — `subtitle` is purely for client-side display (cart page, mini-cart) and does **not** reach the real WooCommerce order.
- The real order only carries `product_id`, `quantity`, and (if the product has a matching WooCommerce product variation) `variation_id` — confirmed by reading `lib/api-route-handlers/checkout/route.ts`'s `normalizedLineItems` construction (~line 100-116) and the client-side line-item builder in `app/checkout/checkout-client.tsx` (~line 247-266), which only forwards `productId`/`variationId`/`quantity`. There is currently no mechanism to attach an arbitrary custom note (like a frame choice) to an order line item.
- `components/cart/CartProvider.tsx`'s `CartProduct` type (line 13-24) is the shared shape for what a cart item can carry; `woocommerceVariationId?: number` is the closest existing precedent for "extra data that needs to reach the real order."
- `createWooCommerceOrder` (`utils/woocommerce-checkout.ts:281`) POSTs a raw payload straight to WooCommerce's `wc/v3/orders` endpoint — whatever shape is built for `line_items` (including `meta_data`) is forwarded as-is. WooCommerce's REST API natively supports a `meta_data: [{key, value}]` array per line item; this is the mechanism used to carry the frame choice through, since (unlike Size) there's no existing WooCommerce product variation dimension for framing.

## Scope

### 1. Frame options data

New `lib/framing/data.ts`:
- `type FrameOption = { id: string; label: string; image: string }`
- `FRAME_OPTIONS: FrameOption[]` — five entries, in this order:
  1. Black & Brown — `/frame-black-brown.png` (real file, provided)
  2. Oak Brown Wood & Gold Lining — `/frame-oak-brown-wood-gold-lining.png` (real file, provided)
  3. Royal Silver & White — `/frame-royal-silver-white.png` (real file, provided)
  4. Rustic Brown with Textured Lining — `/frame-rustic-brown-textured-lining.png` (real file, provided)
  5. No Frame / Rolled Canvas — `/images/product-ship.png` (existing site asset, reused as a neutral "unframed" visual — no new image needed for this option)
- The four real images were originally supplied with spaces and `&` in their filenames (e.g. `Black & Brown.png`); renamed to URL-safe filenames (`frame-black-brown.png`, etc.) since spaces/special characters in static asset paths are fragile in URLs and code. Adding, renaming, or reordering frame styles later is just editing this array, no other code changes.

### 2. Remove the outdated "ships rolled" messaging

Remove the entire `<details>` accordion in `SingleProduct.tsx` (summary "Ships rolled. Frame it locally in your city to hang it" plus its expanded body) — not reworded, fully removed, since its content describes a shipping model that no longer applies now that framing is included by default. The "Packaging" tab and the photography-specific "Shipping and Returns" text are both left untouched (see Current State).

### 3. "Choose a Frame" selector

Added to `SingleProduct.tsx` directly below the existing "Choose a Size" block, before the short-description block. A swatch-style picker: each `FrameOption` renders as a bordered card showing a small thumbnail image plus the label, using the same selected/unselected visual treatment (border and radio-dot) as the existing size pills for consistency. New `selectedFrame` state, defaulting to `FRAME_OPTIONS[0]` (Black & Brown) — framing is the default experience, with "No Frame" available as an explicit opt-out.

A caption line — "Framing included in the price" — is added near this selector, in the same small-text style as the existing "Inclusive of all taxes" line under the price.

### 4. Cart data carries the frame choice

`components/cart/CartProvider.tsx`'s `CartProduct` type gains an optional `frameLabel?: string` field. `SingleProduct.tsx`'s `handleAddToCart` sets it from the selected `FrameOption.label`, and folds it into the composite cart-item `id` (alongside size) so that two different frame choices for the same product/size are distinct cart line items — mirroring exactly how size already works.

### 5. Checkout carries the frame choice through to the real order

- `app/checkout/checkout-client.tsx`'s line-item builder gains a conditional `frameLabel` field on the outgoing line item, mirroring the existing `variationId` handling.
- `lib/api-route-handlers/checkout/route.ts`'s `CheckoutLineItemInput` type gains an optional `frameLabel?: string`; when present (after sanitizing via the existing `sanitizeText` helper), the corresponding `normalizedLineItems` entry gets a `meta_data: [{ key: "Frame", value: frameLabel }]` field, which WooCommerce's order-creation API accepts natively per line item.
- Net effect: the chosen frame becomes visible on the real order in wp-admin, per line item, without requiring any new WooCommerce-side product variation setup.

## Error Handling

- If `frameLabel` is missing/empty for a line item (e.g. an older cart item created before this change, or a non-painting product where this doesn't apply), the `meta_data` field is simply omitted for that line item — no error, no forced default.
- The frame selector always has a valid default (`FRAME_OPTIONS[0]`), so `selectedFrame` can never be empty when adding to cart.

## Testing

No test framework exists in this repo (established pattern). Verification is live, via the dev server and a real end-to-end checkout attempt:
- Confirm the old "Ships rolled..." accordion no longer renders anywhere on a product page.
- Confirm the "Choose a Frame" selector renders below "Choose a Size" with all 5 options, defaults to "Black & Brown", and the "Framing included in the price" line is visible.
- Confirm selecting a different frame updates the selection state visually.
- Add a product to the cart with a specific frame selected, and confirm the cart page shows the frame choice (via `subtitle`, matching how size is already surfaced there).
- Confirm two cart entries for the same product with different frame choices appear as separate line items, not merged.
- Run a real (or as-real-as-safely-possible) checkout and inspect the resulting WooCommerce order's line-item `meta_data` to confirm the frame choice actually appears on the order.
- `npx tsc --noEmit`, compared against the existing known-error baseline.

## Global Constraints

- No new npm dependencies.
- The old "ships rolled, frame it locally" accordion must be fully removed, not reworded.
- The "Packaging" and photography-specific "Shipping and Returns" text blocks are explicitly out of scope and must not be touched.
- The frame choice must reach the real WooCommerce order (via line-item `meta_data`), not just the client-side cart display — this is the whole point of the feature from a fulfillment perspective.
- Selecting a frame must never change the displayed price — framing is included, and the UI must say so.
