# Reviews Page — Design

## Context

A new `/reviews` page collects trust signals (Trustpilot, Google, collector
count) and social proof (a Google-review CTA, an FAQ) in one place. This
reuses several things that already exist elsewhere in the site — the
"Why Artace Studio" USP section (currently only embedded inline in
`SingleProduct.tsx`), the shared `FAQSection` component, and the real
Trustpilot/Google logo assets fetched for the product-page trust badges
— rather than duplicating them.

Every number on this page is either a real figure the user confirmed, or
deliberately non-numeric to avoid inventing anything unverifiable:

- **20,000+ Global Collectors** — confirmed real figure.
- **Google Reviews: 5.0** — confirmed real figure, real Google "G" logo
  (fetched from Google's own static asset CDN, `gstatic.com`, same
  legitimate-source standard applied to the Trustpilot logo).
- **Trustpilot: 4.5** — same real score and logo already live on
  photography product pages.
- Two additional trust tiles use facts already established and shipped
  this engagement, not new claims: **15-Day Returns** and **Secure
  Checkout** (Razorpay).

All 19 FAQ answers are grounded in facts already confirmed either earlier
in this engagement (return window, international shipping/customs,
framing, art advisory, Prints pricing) or by the user directly for this
page (no expedited shipping, order tracking via account, Razorpay payment
methods, no physical gallery, general reassurance on color accuracy). None
invent a policy, number, or program that hasn't been confirmed.

## Decisions

### 1. Page structure (top to bottom)

1. **Hero** — center-aligned heading on a branded background (matches the
   site's existing display-type/color system, not a new visual language),
   e.g. "Loved by Art Collectors Worldwide."
2. **Trust bar** — 5 stat tiles directly below the hero: Global Collectors
   (20,000+), Google Reviews (5.0, real "G" logo), Trustpilot (4.5, real
   Trustpilot logo, dark green `#126849`), 15-Day Returns, Secure
   Checkout.
3. **"Why Artace Studio" (USPs)** — the exact 4-point section already
   live on every product page (Authenticity, Satisfaction Guarantee,
   Personal Support, Curated with Confidence), extracted into a shared
   component so both places render identically instead of drifting apart.
4. **"Have You Purchased From Us?" strip** — a short, warm prompt inviting
   past customers to share feedback, two CTAs: **Write a Review** (links
   to the given Google review URL,
   `https://g.page/r/CREUQjoV-JtBEBM/review`, new tab) and **Contact
   Support** (links to the existing `/contact-us` page).
5. **FAQ** — all 19 questions, reusing the existing `FAQSection`
   component (`components/seo/FAQSection.tsx`) verbatim, same accordion
   behavior already used elsewhere on the site.
6. **Top Categories strip** — chips for the top 5 real categories by
   product count (fetched live, same as every other category-driven page
   on this site): Religious Collection (71), Abstract Collection (24),
   Buddha Collection (24), Ganapati Collection (24), Vastu Paintings (22).
   Photography and Prints are intentionally excluded here — they're
   purchase-format categories, not subject/theme categories, and this
   strip is for browsing by theme like the rest of the site's category
   navigation.

### 2. Shared "Why Artace Studio" extraction

New `components/shared/WhyArtaceStudio.tsx`, exporting the exact content
and markup currently inline in `SingleProduct.tsx` (`WHY_ARTACE_POINTS`
array + its render block, unchanged). `SingleProduct.tsx` is updated to
import and render it instead of keeping its own copy — a pure extraction,
no visual or content change to the existing product-page section.

### 3. FAQ answer sourcing

| # | Question | Answer basis |
|---|---|---|
| 1 | Why should I buy from Artace Studio? | The 4 USP points (authenticity, satisfaction guarantee, personal support, curated confidence) + handmade-by-named-artists. |
| 2 | How can I be sure the artwork is authentic? | Every piece ships with an Authenticity Certificate (existing trust badge on product pages). |
| 3 | Difference between original art and prints? | Original = one-of-a-kind handmade; Print = fine-art reproduction at 25% of the original's price for that size, +₹350 for framing (the Prints feature just shipped). |
| 4 | How long will it take to ship? | Reuses the exact, already-approved wording from the Shipping and Returns copy: timelines are estimated, vary by courier/customs. |
| 5 | Expedited shipping? | No — confirmed by user. |
| 6 | Where shipped from? | Studio/warehouse in India — confirmed by user. |
| 7 | Ship internationally? | Yes; customs/duties are the buyer's responsibility — established fact. |
| 8 | Request more images/details? | Yes, via Contact Us. |
| 9 | Framing services? | Yes — the existing 5-style frame selector; included in price for originals, +₹350 for prints. |
| 10 | Return/exchange policy? | 15 days, unframed/default-size only for originals — established fact. |
| 11 | Damaged on arrival? | Contact within 24 hours — established fact. |
| 12 | Looks different in person? | General reassurance only — user's choice; no new guarantee invented. |
| 13 | Art advisory services? | Yes — the existing Complimentary Art Advisory section/free call. |
| 14 | Trade program? | Bulk/trade discounts via the existing Corporate Bulk Orders page ("Exclusive Trade Discounts" already advertised there). |
| 15 | Work with galleries/corporate clients? | Corporate: yes, confirmed page exists. Galleries: invited to reach out via Contact Us — not claiming an established gallery program that doesn't exist. |
| 16 | Payment methods? | Cards, UPI, netbanking, wallets via Razorpay — confirmed by user. |
| 17 | Track my order? | Yes, via account + courier tracking link — confirmed by user. |
| 18 | Customs duties/taxes? | Yes for international orders, buyer's responsibility — established fact. |
| 19 | Physical gallery location? | No — online-only, ships from the India studio/warehouse — confirmed by user. |

`FAQSection` renders answers as plain text (no embedded links), so
mentions like "Contact Us" in an answer are plain text, not hyperlinks —
consistent with how this component already works elsewhere.

## Data flow

1. `app/reviews/page.tsx` (new, Server Component, mirrors the fetch
   pattern already used in `app/collections/[slug]/page.tsx`): fetches
   categories from the public Store API, picks the top 5 by count
   (excluding Prints, Photography, and the "All Canvas Paintings"
   default), passes them to the page's category-chip section.
2. Trust-bar numbers, USP content, and FAQ items are static — no fetch
   needed for those.
3. `components/shared/WhyArtaceStudio.tsx` is imported by both
   `app/reviews/page.tsx` and `components/singleproduct/SingleProduct.tsx`.

## Out of scope

- No live Trustpilot/Google API integration — both scores are static
  numbers the user confirmed, matching the same approach already shipped
  on product pages.
- No new review-collection mechanism on this site itself — the CTA sends
  customers to the real external Google review link.
- No changes to `/contact-us` itself.
- No gallery-partnership program is being built or claimed — FAQ #15
  only invites inquiries.

## Standing project constraints (carried forward)

- No `git commit`/`git push` — the user reviews and commits/pushes
  everything themselves.
- No test framework — verification via `npx tsc --noEmit`, live
  dev-server checks. Given the port-3000 incident earlier this session,
  any `.next`-clearing or `npm run build` verification will only happen
  after explicitly confirming port 3000 is not the process being touched,
  and preferably not at all while it's known to be running — favor
  `tsc --noEmit` (safe, doesn't touch `.next`) as the primary check.
