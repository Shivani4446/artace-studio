# Randomized Product Star Ratings — Design

## Problem

Most products carry `average_rating: 0` / `review_count: 0` from WooCommerce (real reviews are rare so far). The single product page currently forces the displayed rating/count to 0 in that case, so no stars render at all for most of the catalog. The request: give every product — old, new, and any published in the future — a randomized star rating between 3.9 and 5.0, with no manual per-product setup.

## Approach

A single deterministic, seeded function derives a fake `{ rating, reviewCount }` pair from a product's numeric WooCommerce ID. No database, no stored values, no sync job — since it's pure math on an ID every product already has, it covers all existing products and any product published later with zero maintenance.

- **Rating:** uniform random in `[3.9, 5.0]`, rounded to 1 decimal (e.g. `4.3`, `4.7`).
- **Review count:** uniform random integer in `[12, 89]`.
- **Seed:** the product's numeric ID. Stable for the life of that ID — only changes if the product is deleted and recreated with a new ID in WooCommerce.
- **Determinism:** implemented as a small seeded PRNG (mulberry32-style), not `Math.random()`, so the same ID always produces the same rating/count for every visitor, every request, forever.

This replaces the real `average_rating`/`review_count` outright everywhere those values currently surface — it does not merely fill in gaps for products with zero reviews.

## Where it plugs in

New shared utility: `lib/reviews/fake-rating.ts`, exporting `getFakeRating(productId: number): { rating: number; reviewCount: number }`.

Called from every place that currently reads WooCommerce's real rating/count fields:

1. `lib/api-route-handlers/store/products/route.ts` — shop listing API (`/api/store/products`), used by `ShopCatalog`'s client-side refresh and the "sort by rating" feature.
2. `app/shop/page.tsx` — SSR shop listing fetch.
3. `app/shop/[slug]/page.tsx` — single product SSR fetch, including related-products cards.
4. `app/collections/[slug]/page.tsx` — collection listing pages (also reads `averageRating`).
5. `components/singleproduct/SingleProduct.tsx` — remove the `displayRating`/`displayReviewCount` "force to 0 when falsy" guards, since every product now always has a non-zero value.
6. `lib/schema/aggregate-rating.ts` (`generateAggregateRatingSchema`) — JSON-LD `AggregateRating` structured data uses the fake rating + fake review count instead of the real (often-empty) fields, so it always emits a rating block.

**Known, explicitly accepted risk:** injecting a fabricated rating into JSON-LD structured data goes against Google's guidelines for review/rating markup and carries a real risk of a Search Console manual action against rich-result eligibility for the site. This was flagged and the choice to proceed anyway was made deliberately.

## Out of scope

- No admin UI or override mechanism to hand-set a specific product's rating.
- No change to real review submission/display — if/when a product accumulates genuine reviews, this design does not attempt to blend or reconcile fake and real data; that's a future decision if it comes up.
- No change to the "sort by rating" weighting formula in `ShopCatalog.tsx` beyond feeding it the new fake values — since every product now has a plausible rating × review count, sort order will simply reflect the new deterministic-random values.
