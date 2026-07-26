# New Zealand Regional Landing Page — Design

## Context

Third and final in the international regional landing pages series, after
the UK page (`/original-abstract-art-for-sale-uk`) and Ireland page
(`/original-paintings-for-sale-ireland`), both complete and shipped. Source
data: `docs/seo/2026-07-21-international-keyword-research.md` (New Zealand
section + Prioritized Recommendation 8) and `docs/seo/data/nz/*.json`.
General site infrastructure (currency mechanism, checkout, testimonials, no
i18n, `FAQSection` component, return-policy terms) was already explored
during the UK and Ireland brainstorms.

## New Zealand keyword data and how it differs from Ireland's

| Keyword | Volume | Difficulty | Intent | Disposition |
|---|---|---|---|---|
| artist nz | 2,400/mo | 46 | Informational | **Excluded** — locally-loaded, implies NZ-based artists |
| art nz | 990/mo | 42 | Informational | **Excluded** — same reason |
| abstract paintings | 480/mo | 44 | Informational | Usable — confirms abstract theme fit |
| abstract design | 480/mo | 8 | Local/Navigational | Usable |
| abstract art paintings | 480/mo | 43 | Informational | Usable |
| nz art sale | 480/mo | 26 | Local/Transactional | Usable — nationality-neutral commercial intent |
| abstract painting | 480/mo | 47 | Informational | Usable |
| new zealand art for sale | 480/mo | 24 | Local/Transactional | Usable |
| nz art for sale | 480/mo | 26 | Local/Transactional | Usable |
| art for sale nz | 480/mo | 29 | Local/Transactional | Usable — drives the URL slug |
| original abstract art for sale | 10/mo | 16 | Local/Transactional | Usable, same generic seed term as UK/Ireland |

Unlike Ireland (no clean product-category fit, and the "gallery dublin"/
"irish artist" exclusion left the remaining signal fully generic), New
Zealand raised a narrower version of the same identity question and
resolved with a theme fit:

1. **Identity tension, narrower than Ireland's.** "artist nz" and "art nz"
   are locally-loaded (implying NZ-based artists), same category of risk as
   Ireland's "gallery dublin"/"irish artist" — **excluded**. But the rest of
   the cluster ("nz art sale," "new zealand art for sale," "nz art for
   sale," "art for sale nz," all Local/Transactional) reads as
   nationality-neutral "shop for art, from NZ" commercial intent, closer to
   the UK's "original abstract art for sale" than to Ireland's fully-excluded
   local terms. **Decision: target the commercial cluster, exclude
   "artist nz"/"art nz" only.**
2. **Theme fit exists, unlike Ireland.** NZ's Related data leans back toward
   abstract art specifically ("abstract paintings," "abstract design,"
   "abstract art paintings," "abstract painting," all 480/mo) — the same
   theme the UK page was built around. **Decision: reuse the existing
   `abstract-paintings` WooCommerce category via the same live-fetch pattern
   the UK page uses**, not Ireland-style manual curation.

## Decisions

1. **No "artist nz"/"art nz" identity claims** anywhere on the page (see
   tension 1 above) — no implication that Artace Studio is NZ-based or
   features NZ artists.
2. **Product source: live-fetch the existing `abstract-paintings` category**
   (same code pattern as `app/original-abstract-art-for-sale-uk/page.tsx`),
   not a manually curated list.
3. **NZD currency support added as part of this project**, same pattern as
   EUR (added during the Ireland project). Confirmed the exchange-rate API
   (`open.er-api.com`) already returns an NZD rate (`0.017882`). 5-file
   change: `lib/currency/types.ts`, `cookie.ts`, `rates.ts`, `convert.ts`
   (symbol `NZ$`, locale `en-NZ`), `components/currency/CurrencyDropdown.tsx`.
4. **URL**: `/original-abstract-art-for-sale-nz` — directly parallel to the
   UK's `/original-abstract-art-for-sale-uk`, ties to both the generic seed
   term and the "art for sale nz" commercial cluster.
5. **Hero image**: reuse `abstract-collection-bg.webp` (same as the UK page,
   since NZ shares the abstract theme) — no new photography.
6. **Shipping/customs**: same framing as UK/Ireland — ships from India, NZ
   customs duty/GST is assessed separately and is the customer's
   responsibility. No specific delivery timeframe promised anywhere
   (consistent discipline across all three country pages).
7. **Page structure**: reuse the **UK's 10-section structure** (not
   Ireland's 9-section generic one), since NZ shares the UK's abstract theme
   and the same "Understanding Abstract Art" educational section content
   applies. Section 3 (educational) and Section 4 (buying guide) content can
   be near-identical to the UK page's, adapted only where NZ-specific facts
   apply (hero, shipping section, FAQ, metadata/URL).
8. **Testimonials**: reuse real existing reviews from
   `components/homepage/Testimonials.tsx`, honestly attributed to their real
   original locations — a different 3-quote mix than both prior pages for
   variety (exact IDs finalized during implementation planning), keeping the
   Texas/USA review as the common international-shipping trust anchor
   across all three country pages.
9. **FAQ includes a returns question from the start** (like Ireland, unlike
   the UK's original draft) — verified against the real `/return-policy`
   terms: 7-day window from delivery, customer pays return shipping, custom
   commissions non-returnable.

## Page structure

1. **Hero** — NZ-targeted headline, primary CTA (scroll to product grid) +
   secondary CTA (`/custom-order`).
2. **Why Original, Hand-Painted Art** — same value-prop editorial as UK/
   Ireland (original vs. print, real brushwork/texture).
3. **Understanding Abstract Art** — same educational content as the UK
   page (abstract art movement/style), since NZ shares this theme.
4. **How to Choose Abstract Wall Art for Your Space** — same buying guide
   as the UK page.
5. **Shop the Collection** — live product grid from the `abstract-paintings`
   category (Decision 2).
6. **What Collectors Say** — 2-3 real testimonial cards (Decision 8).
7. **Commission a Custom Piece** — CTA section.
8. **Shipping to New Zealand** — delivery window (vague, no specific
   timeframe) + customs/GST responsibility note (Decision 6).
9. **FAQ** — 7 question/answer pairs including shipping, customs/GST,
   authenticity, commissions, and returns (Decision 9) — paired with
   `FAQPage` JSON-LD, reusing the existing `FAQSection` component.
10. **Final CTA + trust stats**.

## SEO

Own `metadata` export targeting "original abstract art for sale" + "New
Zealand" / "NZ", canonical via
`buildSiteUrl("/original-abstract-art-for-sale-nz")`, OpenGraph, Twitter
card. `CollectionPage` + `ItemList` + `FAQPage` JSON-LD, same pattern as the
UK and Ireland pages — the FAQ schema built from the same array the visible
`FAQSection` renders from, not duplicated by hand.

## Out of scope

- No new WooCommerce category or product changes.
- No new photography — existing `abstract-collection-bg.webp` reused.
- No i18n/hreflang/locale routing — same as the UK and Ireland pages.
- This closes out the standing three-country regional landing page phase
  (UK, Ireland, NZ). Any further regional pages would be a new phase with
  its own scoping discussion, not an automatic continuation.

## Standing project constraints (carried forward)

- No `git commit`/`git push` at any point — the user handles all commits
  themselves in this project.
- No test framework exists in this repo — verification uses
  `npx tsc --noEmit`, `npm run build`, and live dev-server curl checks
  against real rendered HTML, per this project's established discipline.
