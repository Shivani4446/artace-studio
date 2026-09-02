# Website Pages & Engagement Knowledge

A running reference for this Artace Studio engagement — every page/feature built, the decisions behind them, the technical patterns established, and the environment quirks discovered along the way. Written so a fresh session (or a human) can pick up context quickly without re-deriving it.

**Site**: [artacestudio.com](https://artacestudio.com) — Next.js/React e-commerce site for handcrafted Indian paintings.
**Backend**: WooCommerce at `api.artacestudio.com`, accessed only via REST APIs (no file/FTP/SSH/DB access) — Store API (public) for storefront reads, Admin API (Basic Auth, Consumer Key/Secret) for orders/products/categories.
**Repo**: `D:\Artace Studio\artace-studio` (not a git repo in this sandbox — no `.git` here; the user manages version control themselves).

---

## Standing rules for anyone working in this repo

- **Never `git commit`/`git push`** — the user reviews and commits/pushes everything themselves, always. (Also recorded in persistent memory: `feedback_commits_user_handles.md`.)
- When commits/PRs *are* made (by the user, following this session's work): commit messages end with `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`; PR descriptions end with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- **Never touch port 3000** — it's the user's own persistent dev server. Always `netstat -ano | grep ":3000"` first, record the PID, and reconfirm it's unchanged after any work. Use a fresh, incrementing port for all own testing (this engagement has climbed from ~3020 into the high 3030s).
- **No test framework in this project.** Verification is always: `npx tsc --noEmit` (filter out the pre-existing known errors below) plus live dev-server checks via Playwright on a fresh port.
- **Never run `npm run build` or `rm -rf .next` while port 3000 may be running** — a real incident early in this engagement corrupted the shared `.next` cache this way. Clear `.next` only after confirming port 3000 is not listening.
- **Feature workflow**: classify the request (spike / bounded / architectural) → for architectural work: clarifying questions → 2-3 approaches → design presented in chat → written spec doc (`docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`) → user approval → implementation plan (`docs/superpowers/plans/YYYY-MM-DD-<topic>.md`) → **inline execution** (not subagent-driven-development, since commits happen only by the user) → verify each task with `tsc` + live checks. Bounded/trivial changes skip the spec/plan files but still get a short design + explicit approval before touching code.
- **Never fabricate business data** — no invented stats, testimonials, portfolio photos, or turnaround times. Always ask for the real number, or omit the section/claim until real data exists.
- **WooCommerce category gotcha**: assigning a category by `slug` silently fails; must use the numeric `id`. When bulk-assigning categories, always merge with the product's *existing* categories array — never replace it outright (a real bug this engagement hit once, wiping a product's Photography categorization).

### Known pre-existing `tsc --noEmit` noise (always filter out, never "fixed" by this engagement's work)
- `.next/types/**` — stale generated-type noise, clears itself on a clean `.next` (only rebuilt when port 3000 is confirmed not running).
- `app/samora/shop/[slug]/page.tsx` (~line 352) — `WooStoreProduct` type mismatch.
- `app/warli-paintings/page.tsx` (~line 129) — `WooStoreImage` missing `name`.
- `components/navbar.tsx` (~line 1213-1226, shifts as the file changes) — `SearchSuggestion` missing `name`.

---

## Tech stack & core architecture

- **Next.js 15.5.2** App Router, TypeScript, **Tailwind CSS 4**, deployed to Cloudflare Pages (`@cloudflare/next-on-pages`), Edge runtime on API routes/middleware.
- **Framer Motion** (`framer-motion`, already a dependency) — established animation patterns: `useReducedMotion()` guards on every animated component, `whileInView` + `viewport={{once:true}}` for scroll-triggered reveals, `useScroll`/`useTransform` for scroll-linked effects (the sticky-timeline "line draws itself" pattern, first built in `components/homepage/ArtaceJourney.tsx`, reused for Interior Designer Partnership's process section), `useInView` + `animate()` for count-up numbers.
- **lucide-react** for all icons.
- **Razorpay** for payments — **live keys only, no sandbox/test mode** on this account. Never trigger a real payment during automated testing; use isolated `set_paid: false` test orders via the Admin API instead, verify, then delete (`?force=true`).
- **Supabase** for lead-capture tables. ⚠️ **`SUPABASE_URL` fails DNS resolution from this specific sandbox** (confirmed via a raw `curl` returning in 0.005s — instant failure, not a timeout). This affects live end-to-end verification of every Supabase-backed form built here (Custom Portraits, Trade, Design Partners) — the code is correct and mirrors already-proven patterns, but true confirmation requires the user testing on their own server.
- **Resend** for transactional/notification emails on lead-capture forms.

### API routing pattern
- Single catch-all: `app/api/[[...path]]/route.ts` — a `ROUTES` map dispatches `path → handler`, imports alphabetized, entries alphabetized. Every new endpoint gets one import line + one map entry here.
- Individual handlers live at `lib/api-route-handlers/<name>/route.ts`, `export const runtime = "edge"`.

### Checkout / payment pattern (established once, reused everywhere)
- `unitPrice` on a checkout line item → server computes `subtotal`/`total` = `(unitPrice * quantity).toFixed(2)` and WooCommerce honors it over catalog price. Proven mechanism, reused for Prints, Custom Portraits deposits, etc.
- `/api/checkout` — main authenticated checkout (requires login), creates WooCommerce order + Razorpay order, notes carry `{woo_order_id, woo_order_key, woo_order_number}`.
- `/api/checkout/verify` and `/api/razorpay/webhook` — **fully generic**, keyed only by `woo_order_id`/`woo_order_key`, not tied to the cart flow. Reused **unmodified** by every guest-checkout flow built since (Custom Portraits, Design Partners would follow the same shape if they ever needed a real-time payment instead of a manual-review lead).
- Shared utils: `utils/woocommerce-checkout.ts` (`createWooCommerceOrder`, `getWooCommerceOrder`, `updateWooCommerceOrder`, `mergeWooMetaData`, `parseAmountToMinorUnits`, `sanitizeText`, `ensurePositiveInt`), `utils/razorpay.ts` (`createRazorpayOrder`, `getRazorpayPublicConfig`, `verifyRazorpayPaymentSignature`, `verifyRazorpayWebhookSignature`), `lib/site.ts` (`buildSiteUrl`).

### Reusable UI building blocks
- `components/seo/FAQSection.tsx` — accordion FAQ with rotating chevron, `{title, items: {question, answer}[]}`. Reused on every content page (Reviews, Trade, Custom Portraits, Art Care, Interior Designer Partnership).
- `components/custom-order/ImageUpload.tsx` + `lib/api-route-handlers/upload-image/route.ts` — drag/drop/paste photo upload → Supabase Storage bucket `reference-images`, returns public URLs. Reused for Custom Portraits' reference photo and Design Partners' mood board.
- Lead-capture form pattern (`components/trade/TradeApplicationForm.tsx` is the reference): `idle/submitting/success/error` state machine, `FormData`-from-form-element submit, POSTs JSON to its own `/api/<name>` endpoint which validates → inserts to Supabase → sends a Resend notification → returns `{ok:true}`/`{error}`.

---

## Pages & features built this engagement

### Trustpilot rating badge (photography product pages)
Real Trustpilot business account confirmed by user — 4.5★, profile `https://www.trustpilot.com/review/artacestudio.com`. Badge uses the real fetched Trustpilot logo asset and official dark-green brand color. Link-out only (no live embedded widget).

### `/reviews`
Trust bar, USPs, "purchased" strip with a Google review CTA (`https://g.page/r/CREUQjoV-JtBEBM/review`), 19-question FAQ, top-categories chip strip. Established the **20,000+ Global Collectors** stat reused on every later trust bar (Trade, Custom Portraits, Art Care).

### `/trade` — Trade Program
India-focused, modeled after researching `saatchiart.com/en-in/trade` then deliberately built better/more specific: **flat 15% discount** (a real, specific number vs. Saatchi's vague "tiered discounts"), manual application review (not instant self-serve), no fabricated case studies. Application → `trade_applications` Supabase table + `/api/trade-leads`. Later: the "Interior Designers & Architects" qualifying card was turned into a link (with an arrow icon) to `/interior-designer-partnership` once that page existed.

### Affiliate Program (4 phases) — `/affiliates`
Researched against `exoticindiaart.com/affiliate-program`. Phase 1: referral cookies, checkout commission-logging hook. Phase 2: affiliate-facing dashboard + application. Phase 3: admin ledger + payout details, password-gated admin panel (`ADMIN_PANEL_PASSWORD` env var, SHA-256 session token, `lib/admin/auth.ts`). Phase 4: public `/affiliates` marketing page.

### Homepage tweaks
- `ShopByArtist` redesigned from large squares to small round avatars.
- Vekkas M's profile photo swapped to a user-supplied file (later the artist's `slug` was also independently renamed by the user — intentional, not to be reverted).
- Two background images (`AboutUsPanel`, About Us hero) swapped to a user-supplied artwork photo (`/Artace-studio-artwork.png` — note the final hyphenated filename, after the user renamed it from a space-containing name).
- `ShopByPrice` ("Shop by Budget") cards had an unintended watermark — root-caused to the sitewide `ProductImageProtection` script's CSS selector (`.relative.overflow-hidden.rounded-\[12px\]`) accidentally matching these cards; fixed with a scoped class rename (`rounded-xl`, visually identical) rather than touching the shared watermark script.
- Homepage hero H1 later brought into the sitewide H1 standard (see below).

### `/custom-portraits` — Custom Portraits estimator + deposit flow
Single/Couple/Family/Baby portraits, hand-painted from a customer photo.
- **Pricing (real, user-confirmed, must not be altered)**: base size 12″×12″; base prices Single ₹4,500 / Couple ₹5,500 / Family ₹6,800 / Baby ₹4,000; any other size scales proportionally by area from that base (`estimatedPrice = round(basePrice * area / 144)`). Deposit = 10% of the estimate, computed authoritatively server-side (client shows a live preview only).
- **Payment architecture**: one hidden WooCommerce product ("Custom Portrait Deposit," id **4317**) with the price overridden per order via the `unitPrice`/`subtotal`/`total` mechanism. Two real findings while building it:
  - `catalog_visibility: "hidden"` is **not honored** by this store's Store API (still appeared in listings/search) — fixed by setting `status: "draft"` instead, which *is* properly excluded, and still works fine for server-side Admin-API order creation (draft status doesn't block that).
  - WooCommerce auto-added 12% tax on top of the deposit override by default — fixed by setting `tax_status: "none"` on the product (the real balance/tax is handled later on the manually-invoiced final sale).
- New guest-friendly endpoint `/api/custom-portraits` (no login required, unlike the main `/api/checkout`) creates the WooCommerce + Razorpay order, then hands off to the **existing, unmodified** `/api/checkout/verify` and Razorpay webhook.
- New Supabase table `custom_portrait_requests`.
- After deposit: team manually reviews the photo, finalizes exact price, invoices the balance — no automated balance payment. Refund policy is manual/team-processed, described in copy only.

### `/art-care` — Art Care Guide
Followed through on a gap flagged in the site's own `SEO-audit.txt` ("Painting Care & Maintenance Guide" quick-win). Sections: General Care Basics, Caring for Art in India's Climate (monsoon humidity, pest prevention — a real differentiator vs. the `crafttatva.com/pages/art-care` reference page), Care by Medium (Canvas/Photography/Custom Portraits), When to Call a Professional (generic, no named restoration service), 10-question FAQ. Content kept consistent with the pre-existing product-page "Care Instructions" tab copy. Linked from: navbar Resources dropdown, footer Resources section, the product page Care Instructions tab (highest-intent placement), and About Us's "Our Commitment" section.

### Mega Nav restructure (`components/navbar.tsx`)
Removed the per-item one-line descriptions from every desktop dropdown (Collections, Shop Art, Resources) to make room for more content. New top-level structure: **Collections → Shop Art → Commissions → Business → Resources** (Home and Contact were later removed as standalone items — Contact folded into Resources; the logo already links home).
- **Shop Art** dropdown gained "Shop by Artist" and "Shop Worldwide" (UK/Ireland/NZ) sub-rows — previously nowhere in the nav at all.
- **Commissions** (new) — Custom Paintings, Custom Portraits.
- **Business** (new, later renamed target for "For Business") — Trade Program, Design Partner Program, Corporate & Bulk Orders, Affiliate Program, Art Rentals (the last two used to be tiny promo cards buried inside Shop Art).
- **Resources** — About Us, Team, Exhibition, Blogs, Art Care Guide, Warli Paintings, Reviews, Contact.
- Follow-up fixes: a horizontal-overflow bug appeared once the nav grew to 7 (later 6, then 5) top-level items at 1024–1279px widths — fixed with shorter labels, `whitespace-nowrap`, and width-tiered reductions to nav gap/search-bar width, carefully avoiding Tailwind's `xl` breakpoint (1280px) since a naive fix landed exactly on that boundary and silently didn't apply at the tested 1280px width. Also removed a dangling border under the last row of Shop Art's 3-column category grid (`last:border-b-0` only strips the literal last child, not the whole visual row — fixed with `[&:nth-last-child(-n+3)]:border-b-0`). **Known, not-yet-fixed**: the Painting Collections panel has the identical last-row-border bug (2-column grid) — flagged to the user, not actioned since it wasn't asked for.
- Reduced the shared dropdown-panel outer padding (`px-6 py-8 md:px-12` → `px-4 py-5 md:px-6 md:py-6`) for a "crisper" look, per explicit request.

### `/interior-designer-partnership` — Design Partner Program
A **fully separate, standalone program** from Trade and Affiliates (explicit user decision) — Trade is a flat discount for self-serve buyers, Affiliates is a public referral link, this is a relationship-based, designer-specific pitch with a real process and perks. "Commission on referred projects" here is manual/negotiated marketing copy, **not** wired into the Affiliate Program's referral-code/commission-tracking engine.
- Built from a complete user-supplied content plan (section copy, animation direction, SEO metadata all specified in advance).
- Sections: Hero (Ken Burns zoom background), Trust Bar (real numbers: **10+ Designer Collaborations, 21+ Metro Cities Served, 100% Handcrafted/0% Mass-Produced**), The Gap, Who We Are, What We Offer (3 cards), The Process (5-step sticky scroll-drawn timeline, modeled directly on `ArtaceJourney.tsx`), Why Designers Choose Us, Partnership Perks, FAQ, Final CTA/application form. **Portfolio and Testimonials sections intentionally omitted** — no real project photos or designer quotes exist yet; do not fabricate them when adding later, ask for real material first.
- Two animation simplifications from the original brief, made deliberately rather than silently: the "paintbrush-stroke wipe mask" reveal became a clean directional `clip-path` wipe (no bespoke illustrated asset existed); "icons draw themselves (SVG line-draw)" became a staggered spring scale/fade pop-in (`lucide-react` icons don't expose per-path data for a true `pathLength` stroke-draw without forking each icon).
- Backend: `design_partner_applications` Supabase table + `/api/design-partners`, same lead-capture pattern as Trade.
- Added to the Business nav dropdown; linked from Trade's "Interior Designers & Architects" card.
- Post-launch fixes: hero content wrapper was using Tailwind's `max-w-7xl` (1280px) instead of the sitewide `max-w-[1440px]` pixel convention used by every other section on the page; separately, an extra `lg:px-20` on the hero (absent from every sibling section) was indenting its text further than everything below it at desktop widths — both fixed. CTA button changed from gold to the site's white/light-on-dark-hero primary button style (matching Custom Portraits' hero button).
- **Known, not-yet-fixed**: About Us's hero (`Abouthero.tsx`) has the identical `max-w-7xl`/extra-`lg:px-20` container-width inconsistency that was fixed here — flagged, not actioned (out of scope of what was asked).

### Sitewide H1 standardization
An audit found ~57 files with `<h1>`, wildly inconsistent in size across true marketing/landing heroes (some `36px→56px`, some using `rem` units, some Tailwind's semantic scale, some with extra breakpoint steps or `font-semibold`). Scope was explicitly confirmed with the user: **standardize only marketing/landing hero H1s** (21 files: Homepage, About Us, Contact Us, Collections, Team, Exhibition, Shop, Search, Artists ×2, Corporate & Bulk Orders, Rentals, Warli Paintings, all 4 Room pages, all 3 Worldwide pages, Trade/Custom Portraits/Art Care/Reviews/Affiliates *(already correct, used as the reference)*, Interior Designer Partnership) to **`font-display text-[36px] leading-[1.1] md:text-[56px]`** — the scale 5 of the most-recently-built pages already shared. Utility/account pages (Cart, Wishlist, Checkout, Login, Signup, Password reset, Admin, Dashboard), blog/article titles, and the inline product-page title were deliberately left untouched — they serve a different purpose than a hero. Verified with 30 direct `getComputedStyle` measurements across 24 pages at two viewport widths — zero mismatches.

---

## Environment quirks discovered (none were bugs in this engagement's own code)

- **CSS/build-cache corruption** (real incident): caused by running `npm run build` + `rm -rf .next` while the user's port-3000 dev server was live — established the standing rule above.
- **Local dev-sandbox-only Next.js image-optimizer hang**: `/_next/image` requests carrying a browser-like `Accept: image/avif,...` header hang indefinitely for a few specific files *only in this sandbox* — confirmed via direct curl comparison (local vs. production, with/without the header) that production is unaffected. Not a real bug; do not "fix."
- **WordPress backend total outage** (`api.artacestudio.com` unreachable at the TCP level): confirmed via direct network testing to be a server/hosting-level outage, not something caused by this engagement's REST-API-only access.
- **Supabase DNS unreachable from this sandbox** — see Tech Stack section above.
- **`tailwindcss@4.2.1` bug**: `RangeError: Invalid code point` crash inside Tailwind's own bundled `markUsedVariable`, triggered purely by this sandbox's unusually new Node runtime (`v26.1.0`) — root-caused by reproducing it with an isolated PostCSS script that crashed even with **zero project files** involved (just Tailwind's own default theme). Fixed by upgrading `tailwindcss` 4.2.1→4.3.3 and `lightningcss` 1.31.1→1.33.0 (both already inside `package.json`'s declared ranges — a lockfile update, not a version-policy change). Required the user to restart their own dev server to pick up the new binaries.
- **Transient dev-server webpack contention**: firing many rapid sequential page navigations/compiles at one dev server (e.g., an automated multi-page audit script) can produce `ENOENT`/timeout hiccups that look like real breakage but resolve on their own or with a clean restart — not a code defect. Same root cause explains a one-off `ENOENT: .next/server/app/trade/page.js` error the user hit once right after an edit (a hot-reload race, resolved on refresh).

---

## Pending / deferred (flagged but not actioned — only touch if asked)

- Painting Collections dropdown panel's last-row border bug (same class of fix as Shop Art's, not yet applied).
- About Us hero's container-width inconsistency (`max-w-7xl` + extra `lg:px-20`, same class of fix as Interior Designer Partnership's hero, not yet applied).
- Interior Designer Partnership's Portfolio and Testimonials sections — build once real photos/quotes exist; never fabricate placeholders.
- Real end-to-end payment/submission tests still needed on the user's **own live server** (not this sandbox, due to the Supabase DNS issue) for: Custom Portraits deposit checkout, Design Partners application form. Also confirm `supabase/design_partner_applications.sql` (and any other not-yet-run `.sql` files under `supabase/`) has been run in the Supabase SQL editor.

---

## Design specs & implementation plans on file

Every architectural feature above has a paired spec + plan under `docs/superpowers/specs/` and `docs/superpowers/plans/`, named `YYYY-MM-DD-<topic>-design.md` / `YYYY-MM-DD-<topic>.md` — check there first for exact copy, field lists, and task-by-task implementation detail before rebuilding or extending any of the above.
