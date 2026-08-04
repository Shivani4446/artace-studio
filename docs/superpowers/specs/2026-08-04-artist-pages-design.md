# Artist Section + Artist Pages Design

## Goal

Add a real "artist" concept to the site: a per-product artist section on every single product page, a dedicated profile page per artist, an artist listing page, and replace the homepage's fake "Shop by Artist" data with real entries — all backed by one new, simple data source inside this Next.js app (no WordPress dependency).

## Current State

- **No artist data model exists anywhere** — not in WooCommerce (Store API product shape has no artist field/taxonomy/meta key), not in ACF, not in any WordPress custom post type. It's a genuinely new concept end-to-end.
- `components/singleproduct/SingleProduct.tsx` already has dead scaffolding for this: an `artistName?: string` prop (line 236), defaulted to `"Artace Studio"` (line 715, the brand — never a real artist), rendered as a plain, non-clickable "By {artistName}" line (line 1526) right under the product title. `app/shop/[slug]/page.tsx` never passes this prop, so every product currently shows "By Artace Studio."
- The same file has an existing "Art Advisor" block (lines 2067-2100): a dark full-width section, two-column on desktop (headline + CTA button on the left, circular photo + name/role on the right) — `DEFAULT_ADVISOR` (lines 295-304) is Sahil Mahalley, a general consultation booking CTA (`https://cal.com/artace-studio`), unrelated to any specific painting's artist. This is the closest existing visual pattern for a "person profile" block and will be mirrored for the new artist section.
- `components/homepage/ShopByArtist.tsx` renders 4 fully fake, hardcoded artists (invented names/photos/styles) linking to `/artists` — a route that does not exist today (dead link).
- `app/team/page.tsx` is misleadingly titled "Our Artists" in its metadata but its content is the company's own founders/staff — unrelated to painting artists, and out of scope for this work (not touched).
- `app/shop/[slug]/page.tsx` is the closest routing convention to follow for the new artist pages: a server component, `generateMetadata()`, `notFound()` on a missing slug, `buildSiteUrl` from `lib/site.ts` for canonical URLs.
- `components/collections/CollectionLandingPage.tsx` has a local (not exported/shared) `FeaturedProductCard` component (lines 629-689) showing a product's image, name, subtitle, price (via `useCurrency()`'s `selectedCurrency`/`exchangeRates` and a `formatConvertedPrice` helper) and an `AddToCartButton`. The new artist page's "shop this artist" grid will follow this same visual pattern (image, name, price, add-to-cart) rather than reusing this exact internal component, since it isn't exported for reuse and pulling it out is a cross-cutting refactor beyond this feature's scope.

## Scope

### 1. Artist data model

New file `lib/artists/data.ts`:
- `type Artist = { slug: string; name: string; image: string; tagline: string; bio: string; productSlugs: string[] }` — `tagline` is a short one-line blurb for the product-page section; `bio` is the longer text for the artist's own page; `productSlugs` lists which WooCommerce product slugs belong to this artist.
- `ARTISTS: Artist[]` — starts with 1-2 placeholder entries (clearly fake/example data, e.g. "Placeholder Artist") so the whole feature can be built and verified end-to-end; the user replaces these with real artists afterward by editing this one file — no code changes needed to add more artists later.
- `getArtistForProduct(productSlug: string): Artist | undefined` — looks up which artist (if any) claims a given product slug, by scanning `productSlugs`. Products with no matching artist simply don't render the artist section — this is a hard requirement, not an edge case to skip, since most products won't have a real artist assigned until the user populates real data.
- `getArtistBySlug(artistSlug: string): Artist | undefined` — for the `/artists/[slug]` page.

### 2. Product page changes (`SingleProduct.tsx`)

- The existing "By {artistName}" line (line 1526) becomes conditional: if `getArtistForProduct(product.slug)` returns an artist, render their real name as a `<Link>` to `/artists/{slug}`; if not, the line doesn't render at all (no more permanent "By Artace Studio" placeholder).
- A new artist section, visually mirroring the existing Art Advisor block's layout (dark background, two-column, circular photo) but with the artist's own photo/name/tagline and a "View Artist Profile" button linking to `/artists/{slug}`. Rendered only when the product has an assigned artist — otherwise this whole section is omitted, same rule as the byline.

### 3. Artist profile page — `/artists/[slug]`

Follows `/shop/[slug]`'s server-component conventions: `generateMetadata()` (title/description/canonical via `buildSiteUrl`), `notFound()` for an unknown slug. Renders: artist photo, full bio, and a grid of their available paintings — looked up by cross-referencing `productSlugs` against real WooCommerce product data (fetched the same way `/shop/[slug]` already fetches product data), using the existing card-visual conventions (image, name, price via the site's currency-conversion pattern, add-to-cart) rather than a shared component that doesn't currently exist.

### 4. Artist listing page — `/artists`

A grid of artist cards (photo, name, tagline) from `ARTISTS`, each linking to `/artists/{slug}`. This is what finally gives the homepage's "Shop by Artist" section, and the new per-product artist links, somewhere real to land.

### 5. Homepage cleanup (`components/homepage/ShopByArtist.tsx`)

The 4 fake, hardcoded artist entries are replaced with real entries pulled from `ARTISTS` (the same data source as everywhere else), so there's exactly one source of truth for artist data across the whole site — no separate homepage-only fake dataset.

## Error Handling

- A product with no matching artist: both the byline and the dedicated section simply don't render. No placeholder text, no broken link.
- An artist with zero available products (all sold out / none currently matched): the profile page still renders their photo/bio; the "shop their work" grid area shows a simple empty state rather than breaking.
- A `productSlugs` entry that doesn't correspond to a real, currently-fetchable WooCommerce product (e.g. a typo, or a product that was later deleted/unpublished) is silently skipped from that artist's grid — not a hard error, since this is manually-maintained data and typos are expected to happen.
- `/artists/[slug]` for an unknown slug: standard Next.js `notFound()` → 404 page, same as `/shop/[slug]` already does.

## Testing

No test framework exists in this repo (established pattern). Verification is live, via the dev server:
- A product with an assigned artist (via the placeholder data) shows the real byline and the dedicated artist section; a product without one shows neither.
- `/artists/{slug}` renders correctly for a real placeholder slug and returns a 404 for a nonexistent one.
- `/artists` lists the placeholder artist(s) and links correctly.
- The homepage's "Shop by Artist" section shows the same placeholder artist(s), not the old fake data.
- `npx tsc --noEmit`, compared against the existing known-error baseline.

## Global Constraints

- No new npm dependencies.
- No WordPress-side changes of any kind — this feature is entirely self-contained in the Next.js app, deliberately avoiding the WordPress plugin-execution issue that's still unresolved on the hosting side.
- `app/team/page.tsx` (company staff, mistitled "Our Artists") is explicitly out of scope — not touched by this work.
- The artist section (byline + dedicated block) must not render at all for a product with no assigned artist — never a placeholder/fallback artist.
- `ARTISTS` in `lib/artists/data.ts` is the single source of truth for artist data everywhere it appears (product pages, `/artists`, `/artists/[slug]`, and the homepage's "Shop by Artist" section) — no duplicate/separate datasets.
