# UK Regional Landing Page — Design

## Context

This is the first of three planned international regional landing pages (UK,
then Ireland, then New Zealand), per the standing phase order established
after the India content hub and room-landing-pages work. The India content
hub and room-landing-pages projects are both complete; this project starts
the international-regional phase.

Source data: `docs/seo/2026-07-21-international-keyword-research.md`
(Prioritized Recommendation 6) and `docs/seo/data/uk/*.json`. The UK was
selected as the lead international market because "original abstract art for
sale" (110/mo, difficulty 16, Local/Transactional intent) is the highest-
volume validated keyword across all 10 international regions' seed lists,
and the UK's Related-keyword data is the richest of any Tier 1 region by a
wide margin.

## UK keyword data driving this design

| Keyword | Volume | Difficulty | Intent | Role |
|---|---|---|---|---|
| original abstract art for sale | 110/mo | 16 | Local/Transactional | Primary commercial target, drives the URL slug |
| buy original paintings online | 20/mo | 43 | Informational | Secondary commercial target |
| art | 60,500/mo | 83 | Local/Commercial | Long-horizon head term, not a near-term ranking bet |
| paintings | 14,800/mo | 88 | Local/Commercial | Long-horizon head term |
| artwork | 12,100/mo | 78 | Informational | Long-horizon head term |
| abstract art | 9,900/mo | 59 | Informational | Dominant thematic cluster — drives the educational content section |
| abstract wall art | 2,900/mo | 57 | Informational | Drives the buying-guide section |
| abstract painting | 2,900/mo | 64 | Informational | Thematic cluster |
| art prints uk | 2,900/mo | 55 | Informational | Only country-qualified term found — confirms a `-uk`-suffixed, UK-explicit page is worth building |
| art with pictures | 2,400/mo | 67 | Informational | Thematic cluster |

Longtail data is almost entirely "buy original \[X\] painting(s) online"
variants — reinforces "buy original paintings online" as a real secondary
target, not a one-off.

Unlike India (devotional/religious lean) or the room pages (no matching
category existed), the UK's dominant theme is **abstract art**, and Artace
Studio already has a matching WooCommerce category — `abstract-paintings`
(13 products).

## Decisions

1. **Product source**: live-fetch the `abstract-paintings` WooCommerce
   category at request time (same pattern as `app/warli-paintings/page.tsx`'s
   `?category=warli-paintings` fetch). No manual slug curation — the page
   stays current automatically as the category's products change.
2. **URL**: `/original-abstract-art-for-sale-uk` — a keyword-rich slug
   staying tight to the literal top-volume query, rather than a generic
   `/regions/uk` path. Ireland and New Zealand's pages (future projects)
   will each get their own keyword-appropriate slug, not a templated
   `/regions/<country>` pattern, since their top keywords differ from the
   UK's.
3. **Page structure**: 10 sections (below), deliberately NOT a copy of the
   room-landing-pages' 6-section shape. This page is content-richer, since
   the UK's SEO opportunity is dominated by high-volume *informational*
   "abstract art" queries alongside the smaller commercial "for sale" query
   — genuine educational content earns topical authority for those
   informational terms, not just a product grid.
4. **Shipping/customs content**: duties and any import VAT are the
   customer's responsibility, charged separately by UK customs on delivery
   — the price shown at checkout is the art's price only. This is stated
   plainly in section 8, not glossed over.
5. **Testimonials**: reuse 2-3 real existing reviews from
   `components/homepage/Testimonials.tsx` (linked to genuine Google/
   Trustpilot data, not fabricated) — including the existing Texas, USA
   review, to honestly demonstrate international shipping already happens,
   without fabricating or falsely implying UK-specific reviews. Presented
   with their real original locations.
6. **Hero image**: reuse the existing `abstract-collection-bg.webp` (already
   used on `/collections/abstract-paintings`) — no new photography
   commissioned for this page.
7. **Schema**: both `CollectionPage`/`ItemList` JSON-LD (matching the
   room-pages/Warli pattern) AND `FAQPage` JSON-LD — justified because
   section 9 has real, visible FAQ content backing it, not just schema
   for schema's sake.

## Page structure

1. **Hero** — UK-targeted headline, primary CTA (scroll to product grid) +
   secondary CTA (`/custom-order`).
2. **Why Original, Hand-Painted Art** — craftsmanship/value-prop editorial:
   original vs. printed art, real brushwork/texture.
3. **Understanding Abstract Art** — genuine educational content on the
   abstract art movement/style (what makes a piece "abstract," a brief
   history/context, why it suits contemporary interiors). Targets the
   9,900/mo "abstract art" informational cluster directly with real,
   useful content — not keyword-stuffed filler.
4. **How to Choose Abstract Wall Art for Your Space** — practical buying
   guide: palette matching, scale/sizing for a wall, placement. Targets
   "abstract wall art" (2,900/mo).
5. **Shop the Abstract Collection** — live product grid, fetched from the
   `abstract-paintings` category via the Store API, rendered the same way
   Warli's and the room pages' grids are (image, name, price,
   `AddToCartButton` on hover).
6. **What Collectors Say** — 2-3 testimonial cards reused from
   `Testimonials.tsx`'s existing `TESTIMONIALS` array (not a live import of
   that client component — this page is a Server Component; the specific
   quotes are copied as static content, same words/attribution/location).
7. **Commission a Custom Piece** — CTA section targeting the UK's
   "commission a painting online" seed-keyword intent (no volume data
   returned by SE-Ranking for this exact phrase in the UK, but it's one of
   the 10 tracked UK seed keywords, signaling real search intent even where
   SE-Ranking's coverage was sparse).
8. **Shipping to the UK** — delivery window, and the customs/duty
   responsibility note from Decision 4.
9. **FAQ** — 5-6 question/answer pairs covering shipping cost/timeline,
   customs duties, custom commissions, authenticity/hand-painted
   confirmation, and returns — scannable, paired with `FAQPage` schema.
10. **Final CTA + trust stats** — closing conversion section, same trust-
    stat pattern used on the room pages (Handcrafted by / Custom Sizing /
    Approval / Shipping).

## SEO

Own `metadata` export: title/description targeting "original abstract art
for sale" + "UK", canonical via `buildSiteUrl("/original-abstract-art-for-sale-uk")`,
OpenGraph, Twitter card. `CollectionPage` + `ItemList` JSON-LD (Warli/room-
page pattern) plus a new `FAQPage` JSON-LD block generated from the same
Q&A content rendered in section 9 (single source of truth — the JSON-LD
`mainEntity` array is built from the same data structure the visible FAQ
accordion/list renders from, not duplicated by hand).

## Out of scope

- Ireland and New Zealand regional pages — next projects in the standing
  phase order, each gets its own brainstorm/spec/plan cycle since their
  keyword data and page angles differ from the UK's.
- No new WooCommerce category or product changes — `abstract-paintings`
  already exists and fits.
- No new photography — existing `abstract-collection-bg.webp` is reused.
- No i18n/hreflang/locale routing — this remains a single-language English
  site; the page is content/targeting differentiation, not translation.
- No geolocation-based currency or content switching — GBP is already
  selectable via the existing manual currency dropdown; this page doesn't
  change that mechanism.

## Standing project constraints (carried forward)

- No `git commit`/`git push` at any point — the user handles all commits
  themselves in this project.
- No test framework exists in this repo — verification uses
  `npx tsc --noEmit`, `npm run build`, and live dev-server curl checks
  against real rendered HTML, per this project's established discipline.
