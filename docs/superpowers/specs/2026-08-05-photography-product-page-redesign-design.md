# Photography Product Page Redesign — Design

## Context

The Photography category (added earlier this engagement, WooCommerce category
id 376, slug `photography`) currently reuses the same product page as
paintings almost entirely unchanged — it just adds a couple of badges, a
"Make an Offer" button, and a standalone detail-sections block on top of the
painting-oriented page. After the first real photography product went live,
several elements were found to be wrong or irrelevant for a photograph
(customizable/canvas claims, a custom-size flow that doesn't apply to a
single captured image, painting-specific tab copy, unrelated paintings in
"Shop More Like This"), and several photography-specific opportunities were
identified (a real zoomable image view, artist recognition/follow, focused
tabs).

All changes in this spec are scoped to `SingleProduct.tsx` (and its
`app/shop/[slug]/page.tsx` data-fetching companion) and gated behind the
existing check already used throughout this page:
`product.categories.some((category) => category.slug === "photography")`.
Painting product pages render exactly as they do today — no shared code
path changes behavior for a non-photography product.

## Decisions

### 1. Remove "Order a Custom Size" for photography

The button (currently always rendered, opens a width/height custom-size
calculator modal) is wrapped in `!isPhotography`. A photograph is a single
captured image, not a resizable design — arbitrary custom dimensions don't
apply. The predefined "Choose a Size" swatches above it are unaffected and
keep working normally for photography (a product can still offer multiple
preset print sizes). The custom-size modal itself has exactly one trigger
(this button) — hiding the trigger is sufficient, no other code path opens
it.

### 2. Remove "Customizable" tag for photography

The black "Customizable" pill next to the image gallery is wrapped in
`!isPhotography`. The existing "Ships in Tube" / "Original Digital Print"
pills next to it are untouched (already gated on `isPhotography`).

### 3. Shop Catalog category label

Already fixed in the previous session's work (`ShopCatalog.tsx`'s
`categoryLabel` already reads `product.categories[0]`, which is
"Photography" now that the live product's category assignment is corrected,
and its meta line was changed to "Original Digital Print" for photography
products). This item needs no new code — just confirmation it's intact and
eventually committed/deployed by the user.

### 4. Remove "Ships rolled" callout and the icon row below it

Two blocks are wrapped in `!isPhotography`:
- The expandable `<details>` "Ships rolled. Frame it locally in your city to
  hang it" callout.
- The 4-icon strip immediately below it: Premium Cotton Canvas, 100%
  Handmade, Museum Grade, Authenticity Certificate — all claims specific to
  handmade canvas paintings, not digital prints.

The shipping fact itself (ships rolled, in a protective tube) is not lost —
it's restated appropriately in the new "Shipping and Returns" tab (Decision
9), just moved out of the hero area to declutter it.

### 5. Full-screen zoomable image overlay

New dependency: `yet-another-react-lightbox` plus its `zoom` plugin
(`yet-another-react-lightbox/plugins/zoom`). Rationale: pinch-zoom,
drag-to-pan, keyboard/swipe navigation, and focus-trapping/accessibility are
non-trivial to hand-roll correctly, and this library is small, well
maintained, and framework-agnostic (no CSS framework conflicts with
Tailwind).

- The main product image becomes a `<button>` wrapping the existing `<Image>`
  (keeps the same visual, adds `cursor-zoom-in` and an aria-label), opening
  the lightbox on click.
- The lightbox's slide list is built from `product.images` (every image this
  product has, matching what the thumbnail strip already shows), opened at
  `activeImageIndex` so it starts on whichever thumbnail is currently
  selected.
- Zoom plugin config: click/scroll/pinch to zoom, drag to pan while zoomed,
  double-click/tap to toggle zoom.
- This is gated to photography products only (per the request framing of
  "the photography product page"). Painting product pages keep today's
  plain inline image with no click behavior. This can be revisited for
  paintings later as a separate decision if wanted.
- Closing: click outside, `X` button, or `Esc`. Body scroll is locked by the
  library while open (its default behavior).

### 6. Remove "Complimentary Art Advisory" section

The entire black "Complimentary Art Advisory" section (advisor card with
Sahil Mahalley, "Book a Free Call Now") is wrapped in `!isPhotography`.

### 7. "Shop More Like This" → "Photographs You May Also Like"

- **Data**: a new function in `app/shop/[slug]/page.tsx`,
  `getRelatedPhotographyProducts(currentProductId)`, queries
  `wc/v3/products?category=376&exclude=<currentProductId>&per_page=4&status=publish`
  via the authenticated Admin API (consistent with this page's existing
  server-side WooCommerce calls) and maps results through the same
  `toRelatedCard` shape already used for `RelatedProductCard`. This replaces
  a call to the existing `getRelatedProductsForProduct` (which uses
  WooCommerce cross-sells falling back to featured products, with no
  category awareness) whenever the current product is photography.
- **Heading**: `SingleProduct.tsx` renders "Shop More Like This" normally,
  or "Photographs You May Also Like" when `isPhotography`.
- **Card subtitle**: the hardcoded "Handmade Painting" / "Handmade Painting |
  {sizes} | Acrylic Colors on Canvas" lines in this section are replaced
  with "Original Digital Print" / "Original Digital Print | {sizes}" when
  `isPhotography` — gated once at the section level (not per-card), since
  every card in this section is guaranteed to be a photography product when
  the current product is photography (the fetch itself is category-scoped).
  This avoids adding a category field to `RelatedProductCard`.
- **Empty state**: if the photography-scoped fetch returns zero results
  (true today — there's currently only one photography product), the grid
  is replaced with a humorous placeholder card/message instead of rendering
  nothing:

  > "This one's flying solo in the gallery right now — the only photograph
  > in the collection. More frames coming soon."

  Still keeps the "Shop All" link (pointed at `/shop?category=photography`
  instead of `/shop` when photography, so it's not a dead end).

### 8. About the Artist enhancements (photography pages only)

Below the artist's name in the right-hand column (next to the circular
photo), add — only when `isPhotography`:

- **Recognition line**: "Featured Artist — Artace Studio". A new
  `recognition: string` field added to the `Artist` type in
  `lib/artists/data.ts`, same value for all three artists (Sahil, Sampadaa,
  Vekkas) since no artist-specific recognition content exists yet. This is
  deliberately generic and non-specific so it makes no unverifiable claim —
  if/when real per-artist recognitions exist, this field is where they'd go.
- **View Artist Profile + Follow row**: a compact secondary link (same
  destination, `/artists/{artist.slug}`, smaller than the existing left-column
  CTA which is untouched) paired with a **Follow** toggle button.
  - Follow is a client-side-only feature: a `useFollowedArtists()` hook reads
    and writes a JSON array of followed artist slugs to
    `localStorage["artace_followed_artists"]`. No backend, no account
    system (none exists on this site — guest checkout only).
  - Button reads "Follow" (outlined) when not followed, "Following"
    (filled/checked style) when followed; clicking toggles the slug in the
    stored array. State is read on mount (client component, so this section
    of the page needs a small client wrapper — `SingleProduct.tsx` is
    already `"use client"`, so this is a local `useState` + `useEffect`
    reading `localStorage`, no new client boundary needed).

### 9. Photography-specific tabs

New tab set for photography, replacing today's 7 painting tabs:

```
PHOTOGRAPHY_TAB_LABELS = [
  "About the Photograph",
  "Details and Dimensions",
  "Shipping and Returns",
  "Reviews",
]
```

`Reviews` is kept (unchanged `ProductReviewsForm`) so the existing ★ rating
pill (which scrolls to the Reviews tab) keeps working without changes.

Tab content:

- **About the Photograph** — reuses the exact existing "About the Painting"
  rendering: the sanitized `product.description` HTML plus the "Quick
  Highlights" aside (artist / category / medium attribute / size — this
  logic is already generic, not painting-specific). Only the labels change:
  eyebrow "About The Photograph", and the aside's closing line changes from
  "Every piece is handcrafted and carefully quality-checked before dispatch"
  to "Every print is produced to museum-grade archival standards and
  quality-checked before dispatch" (the one painting-specific claim in that
  block).
- **Details and Dimensions** — reuses the exact existing "Specifications"
  rendering (the generic attribute-table built from `specificationRows`,
  which is already attribute-driven and not painting-specific). Only the
  heading changes ("Photograph Details") and the small pill next to it
  changes from "Made for mindful buying" to "Archival Fine Art Print".
- **Shipping and Returns** — new copy merging today's Delivery + Packaging +
  Returns tab content into one tab, same underlying policy (15-day return
  window, ships rolled in a protective tube, international duty terms are
  the buyer's responsibility) reworded away from "painting/canvas/frame it
  locally" language:

  > Your photograph ships rolled in a protective tube to prevent damage in
  > transit. It arrives unframed — visit a local frame shop for framing
  > options suited to your space. A booklet with framing tips is included.
  >
  > If your order arrives damaged, contact our support team within 24 hours
  > of delivery and we'll resolve it quickly.
  >
  > You may return your photograph within 15 days of delivery. It must be
  > unframed, in its original packaging, and in the same condition it was
  > received in. Limited-edition prints purchased through Make an Offer
  > follow the same return window.
  >
  > Delivery times are estimated and may vary by courier and, for
  > international orders, customs processing. Any import duties or taxes for
  > orders shipped outside India are paid directly to the courier on
  > delivery and are not included in our prices.

`activeInfoTab`'s default initial value becomes conditional on
`isPhotography` (defaults to `"About the Photograph"` instead of `"About the
Painting"`) so the tab bar never opens on a label that isn't in the active
set.

## Data flow

1. `app/shop/[slug]/page.tsx`: when the product is photography, its existing
   `Promise.all` swaps `getRelatedProductsForProduct(product)` for
   `getRelatedPhotographyProducts(product.id)`. Both return
   `RelatedProductCard[]`, so `SingleProduct.tsx`'s `relatedProducts` prop
   type is unchanged.
2. `lib/artists/data.ts`: `Artist` type gains `recognition: string`; all
   three `ARTISTS` entries get the same value.
3. `SingleProduct.tsx`: a module-level `isPhotography` boolean (derived once
   from `product.categories`, same check used everywhere already) drives
   every conditional in this spec — tab list, tab content, badges, sections,
   related-products heading/subtitle/empty-state, and the About the Artist
   additions.
4. Follow state lives entirely in the browser (`localStorage`), read via a
   small hook local to this component. No new server code, no new
   Supabase/WooCommerce calls for Decision 8.

## New dependency

`yet-another-react-lightbox` (+ its bundled `zoom` plugin, no separate
package) — added to `package.json` via `npm install`. This is the first new
runtime dependency added during this engagement; flagging clearly since
prior work has stayed dependency-free. If preferred, the custom-built
alternative (no new dependency, hand-rolled pinch/pan) can be swapped in
later — this spec chose the library for lower risk of a subtly broken touch
interaction shipping to production.

## Error handling

- `getRelatedPhotographyProducts` follows the same pattern as other
  authenticated WooCommerce calls in this file (try/catch, returns `[]` on
  any failure) so a WooCommerce hiccup degrades to the empty-state message
  rather than a broken page.
- Lightbox open/close state is local `useState`; if `product.images` is
  empty (shouldn't happen — a fallback image always exists) the click
  handler simply doesn't open a lightbox with zero slides.
- `localStorage` access in the Follow hook is wrapped defensively (some
  browsers/privacy modes throw on `localStorage` access) — a failed read or
  write is caught and treated as "not followed" rather than crashing the
  page.

## Out of scope

- No changes to painting (non-photography) product pages — every decision
  above is gated to `isPhotography`.
- No real user-account-based follow system (would require building
  accounts/login from scratch — a separate, much larger project).
- No per-artist real recognition content — the generic line ships now;
  real per-artist text is a future content update to
  `lib/artists/data.ts`, not a code change.
- No change to the existing "Make an Offer" flow, pricing, cart, or
  wishlist behavior.
- No change to the predefined size-swatch selector — only the *custom*
  arbitrary-dimension flow is removed for photography.

## Standing project constraints (carried forward)

- No `git commit`/`git push` — the user reviews and commits/pushes
  everything themselves.
- No test framework — verification via `npx tsc --noEmit`, `npm run
  build`, and live dev-server checks (a fresh port, never 3000).
