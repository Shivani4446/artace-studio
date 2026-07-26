# Room-Specific Landing Pages — Design

## Context

The homepage "Shop by Room" section (`components/homepage/ShopByRoom.tsx`) shows four
room tiles — Living Room, Pooja Room, Bedroom, Dining Room — all currently linking to
the generic `/shop` page. This is one of two items deferred from the India content hub
work (the other, Shankar Maharaj / Vitthal Rakhumai product SEO, is complete).

No WooCommerce category groups products by room — categories are organized by subject
(Radha Krishna, Ganapati, Buddha, Abstract, Vastu, Landscapes, etc.). WooCommerce product
tags were checked as a possible existing signal: ~100 tags exist, but almost all are
ad-hoc, one-off SEO keyword tags used on a single product each (e.g. "Bedroom Wall Art"
tags exactly 1 product). Not usable as a live-updating room taxonomy.

A separate consideration: `/collections/vastu-paintings` already exists (built in the
India content hub phase) and covers pooja-room + Vastu-conscious art broadly. A new
Pooja Room room-page must not duplicate that content.

## Decisions

1. **Scope**: build all 4 rooms (Bedroom, Living Room, Dining Room, Pooja Room) as
   separate pages in this project, not just the originally-deferred Bedroom/Living Room.
2. **Pooja Room angle**: gets its own distinct content — a pooja-room buying guide
   (deity selection, altar-wall sizing, placement), not a rehash of the Vastu page's
   broader "Vastu-compliant art across the home" framing. Both pages stay live and
   distinct, no redirect/alias.
3. **Room → product mapping**: manual curation. No live category or tag data is
   reliable enough to drive this automatically. I hand-pick ~8–12 product slugs per
   room by browsing the live catalog for pieces that suit each space (subject, palette,
   scale), spanning multiple existing subject categories per room rather than one
   category each. This needs occasional manual refresh as the catalog changes — same
   tradeoff already accepted for the Vastu/Ganesha collection copy.
4. **Page pattern**: standalone content pages modeled on `app/warli-paintings/page.tsx`
   — each room gets its own independent `page.tsx` (own hero, own copy, own
   `generateMetadata`), not a shared generic room-page component. This keeps each page
   free to have a distinct visual/editorial identity per room, consistent with how
   Warli's page isn't componentized against the Vastu/Ganesha `CollectionLandingPage`
   pattern either.
5. **Shared code**: one small fetch helper only — `fetchProductsBySlugs(slugs)` — to
   avoid re-writing WooCommerce Store API fetch/error-handling logic four times. This is
   plumbing, not shared visual/content structure, so it doesn't conflict with decision 4.
6. **Hero images**: reuse the existing room photos already shot for the homepage tiles
   (`public/images/{bedroom,living-room,dining-room,pooja-room}.jpeg`, ~1400px wide) as
   `object-cover` hero backdrops. No new photography needed.

## Routing

- `/rooms/bedroom`
- `/rooms/living-room`
- `/rooms/dining-room`
- `/rooms/pooja-room`

## Data flow

Each page defines its own `const ROOM_PRODUCT_SLUGS = [...]` (8–12 slugs, curated
during implementation by browsing the live catalog). `fetchProductsBySlugs(slugs)`
calls the WooCommerce Store API (`/wp-json/wc/store/v1/products?slug=<comma-separated>`
or equivalent per-slug fetch, whichever the Store API supports cleanly — confirmed
during implementation) and maps the response the same way `fetchWarliProducts` does in
the Warli page: id, slug, name, image, imageAlt (falling back name → product name),
price, currency. `next: { revalidate: 60 }` for freshness without hammering the API,
same as Warli.

## Page structure (per room, following the Warli 6-section shape)

1. **Hero** — full-bleed room photo, eyebrow + H1 + short intro paragraph, primary CTA
   scrolling to the product grid, secondary CTA to `/custom-order`.
2. **About/editorial** — 2–3 short paragraphs on why this room calls for this kind of
   art (palette, scale, placement), image + stat callout, same visual rhythm as Warli's
   "About Warli Art" section.
3. **Why these picks / styling tips** — 4–5 short cards (icon + title + body), room-
   specific practical guidance (for Pooja Room: deity selection, altar-wall sizing,
   direction/placement; for Bedroom: palette/calm, scale relative to headboard wall;
   for Living Room: statement scale, focal-wall placement; for Dining Room: complementing
   the table setting, sightlines from seating).
4. **Curated product grid** — the room's picked products, rendered exactly like Warli's
   featured-collection grid (image, name, price, `AddToCartButton` on hover). No "View
   All" link, since there's no matching category page to send people to.
5. **CTA band** — reinforcing message + link to `/custom-order` (commission a piece
   sized/toned for this room).
6. **Trust stat strip** — same pattern as Warli's closing stats section, room-agnostic
   facts (handmade, shipping, custom options).

## SEO

Each page gets its own `generateMetadata`-equivalent static `metadata` export (title,
description, canonical via `buildSiteUrl`, OpenGraph, Twitter card) targeting the
room-specific search terms (e.g. "bedroom paintings online India", "living room canvas
art", "pooja room paintings"). `CollectionPage` + `ItemList` JSON-LD per page, same
shape as Warli's schema block.

## Homepage wiring

Once all 4 pages exist and are verified, update `ROOM_TILES` in
`components/homepage/ShopByRoom.tsx` — change each tile's `href` from `/shop` to its
matching `/rooms/...` path.

## Out of scope

- No new WooCommerce taxonomy/tags — confirmed not worth the admin overhead versus
  manual curation for a 4-page, ~40-product-total curation job.
- No new product photography — existing room photos are reused.
- International/regional landing pages — next project after this one, per standing
  phase order.
