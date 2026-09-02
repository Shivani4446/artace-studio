# Canvas Rolls Landing Page — Design

## Context

Artace Studio manufactures and exports its own raw canvas material — a genuinely new product line, confirmed via a live catalog search to not exist anywhere in the current WooCommerce store (only finished paintings use "canvas" as a search term). The user wants a premium, aesthetically-led showcase page for this line, introducing **GSAP** as this engagement's animation library going forward (alongside, not replacing, the existing Framer Motion used elsewhere on the site).

Decisions reached with the user before writing this spec:

- **Showcase + inquiry, not e-commerce.** No WooCommerce product, no cart, no checkout. A lead-capture form ("Request Pricing & Samples") mirroring the existing Trade Program / Corporate Bulk Orders pattern — real pricing and bulk quantities are quoted manually, matching how every new-product-line page has launched on this site so far.
- **Real specs only** (provided directly by the user; nothing here is invented):
  - **Material**: 100% Cotton, 65/35 Cotton-Polyester Blend, Linen, 100% Polyester.
  - **Weave**: Tight, Medium, and Uniform Fine weave (spec sheet also lists Plain/Duck as weave-family terms) — Medium Grain is the standard finish texture.
  - **Priming**: Double Acrylic Gesso coat (spec sheet also lists Oil-based/Universal primer and up to Triple-primed as available options).
  - **Weight**: 90–600 GSM (4oz–14oz).
  - **Color**: White, Off-white, Black, Linen finish; custom color on sample.
  - **Width**: 12″ to **144″** (confirmed — corrects an initial 120″ figure from the same conversation).
  - **Roll length**: 5m to 1000m (jumbo rolls up to 1000m); pre-cut yardage 6–100 yards also available.
  - **Packing**: Tube / poly-wrap / carbonated sheet; protection acid-free/moisture-resistant/standard; custom or standard labeling.
  - **Pricing**: starts from ₹120/meter for the fine-art line — exact pricing is quote-only via the form, never shown as a fixed catalog price.
  - **Also available (secondary line)**: Digital Printing Canvas Rolls, starting ₹210/meter, MOQ 10 meters, 100% Cotton/100% Polyester/Cotton-Poly options, 200–650 GSM, Universal Gesso priming, compatible with UV/Eco-Solvent/Solvent/Latex/Pigment/Dye-Sublimation printing.
  - Manufacturing claims to carry verbatim: Made in India, eco-friendly/PVC-free/biodegradable/recyclable.
- **Real photography, 3 images provided** (viewed in full before planning placement):
  - `weave-texture-1.webp` — a single, moody, extreme close-up of the canvas unrolling on a wood surface. Most abstract/texture-forward of the three → **Hero**.
  - `open-canvas.webp` — a full studio-lifestyle shot: canvas unrolled across a rustic wooden table with a painter's palette, brushes, and a blank stretched frame in the background → **Why Our Canvas** (the craft/quality section — this image does the "real artist's studio" storytelling work).
  - `double-gesso-coat-1.webp` — a 5-panel collage including a folded-corner shot that shows the primed (whiter) front against the raw (cream) back → **Material, Weave & Priming** section, specifically illustrating the double-gesso claim.
  - No other images exist yet; no other section gets a photo (Sizes/Supply Formats and Digital Printing are spec/copy-led; FAQ+Form matches the site's established photo-free pattern for closing sections).
- **GSAP**: added as a real npm dependency (`gsap`, with the `ScrollTrigger` plugin) — both fully free with no license gate since GSAP joined Webflow in 2024. Used for scroll-scrubbed image reveals and a pinned section transition on this page specifically; existing Framer Motion elsewhere is untouched.

## Decisions

### 1. Route, metadata, nav

`/canvas-rolls` — new top-level route.

- Title: "Fine Art Canvas Rolls – Premium Cotton & Poly-Cotton Canvas | Artace Studio"
- Description mentions the material range, double-gesso priming, and bulk/export supply.
- `alternates.canonical` via `buildSiteUrl("/canvas-rolls")`.
- Added to the **Business** nav dropdown (`businessLinks` in `components/navbar.tsx`) — this is a bulk/wholesale-facing product line (Made in India, export claims, MOQ-driven pricing), matching the B2B framing of Trade Program and Corporate Bulk Orders already there. Flagged for the user to redirect to Shop Art instead if they'd rather it read as consumer-facing.

### 2. Page sections (6, top to bottom)

1. **Hero** — `weave-texture-1.webp` background with a GSAP scroll-scrubbed slow zoom (the "look at this weave" first impression). Headline: "Fine Art Canvas Rolls, Woven & Primed for the Studio." Subhead mentions cotton/poly-cotton/linen range and double-gesso priming. Primary CTA "Request Pricing & Samples" → scrolls to the form; secondary "See Specifications" → scrolls to the spec section.
2. **Why Our Canvas** — `open-canvas.webp` alongside 4 icon+text differentiators: Double Acrylic Gesso Priming, Tight/Medium/Uniform-Fine Weave, 90–600 GSM Range, Custom Widths to 144″. One line of manufacturing-credibility copy (Made in India, eco-friendly/PVC-free/biodegradable/recyclable).
3. **Material, Weave & Priming** — `double-gesso-coat-1.webp` as the anchor image; a card grid of material options (100% Cotton, 65/35 Cotton-Poly, Linen, 100% Polyester), weave types, the double-gesso coat detail, surface finish (Medium Grain standard; Fine/Ultra-Smooth/Rough Grain available on request), and color options (White/Off-white/Black/Linen finish, custom on sample).
4. **Sizes & Supply Formats** — a clean editorial spec grid (not a dense industrial table): width 12″–144″, roll length 5m–1000m (jumbo to 1000m), pre-cut yardage 6–100 yards, packing (tube/poly-wrap/carbonated sheet), protection (acid-free/moisture-resistant/standard), custom labeling. GSAP staggered reveal on the grid cells as the section scrolls into view.
5. **Also Available: Digital Printing Canvas Rolls** — a secondary teaser, visually quieter than the sections above (smaller, single-card treatment): starting ₹210/meter, MOQ 10 meters, UV/Eco-Solvent/Solvent/Latex/Pigment/Dye-Sublimation compatible. Links into the same form with "Digital Printing Canvas" pre-selectable as the product interest.
6. **FAQ + Request Pricing form** — FAQ reuses the existing `components/seo/FAQSection.tsx` verbatim (no new component). 10 questions, restricted to confirmed facts only (final copy, to be used verbatim):
   1. What materials are available? (100% Cotton, 65/35 Cotton-Polyester Blend, Linen, 100% Polyester)
   2. What priming do you use? (Double Acrylic Gesso; other primer types and coat counts available on request)
   3. What sizes can I order? (12″–144″ width; roll lengths 5m–1000m including jumbo rolls; pre-cut yardage 6–100 yards also available)
   4. What colors are available? (White, Off-white, Black, Linen finish; custom color available on sample)
   5. Is there a minimum order quantity? (No minimum for the fine-art canvas line; the Digital Printing Canvas line has a 10-meter minimum)
   6. Do you offer canvas for digital printing? (Yes — Digital Printing Canvas Rolls, compatible with UV, Eco-Solvent, Solvent, Latex, Pigment, and Dye-Sublimation printing)
   7. How is the canvas packed and protected for shipping? (Tube, poly-wrap, or carbonated-sheet packing; acid-free, moisture-resistant, or standard protection)
   8. Can I get a sample before ordering in bulk? (Yes — custom colors and finishes are available on sample request; mention this in your enquiry)
   9. How is pricing determined? (Starts from ₹120/meter for the fine-art line; exact pricing depends on material, size, and quantity — submit an enquiry for a quote)
   10. Do you supply outside India? (Yes — manufactured in India for both domestic and export supply)

   The form (Name, Company/Studio Name, Email, Phone, Product Interest [Fine Art Canvas / Digital Printing Canvas], Material preference, Quantity needed, Message) is lead-capture only.

### 3. Backend — mirrors the existing Trade Program / Corporate Bulk Orders pattern exactly

- New Supabase table `canvas_roll_enquiries` (full_name, company_name, email, phone, product_interest, material_preference, quantity, message, user_agent, ip_address, timestamps), shipped as a `.sql` file under `supabase/` for the user to run by hand.
- New endpoint `lib/api-route-handlers/canvas-roll-enquiries/route.ts`, structurally identical to `lib/api-route-handlers/trade-leads/route.ts`: validate → insert into Supabase → Resend notification email → `{ok:true}`/`{error}`. Registered in `app/api/[[...path]]/route.ts`.
- Manual review, no automation — pricing and bulk-order logistics are quoted by the team directly, matching every other lead flow on this site.

### 4. GSAP usage on this page (new pattern, scoped narrowly)

- `gsap` + `gsap/ScrollTrigger` installed via npm, registered once in a small client component wrapper.
- **Hero**: `ScrollTrigger`-scrubbed slow scale-up on the background image (replaces the Framer-Motion "Ken Burns on a timer" pattern used elsewhere with a scroll-linked version, appropriate since GSAP is the tool for this page).
- **Section 3 (Material/Weave/Priming)**: the anchor image and the spec cards animate in with a GSAP timeline (image slides/fades in, cards stagger) triggered by `ScrollTrigger` on enter.
- **Section 4 (Sizes & Supply Formats)**: staggered fade/slide-up on the spec grid cells via `ScrollTrigger`.
- No `SplitText` or DOM text-splitting — keeps text selectable/accessible and avoids over-engineering a first GSAP page. No horizontal scroll or pinning beyond a simple scroll-scrub on the hero image (YAGNI — a pinned multi-panel transition was considered and dropped as unnecessary complexity for a 6-section page).

## Out of scope

- No WooCommerce product/variant/cart/checkout for either canvas line.
- No fabricated lead times, MOQ (beyond the digital-printing line's stated 10m), or fixed catalog pricing.
- No additional photography beyond the 3 provided images — no stock photos, no AI-generated texture shots.
- No migration of existing Framer Motion animations elsewhere on the site to GSAP — this page only.

## Standing project constraints (carried forward)

- No `git commit`/`git push` — the user reviews and commits/pushes everything themselves.
- No test framework — verification via `npx tsc --noEmit` and live dev-server checks on a fresh port, checking `netstat -ano | grep ":3000"` first and never touching that PID.
