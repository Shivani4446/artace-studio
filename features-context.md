# Artace Studio — Session Feature & Context Log

A running record of the work done in this Claude Code session on the Artace Studio
Next.js/WooCommerce site (`D:\Artace Studio\artace-studio`). Written as a reference for
future sessions — read the "Session-Wide Conventions" section first, it governs how work
happens in this repo.

---

## Session-Wide Conventions (read first)

- **Git is entirely the user's own responsibility.** Never run `git commit`, `git add`, or
  `git push` in this repo. The user (Sahil, `sahilmahalley-pere-tech`) reviews and commits
  everything himself, usually shortly after each turn. This was established early after an
  incident where ~12 unwanted commits were made before the user corrected it — treat it as
  absolute.
- **No worktrees** — all work happens directly on `main` in place, with the user's
  session-wide consent.
- **No test framework exists.** Verification is always: `npx tsc --noEmit` (compare against
  the known pre-existing baseline errors — currently `app/samora/shop/[slug]/page.tsx`,
  `app/warli-paintings/page.tsx`, `components/navbar.tsx`, plus noisy `.next/types/...`
  route errors that fluctuate across dev-server restarts and aren't real), a full
  `npm run build` (must exit 0), live dev-server checks via `curl`, and direct WooCommerce
  REST API calls to confirm real data before/after a change.
- **Two different WooCommerce REST APIs, different shapes** — don't confuse them:
  - `wc/store/v1/*` (Store API): public, no auth, does **not** expose custom `meta_data`/ACF
    fields, prices are minor-unit integers, CORS-blocks browser-side calls (must fetch
    server-side).
  - `wc/v3/*` (admin API): Basic Auth via `WOOCOMMERCE_CONSUMER_KEY`/`WOOCOMMERCE_CONSUMER_SECRET`
    env vars, **does** expose `meta_data` (custom/ACF fields), plain decimal-string prices
    (`"20999"` = ₹20,999, no minor-unit math), `stock_status` is a string enum
    (`"instock"|"outofstock"|"onbackorder"`) not a boolean.
- **Windows/git-bash quirks:** Node's `require()`/`fs` chokes on some `/tmp`-style paths
  from Git Bash on Windows — use the scratchpad dir
  (`C:\Users\PERENN~1\AppData\Local\Temp\claude\d--Artace-Studio\...\scratchpad`) or full
  Windows paths for throwaway scripts/downloads. Kill stray dev servers with
  `taskkill //F //PID <pid> //T` (find PIDs via `netstat -ano | grep LISTENING | grep :3000`).
- **Workflow pattern:** `superpowers:brainstorming` → `superpowers:writing-plans` →
  `superpowers:subagent-driven-development` for larger, well-scoped new features (multiple
  files, real design decisions). `superpowers:systematic-debugging` for any bug report —
  root cause before any fix, always. Small, unambiguous content/config edits are done
  directly without the full ceremony.
- **Real data over guessing, always.** This session repeatedly found that assuming
  something about WooCommerce data, pricing, fonts, or infra was wrong — the fix always
  came from pulling the actual live API response / actual build log / actual file content
  first, not from reasoning about it in the abstract.

---

## Architecture Notes Worth Remembering

- **Artist-to-product mapping** (`lib/artists/data.ts`): driven by WooCommerce's real
  per-product **"artist" custom field** (ACF-backed plain text, entered when a product is
  uploaded in wp-admin) — matched case/whitespace-insensitively against `Artist.name` via
  `getArtistByName()`. This replaced an earlier, wrong design that used a manually-curated
  static `productSlugs` list — do not reintroduce that pattern.
- **Framing options** (`lib/framing/data.ts`, `FRAME_OPTIONS`): the chosen frame reaches the
  real WooCommerce order as **line-item `meta_data`** (`{key: "Frame", value: <label>}`),
  not a product variation — there's no WooCommerce variation dimension for framing, unlike
  Size which uses a real `variation_id`.
- **Custom-size pricing** (`components/singleproduct/SingleProduct.tsx`,
  `customCalculatedPrice`): fits a **power-law regression** (`price = a * area^b`) across
  *every* real WooCommerce size-variation price configured for that product, with an
  **exact-match short-circuit** (if the customer's typed dimensions exactly match a real
  configured size, show that variation's real price, not an estimate). This replaced a
  badly broken formula that linearly scaled off whichever size pill happened to be selected
  on the page — verified against real product data that the old formula was off by up to
  ~2x at larger sizes. See the git history for the full root-cause writeup if revisiting.
- **Fonts** (`lib/fonts.ts`): all fonts are self-hosted via `@fontsource/*` npm packages +
  `next/font/local` — **not** `next/font/google`. `next/font/google` fetches from Google's
  CDN *during* `next build`, which Cloudflare Pages' build sandbox cannot reliably reach,
  and repeatedly broke deploys. Every font consumer imports from this one shared module now
  (`playfairDisplay`, `inter`, `lora`, `fraunces`).
  - **Known, deliberately-untouched bug:** `.font-playfair` in `app/globals.css` maps to
    `var(--font-sentient)`, not `var(--font-playfair)`. Most "Playfair Display" loading
    across the codebase was therefore already dead/inert before the fonts fix (rendering as
    Sentient instead) — confirmed via `var(--font-playfair)` never being read anywhere.
    Left as-is intentionally to avoid an unplanned visual change; only the two call sites
    that used `.className` directly (`components/About/Abouthero.tsx`,
    `components/About/AboutusSecondsection.tsx`) were genuinely rendering Playfair/Lora and
    were carefully preserved.
- **Deployment pipeline:** Cloudflare Pages, via `@cloudflare/next-on-pages`, which
  internally shells out to Vercel's build CLI (`npx vercel build`) — seeing "Vercel CLI" in
  build logs is normal/expected, it is not actually deploying to Vercel.
  `next.config.ts` has `typescript.ignoreBuildErrors: true` and (added this session)
  `eslint.ignoreDuringBuilds: true` — both deliberate, so pre-existing lint/type debt never
  blocks a deploy. `npm run lint` still runs the real linter for anyone who wants to work
  through that backlog.
- **`package.json` must never pin a platform-specific native binary as a direct
  dependency** (e.g. `lightningcss-win32-x64-msvc`) — this broke every Cloudflare deploy for
  several commits in a row (`EBADPLATFORM` on their Linux build servers) after someone
  added it locally on Windows to work around a local install hiccup. Platform-specific
  binaries should only ever appear as `optionalDependencies` *inside* the package that
  needs them (e.g. inside `lightningcss`'s own `package.json`), never force-added at the
  project's top level.
- **robots.txt** (`app/robots.ts`): already correctly `Allow: /`s AhrefsBot, ClaudeBot,
  Google-Extended, GPTBot, etc. But **Cloudflare's own "AI Crawl Control" feature injects a
  conflicting `Disallow: /` block** for several AI bots directly into the served
  `/robots.txt`, at the edge, wrapped in `# BEGIN/END Cloudflare Managed content` markers —
  this is outside the app's control entirely. Any future robots.txt/bot-access issue should
  be checked against the **live** `curl https://artacestudio.com/robots.txt` output first,
  not just the repo's `app/robots.ts`, since Cloudflare can add content on top. Fixing bot
  conflicts or AhrefsBot's actual crawl-blocking (likely Bot Fight Mode / Super Bot Fight
  Mode, a separate Cloudflare feature) requires the Cloudflare dashboard, not a code change.

---

## Feature Log

### Password reset investigation (Hostinger/WordPress)
User reported password reset showing "unable to reach WordPress." Investigated as a
Hostinger/WordPress hosting-side issue; user resolved it themselves on the hosting side
(commit "fixed the reset passowrd bug"). Same underlying class of issue (WordPress-side
Wordfence brute-force lockout) recurred later — see "Deployment/login investigation" below.

### Navbar avatar + checkout trust points
Logged-in navbar now shows the user's initials instead of a generic icon. Added 5 trust
points (with icons, exact copy provided by user) to the checkout window.

### Checkout "Need More Help?" chips
Added chips in the checkout window: "Contact Art Advisory" / "Contact Customer Support",
linking to the relevant pages, per exact copy the user provided.

### Artist pages (major feature, multi-task SDD)
- New `/artists` index page, `/artists/[slug]` detail pages, `ShopByArtist` homepage
  section, artist byline + link under the product title on every product page.
- Wrote real bios/taglines for the 3 actual artists: **Sahil Mahalley**, **Sampadaa
  Mahalley**, **Vekkas Mahalley** (not "Artace Studio," which is the brand, not an artist).
- **Architecture correction mid-build:** originally used a static, manually-curated
  `productSlugs` list per artist (all empty, would've required manual upkeep forever). User
  corrected this — WooCommerce already has a real per-product "artist" ACF field, populated
  on upload. Reworked to match on that field via `getArtistByName` (see Architecture Notes
  above). Also fixed products silently not showing/linking their artist due to this same
  gap.
- `/vekkas-mahalley.webp` was a placeholder photo at the time — check whether the user has
  since supplied a real one.

### Vekkas Mahalley → "Vekkas M" rename
Renamed the artist's display name from "Vekkas Mahalley" to "Vekkas M" in
`lib/artists/data.ts` (name field + bio self-reference). **This uncovered a real, live
data-matching bug**, not just a cosmetic rename: 95 of Vekkas's 96 WooCommerce products
already had `artist: "Vekkas M"` set (not the old full name) — meaning the exact-match logic
in `getArtistByName` was silently failing to attribute 95 products to him before this fix.
Confirmed live before/after via the WooCommerce API and the rendered artist page (grid went
from ~1 product to 93).
- **One product still needs manual fixing in wp-admin:** *Four Seasons Tree Canvas
  Painting* still has the old "Vekkas Mahalley" string in its WooCommerce artist field — the
  user was going to update it there directly (not something fixable in code).

### Framing options (major feature, multi-task SDD)
Every painting now ships framed by default (framing included in price, not an add-on).
- Removed the old "Ships rolled. Frame it locally..." accordion.
- Added a "Choose a Frame" swatch selector below "Choose a Size" (`lib/framing/data.ts`:
  Black & Brown, Oak Brown Wood & Gold Lining, Royal Silver & White, Rustic Brown with
  Textured Lining, plus a "No Frame / Rolled Canvas" opt-out), defaulting to Black & Brown.
- `CartProduct.frameLabel?: string` threads the choice through the cart → checkout → real
  WooCommerce order as line-item `meta_data` (see Architecture Notes).
- **Fix-round finding:** the frame selector wasn't originally scoped by `!isPhotography`,
  so it appeared (and could reach the real order) on photography prints too — which
  contradicts their own separate "ships unframed" policy text. Fixed and verified.

### Specifications tab cleanup + trust-badge relocation
- The product page's "Specifications" table was pulling in 4 ACF fields
  (`about_the_painting`, `dimensions_&_materials`, `care_&_framing`, `shipping_&_returns`)
  meant for the *other* tabs, causing duplicated/wrong content (confirmed live: one real
  product had the exact same 1,553-character paragraph appearing 4 times over). Removed
  those 4 keys from `PRODUCT_INFORMATION_META_KEYS` in `app/shop/[slug]/page.tsx`. All 7
  tabs remain — only the Specifications *table's* data source was trimmed.
- Moved the "Premium Cotton Canvas / 100% Handmade / Museum Grade / Authenticity
  Certificate" trust badges from the bottom of the info column to directly under the
  product image, and enlarged them (`line-clamp` + reserved height already established
  elsewhere in the codebase as the pattern for this).

### Resend email — how it's used (informational, no code change)
Explained to the user: Resend currently powers (a) business-notification emails for 4 forms
(contact, corporate leads, custom order, photography "Make an Offer") — all landing at
`info@artacestudio.com`, and (b) the one customer-facing email, the registration welcome
email. A `buildPasswordResetEmail` template exists but isn't wired up — password reset still
goes through WordPress's own mail system. Advised that Resend/marketing-broadcast tools are
the wrong fit for the user's actual described needs (1:1 partnership outreach to
hotels/designers, personal custom-order conversations) — those need a real mailbox, not an
email-sending API.

### Popup transition fix
The "Ganesh Chaturthi Special" promo popup (`components/ui/PromotionModal.tsx`, appears 15s
after page load) flashed in instantly instead of fading/scaling in — root cause: it had a
working *close* transition but no *open* one, since React mounted it already at its final
visible styles in one paint (nothing for the CSS transition to animate from). Fixed with a
double-`requestAnimationFrame` "enter" pattern (mount hidden → flip to visible one frame
later), matching the existing close-transition style. When the user reported "not
appearing" afterward, root-caused (not a regression) to the modal's own existing
`sessionStorage` "already seen this session" gate — expected once dismissed once in a tab.

### FAQ dropdown fix ("buyers section")
`components/seo/FAQSection.tsx` (shared by ~15 pages, including the homepage's "Buyer
Questions" section) had three `md:` classes that **force-opened every FAQ answer on
desktop only** (`md:grid-rows-[1fr]`, `md:hidden` on the chevron, `md:cursor-default`) — so
it worked as a real accordion on mobile but always showed everything expanded on desktop.
Removed all three; it's now a real accordion (question visible, answer collapsed until
clicked) at every screen size, everywhere the shared component is used.

### ShopByArtist section fixes (two rounds)
1. Heading was visually ALL CAPS via a CSS `uppercase` class despite the source text
   already being written in Title Case ("Shop By Artist") — removed the class.
2. **First attempt misdiagnosed** "not maintaining the content length" as card-height
   inconsistency (added `line-clamp-2` + reserved height to the artist taglines) — this
   wasn't wrong to add, but wasn't the actual complaint. User clarified they meant the
   section's **content width doesn't match the navbar's**. Root cause: every other
   homepage section (13 of them) plus the navbar puts `mx-auto`, `max-w-[1440px]`, and
   `px-6 md:px-12` all on the *same* container element — `ShopByArtist.tsx` was the one
   outlier, splitting the padding onto the outer `<section>` instead. Fixed to match the
   site-wide convention exactly.

### Explore Our Collections — reorder + reimage
The homepage's "Explore Our Collections" section was driven by a **live WooCommerce
category fetch** sorted by product count, with a hacky keyword-priority list — meaning
editing the component's fallback data would have had zero visible effect. Replaced with a
fixed, curated 6-collection list (removed the dynamic fetch from `app/(home)/page.tsx`
entirely): **Modern Art → Abstract Paintings → Landscape Paintings → Ganesha Paintings →
Radha Krishna Paintings → Photography**, each with the user-supplied image, "Custom Order"
card unchanged in the last position. Verified all 6 WooCommerce category slugs are real and
populated before wiring them in (`modern-wall-art`, `abstract-paintings`,
`landscapes-cityscapes-paintings`, `ganapati-paintings`, `radha-krishna-paintings`,
`photography`).

### Google Ads / GA4 tag installation
- Installed the base GA4 "Google tag" (`G-27V3DFEVET`) directly in `app/layout.tsx`'s
  `<head>` (site previously only had GTM, no direct gtag.js — this was a genuine gap, not
  a duplicate).
- Wired the Google Ads conversion action (`AW-11024941492`) as an *additional*
  `gtag('config', ...)` call on the same tag (Google's own recommended pattern for
  multiple tag IDs on one site — no second loader script).
- The original "Purchase" conversion event snippet the user pasted assumed a click-then-
  navigate pattern; after clarifying, it actually needed to fire on real completed order
  confirmation — added `trackAdsConversionPurchase()` in `utils/gtm.ts` (same
  sessionStorage-dedup pattern as the existing `trackPurchase`), called from
  `app/checkout/success/checkout-success-client.tsx`. Pushes a `dataLayer` event; the
  actual Google Ads Conversion Tracking tag + trigger still needs to be created inside GTM's
  own dashboard (not code) to consume it.

### Footer redesign
Under the logo: removed the old "We empower independent artists..." tagline, replaced with
"A Repository of Paintings" (small text), then added address (Pune, Maharashtra, India —
locality-level only, no street address exists anywhere in the codebase), phone
(`+91 9657609102`, the same number used site-wide for WhatsApp/tel links), and email
(`info@artacestudio.com`) — both as real `tel:`/`mailto:` links.

### Deployment failures — root-caused and fixed (multi-part, the biggest debugging arc)
User reported 5 consecutive failed Cloudflare deploys. Root-caused and fixed in stages,
each confirmed against the **next** real build log rather than assumed fixed:
1. **`EBADPLATFORM` on `npm clean-install`** — `lightningcss-win32-x64-msvc` had been
   force-added as a plain (non-optional) top-level dependency in `package.json` (traced via
   `git log -S` to the exact commit), which can only install on Windows and hard-failed
   Cloudflare's Linux build servers on *every* deploy since. Removed it; `lightningcss`
   already correctly ships every platform's binary as its own internal optional dependency.
2. **ESLint config silently broken** (found during verification, unrelated to the outage
   itself): `eslint.config.mjs` imported `eslint-config-next`'s presets via a broken module
   path, so lint had never actually been running. Fixed properly with `FlatCompat` (bridges
   `eslint-config-next`'s legacy-format presets into ESLint 9 flat config — the same pattern
   Next.js's own scaffolding uses). Running it for real surfaced 31 pre-existing findings
   (5 errors) — rather than let *fixing the tooling* become a new deploy blocker, added
   `eslint.ignoreDuringBuilds: true` to `next.config.ts`, matching the existing
   `typescript.ignoreBuildErrors: true` convention.
3. **`next/font/google` build-time fetch failures** — Cloudflare's build sandbox
   intermittently/systematically cannot reach `fonts.gstatic.com`, and `next/font/google`
   fetches font files from there *during* `next build`. This pattern was used in 15
   different files across 4 font families (Playfair Display, Inter, Lora, Fraunces) — any
   of them could break a deploy. Root-caused, then discovered the `.font-playfair` dead-code
   bug (see Architecture Notes) while fixing it, which changed the fix's shape: self-hosted
   all 4 fonts via `@fontsource/*` + `next/font/local`, centralized in `lib/fonts.ts`;
   removed the now-provably-dead Playfair/Lora loading from 11 files entirely (zero visual
   change, confirmed); properly migrated the 2 genuinely-live usages, catching and fixing
   one real regression risk in the process (`Abouthero.tsx`'s heading would have silently
   lost its bold weight without an explicit `font-bold` compensating class, since the
   original single-weight font instance implicitly fixed the weight and the new
   multi-weight shared one doesn't).
   Verified with two full local `npm run build` runs (`EXIT CODE: 0` both times) plus
   confirming the actual `.woff2` files were generated on disk.

### Custom-size pricing fix (major bug, math-heavy)
User reported the custom-size modal on product pages showing wildly inaccurate prices
compared to the real configured size variations (e.g. 15×15 = ₹12,500, 20×20 = ₹18,000 in
WooCommerce, but the modal showed something else for the same sizes). Root cause: the old
formula (`currentPrice × customArea / baseArea`) linearly projected off **whichever size
pill happened to be selected on the page** — unstable (same input, different output
depending on unrelated UI state) and mathematically wrong, since real per-size pricing has
a fixed-cost component and doesn't scale proportionally with area at all. Verified against
a real 8-variation product (12×12 through 42×42) that the old formula was overpricing the
largest size by ~2x and underpricing the smallest by ~18%.
Fixed with (`components/singleproduct/SingleProduct.tsx`, `customCalculatedPrice` and
friends):
- An **exact-match short-circuit** — if the typed dimensions match a real configured
  variation exactly, show that variation's real price, not an estimate.
- A **power-law regression** (`price = a * area^b`) fit across every real size variation's
  (area, price) pair for that specific product — tested against the straight-line
  alternative on real data and the power curve was roughly 2x more accurate (~8% RMS error
  vs ~18%), which matches how size-based pricing with economies of scale actually behaves.
- Graceful fallbacks for products with only 0 or 1 real size variations.
Verified with isolated Node scripts reproducing the exact algorithm against real WooCommerce
variation data (exact prices reproduced at real sizes, sensible interpolation/extrapolation
elsewhere), `tsc --noEmit` clean, and a full production build (`EXIT 0`).

### Navbar "Commissions" → "Custom" rename
Renamed the desktop nav item label only (`components/navbar.tsx`, the `desktopLinks` array)
from "Commissions" to "Custom." Left "commission" as a verb in descriptive dropdown copy
("Commission bespoke artwork...") untouched, since that's different from the nav label
itself.

### robots.txt / AI-bot & AhrefsBot investigation (no code change — infra issue)
User reported conflicting rules (ClaudeBot, Google-Extended, GPTBot each have both an
Allow and a Disallow) and wanted AhrefsBot fully allowed. Investigated by fetching the
**live** `/robots.txt`, not just the repo source, and found the app's own `app/robots.ts`
already correctly allows all of these — the conflicts come from a `# BEGIN/END Cloudflare
Managed content` block that Cloudflare's own "AI Crawl Control" feature injects at the edge,
independent of what the app serves. No code fix is possible here. Gave the user exact
Cloudflare-dashboard steps (AI Crawl Control panel to resolve the 3 bot conflicts; Bot Fight
Mode / Super Bot Fight Mode in Security → Bots to check for AhrefsBot's actual traffic
block, separate from robots.txt entirely). **Left open:** whether the user wants
`ai-train=no` changed to `ai-train=yes` in that same Cloudflare panel — a real
content-licensing decision, asked but not yet answered.

---

## Outstanding / Pending Items

- **Vekkas Mahalley product data:** *Four Seasons Tree Canvas Painting* still has the old
  full name in its WooCommerce "artist" field — needs a manual one-field edit in wp-admin.
- **`/vekkas-mahalley.webp`:** confirm whether a real photo has been supplied yet (was a
  placeholder earlier in the session).
- **Cloudflare dashboard changes (not code, not doable by Claude):**
  - AI Crawl Control panel: allow ClaudeBot, Google-Extended, and GPTBot to resolve the 3
    robots.txt conflicts.
  - Security → Bots: check Bot Fight Mode / Super Bot Fight Mode for AhrefsBot's actual
    crawl-blocking issue.
  - Decide `ai-train=no` vs `ai-train=yes` in the Content-Signal setting (same AI Crawl
    Control panel) — content-licensing decision, still open.
- **GTM dashboard (not code):** create the actual "Google Ads Conversion Tracking" tag +
  Custom Event trigger (matching event name `ads_conversion_purchase_1`) inside Google Tag
  Manager's own UI to consume the `dataLayer` push already wired up in code.
- **Resend/email:** no code change was requested here, just guidance — revisit if the user
  wants a dedicated mailbox/CRM set up for partnership outreach and custom-order
  conversations, or Resend Broadcasts wired up for occasional campaigns.
- **eslint backlog:** 31 real lint findings (5 errors, 26 warnings) exist across the
  codebase, currently non-blocking for deploys (`eslint.ignoreDuringBuilds: true`). Run
  `npm run lint` to see them if anyone wants to work through the backlog.
