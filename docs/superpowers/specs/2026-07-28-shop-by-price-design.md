# Shop by Price Homepage Section — Design

## Context

The homepage (`app/(home)/page.tsx`) already has two "browse by X" sections
back to back: `<ShopByRoom />` (4 photo tiles linking to `/rooms/{slug}`) and
`<DiscoverEssentials />` (a live-fetched category grid linking to
`/collections/{slug}`). The user wants a third axis: browse by price range,
5 tiers from lowest to highest, each linking to the filtered product list.

The shop page (`components/shop/ShopCatalog.tsx`) already has a fully
functional price-range slider — `priceMin`/`priceMax` state (lines 344-345),
initialized from the actual min/max prices across loaded products
(`minAvailablePrice`/`maxAvailablePrice`, lines 334-342), filtering
`filteredProducts` (lines 356-411) by `product.price >= priceMin &&
product.price <= priceMax`. It is not currently readable from the URL — only
`category` is (via `categoryFromQuery`, lines 259-277, feeding
`selectedCategories`'s lazy `useState` initializer, lines 279-281). No new
filtering system is needed, only extending this existing one the same way
`category` already works.

Real catalog data pulled from the live Store API (104 products) informs the
tier boundaries: min ₹450, p10 ₹4,500, median ₹8,719, p75 ₹13,300, p90
₹18,600, max ₹35,500.

## Decisions

1. **Placement:** `app/(home)/page.tsx` — new `<ShopByPrice />` between
   `<ShopByRoom />` (line 157) and `<DiscoverEssentials />` (line 158). Both
   neighbors are also "browse by X" sections; grouping keeps the page's
   discovery sections together rather than scattering them.
2. **Five tiers**, clean round numbers rather than exact percentile cutoffs
   (a shopper thinks in round numbers, not "₹4,719"):

   | # | Range | Query params | Label |
   |---|---|---|---|
   | 1 | Under ₹5,000 | `?maxPrice=5000` | Starter Pieces |
   | 2 | ₹5,000 – ₹10,000 | `?minPrice=5000&maxPrice=10000` | Most Loved |
   | 3 | ₹10,000 – ₹15,000 | `?minPrice=10000&maxPrice=15000` | Statement Art |
   | 4 | ₹15,000 – ₹25,000 | `?minPrice=15000&maxPrice=25000` | Premium Pieces |
   | 5 | Above ₹25,000 | `?minPrice=25000` | Masterworks |

   Tier 1 omits `minPrice` (no floor below zero); tier 5 omits `maxPrice`
   (no ceiling — future higher-priced pieces are automatically included).
3. **Destination: `/shop`, not a new page.** Each tile is a plain
   `<Link href="/shop?...">`. `ShopCatalog.tsx` gains a `priceFromQuery`
   `useMemo` (mirroring `categoryFromQuery`'s existing shape) that reads
   `minPrice`/`maxPrice` from `useSearchParams()`, parses them as numbers,
   and — only when present and finite — uses them instead of
   `minAvailablePrice`/`maxAvailablePrice` as the lazy initial value for the
   `priceMin`/`priceMax` `useState` calls. When absent (a normal, un-tiled
   visit to `/shop`), behavior is completely unchanged. The existing slider
   UI, its drag handles, and `hasPriceFilter`'s "clear filter" affordance
   all keep working exactly as they do today — this only changes what the
   slider's start position is.
4. **Visual design: solid-color cards, not photo tiles.** `ShopByRoom` and
   `DiscoverEssentials` are both photo-driven; a price tier has no natural
   photo. Using solid cards instead is a deliberate visual break that also
   reads as more "utility/filter" in tone, appropriate for a numeric
   browsing axis. Background deepens tier-over-tier through the site's
   existing palette — tier 1 `#FAF7F2` (the site's cream), tier 2-3 shades
   moving toward `#D4AF37` (the gold already used for the Ganesh Chaturthi
   promo elements), tier 4-5 toward `#1f1f1f` (the site's near-black) — so
   the ascending order reads visually, not just from the printed numbers.
   Each card: eyebrow-style label (e.g. "MOST LOVED"), the price range as
   the large headline, an arrow icon, same `hover:scale-105` /
   `transition-transform duration-700` language already used on
   `ShopByRoom`'s and `DiscoverEssentials`'s tiles. Layout: `grid-cols-2` on
   mobile (last tile spans both columns), `sm:grid-cols-3`,
   `lg:grid-cols-5` (all five in one row on desktop, matching the
   1440px-max-width container's spare width at that breakpoint).
5. **Copy:**
   - Eyebrow: "Shop by Budget"
   - Heading: "Find Art That Fits Your Vision — and Your Budget"
   - Intro line: "Every price point at Artace Studio is 100% hand-painted —
     never printed, never mass-produced. Pick a range and start browsing."

## Data flow

1. `components/homepage/ShopByPrice.tsx` (new) — a static, no-fetch Server
   Component (the 5 tiers are hardcoded copy/ranges, not data from
   WooCommerce, unlike `DiscoverEssentials`). Renders the header + 5
   `<Link>` cards.
2. `app/(home)/page.tsx` — import and render `<ShopByPrice />` between the
   two existing sections named in Decision 1.
3. `components/shop/ShopCatalog.tsx` — add `priceFromQuery` (mirrors
   `categoryFromQuery`'s pattern) and use it in the `priceMin`/`priceMax`
   `useState` initializers. No other part of the file changes — filtering
   logic, the slider UI, and `hasPriceFilter` are all downstream of these
   two state values and need no changes themselves.

## Out of scope

- No changes to `ShopByRoom` or `DiscoverEssentials` themselves.
- No new page or new filtering mechanism — reuses `/shop` and its existing
  slider verbatim.
- No server-side price filtering (WooCommerce query params) — the shop
  page's filtering is, and remains, client-side over already-loaded
  products, matching how `category` already works there today.
- No currency conversion awareness in the tier boundaries — ranges are
  defined in INR (the site's base currency), matching how the shop page's
  own slider already displays prices (`currency.formatPrice`), independent
  of this feature.

## Standing project constraints (carried forward)

- No `git commit`/`git push` — the user reviews and commits/pushes
  everything themselves.
- No test framework — verification via `npx tsc --noEmit`, `npm run build`,
  and live dev-server checks (a fresh port, never 3000).
