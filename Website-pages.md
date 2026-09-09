# Website Pages & Engagement Knowledge

> **Related project docs:** this is the most current, actively-maintained running log of this engagement's work — trust this one first if it disagrees with another doc. [features-context.md](features-context.md) has deeper session conventions and WooCommerce API notes from an earlier session thread. [PROJECT-RESUME.md](PROJECT-RESUME.md) is a business/product overview. [Samora-context.md](Samora-context.md) covers the separate Samora sub-brand. [suggestion.md](suggestion.md) tracks the SEO/technical/feature improvement backlog and doubles as a running log of everything fixed from it.

A running reference for this Artace Studio engagement — every page/feature built, the decisions behind them, the technical patterns established, and the environment quirks discovered along the way. Written so a fresh session (or a human) can pick up context quickly without re-deriving it.

**Site**: [artacestudio.com](https://artacestudio.com) — Next.js/React e-commerce site for handcrafted Indian paintings.
**Backend**: WooCommerce at `api.artacestudio.com`, accessed only via REST APIs (no file/FTP/SSH/DB access) — Store API (public) for storefront reads, Admin API (Basic Auth, Consumer Key/Secret) for orders/products/categories.
**Repo**: `D:\Artace Studio\artace-studio` — a real git repo with a GitHub remote (`github.com/Shivani4446/artace-studio`, branch `main`); the user manages all commits/pushes themselves. (An earlier version of this doc said "not a git repo" — that was checked from the wrong directory, the parent `D:\Artace Studio`, which itself has no `.git`; the project subdirectory does.)

---

## Standing rules for anyone working in this repo

- **Never `git commit`/`git push`** — the user reviews and commits/pushes everything themselves, always. (Also recorded in persistent memory: `feedback_commits_user_handles.md`.)
- When commits/PRs *are* made (by the user, following this session's work): commit messages end with `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`; PR descriptions end with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- **Never touch port 3000** — it's the user's own persistent dev server. Always `netstat -ano | grep ":3000"` first, record the PID, and reconfirm it's unchanged after any work. Use a fresh, incrementing port for all own testing (this engagement has climbed from ~3020 into the high 3030s).
- **No test framework in this project.** Verification is always: `npx tsc --noEmit` (filter out the pre-existing known errors below) plus live dev-server checks via Playwright on a fresh port.
- **Never run `npm run build` or `rm -rf .next` while port 3000 may be running** — a real incident early in this engagement corrupted the shared `.next` cache this way. Clear `.next` only after confirming port 3000 is not listening.
- **Never run `next build`, `next dev`, `next start`, or `npx playwright test` (its webServer does `next build && next start`) in this project directory without asking the user first, every single time.** Added after **two separate real incidents**: the first from an explicit `rm -rf .next` while the user's server was live; the second from simply running the Playwright e2e suite while the user's server was live — no `rm -rf` involved at all, the concurrent `next build` alone crashed it (both processes share the same `.next` directory). The user restarts their own server themselves; never attempt to fix it from this side. This applies to *every* task with a live-check step, not just a one-time caveat — see the PayU gateway entry below for a plan explicitly written with this constraint baked into every task.
- **Never paste or ask for real credential values in chat.** A real incident: the user pasted what they believed was a PayU "salt" — it was actually a PEM-formatted RSA private key. They were told to treat it as exposed, rotate whatever system it belongs to, and add real secrets directly to `.env.local` (and Cloudflare Pages' env vars for production) instead of chat. Specs/plans/code reference only environment variable *names*, never values.
- **Feature workflow**: classify the request (spike / bounded / architectural) → for architectural work: clarifying questions → 2-3 approaches → design presented in chat → written spec doc (`docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`) → user approval → implementation plan (`docs/superpowers/plans/YYYY-MM-DD-<topic>.md`) → **inline execution** (not subagent-driven-development, since commits happen only by the user) → verify each task with `tsc` + live checks. Bounded/trivial changes skip the spec/plan files but still get a short design + explicit approval before touching code.
- **Never fabricate business data** — no invented stats, testimonials, portfolio photos, or turnaround times. Always ask for the real number, or omit the section/claim until real data exists.
- **WooCommerce category gotcha**: assigning a category by `slug` silently fails; must use the numeric `id`. When bulk-assigning categories, always merge with the product's *existing* categories array — never replace it outright (a real bug this engagement hit once, wiping a product's Photography categorization).
- **When indirect research (WebFetch/WebSearch summaries) can't be trusted for an exact technical detail** (e.g. an exact repeated-character count in a hash formula), don't guess from a second or third fetch — find one complete worked example with a real, independently-checkable *output* and brute-force/verify against that directly. See the PayU gateway entry below for a real case where this was the only way to resolve a genuinely contradictory spec.

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

### Canvas Rolls hero alignment
The hero image/subhead overlapped specifically at 1024–1279px. Reverted to a single full-bleed hero image (`object-cover object-[30%_center]`, gradient overlay removed per explicit request — "keep the image as hero section background," not a separate zoomed element), and made the subhead copy responsive via three conditional `<span>` elements (`lg:hidden` / `hidden lg:inline xl:hidden` / `hidden xl:inline`) so the text never collides with the product at that specific width band. Confirmed clean at all widths via screenshots.

### `suggestion.md` — full-site SEO/technical/feature audit
A comprehensive audit ("what should be improved SEO-wise, tech-wise, and what features would make this the best ecommerce site for paintings") produced `suggestion.md` at the project root, then worked through almost entirely: SEO §1.1–1.6 and technical §2.1–2.9 are marked done, including a dynamic sitemap (197 entries, was static), Service/Person schema, hreflang tags, third-party scripts converted to `next/script`, security headers, Web Vitals reporting, a PWA manifest, a skip-link, and CI. Two engagement-wide changes came out of the technical section and are documented as their own subsections below: the **Playwright e2e suite** and the **build-safety net**. The suggestion doc's "Section 3" growth-feature ideas were built in the order the user chose — **Loyalty → Gift Cards → View in Your Room** — each documented below; **§2.7 (PayU second gateway)** is the current, still-in-progress item. Treat `suggestion.md` as the up-to-date checklist of what remains from the original audit.

### Playwright e2e suite (`e2e/`, `playwright.config.ts`)
Added per `suggestion.md` §2.3 — this project has no other test framework. Suites: checkout, custom-portraits, lead-capture-forms, rewards-checkout, gift-cards, view-in-your-room (13 tests total). Fully mocked at the network boundary (Razorpay/WooCommerce stubbed) — safe to run in CI, never places a real order or payment. **The config's `webServer` runs `next build && next start -p 3100`**, which is exactly what shares the `.next` cache with the user's live dev server and has caused a real crash — see the new standing rule above; always ask before running `npx playwright test` in this directory. Two gotchas hit while building it: `devices["iPhone 13"]`'s full object can't be spread into a nested `describe`'s `test.use()` (it includes `defaultBrowserType`, which Playwright refuses there) — destructure that key out first; mocking `navigator.mediaDevices` as unavailable requires `Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: undefined })` — a plain assignment or `delete` silently no-ops in Chromium because the property is getter-only.

### Build-safety net re-enabled
`next.config.ts`'s `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` were flipped from `true` back to `false` per `suggestion.md` — real type/lint errors now block production builds instead of being silently swallowed. This immediately caught one real, pre-existing bug from parallel work (`components/samora/SamoraTrackOrder.tsx` had unescaped-apostrophe lint errors) — fixed directly since it was blocking every build, not just this engagement's.

### Artace Rewards (Loyalty Program) — `/rewards`
Fully custom points system (not a plugin). **Rules, user-confirmed, must not be altered**: 1 point per ₹100 spent (`POINTS_PER_RUPEE_SPENT = 0.01`), 1 point = ₹1 discount (`POINT_VALUE_INR = 1`), 100-point minimum redemption (`MIN_REDEMPTION_POINTS`), no expiry, every order earns with no exclusions, redemption is a separate "Apply Points" control independent of coupons, scoped to the main Artace checkout, program name "Artace Rewards."
- **Architecture**: `rewards_ledger` Supabase table — append-only audit trail; balance is always `SUM(points)` computed on read, never a stored counter. `lib/rewards/constants.ts` holds the numbers above; `lib/rewards/ledger.ts` exposes `getPointsBalance`, `creditPoints`, `debitPoints`, `calculatePointsEarned`, `clawbackPointsForOrder` (the last for order cancellations/refunds via the WooCommerce order-status webhook).
- Wired into `/api/checkout` (redemption request validated server-side against real balance, never trusted from the client), `/api/checkout/verify` (crediting/debiting on successful payment), `components/checkout/ApplyPointsBox.tsx`, the public `/rewards` page, and `app/dashboard/rewards` for logged-in customers.
- **Crediting is not gated by `storeName`** — Samora orders earn/redeem points too. This was a real gap found during Gift Cards research; rather than restrict it, the user chose to formalize Samora's inclusion in the spec.
- **Real bug found and fixed**: points redemption was validated only against the customer's balance, never against the order's own subtotal — a customer could push an order's payable total to zero or negative. Fixed by extracting `lib/checkout/subtotal.ts`'s `calculateOrderSubtotal`, computed once per checkout and shared by both the points cap and the gift-card cap check (see below) so a combined discount can't exceed the order total either.

### Gift Cards — `/gift-cards`
**Rules, user-confirmed**: customers can purchase them; fixed denominations only — ₹1,000 / ₹2,500 / ₹5,000 / ₹10,000; redeemed via a code entered at checkout; declining balance, remainder carries forward; no expiry; emailed to the purchaser only (no separate recipient-delivery flow); no refunds on purchase.
- **Architecture**: `gift_cards` + `gift_card_redemptions` Supabase tables (declining-balance ledger, same append-only philosophy as Rewards). One hidden WooCommerce product (`GIFT_CARD_PRODUCT_ID = 4413`) created via the Admin API, price overridden per purchase via the same `unitPrice` mechanism Custom Portraits uses. Code format `ARTACE-XXXX-XXXX-XXXX`, generated with visually-ambiguous characters excluded.
- Key files: `lib/gift-cards/constants.ts`, `code.ts`, `ledger.ts`, `email.ts`; `/api/gift-cards` (purchase) and `/api/gift-cards/balance` (lookup); `components/checkout/RedeemGiftCardBox.tsx` (checkout redemption), `components/gift-cards/GiftCardPurchaseForm.tsx` and `GiftCardBalanceChecker.tsx`, the public `/gift-cards` page, `supabase/gift_cards.sql`.
- Redemption is capped against the same `calculateOrderSubtotal` as Rewards, combined-discount-aware (see above).

### View in Your Room — product pages
**Rules, user-confirmed**: live camera view (AR-style, not a 3D/AR-kit placement), camera feed plus a manual overlay the customer can resize/rotate freely — explicitly framed as a *visual reference*, not scale-accurate — placed on each product page near the size selector, with a "Save Photo" share button, mobile-only to start.
- Key files: `utils/product-size.ts` (hoisted `parseSizeDimensions`/`inferSizeUnit` out of `SingleProduct.tsx`), `hooks/useIsMobileDevice.ts`, `components/room-preview/RoomPreviewOverlay.tsx` (custom Pointer-Events-based drag/resize/rotate — all math is container-relative via `getBoundingClientRect()`, deliberately never mixing viewport and container coordinate spaces), `utils/room-preview-capture.ts` (canvas compositing + Web Share API with a download fallback), `components/room-preview/ViewInYourRoomModal.tsx`, integrated into `components/singleproduct/SingleProduct.tsx`.
- **Real production bug, user-reported live**: `navigator.mediaDevices` is `undefined` outside a secure context (non-HTTPS, non-localhost) — calling `.getUserMedia` on it threw a synchronous `TypeError` before any `.catch()` could ever attach, crashing the feature on click. Root-caused and fixed with an explicit guard (`if (!navigator.mediaDevices?.getUserMedia)`) plus a new `"unsupported"` camera state, distinct from `"denied"`, with its own clear messaging. Covered by a new e2e test (see the Playwright gotcha above for why the obvious mocking approach didn't work).

### PayU — second payment gateway (in progress)
Second checkout option alongside Razorpay, customer's explicit choice via two buttons at checkout — **PayU's standard hosted checkout**, a hash-based redirect flow (merchant computes a SHA-512 hash server-side, the browser auto-submits an HTML form POST to PayU's own hosted page, PayU redirects back via a POST carrying a reverse hash to verify), not a JS-embeddable widget like Razorpay's. **Production credentials directly, no sandbox** — the user's explicit choice, meaning the first real transaction is real money and is deliberately left as the user's own action (same pattern as every other real-money milestone in this engagement).
- **Architecture**: extends `/api/checkout` with a `paymentGateway: "razorpay" | "payu"` field rather than forking a parallel endpoint — every existing validation/discount/order-creation step is identical regardless of gateway, only the response branches. Extracted `lib/checkout/finalize-order.ts`'s `finalizeOrderAfterPayment()` out of the Razorpay verify route (behavior-preserving refactor) so it, and the new PayU callback route, share one copy of the post-payment logic (marking the order paid, Rewards crediting/debiting, gift-card redemption/generation) instead of duplicating it.
- **A real hash-formula bug, found and fixed via empirical verification, worth remembering as a technique**: PayU's own documentation (read via WebFetch/WebSearch) gave mutually contradictory counts of the exact number of empty pipe-delimited "reserved" segments in the hash string — an artifact of WebFetch's summarization-based extraction being unreliable for exact repeated-character counts. This was resolved not by re-reading the docs a third time, but by finding one complete worked example with a real, independently-checkable *computed hash output* (`key=C0Dr8m, txnid=12345, amount=10, productinfo=Shopping, firstname=Test, email=test@test.com, udf2=abc, udf4=15, salt=3sf0jURk` → a real published SHA-512 hash) and brute-force testing candidate segment counts 0–8 against it in a throwaway script. This proved the correct formula is **6 real fields + 5 always-empty UDF slots + 5 reserved empty segments (not 6, as first assumed) + salt = 17 elements, 16 pipes** — confirmed byte-for-byte against the real hash output, the strongest verification available for a spec this exact.
- Key files: `utils/payu.ts` (`sha512Hex` via WebCrypto — plain digest, no HMAC needed; `getPayuConfig`; `PAYU_PAYMENT_URL`; `generatePayuRequestHash`; `verifyPayuResponseHash`), `lib/checkout/finalize-order.ts` (new, shared), `lib/api-route-handlers/checkout/payu-callback/route.ts` (new — always redirects, never returns JSON, since PayU POSTs here as a real browser navigation), `lib/api-route-handlers/checkout/route.ts` (extended), `lib/api-route-handlers/checkout/verify/route.ts` (refactored to call the shared finalize function), `app/checkout/checkout-client.tsx` (two payment buttons, `handlePayuCheckout`, `payuError` query-param handling).
- **Status**: all 5 implementation-plan tasks are code-complete and pass `npx tsc --noEmit`; each task's *live* verification step (a dev-server curl check, the full Playwright suite, a live UI check) is deferred pending the user's go-ahead per the new standing build/dev/test rule above. The **response (reverse) hash formula remains a derivation** from the now-confirmed request formula, not independently empirically verified the same way — flagged honestly in the spec rather than presented as equally certain; it should be confirmed the first time the user completes one real PayU transaction. Spec: `docs/superpowers/specs/2026-09-09-payu-gateway-design.md`; plan: `docs/superpowers/plans/2026-09-09-payu-gateway.md`.

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
