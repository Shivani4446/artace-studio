# Interior Designer Partnership Landing Page — Design

## Context

The user supplied a complete section-by-section content plan (`Artace Studio × Interior Designer.md`) for a new B2B landing page targeting interior designers specifically — tone, copy, animation direction, SEO metadata, and form fields all already written. This spec formalizes that plan into an implementable design, resolves the placeholders the user's own doc flagged as needing real data, and reconciles the new page against two already-existing, adjacent B2B offerings (`/trade`, `/affiliates`) before writing any code.

Decisions reached with the user before writing this spec:

- **Fully separate, standalone program** — not a merge with `/trade`, not wired into the existing Affiliate Program's referral-code/commission-tracking engine. "Commission on referred projects" (Section 8) is manual/negotiated per partner, described in marketing copy only — no automated commission tracking is built for it. This keeps the "Business" nav dropdown coherent: Trade Program (flat discount, self-serve buyers), **Design Partner Program (new — relationship-based, designer-specific)**, Affiliate Program (public referral commission), Corporate & Bulk Orders, Art Rentals — five genuinely distinct offerings, not overlapping ones.
- **Real Trust Bar numbers, provided by the user**: 10+ Designer Collaborations, 21+ Metro Cities Served. The third clause ("100% Handcrafted, 0% Mass-Produced") is a factual production-model claim, not a metric needing separate verification, and is used as-is.
- **No fabricated average turnaround number** — the user didn't provide one, so the FAQ answer stays general ("confirmed during your Vision Consultation"), matching the doc's own bracketed fallback intent.
- **Portfolio (Section 9) and Testimonials (Section 10) are omitted entirely for this launch** — no real project photos or designer quotes exist yet, and this engagement's standing practice (established across Trade, Reviews, Custom Portraits) is to never fabricate trust content. These can be added later once real material exists; no placeholder or "coming soon" stub is built for them now.
- **Route**: `/interior-designer-partnership`, not `/trade-partners` — a "trade-" prefixed URL would blur the "fully separate program" decision above.

## Decisions

### 1. Route, metadata, schema

`/interior-designer-partnership` — new top-level route.

- Title (from the user's doc): "Art Partner Program for Interior Designers | Artace Studio"
- Description (from the user's doc): "Partner with Artace Studio for handcrafted, bespoke canvas art built for your projects. Trade perks, priority turnaround, white-glove delivery."
- `alternates.canonical` via `buildSiteUrl("/interior-designer-partnership")`.
- `FAQPage` JSON-LD from the FAQ content (Section 11), same `<script type="application/ld+json">` pattern already used on `/custom-portraits` and `/art-care`.
- No `Organization` schema addition — out of scope for this page; the user's doc says "site-wide if not already present," which is a separate, unscoped decision.

### 2. Page sections (final list, top to bottom)

1. **Hero** — H1, subhead, primary CTA ("Become a Design Partner" → scrolls to the Final CTA form), secondary text link ("See How It Works" → scrolls to Section 6).
2. **Trust Bar** — "10+ Designer Collaborations · 21+ Metro Cities Served · 100% Handcrafted, 0% Mass-Produced," numbers count up on scroll into view.
3. **The Gap** — 3 pain-point bullets + closing line, staggered fade-up.
4. **Who We Are** — studio description + directional clip-path photo reveal (see Animations below for the brushstroke-mask simplification).
5. **What We Offer** — 3 cards (Ready-to-Acquire Originals / The Studio Masterpiece / Accessible Artistry), scale+fade in, hover-lift.
6. **The Process** — 5-step sticky-scroll timeline (Vision Consultation → Sketch & Concept Approval → Palette Confirmation → Creation with Updates → Final Reveal & Delivery), scroll-linked line draw, active-step highlight.
7. **Why Designers Choose Artace** — 4 icon+text pairs, staggered fade-up.
8. **Partnership Perks** — icon grid (5 perks from the doc), staggered pop-in (see Animations below for the SVG-line-draw simplification).
9. ~~Portfolio~~ — omitted this launch.
10. ~~Testimonials~~ — omitted this launch.
11. **FAQ** — reuses `components/seo/FAQSection.tsx` verbatim with the 6 Q&As from the doc, turnaround answer generalized per the Context section above.
12. **Final CTA** — H2/subhead + application form (Section 3 below), staggered field fade-in.

### 3. Final CTA form → backend (mirrors the existing Trade Program pattern exactly)

**Fields** (from the doc): Name, Studio/Firm Name, City, Project Type, Email, Phone, Upload Mood Board (optional).

- New component `components/design-partners/DesignPartnerForm.tsx` — modeled directly on `components/trade/TradeApplicationForm.tsx` (same visual style, same `idle/submitting/success/error` state machine, same `FormData`-from-form-element submit pattern), plus one addition: an optional mood-board upload using the existing, unmodified `components/custom-order/ImageUpload.tsx` (`maxFiles={1}`, since this is a single reference upload, not a multi-photo gallery).
- New endpoint `lib/api-route-handlers/design-partners/route.ts` — structurally identical to `lib/api-route-handlers/trade-leads/route.ts`: validate required fields (name, email, phone, city, project type) → insert into Supabase → send a Resend notification email to the configured contact address → return `{ok: true}` or a clear error. Registered in `app/api/[[...path]]/route.ts` as `"design-partners"`, alphabetically ordered with the other routes.
- New Supabase table `design_partner_applications`, shipped as a `.sql` file under `supabase/` for the user to run by hand (same handoff as every other new table this engagement): `full_name`, `studio_name`, `city`, `project_type`, `email`, `phone`, `mood_board_url` (nullable), `message` (nullable, optional free-text field — every other lead form on this site has one, so this stays for consistency), `user_agent`, `ip_address`, timestamps.
- **Manual review, no automation** — matches Trade/Custom Order/Custom Portraits: applications land in Supabase + a notification email, the team follows up directly. No commission tracking, no referral codes, no auto-approval.

### 4. Animation approach

Framer Motion (`framer-motion`, already a project dependency) covers nearly everything in the doc directly:

- **Hero**: slow Ken Burns zoom on the background image via `animate={{scale: [1, 1.08]}}` over a long linear duration; headline/subhead `initial/animate` fade-up staggered ~150ms; CTA gold-fill hover via CSS transition (matches existing button hover patterns site-wide).
- **Trust Bar**: a small reusable `CountUpNumber` component using Framer Motion's `useInView` to trigger a count from 0 to the target once, on first scroll into view.
- **The Gap / Why Designers Choose Artace / Partnership Perks**: `whileInView` + `staggerChildren` variants — the same fade-up-on-scroll pattern used elsewhere, nothing new architecturally.
- **What We Offer cards**: `whileInView` scale+fade in, `whileHover` lift + shadow.
- **FAQ**: unchanged — `FAQSection` already has accordion expand/collapse with a rotating chevron.
- **Final CTA**: form fields fade in via `whileInView` stagger; submit button gets a gold micro-interaction on hover (CSS, matching existing button patterns); background stays the site's standard off-white rather than introducing a new canvas-texture image asset that doesn't exist yet.

**Two deliberate simplifications from the doc**, called out explicitly rather than silently substituted:

- **Section 4's "paintbrush-stroke wipe mask" reveal** → a directional `clip-path` reveal (e.g., a clean diagonal or left-to-right wipe) animated via Framer Motion on scroll into view, instead of a literal brushstroke-shaped mask. A true brushstroke mask requires a bespoke illustrated SVG asset that doesn't exist; a crisp geometric wipe reads as an intentional, gallery-style reveal without inventing art assets mid-implementation.
- **Section 8's "icons draw themselves (SVG line-draw)"** → the perk icons come from `lucide-react` (the icon set used everywhere else on this site), whose components don't expose per-path SVG data for a true `pathLength` stroke-draw animation without forking each icon individually. Icons instead do a staggered spring scale+fade "pop-in" (`initial={{scale: 0.8, opacity: 0}}` → `animate={{scale: 1, opacity: 1}}`, staggered per icon) — same deliberate, one-at-a-time reveal feel, built entirely from existing components.

**Built as designed, no simplification**: Section 6's sticky-scroll process timeline. New component `components/design-partners/ProcessTimeline.tsx`: a sticky vertical line whose fill height (or `scaleY`) is driven by Framer Motion's `useScroll` + `useTransform` mapped to the section's scroll progress, with each of the 5 steps highlighting as the scroll progress crosses its threshold. This is the centerpiece of a process-heavy B2B pitch and is fully achievable with Framer Motion's built-in scroll utilities — no new dependency.

### 5. Nav placement

Add one entry to `businessLinks` in `components/navbar.tsx` (alongside Trade Program, Corporate & Bulk Orders, Affiliate Program, Art Rentals):

```ts
{
  name: "Design Partner Program",
  href: "/interior-designer-partnership",
  tagline: "Handcrafted, bespoke canvas art built for the projects you design.",
},
```

Renders automatically in both the desktop "Business" mega-menu panel and the mobile "For Business" accordion — no other nav files need touching (confirmed generic rendering over this array, established during the mega-nav rebuild).

## Out of scope

- No Portfolio gallery or Testimonials carousel this launch (Sections 9-10) — no real photos or quotes exist yet. Revisit once the user has real material; each would be its own small addition to this page, not a redesign.
- No automated commission/referral tracking for the "commission on referred projects" perk — manual, per the "fully separate program" decision.
- No changes to `/trade` or `/affiliates` beyond nothing — this page is additive only.
- No `Organization` schema site-wide audit — unscoped, separate concern.
- No bespoke brushstroke-mask illustration asset or per-icon SVG line-draw fork — the two named simplifications above stand as the final design, not an interim compromise to revisit immediately.

## Standing project constraints (carried forward)

- No `git commit`/`git push` — the user reviews and commits/pushes everything themselves.
- No test framework — verification via `npx tsc --noEmit` and live dev-server checks on a fresh port, checking `netstat -ano | grep ":3000"` first and never touching that PID.
- Reuse existing components/utilities directly rather than rebuilding: `FAQSection`, `ImageUpload`, `/api/upload-image`, the `TradeApplicationForm`/`trade-leads` lead-capture pattern, `buildSiteUrl`.
