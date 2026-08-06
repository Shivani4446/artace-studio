# Specifications Tab Cleanup & Trust-Badge Relocation Design

## Goal

On the Paintings product page (and, as a shared side effect, Photography's equivalent tab): stop the "Specifications" table from showing duplicated long-form prose that belongs to other tabs, and move the "Premium Cotton Canvas / 100% Handmade / Museum Grade / Authenticity Certificate" trust-badge row from the bottom of the info column to directly below the product image, restyled larger and clearer.

## Current State

- `components/singleproduct/SingleProduct.tsx` renders 7 tabs for paintings (`About the Painting`, `Specifications`, `Care Instructions`, `Delivery`, `Packaging`, `Returns`, `Reviews` — `TAB_LABELS`, line 54) and 4 for photography (`PHOTOGRAPHY_TAB_LABELS`, line 74). All 7/4 tabs stay exactly as-is — this design does not remove or rename any tab.
- The "Specifications" tab (line 1386) and photography's "Details and Dimensions" tab (line 1594) both render `specificationRows`, a client-side `useMemo` (line 877) that maps a synthetic WooCommerce "Product Information" attribute into label/value table rows, one row per line of that attribute's text.
- That synthetic attribute is built server-side, in `app/shop/[slug]/page.tsx`, by merging multiple sources (a real WooCommerce "Product Information" attribute if present, plus a curated list of ACF meta fields — `PRODUCT_INFORMATION_META_KEYS`, lines 27-42) into one combined list, each meta field becoming a `"Label: value"` line (`toMetaLabel` + `getProductInformationFromWooV3Product`, lines 293-413).
- `PRODUCT_INFORMATION_META_KEYS` currently includes `"dimensions_&_materials"`, `"care_&_framing"`, `"shipping_&_returns"`, and `"about_the_painting"` alongside genuine short technical attributes (`size_in_centimetres`, `customizable`, `product_type`, `colors`, `material`, `width_inches`, `height_inches`, `orientation`, `certificate_provided`, `country_of_origin`). The first four are long free-text ACF fields intended to back the *other* tabs, but those other tabs (`About the Painting`, `Care Instructions`, `Delivery`, `Packaging`, `Returns`) actually render hardcoded static copy in `SingleProduct.tsx` and never read these ACF fields at all — so today these four fields only ever surface as extra, duplicated rows inside the Specifications table.
- Confirmed live via the WooCommerce v3 API: product id 573 ("Dagdusheth Ganapati Canvas Painting") has all four fields (`about_the_painting`, `dimensions_&_materials`, `care_&_framing`, `shipping_&_returns`) populated with the exact same 1,553-character paragraph, meaning its Specifications tab currently renders that same block of text four times over (labeled "About The Painting", "Dimensions & Materials", "Care & Framing", "Shipping & Returns"), on top of its genuine spec rows.
- The trust-badge row (`SingleProduct.tsx`, currently ~lines 2005-2026) sits at the very bottom of the right-hand info column, inside `{!isPhotography && (...)}` (so it never shows for photography products), after the frame selector and short description, just above the tabs section. It's a `grid-cols-2 gap-3 sm:grid-cols-4` layout with small icons (`h-4 w-4`) and 11px labels: Premium Cotton Canvas (`BadgeCheck`), 100% Handmade (`ShieldCheck`), Museum Grade (`Star`), Authenticity Certificate (`ShieldCheck`).
- The image column (left side of the `lg:grid-cols-[500px_minmax(0,1fr)]` layout, `SingleProduct.tsx` lines 1693-1757) contains the main image and a horizontal thumbnail strip, both inside a `mx-auto max-w-[500px] lg:mx-0` wrapper that closes at line 1756.

## Scope

### 1. Specifications table: remove duplicated content

In `app/shop/[slug]/page.tsx`, remove these four entries from `PRODUCT_INFORMATION_META_KEYS`:
- `"dimensions_&_materials"`
- `"care_&_framing"`
- `"shipping_&_returns"`
- `"about_the_painting"`

The remaining 10 entries are untouched, and no other part of the merge pipeline (`getProductInformationFromWooV3Product`, `getProductInformationFromWordPressProduct`, `isProductInformationMetaKey`, etc.) changes. This is shared code — the fix applies identically to the Specifications tab (paintings) and the Details and Dimensions tab (photography), which is a strict correctness improvement in both places, not scope creep.

No tabs are removed or renamed. `About the Painting`, `Care Instructions`, `Delivery`, `Packaging`, `Returns`, and `Reviews` all continue to render exactly as they do today, with their existing hardcoded/description-driven content.

### 2. Trust-badge row: relocate and restyle

In `components/singleproduct/SingleProduct.tsx`:
- Remove the existing badge grid from the bottom of the info column (still inside `{!isPhotography && (...)}` at that location — the wrapping fragment stays for whatever else remains there).
- Insert a new badge block into the left image column, as a sibling immediately after the thumbnail strip (after the `<div className="mt-4 flex gap-3 overflow-x-auto ...">...</div>` closes, still inside the `mx-auto max-w-[500px] lg:mx-0` wrapper so it's width-matched to the product image), gated by the same `!isPhotography` check (photography product pages keep showing nothing here, unchanged).
- Restyle as a single bordered card, one row of 4 items, per the approved preview:
  - Card: rounded border + light background, consistent with the page's existing card idiom (e.g. `rounded-[12px] border border-[#e4ded4] bg-white`, matching patterns already used elsewhere on this page such as the "About the Painting" tab's white article card).
  - Layout: `grid grid-cols-4` (one row, all four breakpoints — no responsive column collapse, since the column itself is already narrow/fixed-width) with thin vertical dividers between items (e.g. `divide-x divide-[#e4ded4]`).
  - Each item: icon centered above label, icon enlarged from `h-4 w-4` to `h-6 w-6`, label text enlarged from `text-[11px]` to `text-[12px] font-medium`, same icon components and colors as today (`BadgeCheck` `#3a6b96`, `ShieldCheck` `#4c8e58`, `Star` `#d4a43d`, `ShieldCheck` `#cf7f33`).
  - Padding inside each cell (e.g. `p-3`) so the row reads as a proper trust-badge panel rather than a cramped strip.

## Error Handling

- No new failure modes. The Specifications-table change is a pure data-filtering change (removing 4 keys from a static array) — the existing "Product information is currently unavailable" fallback (`specificationRows.length === 0`) continues to apply unchanged if a product genuinely has no spec data left after the trim.
- The badge-row relocation is a pure static-content move — no data fetching, no new conditional logic beyond the existing `!isPhotography` gate that already governs this block today.

## Testing

No test framework in this repo (established pattern). Verification is live, via the dev server and the real WooCommerce API:
- Confirm product id 573 (Dagdusheth Ganapati Canvas Painting, slug `dagdusheth-ganapati-canvas-painting`) no longer shows the "About The Painting" / "Dimensions & Materials" / "Care & Framing" / "Shipping & Returns" duplicated-paragraph rows in its Specifications tab, and that its genuine spec rows (size, material, orientation, etc.) still render.
- Confirm a product with only the genuine 10 meta keys populated (e.g. the earlier "Musical Ganesha Canvas Painting" test product) renders its Specifications tab unchanged.
- Confirm all 7 tabs (paintings) still exist, labeled and ordered exactly as before, and each still shows its own existing content (`About the Painting`, `Care Instructions`, `Delivery`, `Packaging`, `Returns`, `Reviews` untouched).
- Confirm the photography "Details and Dimensions" tab also no longer shows the four duplicated fields (shared fix), and its own dedicated tabs are otherwise untouched.
- Confirm the trust-badge row now renders directly below the thumbnail strip, width-matched to the image, styled as a single-row bordered card with larger icons/text, on a real painting product page.
- Confirm the trust-badge row does NOT render anywhere on a photography product page (unchanged behavior).
- Visual check at mobile, tablet, and desktop widths — badge labels must not overflow or wrap awkwardly inside the narrower fixed-width image column.
- `npx tsc --noEmit`, compared against the existing known-error baseline (`.next/types/app/api/[[...path]]/route.ts`, `app/warli-paintings/page.tsx`, `components/navbar.tsx`, `app/samora/shop/[slug]/page.tsx`).

## Global Constraints

- No new npm dependencies.
- No tabs are added, removed, or renamed — all 7 paintings tabs and all 4 photography tabs stay exactly as they are today, with their existing content untouched.
- Only the 4 named ACF meta keys are removed from the Specifications/Details-and-Dimensions data source; the other 10 genuine spec keys are untouched.
- The trust-badge row keeps its existing `!isPhotography` gating (paintings only) — no new product-type logic.
- The trust-badge row's icons, colors, and label text stay the same 4 items in the same order; only size, layout (single row of 4 with dividers), and placement change.
