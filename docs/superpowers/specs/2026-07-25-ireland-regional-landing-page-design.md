# Ireland Regional Landing Page — Design

## Context

Second in the international regional landing pages series, after the UK page
(`/original-abstract-art-for-sale-uk`, complete and shipped). Source data:
`docs/seo/2026-07-21-international-keyword-research.md` (Ireland section +
Prioritized Recommendation 7) and `docs/seo/data/ie/*.json`. General site
infrastructure (currency mechanism, checkout, testimonials, no i18n) was
already explored during the UK brainstorm.

## Ireland keyword data and the two tensions it raised

| Keyword | Volume | Difficulty | Intent | Disposition |
|---|---|---|---|---|
| gallery dublin | 3,100/mo | 73 | Local/Commercial | **Excluded** — see Decision 1 |
| art | 6,600/mo | 62 | Local/Commercial | Usable, generic head term |
| wall art | 1,900/mo | 54 | Local/Commercial | Usable, generic head term |
| art gallery | 1,600/mo | 68 | Local/Commercial | Usable, generic head term |
| paintings | 1,600/mo | 63 | Informational | Usable, generic head term — drives the URL slug |
| irish artist | 810/mo | 27 | Informational | **Excluded** — see Decision 1 |
| wall prints / irish prints / irish print / arts prints | 590/mo each | 18-26 | Local/Commercial | **Excluded** — see Decision 2 |
| original abstract art for sale | 10/mo | 24 | Local/Transactional | Usable but low-volume; not Ireland's theme the way it was the UK's |

Unlike the UK (clean fit with the existing `abstract-paintings` category),
Ireland's data raised two real tensions, resolved with the user before
design:

1. **Local/nationality-identity risk.** "gallery dublin" and "irish artist"
   are genuinely local/nationality-loaded queries. Artace Studio is an
   India-based studio with no real Dublin or Irish-artist connection —
   unlike the UK's "original abstract art for sale," which is nationality-
   neutral commercial language any international seller can legitimately
   target. **Decision: excluded entirely.** No Dublin or Irish-artist
   framing anywhere on this page.
2. **The "prints" contradiction.** Ireland's data shows a real print-demand
   cluster (~2,360/mo combined: wall prints, irish prints, irish print, arts
   prints). Investigation confirmed Artace Studio has a live WooCommerce
   "Art Prints" category selling actual `Acrylic print on Canvas`
   reproductions — a real product line that contradicts the "100%
   hand-painted, never printed" messaging used everywhere else on the site,
   including the UK page. **Decision: excluded.** This page stays
   originals-only, fully consistent with the UK page and the rest of the
   site's brand voice. The print-demand cluster is left uncaptured by
   design, not oversight.

After excluding both, the remaining usable signal is generic: "art,"
"wall art," "art gallery," "paintings" — none of which map to a single
existing product category the way "abstract art" mapped to
`abstract-paintings` for the UK.

## Decisions

1. **No Dublin/Irish-identity claims** (see tension 1 above).
2. **Originals-only, no prints mentioned** (see tension 2 above).
3. **EUR currency support added as part of this project.** Ireland uses EUR;
   the site's currency system currently supports only INR, USD, AED, AUD,
   CAD, GBP. Confirmed the exchange-rate API (`open.er-api.com`) already
   returns an EUR rate — this is a small, well-contained addition across 5
   files (`lib/currency/types.ts`, `cookie.ts`, `rates.ts`, `convert.ts`,
   `components/currency/CurrencyDropdown.tsx`), each needing one new EUR
   entry (symbol `€`, locale `en-IE`). Not scoped to only this page — it's a
   site-wide currency-system change that happens to be needed for this
   page's purpose.
4. **Product source: manually curated cross-category selection, ~12
   products** (landscapes, abstract, and Buddha pieces, plus 2 devotional
   highlights) — not a single-category live-fetch like the UK (no category
   fits Ireland's generic keyword data the way `abstract-paintings` fit the
   UK's), and not a reuse of the homepage's `featured=true` bestsellers
   (that set is heavily devotional/Hindu-deity-themed, curated for the India
   homepage audience — not necessarily the strongest "most popular" framing
   for a general international/Irish buyer). Curated list, exact slugs
   finalized during implementation planning, following the same "browse the
   live catalog and hand-pick" process used for the room pages and the
   original `featured=true` set as a starting reference point.
5. **URL**: `/original-paintings-for-sale-ireland` — ties to "paintings"
   (1,600/mo) plus generic "original ... for sale" commercial framing, since
   "abstract" isn't Ireland's theme the way it was the UK's.
6. **Shipping/customs**: same as the UK — ships from India, Irish/EU import
   VAT or customs handling fees are charged separately and are the
   customer's responsibility. Consistent messaging across both country
   pages.
7. **Page structure**: 9 sections (one fewer than the UK's 10) — no
   dedicated "Understanding X Art" educational section this time, since
   there's no equivalent single-theme informational keyword cluster the
   way "abstract art" (9,900/mo) was for the UK. Section 3 becomes a
   general "how to choose original art for your home" buying guide instead
   of an abstract-specific one.
8. **Testimonials**: same approach as the UK — reuse real existing reviews
   from `components/homepage/Testimonials.tsx`, honestly attributed to
   their real original locations, not fabricated or falsely re-attributed
   to Ireland.
9. **FAQ includes a returns question from the start** (the UK page's FAQ
   initially omitted one — a gap only caught in that page's final review
   and fixed afterward — so this page's plan should include it from the
   first draft, verified against the real `/return-policy` terms: 7-day
   window from delivery, customer pays return shipping, custom commissions
   non-returnable).

## Page structure

1. **Hero** — Ireland-targeted headline, primary CTA (scroll to product
   grid) + secondary CTA (`/custom-order`).
2. **Why Original, Hand-Painted Art** — same value-prop editorial as the UK
   page (original vs. print, real brushwork/texture).
3. **How to Choose Original Art for Your Home** — general buying guide
   (palette, scale/sizing, placement) — not abstract-specific.
4. **Shop the Collection** — curated cross-category product grid (Decision
   4).
5. **What Collectors Say** — 2-3 real testimonial cards, same honest-reuse
   approach as the UK page.
6. **Commission a Custom Piece** — CTA section.
7. **Shipping to Ireland** — delivery window (no specific timeframe
   promised, same discipline as the UK page since none has been confirmed)
   + customs/VAT responsibility note (Decision 6).
8. **FAQ** — 6-7 question/answer pairs including shipping, customs,
   authenticity, commissions, and returns (Decision 9) — paired with
   `FAQPage` JSON-LD, reusing the existing `FAQSection` component.
9. **Final CTA + trust stats**.

## SEO

Own `metadata` export targeting "original paintings for sale" + "Ireland",
canonical via `buildSiteUrl("/original-paintings-for-sale-ireland")`,
OpenGraph, Twitter card. `CollectionPage` + `ItemList` + `FAQPage` JSON-LD,
same pattern as the UK page — the FAQ schema built from the same array the
visible `FAQSection` renders from, not duplicated by hand.

## Out of scope

- New Zealand regional page — next project in the standing phase order,
  gets its own brainstorm cycle.
- The "prints" keyword cluster and any Art Prints category page/content —
  deliberately excluded per Decision 2. Could be revisited as a genuinely
  separate future project if the business wants to pursue that cluster
  explicitly and honestly (a dedicated prints page, clearly labeled as
  such) — not bundled into this one.
- No new WooCommerce category or product changes.
- No new photography — hero image choice to be finalized during
  implementation planning (likely an existing landscape/general-appeal
  background, given the curated cross-category product focus rather than
  one category's existing hero image).
- No i18n/hreflang/locale routing — same as the UK page, this remains
  content/targeting differentiation on a single-language English site.

## Standing project constraints (carried forward)

- No `git commit`/`git push` at any point — the user handles all commits
  themselves in this project.
- No test framework exists in this repo — verification uses
  `npx tsc --noEmit`, `npm run build`, and live dev-server curl checks
  against real rendered HTML, per this project's established discipline.
