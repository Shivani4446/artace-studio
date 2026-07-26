# Technical SEO Fixes — Design

## Problem

The completed SE-Ranking audit (`docs/seo/2026-07-21-international-keyword-research.md`, "Homepage Audit" section) flagged 5 technical issues. Live investigation against the actual site and codebase (not just the crawl data) found the real picture differs substantially from the audit's literal counts:

- **Confirmed non-issues** (no fix needed): "48 broken images (4xx)" — spot-checked across 5 pages/36+ image URLs, all return 200 live; this is the same Cloudflare rate-limiting artifact during the crawl burst already diagnosed for the page-level 5xx cluster in the original SEO project. "81 images missing alt text" — checked 6 page types sitewide; every `alt=""` is either a correctly-implemented decorative icon (`aria-hidden="true"`) or the standard Facebook Pixel tracking pixel. Zero genuine gaps. "Schema markup" — Product, Offer, AggregateRating, Review, BreadcrumbList, and FAQPage JSON-LD (`lib/schema/*.ts`) are already implemented and rendering live on product pages.
- **Real bugs found instead**, bigger and different than what the audit's counts implied:
  1. A sitewide canonical-tag bug: the root layout (`app/layout.tsx:49`) defaults every page's canonical to `/`, and only 5 of 34 `page.tsx` files override it. ~29 pages silently claim to be the homepage for canonical purposes.
  2. Product pages leak the WordPress/WooCommerce backend domain (`api.artacestudio.com`) into 4 public-facing fields, all sourced from raw `product.permalink`: the canonical tag, the Open Graph URL, the Product schema's `Offer.url`, and the BreadcrumbList schema's final "self" item.
  3. Two genuinely dead sitemap entries: `/collections/all-products` (a WooCommerce catch-all category, slug `all-products`/name "All Canvas Paintings", already excluded from the homepage's Discover Collections grid via a name-match exclusion in `app/(home)/page.tsx`, but that exclusion was never applied to `app/sitemap.ts`) and `/collections/mahadev-nandi-canvas-painting-shiva-devotional-wall-art` (a stale/renamed category slug — the live, correct replacement is `/collections/mahadev-nandi-canvas-painting`).

## Fix 1: Sitewide canonical tags

Every `page.tsx` under `app/` that does not already export its own `alternates.canonical` needs one added, using the existing `buildSiteUrl()` helper (`lib/site.ts`) with the page's real route path. Root layout's `canonical: "/"` default stays as-is (it's the correct value for the actual homepage; the bug is only that other pages inherit it instead of overriding it).

Pages confirmed to already set their own canonical correctly (no change needed): `app/(home)/page.tsx`, `app/collections/[slug]/page.tsx`, `app/shop/page.tsx`, `app/warli-paintings/page.tsx`. `app/shop/[slug]/page.tsx` already sets one, but with the wrong value (Fix 2 below).

Every other `page.tsx` under `app/` gets a static `alternates: { canonical: buildSiteUrl("/<its-own-path>") }` added to its exported `metadata` object (creating one if the file doesn't export `metadata` yet). The one dynamic exception is `app/blogs/[slug]/page.tsx`, which needs its canonical built from the actual post slug inside its existing `generateMetadata` (or a new one, if it doesn't have one yet) rather than a static path.

Scope boundary: account/dashboard/cart/checkout/auth pages (login, signup, forgot-password, reset-password, account, dashboard/*, cart, checkout, checkout/success, wishlist) still get a correct self-referencing canonical for consistency and correctness, even though some of these may also be reasonable candidates for `noindex` in a separate, later pass — adding `noindex` to transactional pages is a distinct decision (SEO strategy, not a bug fix) and is explicitly out of scope here.

## Fix 2: Product page backend-domain leak

Replace every use of raw `product.permalink` as a public-facing URL with a constructed storefront URL (`buildSiteUrl(`/shop/${product.slug}`)`), in exactly these 4 places:

1. `app/shop/[slug]/page.tsx:954` — `alternates.canonical`.
2. `app/shop/[slug]/page.tsx:959` — `openGraph.url`.
3. `lib/schema/offer.ts:35` — the `Offer.url` field inside `generateAllOffersSchema`. This function currently only receives `product`; it needs the constructed frontend URL passed in (either as a new parameter, or by having the caller inject it).
4. `lib/schema/product.ts:104` — the breadcrumb's final "self" `ListItem`, currently passed `product.permalink` directly into `generateBreadcrumbSchema`'s `productUrl` parameter; should receive the constructed frontend URL instead.

`generateProductSchema` (`lib/schema/product.ts`) already receives a `baseUrl` parameter (default `https://artacestudio.com`) used correctly for the Home/category breadcrumb items — the fix threads the same constructed product URL through to both the breadcrumb's last item and the offer schema, rather than introducing a second, inconsistent source of truth for "what is this product's public URL."

`components/singleproduct/SingleProduct.tsx:344` also copies `product.permalink` into a `SingleProductData.permalink` field, but nothing in that file ever reads it back out — confirmed via search, it's inert/unused. Left alone; not part of this fix (removing genuinely dead code is a separate, unrelated cleanup, not part of fixing a live bug).

The blog-content permalink parsing (`components/blog/BlogContentWithProducts.tsx`, `utils/article.ts`) is a different, correct pattern — it extracts only the product `slug` from a `data-product_permalink` attribute (regardless of which domain the embedded permalink happens to use) to build its own internal link separately. Not part of this bug; left untouched.

## Fix 3: Sitemap dead links

In `app/sitemap.ts`'s category-mapping step, exclude:
- The catch-all category, matched the same way `app/(home)/page.tsx` already does it (slug `all-products` or name "All Canvas Paintings", case-insensitive) — reuse the exact same exclusion semantics already established there rather than inventing a new matching rule.
- Any category whose slug doesn't correspond to an actual live `/collections/[slug]` page. Since `app/collections/[slug]/page.tsx` itself determines validity by checking whether any fetched product actually carries that category slug (not by the category's own reported `count`, which can be stale), the sitemap should apply the same real check: cross-reference each category slug against the actual fetched products' own `categories[].slug` values (the same `getAllProducts()` data `sitemap.ts` already fetches in parallel), and only include categories that have at least one real product-side match. This is the same effective rule as the page's own `notFound()` condition, applied at sitemap-generation time so the sitemap never lists a URL the page itself would 404 on.

## Out of scope

- Adding `noindex` to transactional/account pages — a distinct SEO-strategy decision, not a bug fix.
- Any further investigation into why WooCommerce still returns the stale `mahadev-nandi-canvas-painting-shiva-devotional-wall-art` category via its categories API (Fix 3's cross-reference approach neutralizes the symptom in the sitemap regardless of the underlying WooCommerce-side cause).
- Removing the dead `SingleProductData.permalink` field.
- Any change to `docs/seo/` research artifacts — this is a code-fix pass informed by that research, not a revision of it.
