# Painting Categories Archive Page — Design

## Context

Artace Studio's site has no single page listing every painting category —
customers only see a hand-picked subset of 5 categories in the navbar's
"Painting Collections" dropdown and the footer's "Collections" section
(`utils/collections.ts`'s hardcoded `COLLECTION_LINK_ITEMS`). The footer also
has a "Painting Categories" link (`components/footer.tsx:61`) that currently
points at `/shop` — a placeholder, not a real categories page.

Individual category landing pages already exist at `/collections/{slug}`
(`app/collections/[slug]/page.tsx`, edge runtime, `revalidate = 60`,
fetching `GET /wp-json/wc/store/v1/products/categories?hide_empty=true&per_page=100`
via the `WooStoreCategory` type: `{id, name, slug, count, image?}`). There is
no index page listing them.

The live catalog has 19 categories today, of very uneven quality:

```
all-products                          | All Canvas Paintings              | 103 | image
religious-paintings                   | Religious Collection               |  62 | image
buddha-paintings                      | Buddha Collection                  |  24 | image
ganapati-paintings                    | Ganapati Collection                 |  20 | image
vastu-paintings                       | Vastu Paintings                     |  18 | image
abstract-paintings                    | Abstract Collection                 |  15 | image
radha-krishna-paintings               | Radha Krishna Collection            |  13 | image
art-prints                            | Art Prints                          |  13 | image
landscapes-cityscapes-paintings       | Landscapes & Cityscapes Collection  |  12 | image
corporate-paintings                   | corporate paintings                 |  12 | no image
table-top-paintings                   | Table Top Paintings                 |  10 | image
abstract-wall-art                     | Abstract Wall Art                   |  10 | image
modern-wall-art                       | Modern Wall Art                     |   3 | no image
figurative-paintings                  | Figurative Collection                |   2 | image
abstract-paintings-abstract-wall-art  | Abstract Paintings                   |   1 | no image
nature-paintings                      | Nature Paintings                     |   1 | no image
mahadev-nandi-canvas-painting         | Mahadev Nandi canvas painting        |   1 | no image
abstract-deer-paintings-living-room   | Abstract Deer Paintings for Living Room | 1 | image
marine-art                            | Marine Art                           |   1 | no image
```

Several are one-off categories auto-created from tagging a single product
(no meaningful "collection" identity), and one (`all-products`) is the
store's catch-all, not a distinct style. The homepage's existing
`DiscoverEssentials` section (`app/(home)/page.tsx`'s `getDiscoverCategories`)
already fetches this same endpoint for its 7-tile teaser grid, filtering out
the catch-all by name and falling back to a generic image for categories
without one — that pattern is *not* strict enough for a dedicated archive
page, which should only show real, browsable categories.

## Decisions

1. **New page at `/collections`** (`app/collections/page.tsx`, sibling to
   the existing `app/collections/[slug]/page.tsx`). This is currently
   unclaimed — only the dynamic slug route exists — so it becomes the
   natural index of the categories that live one level below it.
2. **Live data, not a hardcoded list.** Fetches
   `GET /wp-json/wc/store/v1/products/categories?hide_empty=true&per_page=100`
   at request time (same endpoint the sibling `[slug]` page and the
   homepage's Discover section already use), so newly added WooCommerce
   categories appear automatically with no code change.
3. **Filtering, applied on top of `hide_empty=true`:**
   - Must have a real `image.src` — no fallback-image categories shown.
   - Must have `count >= 2` — excludes one-off/auto-created categories.
   - Excluded by name (case-insensitive, trimmed): `"all canvas paintings"`
     (the catch-all, matching the same exclusion `DiscoverEssentials`
     already applies) and `"corporate paintings"` (already has its own
     dedicated `/corporate-bulk-orders` page — showing it here would
     duplicate that with no product-category browsing value).
   - Result against today's catalog: 11 categories — Religious, Buddha,
     Ganapati, Vastu, Abstract, Radha Krishna, Art Prints, Landscapes &
     Cityscapes, Table Top, Abstract Wall Art, Figurative.
   - Sorted by `count` descending (most-stocked categories first), matching
     `DiscoverEssentials`'s existing sort.
4. **Runtime: `edge` + `revalidate = 60`**, matching the sibling
   `/collections/[slug]/page.tsx` exactly, *not* the app-root static
   pattern. This project had a production incident earlier when the
   **root** `/` page was given `runtime = 'edge'` — a `@cloudflare/next-on-pages`
   bug where a route becoming dynamic at the app root collided with
   `favicon.ico`/`robots.ts`/`sitemap.ts`, which live in that same root
   directory. `/collections/page.tsx` is nested one level deeper, in the
   same directory as the already-live, already-edge `[slug]` sibling — not
   sharing a directory with any special convention file — so it isn't in
   the same risk category. Using the same runtime as its sibling (rather
   than mixing static and dynamic within one route segment) is the more
   conservative, consistent choice.
5. **Layout: a plain uniform grid**, not `DiscoverEssentials`'s
   featured-tile-plus-custom-order-CTA layout (that layout is a fixed
   7-slot homepage teaser; this page shows a variable-length full list).
   Each card: category image with a bottom gradient, category name, and
   product count, linking to `/collections/{slug}`. Simple page header
   above the grid: eyebrow, `<h1>`, one-line intro.
6. **SEO:** static `export const metadata` (title/description/canonical,
   matching every other simple page in this project) plus an `ItemList`
   JSON-LD block, matching the exact shape already used on the NZ/UK/Ireland
   pages (`app/original-abstract-art-for-sale-nz/page.tsx:261-272`):
   `{"@type": "ItemList", "@id": "{pageUrl}#itemlist", url, numberOfItems,
   itemListElement: [{"@type": "ListItem", position, url, name, image}]}`,
   listing every category shown (not capped at 6 like the NZ page's product
   list, since this page's whole purpose is being a complete index).
7. **Footer change:** `components/footer.tsx:61` — `"Painting Categories"`
   href changes from `/shop` to `/collections`. No other nav/footer entries
   change; the existing hardcoded "Collections" footer section and navbar
   dropdown (5 curated links) are untouched — this new page is a superset,
   reached via its own link, not a replacement for the curated shortcuts.

## Data flow

1. `app/collections/page.tsx` (Server Component, edge runtime) fetches the
   categories endpoint directly (own local `fetchCategories` helper,
   `WooStoreCategory` type — same shape as the `[slug]` page's, duplicated
   locally rather than shared, matching this codebase's existing convention
   of each route owning its own WooCommerce types rather than importing
   them across routes).
2. Filters per Decision 3, sorts by count descending, maps to a
   `CategoryCard` shape: `{id, name, slug, count, image, imageAlt, href}`.
3. Renders the page header, the `ItemList` JSON-LD `<script>` tag, and a
   grid of `<Link>` cards (plain server-rendered markup — no client
   interactivity needed, unlike the FAQ accordion work).
4. If the fetch fails or returns zero qualifying categories, the page
   still renders its header copy with an empty-state message below (no
   silent blank page) — matching the defensive-empty-state pattern already
   used on `/warli-paintings` for its product grid.

## Out of scope

- No changes to the navbar's "Painting Collections" dropdown or the
  footer's curated "Collections" section — both keep their existing 5
  hand-picked links.
- No changes to `/collections/[slug]/page.tsx` itself.
- No pagination — 11 categories today comfortably fits one grid; if the
  catalog grows substantially, pagination can be a later, separate change.
- No product thumbnails/previews beyond the category's own cover image.

## Standing project constraints (carried forward)

- No `git commit`/`git push` at any point — the user reviews and
  commits/pushes everything themselves.
- No test framework — verification via `npx tsc --noEmit`, `npm run build`,
  and live dev-server checks (a fresh port, never 3000).
- No staging/preview deploys exist for this project — production-affecting
  runtime choices (Decision 4) are made conservatively and explained, not
  guessed.
