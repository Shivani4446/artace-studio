# Homepage Rebuild — Design

## Problem

The current homepage (`app/(home)/page.tsx`) is India-only in copy and structure, and is missing the sections identified as the site's biggest differentiators in `Artace Studio Homepage research.md`: a trust bar, the five-phase collaborative journey, and room/occasion-based navigation. The business is now also targeting art collectors/enthusiasts across UAE, Singapore, New Zealand, Australia, UK, Malaysia, Philippines, Ireland, Germany, and Netherlands, alongside the existing India middle-class/Vastu/affordable persona. The completed SE-Ranking keyword research (`docs/seo/2026-07-21-international-keyword-research.md`) validated both personas with real data and surfaced concrete, previously-unknown content opportunities (notably a Marathi/Hindi devotional keyword cluster, and UK as the strongest international lead market). This design rebuilds the homepage to reflect the approved 12-section copy doc (`Homepage Copy.md`), folds in the SEO findings, and adds a motion layer — while keeping the existing e-commerce plumbing (WooCommerce product fetches, cart, currency) untouched.

## Scope decision: one blended, currency-aware homepage

No geo-detection, no separate regional URLs/pages. One homepage serves everyone. The existing `CurrencyProvider`/`useCurrency()` hook (`components/currency/CurrencyProvider.tsx`) — already built, manual-select, cookie-persisted — becomes the mechanism for the one piece of region-driven content this rebuild needs: the hero's price-anchor line, rendered via `useCurrency().formatPrice(amountInInr)`. No other section varies by selected currency in this pass; if more content needs to vary by region later, it hangs off this same hook rather than introducing geo-detection.

## Section-by-section plan

Current order in `page.tsx`: Hero → ShopBestSellers → DiscoverEssentials → TrueArtistrySection → Testimonials → PromotionalBanner → JournalSection → FAQSection → ArtistInvitation.

New order and per-section changes:

1. **Hero** (`components/homepage/HeroSection.tsx`, modify) — add a price-anchor line beneath the sub-headline: "Original pieces from `{formatPrice(8500)}` · Bespoke commissions from `{formatPrice(15500)}`", using `useCurrency()`. This requires converting the price-anchor line (only) into a small client component or making the whole section a client component — `HeroSection` is currently a server component with no interactivity, so the minimal change is a new small client subcomponent (`HeroPriceAnchor.tsx`) rendered inside it, keeping the rest of the section server-rendered. Hero background image stays as-is (rotating across devotional/abstract/figurative imagery needs new photography — deferred, see Out of Scope).

2. **Trust Bar** (new `components/homepage/TrustBar.tsx`) — 5 items in a single row (icon + label + sub-label), directly under the hero: 100% Handcrafted, Artist-Led Consultation, White-Glove Delivery, 4.9★ on Google, Pan-India Shipping. Icons from `lucide-react` (matches existing site convention — `ShoppingCart`, `ArrowRight`, `ArrowUpRight` already used elsewhere). Framer Motion stagger-in on scroll (each item fades/slides in with a small delay offset from the previous).

3. **The Artace Studio Journey** (new `components/homepage/ArtaceJourney.tsx`) — header "A Masterpiece Made With You, Not Just For You", intro line, 5 numbered steps (Vision Consultation → Idea & Sketch → Palette Confirmation → Creation with Milestone Updates → Final Reveal & Delivery), each with a short label + one-line description, lucide-react icon per step, CTA "Book a Free Consultation" linking to `https://cal.com/artace-studio` — the same live booking link already used by the Design It Together panel's "Book a Call Now" CTA (a consultation is a booked call, not a custom-order form submission, so this reuses the existing booking flow rather than `/custom-order`). Framer Motion scroll-triggered reveal, steps animating in sequentially.

4. **Shop by Room** — **deferred**. Not built in this pass; needs real room-styled photography for 4 tiles (Living Room, Pooja Room, Office, Gifting) that the user will supply separately. `page.tsx` ships without this section for now; adding it later is a small, self-contained follow-up (new component + one import/render line in `page.tsx`), not a structural change.

5. **Bestsellers** (`components/homepage/ShopBestSellers.tsx`, modify) — update H2 from "Shop Bestsellers" to "Bestselling Handcrafted Canvas Paintings", add the intro line from the copy doc. Product-fetch logic, grid, and `AddToCartButton` integration unchanged.

6. **Collections** (`components/homepage/DiscoverEssentials.tsx`, modify) — update H2 to "Explore Our Collections, Radha Krishna, Abstract, Buddha & Beyond" + add intro line. The Vastu tile already exists in `FALLBACK_CATEGORIES` (id 6) and in `PRIORITY_KEYWORDS`-adjacent logic — no structural change needed there. Add the Marathi/Hindi devotional keyword finding (Shankar Maharaj, Vitthal Rakhumai) as supporting copy in the intro line or as a new fallback tile if a matching WooCommerce category exists (confirm against live categories during implementation; if no matching category exists, the finding surfaces instead in the Journal/content-strategy recommendations, not forced into this grid).

7. **True Artistry** (`components/homepage/TrueArtistrySection.tsx`, modify) — copy unchanged (per copy doc, "keep mostly as-is"). Add a Framer Motion fade/slide-in on scroll for the text block and video container.

8. **About Us panel** (new `components/homepage/AboutUsPanel.tsx`, extracted from the existing `PromotionalBanner.tsx`) — the current `StackedCampaign`'s 2nd panel content ("We Connect You With Authentic, Handmade Art...", CTA "More About Us" → `/about-us`) becomes its own standalone single-panel component, unchanged copy, placed here — directly after True Artistry, extending the brand-trust beat with a distinct full-bleed visual treatment before the social-proof section that follows.

9. **Testimonials** (`components/homepage/Testimonials.tsx`) — unchanged (per copy doc, "keep as-is").

10. **Design It Together** (new `components/homepage/DesignTogetherPanel.tsx`, extracted from `PromotionalBanner.tsx`) — the current 3rd panel, with its header/body copy updated to match the copy doc's section 9 exactly ("Not Sure What You Need? Let's Design It Together" / the new body text / "Book a Call Now" + "See Collection" CTAs, both already wired to real destinations — `cal.com/artace-studio` and presumably `/shop` or a collections page for "See Collection", confirmed during implementation). Placed here, as the second of the two consultation CTAs the copy doc calls for (first is the Journey section's CTA).

11. **Journal** (`components/homepage/JournalSection.tsx`) — unchanged.

12. **FAQ** (`app/(home)/homepage-schema.ts`, modify) — add the 3 new Q&As from the copy doc (pricing, delivery timeline, shipping) to the `homepageFaqs` array. Since `homepageSchema`'s `FAQPage` entry is generated from this same array (`homepageFaqs.map(...)`), the JSON-LD schema updates automatically — no separate schema change needed.

13. **Artist Invitation** (`components/homepage/ArtistInvitation.tsx`, modify) — shrink to the copy doc's "single compact line + link" treatment (currently a full two-column section with heading, paragraph, CTA, and an SVG illustration — reduce to one short line of text + "Partner With Us →" link, dropping the illustration and paragraph to match the copy doc's explicit sizing-down instruction).

**Removed:** the `PromotionalBanner.tsx` component's 1st panel (the "Flat 10% Off" discount banner) is deleted outright — flagged in the research doc as conflicting with the brand's premium voice ("Words We Avoid: Discount/Sale"). `PromotionalBanner.tsx` itself is deleted once its 2nd and 3rd panels are extracted into their own components per items 8 and 10 above; `StackedCampaign`'s sticky-scroll visual treatment (shared layout/positioning logic) is preserved by copying it into both new single-panel components rather than trying to share a 3-panel component across two different homepage positions.

## SEO-informed additions

- The Marathi/Hindi devotional keyword cluster (शंकर महाराज / Shankar Maharaj, वित्ठल रखुमाई / Vitthal Rakhumai — validated at 500/mo and 320/mo respectively, difficulty 7 and 10) is the one genuinely new content finding from the research to fold in, per item 6 above.
- H2 rewrites in items 5 and 6 directly reflect the keyword findings already in the copy doc's own SEO-strengthened headers — no additional H2 changes needed beyond what's in the copy doc.
- Schema: existing `ArtGallery` (Organization-equivalent), `WebSite`, `WebPage`, `AggregateRating`, `FAQPage`, and `BreadcrumbList` JSON-LD in `homepage-schema.ts` already cover what the original research doc recommended — only the `FAQPage` entries change (via item 12), automatically, since it's derived from the same array. No net-new schema types needed for the homepage.
- The site-audit's homepage-relevant technical findings (missing image alt text on 81 images, 48 broken product images, sitemap noindex/non-canonical hygiene) are **not** part of this homepage rebuild — they're sitewide/product-catalog issues, not homepage-section content, and are better tracked as a separate technical-SEO cleanup pass. Flagging this boundary explicitly so it isn't assumed to be silently included here.

## Animation approach

Framer Motion (new dependency — first animation library in this codebase; existing chat widget uses plain CSS `@keyframes`, which stays as-is, this isn't a retrofit of existing animations). Used for:
- Trust Bar: staggered fade/slide-in per item on scroll into view.
- Journey: sequential step reveal on scroll.
- True Artistry: single fade/slide-in for the text+video block on scroll.
- About Us panel / Design Together panel: preserve the existing sticky-scroll stacking visual effect (CSS `position: sticky`, not Framer Motion) — Framer Motion adds the entrance animation only, not the scroll-driven pinning, which is already handled by existing CSS.

All animations use `viewport={{ once: true }}` (Framer Motion's built-in "animate once" behavior) so they don't re-trigger on scroll-back-up, and respect `prefers-reduced-motion` (Framer Motion's `useReducedMotion` hook gates the animated variants, falling back to an immediate, non-animated render).

## Out of scope

- Shop by Room section (item 4) — deferred pending user-supplied photography.
- Hero image rotation across devotional/abstract/figurative imagery — deferred, same reason (needs new photography).
- Sitewide technical SEO fixes (alt text, broken images, sitemap hygiene) — separate pass, not homepage content.
- Any change to product-fetch logic, cart, checkout, or currency conversion math itself — this rebuild only adds one new consumer of the existing `useCurrency()` hook, it doesn't change currency/pricing logic.
- Regional/geo-detected content variants or separate regional URLs — explicitly rejected in favor of the single blended homepage approach above.
