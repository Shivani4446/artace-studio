# Trade Program Landing Page — Design

## Context

The user asked for a landing page in the spirit of Saatchi Art's trade page
(`saatchiart.com/en-in/trade`), aimed at interior designers, architects, and
hospitality/commercial firms — a different audience from the existing
`/corporate-bulk-orders` page, which targets one-off corporate
gifting/office-decor buyers.

Saatchi's page was fetched and analyzed directly before designing this:
hero with real hospitality install photography → 5 icon-led value props
(catalog size, tiered discounts, dedicated service, complimentary
curatorial support, custom commissions) → a Trade-vs-Hospitality audience
split → 2 real named case studies → footer email capture (10% off) → "Join
Now" CTAs. No testimonials, no FAQ.

Decisions reached with the user before writing this spec:

- **Separate `/trade` page**, not a rebuild of `/corporate-bulk-orders` —
  cross-linked between the two rather than merged.
- **No fabricated case studies** — Saatchi's credibility comes partly from
  real named installs the user doesn't have yet; this page leans instead
  on real, already-live trust numbers (Trustpilot 4.5, Google 5.0, 20,000+
  Collectors — the same real figures shipped on `/reviews`) plus real
  built capabilities Saatchi's page only vaguely gestures at (complimentary
  art advisory, working custom size/frame selector, named-artist
  attribution).
- **Flat 15% trade discount** for all trade members — a real, specific
  number rather than Saatchi's deliberately vague "tiered discounts."
- **Manual application review**, not instant self-serve signup — this
  matches how every other lead-driven flow on this site already works
  (Custom Orders, Make an Offer, Corporate Bulk Orders): honest "Apply →
  we review within 24-48 hours → shop with your discount" framing, not a
  Saatchi-style "Join Now" that implies instant enrollment.

One environment fact carried into this spec rather than re-discovered:
`SUPABASE_URL` in `.env.local` fails DNS resolution in this environment
(confirmed earlier this engagement against the Custom Order endpoint).
The new lead-capture table follows the exact same Supabase-insert pattern
as the existing, working `corporate-leads` endpoint, so it will have the
identical failure mode if that pre-existing issue isn't resolved — this is
an environment/project issue outside this feature's code, flagged here so
it isn't mistaken for a bug introduced by this work.

## Decisions

### 1. Page sections (top to bottom)

1. **Hero** — "Artace Studio Trade Program," positioned for design
   professionals, dark branded background matching the site's established
   hero treatment (same visual language as `/reviews`' hero).
2. **Trust bar** — the same 3 real stat tiles already live on `/reviews`
   (Global Collectors 20,000+, Google 5.0, Trustpilot 4.5), reusing the
   same real logo assets (`public/google-logo.png`,
   `public/trustpilot-logo.svg`). Not extracted into a shared component in
   this pass — the Reviews page's 5-tile bar includes 2 tiles (15-Day
   Returns, Secure Checkout) that don't fit a trade context, so this page
   gets its own 3-tile version rather than forcing a shared abstraction
   over a layout that would need per-page tile customization anyway.
3. **Benefits grid** — 5 icon cards: Flat 15% Trade Discount,
   Complimentary Art Advisory (links to the existing advisory contact
   path), Custom Sizing & Framing (references the real selector already
   on product pages), Handmade by Named Artists, Dedicated Trade Support.
4. **Who Qualifies** — two-column split: Interior Designers & Architects
   / Hospitality & Commercial Firms — short descriptive text per column,
   no fabricated logos or client names.
5. **How It Works** — 3 numbered steps: Apply → We Review (24-48 hours)
   → Shop With Your Trade Pricing.
6. **Application form** — new `TradeApplicationForm` component, modeled
   directly on the existing `CorporateLeadForm` (same visual style, same
   submit/success/error state machine), fields: Full Name, Studio/Company
   Name, Email, Phone, Profession (select: Interior Designer / Architect /
   Hospitality Procurement / Other), Portfolio or Website URL, Message.
7. **FAQ** — 6 trade-specific questions, reusing the existing
   `FAQSection` component: What's the trade discount? Who qualifies? How
   long does approval take? Is there a minimum order? Can I combine trade
   pricing with custom sizing/framing? What if I need bulk/corporate
   gifting instead? (last one cross-links to `/corporate-bulk-orders`).

### 2. Data flow — mirrors the existing Corporate Leads pattern exactly

- New Supabase table `trade_applications` (columns mirroring
  `corporate_leads`: `full_name`, `company_name`, `email`, `phone`,
  `profession`, `portfolio_url`, `message`, `user_agent`, `ip_address`,
  timestamps), shipped as a `.sql` file under `supabase/` for the user to
  run by hand — same established pattern as every other new table this
  engagement.
- New handler `lib/api-route-handlers/trade-leads/route.ts`, structurally
  identical to `lib/api-route-handlers/corporate-leads/route.ts`: validate
  required fields → insert into Supabase → send a Resend notification
  email to the same configured contact address → return `{ ok: true }` or
  a clear error.
- Registered in the existing catch-all router
  (`app/api/[[...path]]/route.ts`), same mechanism as every other API
  route.

### 3. Cross-linking

- `/trade`'s FAQ links to `/corporate-bulk-orders` for pure bulk-gifting
  needs.
- `/corporate-bulk-orders` gets one new line/link pointing to `/trade` for
  design professionals specifically — small, additive change, not a
  redesign of that page.

## Out of scope

- No case-study/portfolio section (no real projects to feature yet, per
  the user).
- No automatic approval or discount-code generation — applications are
  reviewed manually, matching every other lead flow on this site.
- No changes to `/corporate-bulk-orders`'s existing form, layout, or
  content beyond adding the one cross-link.
- No fix to the pre-existing Supabase DNS issue — flagged, not addressed,
  since it's an environment/project configuration matter outside this
  feature.

## Standing project constraints (carried forward)

- No `git commit`/`git push` — the user reviews and commits/pushes
  everything themselves.
- No test framework — verification via `npx tsc --noEmit`. Given the
  port-3000 incident, no `npm run build` / `rm -rf .next` while port 3000
  may be running; prefer asking the user to check new pages on their own
  live server over starting a second dev server in this shared folder.
