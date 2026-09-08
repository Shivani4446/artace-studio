# Artace Studio — Website Improvement & Growth Roadmap

**Methodology:** This is a direct audit of the live codebase (routes, `next.config.ts`, `middleware.ts`, the schema/SEO layer under `lib/schema/`, checkout, sitemap/robots) done September 2026 — not a generic checklist. Every finding below points at the actual file that shows it. It complements `Website-pages.md` (which documents what's already built and how) rather than repeating it; the "Pending / deferred" section of that file already lists two small UI bugs and one testing task — those are folded in below rather than re-explained.

No numbers are invented anywhere in this document. Where a recommendation would normally cite a metric (traffic, conversion rate, AOV), it's left general — plug in your real numbers before prioritizing.

---

## 1. SEO

### 1.1 Sitemap is static and misses most of the catalog — High priority — ✅ Done
[app/sitemap.ts](app/sitemap.ts) now generates dynamically: live products and categories from the WooCommerce Store API, live blog posts from the WP REST API, and artist pages from the local artist dataset, plus all the previously-missing static nav pages. Total entries went from 38 to 197 in a live test.

Two extra bugs turned up during verification and are fixed too: (1) every `/collections/[slug]` URL was checked live — the naive "all non-empty categories" approach included WooCommerce's `all-products` catch-all category and a stale, now-redirected category slug, both of which would have 404'd/308'd if crawled, so category slugs are now derived from products' own category tags (matching the page's real matching logic) with the redirected slug explicitly excluded; (2) Samora-tagged products (a separate storefront living at `/samora/shop/[slug]`, not `/shop/[slug]`) were being included as `/shop/` URLs and would have 404'd — now excluded from this sitemap. All 153 product/category URLs plus every new static/artist/blog URL were spot-checked live and return 200.

Also fixed in passing: the old file hardcoded `https://www.artacestudio.com` while every canonical tag and `robots.ts` uses the non-`www` origin (`getSiteOrigin()`) — sitemap URLs now match.

**Not included, flagged for a decision:** Samora's own product pages (`/samora/shop/[slug]`) are real and crawlable (nothing disallows them in `robots.ts`) but weren't in scope of the original audit and aren't in this sitemap either — say the word if Samora should be indexed and I'll add them the same way.


[app/sitemap.ts](app/sitemap.ts) is a hand-maintained array of ~20 static pages plus three hardcoded slug lists (`shopSlugs`, `collectionSlugs`, `roomSlugs`). It does **not** include:
- Individual product pages (`/shop/[slug]`) — the actual money pages.
- Artist pages (`/artists`, `/artists/[slug]`).
- Newer nav pages: `/canvas-rolls`, `/interior-designer-partnership`, `/trade`, `/custom-portraits`, `/art-care`, `/custom-order`, `/make-an-offer`, `/reviews`, `/affiliates`.
- Blog posts (`/blogs/[slug]`).

Anything not in the sitemap relies entirely on internal links + crawl budget to get indexed, and the hardcoded slug arrays will silently go stale the moment a category is renamed or a product is added in WooCommerce.

**Fix:** generate the sitemap dynamically at request time by pulling live slugs from the WooCommerce Store API (products, categories, artists if they're a custom post type) instead of hand-typed arrays. Next.js supports `generateSitemaps()` to split output past the 50,000-URL cap if the catalog grows that large.

### 1.2 Structured-data coverage has real gaps — Medium — ✅ Done
The schema layer under `lib/schema/` is genuinely solid where it's used: [lib/schema/product.ts](lib/schema/product.ts) emits `Product` + `Offer` + `AggregateRating` + `Review` + `BreadcrumbList` via `@graph`, and 22 pages already carry `application/ld+json`. But these pages have **none**: `/trade`, `/corporate-bulk-orders`, `/rentals`, `/exhibition`, `/team`, `/reviews`, `/affiliates`, `/make-an-offer`, `/artists`, `/artists/[slug]`.

~~Also missing sitewide: a single `Organization`/`LocalBusiness` + `WebSite`...~~ **Correction, found while starting this fix:** this already exists, and is more complete than what I originally recommended — [app/(home)/homepage-schema.ts](app/(home)/homepage-schema.ts) declares a real `ArtGallery` entity (schema.org's more specific subtype, a better fit than generic `Organization`) with genuine `PostalAddress`, `ContactPoint`, `sameAs` social profiles, plus `WebSite` with a `SearchAction`, all rendered on the homepage. That's the standard, correct place for it — Google doesn't need it repeated on every page. My original note overstated this as a gap; it isn't one.

**Still genuinely missing, and still the real fix here:** `Service` schema on the B2B lead-gen pages (Trade, Corporate Bulk Orders, Rentals) and `Person`/`AboutPage` schema on Team and Artists — none of those five have any structured data at all.

Added two new schema-generator modules following the existing per-type file convention in `lib/schema/` — [lib/schema/service.ts](lib/schema/service.ts) and [lib/schema/person.ts](lib/schema/person.ts) — and wired them into all five pages using only real, already-published on-page copy (the trade discount %, the real team bios/roles/LinkedIn profiles from `app/team/page.tsx`, the real artist bios from `lib/artists/data.ts`). `/rentals` needed its schema added to `app/rentals/layout.tsx` instead of the page itself, since that page is a client component and can't export server-only metadata/schema. Verified live: all six pages (`/trade`, `/corporate-bulk-orders`, `/rentals`, `/team`, `/artists`, `/artists/sahil-mahalley`) emit valid, correctly-typed JSON-LD (`Service` ×3, `Person` arrays on the two listing pages, `Person` on the individual artist page), zero console errors, no visual regression from the JSX restructuring (screenshotted two of them). Full `npm run build` passes clean.

### 1.3 No hreflang on the country-targeted landing pages — Medium — ✅ Done
`/original-abstract-art-for-sale-uk`, `-nz`, and `-ireland` all exist and are in the sitemap, but none declare `alternates.languages` (hreflang). Without it, Google can treat near-duplicate English-language pages targeting different countries as competing rather than complementary, which undercuts the point of having built them separately.

**Fix:** add `en-GB` / `en-NZ` / `en-IE` / `en-IN` (x-default) hreflang alternates across these four pages.

Confirmed the near-duplicate assumption before implementing (diffed the UK and NZ page source after normalizing country-name references — ~80% identical, same template). Added mutual `alternates.languages` (`en-GB`/`en-NZ`/`en-IE`) to all three pages, each listing itself plus the other two, per Google's own requirement. Skipped an `x-default`/`en-IN` entry — none of these three pages is actually the generic/India version, and guessing one would be a wrong signal, not a safe default. Verified live: all three pages render all three correctly-resolved absolute-URL `<link rel="alternate" hreflang>` tags (they serialize as `hrefLang`, which is spec-valid — HTML attribute names are case-insensitive).

### 1.4 Render-blocking third-party scripts hurt Core Web Vitals (a ranking factor) — High — ✅ Done
In [app/layout.tsx](app/layout.tsx), six third-party scripts are loaded as raw `<script>` tags directly in `<head>` — gtag.js, the inline gtag config, Trustpilot's widget bootstrap, the Google Merchant widget + its start-up IIFE, Ahrefs analytics, and the Meta Pixel. Only the GTM container itself uses Next's optimized `@next/third-parties` helper. Raw `<script>` tags in a server-rendered `<head>` compete with the page's own LCP resources instead of deferring politely.

**Fix:** move each of these to `next/script` with `strategy="afterInteractive"` (analytics/pixels) or `"lazyOnload"` (Trustpilot/Merchant widgets, which don't need to be ready immediately).

All six converted to `next/script` — gtag (base script + inline config) on `strategy="afterInteractive"`, and Trustpilot/Merchant-widget/Ahrefs/Meta-Pixel on `strategy="lazyOnload"`. Script contents themselves are byte-for-byte unchanged (no behavior risk); only the loading strategy changed. This also happens to be the exact spot ESLint's own `@next/next/next-script-for-ga` rule was flagging (confirmed it's gone from `npm run lint` output now).

Verified live, not just by inspection: loaded the homepage in a real browser and confirmed after page load — `window.dataLayer` populated (5 entries), `window.gtag` and `window.fbq` both defined and firing (the actual conversion/pixel network requests went out to `doubleclick.net` and `connect.facebook.net`), `window.merchantwidget` initialized, every expected external script (gtag.js, Trustpilot, gstatic merchant widget, Ahrefs) present in the DOM, and **zero console errors**. Full `npm run build` also still passes clean.

### 1.5 Content & internal linking — Medium
Blog runs on the WordPress REST API (`app/blogs/[slug]/page.tsx` → `/wp-json/wp/v2/posts`), which is good infrastructure — the gap is likely cadence/coverage, not plumbing. The recent mega-nav rebuild and Art Care page are exactly the kind of internal-linking foundation a content hub should feed into (see 3.4).

The `/reviews` page aggregates real Trustpilot/Google review links but nothing sitewide surfaces that trust signal near the actual buying moment (add-to-cart) — see 3.2.

### 1.6 Image SEO — mostly already good, spot-check copy
`next/image` is used almost everywhere; only 2 raw `<img>` tags exist in the whole codebase, both inside a chat widget component, not on content pages. This is a strength, not a gap. Worth a manual pass on product-gallery alt text for descriptiveness (a copy-quality check, not a code fix).

---

## 2. Technical

### 2.1 Build errors are silenced — High — ✅ Done
[next.config.ts](next.config.ts) has both `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true`. The comment in the file explains eslint was silently broken and this was the stopgap — but it means a real type error or lint violation can ship straight to production today with zero warning.

**Fix:** work through the currently-known type-error backlog (the three already tracked as pre-existing noise: `app/samora/shop/[slug]/page.tsx`, `app/warli-paintings/page.tsx`, `components/navbar.tsx`), then flip both flags back to `false` so future regressions actually block a bad deploy instead of accumulating silently.

All three tracked type errors turned out to be genuinely trivial, and fixing them surfaced one real bug worth calling out: [components/navbar.tsx](components/navbar.tsx)'s mobile search dropdown was passing a nonexistent `suggestion.name` as an `<Image>` `alt` (the real field is `.title`, used correctly two lines away for the visible label) — that image's alt text was silently rendering as `undefined` in production. The other two (`samora/shop/[slug]/page.tsx`, `warli-paintings/page.tsx`) were genuinely just missing fields (`permalink`/`stock_quantity`, `name`) on locally-declared types that don't match what the WooCommerce Store API actually returns — no runtime behavior changed.

`npm run lint` also turned up 5 real errors once actually run (an unescaped quote in three places, one stray `<any>`) — all fixed; the 26 remaining findings are warnings, which don't fail a Next.js build either way, so they're left as a smaller future cleanup, not blockers.

With both the type and lint backlogs clear, flipping `ignoreBuildErrors`/`ignoreDuringBuilds` to `false` in `next.config.ts` and running a real `npm run build` (not just `tsc --noEmit`) surfaced a **second real, build-breaking bug that `ignoreBuildErrors` had been silently masking the whole time**: the central API router ([app/api/[[...path]]/route.ts](app/api/[[...path]]/route.ts)) declared its route params as `Promise<T> | T` (a defensive union), which fails Next 15's stricter generated route-type check — every other dynamic route in the codebase already uses the plain `Promise<T>` form Next 15 actually passes, so this was narrowed to match with no behavior change (the existing `await Promise.resolve(params)` call handles a real Promise exactly the same either way). `npm run build` now passes end-to-end with real type checking and linting enforced — confirmed clean, twice, with port 3000 unused throughout.

### 2.2 No CI pipeline at all — High — ✅ Done
There is no `.github/workflows` directory. Nothing runs `tsc`, lint, or a build check automatically on a PR — the only current gate is a human running `npx tsc --noEmit` locally before reporting done.

**Fix:** a minimal GitHub Action (or Cloudflare Pages' own build-check) running `npx tsc --noEmit`, `npm run lint`, and `npm run build` on every PR would catch regressions before they reach `main`, independent of who's driving the session that day.

Added [.github/workflows/ci.yml](.github/workflows/ci.yml): runs on every PR and every push to `main`, on Node 20 (matching the project's `@types/node` range), running exactly the three commands above in sequence. It needs no new GitHub secrets to pass today — every env var the build touches already has a safe public production fallback baked into the code — but if a future change needs an authenticated call (WooCommerce keys, Razorpay, Resend, Supabase, Delhivery) during the build step specifically, the workflow file has a comment on exactly where to add the matching repo secret. Validated the YAML syntax directly; the three commands it runs were already proven to pass locally above.

### 2.3 Zero automated test coverage — Medium — ✅ Done
Confirmed: no test files or framework anywhere in the repo. Given the size of this codebase, full coverage isn't realistic to bootstrap retroactively — but the three revenue-critical flows (checkout, the Custom Portraits deposit flow, and the lead-capture forms for Trade/Design Partners/Canvas Rolls) are exactly the kind of thing that breaks silently and expensively. A handful of Playwright smoke tests on just those flows would be disproportionately high-value for the effort.

Added `@playwright/test` as a real devDependency (it was only a transitive one before) with [playwright.config.ts](playwright.config.ts) and three suites under `e2e/`:
- [e2e/checkout.spec.ts](e2e/checkout.spec.ts) — the main cart checkout, including the "payment window dismissed" error path.
- [e2e/custom-portraits.spec.ts](e2e/custom-portraits.spec.ts) — the deposit flow, including the reference-photo upload.
- [e2e/lead-capture-forms.spec.ts](e2e/lead-capture-forms.spec.ts) — the Trade application form (success and server-error paths); the same pattern applies directly to Design Partners/Canvas Rolls if those get their own suites later.

Per your call on the payment-gateway question: **mocked, not real Razorpay sandbox.** [e2e/mocks.ts](e2e/mocks.ts) stubs Razorpay's hosted `checkout.js` at the network boundary (the fake `window.Razorpay` calls the real `handler` callback exactly like the SDK would, so the real client-side code path runs end-to-end) and stubs this app's own `/api/checkout`, `/api/checkout/verify`, `/api/custom-portraits`, and `/api/upload-image` too — otherwise every CI run would create a real WooCommerce order. Nothing here ever contacts Razorpay or WooCommerce for real.

One real bug in the test setup, not the app, caught and fixed before trusting the suite: the first run failed with the checkout form never appearing — turned out to be `next dev`'s on-demand route compilation being slow enough, under multiple parallel test workers hitting different routes for the first time at once, to occasionally lose a race with the test's timeout. Switched the test server to a real `next build && next start` (production mode has no such lag, and it's what's actually deployed) — confirmed reliable across three full back-to-back runs, including one with `CI=true` set to match exactly how it runs in `.github/workflows/ci.yml`.

Wired into CI as a separate `e2e` job (its own pass/fail, since it does a real build+start rather than just type/lint) that uploads the HTML report as an artifact on failure.

### 2.4 No security headers configured — Medium — Headers ✅ done, rate limiting still open
No `headers()` block in `next.config.ts` and no `public/_headers` file (the Cloudflare Pages convention). That means no CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, or Permissions-Policy anywhere — worth having given the site has `/admin`, `/account`, and `/checkout` on the same domain.

Added a `headers()` block to [next.config.ts](next.config.ts): `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` (restricting only `camera`/`geolocation`, confirmed unused anywhere in the codebase — deliberately leaving `microphone` unrestricted since `components/chat/ChatInputBar.tsx` genuinely uses it for voice input), and a conservative `Strict-Transport-Security` (no `includeSubDomains`/`preload` yet, since this codebase can't fully confirm every subdomain is HTTPS-ready and both flags are hard to safely walk back once picked up). Verified live on real responses — homepage, an edge-rendered product page, an API route, and `/sitemap.xml` — all five headers present on every one.

**Content-Security-Policy deliberately left out of this pass** — this site loads a wide set of third-party scripts (GTM/gtag, Meta Pixel, Trustpilot, Google Merchant widget, Ahrefs, Razorpay, a chat widget, Google Fonts) plus Supabase/WooCommerce API calls, and a wrong CSP silently breaks checkout, analytics, or chat rather than failing loudly. That's real, separate work — enumerate and test the full allow-list — not something to guess at alongside the headers above. Flagging as a distinct follow-up rather than skipping it silently.

**Not yet done:** rate limiting on the public lead-capture API routes (`canvas-roll-enquiries`, `trade-leads`, `design-partners`, etc.) — `middleware.ts` correctly gates `/admin` and `/dashboard`/`/account` behind session cookies, but nothing throttles these public POST endpoints yet.

### 2.5 No error monitoring or Web Vitals telemetry — Medium — Web Vitals ✅ done, error monitoring still open
No Sentry (or equivalent) and no `useReportWebVitals`/web-vitals reporting anywhere in the codebase. With this much client-side surface (GSAP, Framer Motion, currency conversion, cart/wishlist state), production errors currently have no channel back to the team except a user reporting them manually — and Core Web Vitals fixes (like 1.4 above) can't be measured without a real feed of field data.

Added [components/analytics/WebVitalsReporter.tsx](components/analytics/WebVitalsReporter.tsx), rendered sitewide from `app/layout.tsx`, using Next's built-in `useReportWebVitals` hook. Deliberately reuses the GTM/GA4 already configured (`window.dataLayer`) instead of adding a new analytics account — pushes a `web_vitals` event with `metric_name`/`metric_value`/`metric_rating` per Core Web Vital, following Google's own recommended CLS-×1000 scaling for dataLayer/GA4. Verified against a real production build (`next build` + `next start`, not dev mode, since some metrics only finalize under production timing) — FCP, TTFB, LCP, and CLS all fired correctly with real values, all rated "good". A GTM tag/trigger on the `web_vitals` event name is still needed on the GTM side to forward these into a GA4 report — that's a dashboard config step outside this codebase, not code.

**Error monitoring (Sentry or equivalent) is a separate, still-open half of this item** — it needs a new third-party account/API key, which isn't something to set up without you.

### 2.6 No PWA manifest — Low — ✅ Done (icon quality flagged)
No `manifest.json`/`.webmanifest` and no maskable icon set in `public/`. Low effort, and "add to home screen" is a real repeat-visit lever for a visually-driven catalog someone browses over multiple sessions before buying.

Added [app/manifest.ts](app/manifest.ts) using Next's metadata-route convention (same pattern as the existing `sitemap.ts`/`robots.ts`) — real name/description, `standalone` display, and theme colors matching the site's actual palette. Verified live: served correctly at `/manifest.webmanifest` with valid JSON, and Next auto-injects the `<link rel="manifest">` tag with zero extra config needed.

**Icon is a real limitation, flagged rather than faked:** it reuses `/Artace-logo.svg` — the same file already used sitewide for the favicon/apple-touch-icon — for consistency, but that file is a wide 47×32 wordmark, not a square mark, so an actual install prompt/home-screen icon will show it letterboxed rather than filling the icon slot. A proper square icon (192×192 and 512×512 PNG, plus a maskable variant with safe-zone padding) needs to be designed — that's a design asset this pass can't fabricate, not a code gap.

### 2.7 Checkout is single-gateway — Medium (conversion, not just tech) — Decided, not yet built
[app/checkout/page.tsx](app/checkout/page.tsx) integrates Razorpay only. Given the UK/NZ/Ireland-targeted landing pages already exist and multi-currency display is already built (`CurrencyProvider`), a Western buyer without an India-friendly card has no fallback. Worth adding PayPal at minimum, and considering EMI/BNPL for original paintings at the higher end of the price range.

**Decision (not PayPal/EMI):** PayPal and EMI/BNPL won't be integrated. The business already has a **PayU** account — the plan is to add it as a second gateway alongside Razorpay, with the customer choosing which to pay with at checkout. Not yet built; queued behind the Section 3 features below.

### 2.8 Accessibility basics — Medium — Skip link ✅ done, axe pass still open
No skip-to-content link found anywhere sitewide — cheap to add (`<a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>`) and expected for keyboard/screen-reader users. Worth an axe DevTools pass specifically on the mega nav (recently rebuilt, complex) and the product configurator (frame swatches, size selectors) — custom controls like these are usually where a hand-built UI's accessibility gaps concentrate.

Added to [components/chrome/SiteChrome.tsx](components/chrome/SiteChrome.tsx) — sitewide (every page renders through this one wrapper, so no per-page changes needed), pointing at a new `#main-content` wrapper div around `{children}`. Verified live with real keyboard interaction, not just by reading the code: invisible by default, is the very first Tab stop on the page, becomes a visible focus pill in the top-left the moment it's focused, and Enter correctly jumps to `#main-content`. The axe DevTools pass on the mega nav and product configurator is still open — that's a manual audit task, not something to do blind without a real screen reader/tooling pass.

### 2.9 Housekeeping — Low — ✅ Done
Six loose knowledge docs live at the project root (`AGENTS.md`, `features-context.md`, `PROJECT-RESUME.md`, `README.md`, `Samora-context.md`, `Website-pages.md`, `WORDPRESS_JWT_SETUP.md`) with likely overlapping content — worth consolidating or at least cross-linking so they don't drift out of sync with each other over time.

Went with cross-linking, not merging — a "Related project docs" pointer added to the top of all seven files (plus `suggestion.md` itself, which already cross-referenced `Website-pages.md`), each naming which doc is authoritative for what, rather than collapsing real, independently-useful content (like `features-context.md`'s WooCommerce API-shape notes and the "12 unwanted commits" incident, both genuinely worth keeping, not duplicating elsewhere) into one file.

Reading through them to write those pointers surfaced real, verifiable staleness worth fixing while I was there, not just cross-linking around:
- `AGENTS.md` and `PROJECT-RESUME.md` both claimed **"Next.js 16"** — `package.json` says `15.5.2`. Fixed in both.
- `PROJECT-RESUME.md` claimed the deployment platform was **Vercel** — this project actually deploys via **Cloudflare Pages** (`@cloudflare/next-on-pages`, the `pages:build` script). Fixed.
- `Website-pages.md` claimed the repo **"is not a git repo in this sandbox"** — it is, with a real GitHub remote; that check was previously run from the parent directory by mistake. Fixed.
- `AGENTS.md`'s "Known Issues" and `features-context.md`'s "No test framework exists" both referenced the exact type/lint errors and test-coverage gap fixed earlier in this pass (§2.1, §2.3) — updated both rather than leaving them describing a state that's no longer true.

Also carrying over two small, already-identified-but-unfixed bugs from `Website-pages.md`'s pending list:
- ~~Painting Collections dropdown panel has the same last-row border bug Shop Art had.~~ **Correction:** checked before fixing, and this isn't actually broken today. The panel has exactly 5 items in a 2-column grid (odd count), so `last:border-b-0` correctly targets the lone item alone in the final row — the `nth-last-child(-n+N)` pattern used on Shop Art only applies when the item count is an exact multiple of the column count (Shop Art has 9 items in 3 columns). I nearly "fixed" this by copying that pattern over anyway, which would have actually introduced a real bug (stripping the border from an item that's still in a full row above the last one) — caught it via a live screenshot before shipping it, reverted. Verified visually: no border bug exists in the current panel. Worth re-checking only if a 6th collection is ever added.
- **About Us hero container-width mismatch — ✅ Done.** [components/about/Abouthero.tsx](components/about/Abouthero.tsx) had exactly the described bug: `max-w-7xl` (1280px) instead of the sitewide `max-w-[1440px]`, plus a stray extra `lg:px-20` not present in the sitewide `px-4 sm:px-6 md:px-12` pattern. Fixed both. Verified live: the H1's left edge now measures exactly 48px at a 1440px viewport, matching the sitewide standard exactly.

---

## 3. What Would Make This the Best Ecommerce Site for Paintings

Organized by what each addition actually buys you, not just a feature list.

**Agreed build order:** Loyalty/rewards program → Gift cards → "View in Your Room" tool. Each goes through its own brainstorm → design → approval before implementation, same as every other feature in this engagement.

### 3.1 Discovery & Personalization
- **"View in Your Room" tool.** The single biggest differentiator available to an online paintings store, and the biggest thing missing here. Doesn't need true AR/WebXR to start — a client-side "upload a photo of your wall, drag/resize the painting onto it" tool solves the #1 hesitation buyers have with wall art (scale/fit) at a fraction of the engineering cost.
- **Sitewide "Recommended for you."** Per-product related-items already exist (`SingleProduct.tsx`, `shop/[slug]/page.tsx`) — the gap is a cross-session, homepage/account-level version driven by browsing or purchase history.
- **Mood boards**, beyond the existing wishlist — let a customer (or a trade/design-partner account) assemble a multi-piece room concept and share it as a link. This falls directly out of the Interior Designer Partnership program you just built.

### 3.2 Trust & Buying Confidence for High-Ticket Art
- **Certificate of Authenticity**, shown or downloadable per original — expected at this price point if not already issued at fulfillment.
- **Framing preview render.** Frame selection already exists (`lib/framing/data`) — the natural next step is compositing the chosen frame onto the actual product photo instead of leaving the choice abstract.
- **Insurance / white-glove shipping** as a checkout option for high-value originals.
- **On-site rating badge near add-to-cart**, pulling the same Trustpilot/Google numbers already surfaced on `/reviews` — right now that trust signal is stranded on a page most buyers never visit.

### 3.3 Post-Purchase & Retention
- **Loyalty/rewards program** — not found anywhere in the codebase. Strong repeat-purchase lever for a collectibles category.
- **Gift cards** — no evidence found; standard for a gifting-heavy category, and the site already runs festive promos (the Ganesh Chaturthi banner currently in the nav).
- ~~Customer referral program~~ — **already covered.** The existing affiliate program (`app/affiliates`, `app/dashboard/affiliate`) serves this role; no separate referral system needed.
- **Back-in-stock alerts** for one-of-a-kind originals that sell out, and an **abandoned-cart recovery** flow (email or WhatsApp).

### 3.4 Content & Community
- **Artist process video** embedded on `/artists/[slug]` pages — a painting is an emotionally-driven purchase, and seeing the making-of builds more trust than static photos alone.
- **Customer/UGC gallery** ("paintings in real homes") — social proof that doubles as reusable marketing content.
- **A real content hub on the blog** — buying guides ("how to choose canvas size for your wall," Vastu-compliant placement, care & framing — `/art-care` is already the right base to build from) targeting long-tail search and feeding the internal-linking work already started with the mega-nav rebuild.
- **360° virtual exhibition walkthrough** — `/exhibition` already exists as a page; extending it with an actual 360 viewer for past gallery shows is a natural, differentiated add.

### 3.5 B2B / Trade Growth
- Trade, Design Partner Program, and Corporate Bulk Orders currently exist as separate lead-generation pages, but none has a logged-in portal for an approved account to actually transact — a **self-serve trade price list + quick-reorder** would convert that pipeline into a real B2B sales channel.
- **Bulk/PO CSV upload** for corporate orders, rather than only a contact-form lead flow.

### 3.6 Internationalization / Payments
- Confirm the multi-currency display (`CurrencyProvider`) actually drives the payment gateway charge, not just the displayed price, for the UK/NZ/Ireland-targeted traffic.
- A **duties/import-tax estimator** at checkout for international shipping — a common, specific cause of cart abandonment on cross-border physical-art purchases.

---

## If You Can Only Do Five Things

1. **Dynamic sitemap** (1.1) — highest SEO leverage for the lowest engineering effort; the current one is silently excluding most of the catalog.
2. **Re-enable build-time type/lint checks + add CI** (2.1, 2.2) — stops silent regressions before they compound further.
3. **Convert third-party scripts to `next/script` strategies** (1.4) — direct Core Web Vitals and SEO ranking impact.
4. **"View in Your Room" tool** (3.1) — the single biggest conversion differentiator available for this category.
5. **Loyalty + gift cards + referral** (3.3) — a retention triad that reuses infrastructure (affiliate attribution/payouts) you've already built once.
