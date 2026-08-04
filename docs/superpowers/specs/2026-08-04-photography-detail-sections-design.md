# Photography Product Detail Sections — Design

## Context

Artace Studio's Photography category (added earlier this engagement) needs
three additional content sections on the product page — Story Behind the
Capture, Photography Technique, and Interior Styling Recommendations — that
only appear for Photography products. The user has already added these as
three ACF fields on the WooCommerce product edit screen:
`story_behind_the_capture`, `photography_technique`,
`interior_styling_recommendations`.

Two things were verified live before designing this:

1. **The public Store API (`wc/store/v1/products`) has no `meta_data` field
   in its schema at all** — confirmed by inspecting a real product response
   (its full key list has no `meta_data`). Custom fields, ACF or otherwise,
   are invisible to every part of this site that reads from the Store API.
2. **The authenticated WooCommerce Admin API (`wc/v3/products/{id}`)
   already returns these exact ACF field values** in its `meta_data` array
   — confirmed by creating a temporary test product with these three keys
   set directly and reading them back unchanged. ACF's own REST API
   (`acf/v3/...`) is not registered on this WordPress install (checked via
   the site's `/wp-json/` namespace list), but that doesn't matter: these
   are plain WordPress postmeta under the hood, and WooCommerce's own API
   already exposes them.
3. `app/shop/[slug]/page.tsx` already has exactly this pattern in
   production for a different field — `fetchProductArtistName` (lines
   482-505) fetches the full `wc/v3/products/{id}` response with Basic
   Auth and plucks one `meta_data` entry (`key === "artist"`) by name. This
   design reuses that pattern verbatim for three keys instead of one.

## Decisions

1. **New fetch function, same pattern as `fetchProductArtistName`.**
   `fetchPhotographyDetails(productId)` in `app/shop/[slug]/page.tsx`: one
   authenticated `wc/v3/products/{id}` fetch, reads `story_behind_the_capture`,
   `photography_technique`, `interior_styling_recommendations` from
   `meta_data`, returns `{storyBehindTheCapture, photographyTechnique,
   interiorStylingRecommendations}` with each a `string | undefined`
   (trimmed; empty string treated as absent, mirroring
   `fetchProductArtistName`'s `value || undefined`).
2. **Called in the page's existing `Promise.all`**, passed to
   `<SingleProduct>` as a new `photographyDetails` prop — same wiring as
   `artistName` today.
3. **Gated to Photography category, reusing the exact same check** already
   used for the badges/Make an Offer button:
   `product.categories.some((category) => category.slug === "photography")`.
4. **Placement: a new standalone section, not a tab.** The existing tab
   bar already has 7 tabs (About the Painting, Specifications, Care
   Instructions, Delivery, Packaging, Returns, Reviews); adding 3 more
   would crowd it and undersell content the user specifically wants to
   stand out. Renders as its own section immediately after the tabbed
   content area, only for Photography products.
5. **Each of the 3 blocks renders independently** — since the fields are
   optional, a product with only `photography_technique` filled in shows
   only that one block, not three with two empty placeholders. If none of
   the three have content, the whole section doesn't render.
6. **Visual style**: three stacked blocks, each with a small Lucide icon,
   an uppercase eyebrow label, a `font-display` heading (the section
   title), and the field's text as body copy with `whitespace-pre-line` to
   preserve the line breaks the user typed in the ACF textarea. Palette
   matches what's already established for Photography on this page (the
   `#EFE7DA` / `#5b4f3f` badge colors from the earlier badges work),
   generous vertical spacing, a subtle top border separating it from the
   tabs above. Icons: `BookOpen` (Story Behind the Capture — already
   imported? no, new import), `Aperture` (Photography Technique), `Sofa`
   (Interior Styling Recommendations) — all from `lucide-react`, already
   this project's icon library throughout.
7. **Text rendering is plain text, not HTML.** The ACF fields were set up
   as text fields (per the user); rendering as plain text with
   `whitespace-pre-line` is the safe default. If the user later changes
   these to a rich-text ACF field type, this would need revisiting to
   render HTML instead — out of scope for now since that's not what exists
   today.

## Data flow

1. `app/shop/[slug]/page.tsx`'s `SingleProductPage` calls
   `fetchPhotographyDetails(product.id)` alongside its existing
   `Promise.all` (`getProductWithProductInformation`,
   `getRelatedProductsForProduct`, `getLatestBlogs`,
   `fetchProductArtistName`).
2. Result passed to `<SingleProduct photographyDetails={photographyDetails} ... />`.
3. `SingleProduct.tsx`'s `SingleProductProps` gains
   `photographyDetails?: {storyBehindTheCapture?: string; photographyTechnique?: string; interiorStylingRecommendations?: string}`.
4. Inside the component, a new section renders after the existing tab
   content block, gated by the same photography-category check already
   used for badges/Make an Offer, and by each field being non-empty
   individually.

## Out of scope

- No changes to the existing 7-tab system.
- No admin-side changes — the ACF fields already exist; this is read-only
  on the frontend.
- No rich-text/HTML rendering (see Decision 7).
- No changes to non-Photography product pages.

## Standing project constraints (carried forward)

- No `git commit`/`git push` — the user reviews and commits/pushes
  everything themselves.
- No test framework — verification via `npx tsc --noEmit`, `npm run
  build`, and live dev-server checks (a fresh port, never 3000).
