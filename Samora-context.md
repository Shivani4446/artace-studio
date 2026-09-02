# Samora — Project Context

Working knowledge dump of everything built for **Samora**, the handcrafted-goods sub-brand of
Artace Studio, across this chat. Written so a future session (or teammate) can pick this up
without re-deriving it. Last updated: 2026-09-02.

---

## 1. What Samora is

- A sub-brand of Artace Studio selling handcrafted lifestyle goods — tote bags, tea coasters,
  trays, name plates — as opposed to Artace's canvas paintings.
- Lives on the **same Next.js app and the same WooCommerce backend** as Artace Studio, at the
  `/samora` slug (e.g. `artacestudio.com/samora`, `/samora/shop`, ...).
- **Product differentiation**: a product belongs to Samora if and only if it carries the
  WooCommerce **tag** `samora` (slug `samora`). Nothing else marks a product as Samora's —
  not category, not a separate post type. Category (e.g. `tote-bags`, `tea-coaster`) is used
  *within* Samora for browsing/filtering, but tag is the brand boundary.
- Helper: `hasSamoraTag()` / `SAMORA_TAG_SLUG` in `lib/samora/products.ts` — the single source of
  truth used everywhere this boundary matters.

## 2. Brand identity

- Colors: cream background `#fbf6ef` / `#f3ead9`, terracotta accent `#c1683d` (hover `#a8552f`),
  deep ink `#2b2420`, deep maroon `#460000` (from the real logo, used as a secondary/festive
  accent), gold `#e8c07d` (festive accent, bunting/rosette motifs).
- Fonts: **Fraunces** (display/headings, loaded as `--font-fraunces`, used via the
  `.font-samora-display` utility class in `app/globals.css`) + **Inter** (body, already shared
  with Artace).
- Logo: `/public/samroa-logo.svg` — **note the filename typo ("samroa") is intentional/existing,
  do not "fix" it without updating every reference.**
- No Samora-specific favicon/OG image beyond what's already wired; product photography comes
  directly from WooCommerce.

## 3. Routing & site chrome

- `app/samora/layout.tsx` — Samora's own root-ish layout (nested under the app's single real root
  layout): loads Fraunces, wraps children in `SamoraPromoBanner` + `SamoraNavbar` (combined into
  **one** `sticky top-0 z-[60]` wrapper — they used to each be independently sticky, which broke;
  don't re-add `sticky` to `SamoraNavbar` itself) and `SamoraFooter`.
- `components/chrome/SiteChrome.tsx` — the mechanism that makes `/samora/*` "feel like a
  different site": it path-matches `/samora` and skips Artace's `Navbar`, `Footer`,
  `PromotionBar`, `PromotionModal`, `ProductImageProtection`, `ChatWidget`, and the WhatsApp
  bubble for those routes, letting `app/samora/layout.tsx`'s own chrome take over instead.
- Still shared across both brands (mounted once in the real root `app/layout.tsx`, above
  `SiteChrome`): `AuthSessionProvider`, `CurrencyProvider`, `CartProvider`, `WishlistProvider`.
  **The cart is genuinely shared** — a user can have both Artace and Samora items in one cart —
  this is why coupon/gift/shipping logic has to explicitly check "is every item in this cart
  actually a Samora product" rather than assuming it.

## 4. Pages built

| Route | Purpose |
|---|---|
| `/samora` | Homepage: Hero, TrustBar, **FestiveSpecial** (Rakhi banner section, tote-bags-only showcase), CraftCategories, Story, Process, GiftingBanner, FAQ |
| `/samora/shop` | `SamoraShopCatalog`: dynamic category pills, dynamic attribute facets (e.g. Material/Color — appear automatically once products carry real WooCommerce *attributes*, not just meta fields), search, price range, sort (Newest/Price asc-desc/Name) — all client-side over the fetched product list |
| `/samora/shop/[slug]` | `SamoraSingleProduct`: gallery, quantity stepper, variation selector, **PIN code delivery checker**, **"Make it a gift" option**, specs table (pulled from real WooCommerce meta fields), reviews (list + submission form, real WooCommerce reviews API), related products ("More from Samora") |
| `/samora/cart` | Mirrors Artace's cart logic (`useCart()`), Samora-themed; shows gift-wrap fee line when applicable |
| `/samora/checkout` | Mirrors Artace's checkout logic exactly (same `/api/checkout*` routes), Samora-themed; live shipping quote as the PIN code is typed; coupon field; order summary shows Subtotal / Discount / Gift Wrapping / Shipping / Total |
| `/samora/checkout/success` | Mirrors Artace's success/polling page |

Homepage's Festive Special section (`components/samora/SamoraFestiveSpecial.tsx`) is filtered to
**tote bags only** (`category=tote-bags` combined with `tag=samora` in the Store API query in
`app/samora/page.tsx`) — this was a deliberate later change; don't widen it back to "all Samora
products" without being asked.

## 5. Checkout business logic — Samora-specific

Lives in `lib/samora/pricing.ts` (pure constants/functions, client-safe) and
`lib/samora/pricing.server.ts` (server-only WooCommerce data fetching). Wired into
`lib/api-route-handlers/checkout/route.ts`, gated behind `storeName === "Samora"` so Artace's
checkout is completely unaffected.

- **Gift fee**: ₹50 per item (`SAMORA_GIFT_FEE_PER_ITEM_INR`), computed **server-side** from real
  quantities (never trusted from the client), added to the WooCommerce order as a real
  `fee_lines` entry ("Gift Wrapping") so it's part of the actual Razorpay charge.
- **Free shipping threshold**: ₹2000 (`SAMORA_FREE_SHIPPING_THRESHOLD_INR`) — this is a
  **Samora-only constant in code**, deliberately independent of Artace's shared WooCommerce
  shipping zone (which stays at its own settings).
- **RAKHI10 coupon**: real WooCommerce coupon (id `4272`, 10% off, `usage_limit_per_user: 1`,
  expires `2026-08-29` — Raksha Bandhan 2026 is Aug 28). Enforced **Samora-only in application
  code**, not via WooCommerce's native product/category coupon restriction (deliberate — a
  native restriction would need manual updates every time a new Samora product is tagged; the
  code-layer check stays correct automatically):
  - Rejected outright if applied from Artace's checkout (`storeName !== "Samora"`).
  - Rejected if the cart contains any non-Samora product (checked via real WooCommerce tags on
    every line item, server-side, in `fetchLineItemTotals`'s `allItemsAreSamora` flag).
  - `isSamoraExclusiveCoupon()` / `SAMORA_EXCLUSIVE_COUPON_CODES` in `lib/samora/pricing.ts` is
    where new Samora-only coupon codes get registered.
- **Real Delhivery shipping rate** at checkout, added as a real `shipping_lines` entry (method_id
  `delhivery`). See §6.

## 6. Delhivery integration

`lib/delhivery.ts` — two functions, both already live and verified working:

- `checkDelhiveryServiceability(pincode)` — real serviceability, COD/prepaid availability,
  remote-area flag, district/city, via Delhivery's Pincode API.
- `calculateDelhiveryShippingRate({ destPincode, weightGrams, paymentType, mode })` — real
  shipping cost via Delhivery's Invoice/Charges (rate calculator) API. Defaults: Surface mode
  (`"S"`), Pre-paid (matches this checkout — no COD is offered).

Env vars (`.env.local`, gitignored — also mirrored as blank placeholders in `.env.example`):
- `DELHIVERY_API_TOKEN` — real production token, already set.
- `DELHIVERY_PICKUP_PINCODE=411037` — **corrected value**. Was a wrong `411001` guess initially;
  fixed once the user shared the real warehouse address (see §7). Every shipping quote is
  calculated *from* this pincode, so if it's ever wrong, all quotes are off store-wide.

`lib/api-route-handlers/checkout/pincode/route.ts` (`/api/checkout/pincode`, used by
`SamoraPincodeChecker` on the product page and by the live quote on the checkout page) combines:
- **India Post's public API** (`api.postalpincode.in`, free, no key) for real **locality names**
  (e.g. "Bibvewadi" for 411037, "Bavdhan" for 411021) — deliberately shows *all* post-office
  names for a pincode rather than guessing a single "correct" one, since the data doesn't
  reliably support picking just one.
- **Delhivery** for actual serviceability + the real shipping rate.
- Important fix already applied: a failed/null Delhivery API call (bad token, network issue) is
  reported differently from "Delhivery confirmed this pincode isn't serviceable" — conflating
  the two was a real bug that made every pincode look unserviceable during a period when a newly
  added env var hadn't been picked up yet (dev server needed a restart). Don't reintroduce that
  conflation.

**Not built yet: actual shipment/waybill/label creation** (i.e., automatically booking the
physical Delhivery pickup with a real AWB/waybill number after an order is paid). This is
a different, higher-stakes API (creates real carrier-side records, unlike the read-only
pincode/rate lookups) — see §8, currently paused mid-design.

## 7. Open issue: Delhivery pickup location shows "inactive"

- User's Delhivery One portal shows their pickup location — **Facility Name "Artace Studio
  Warehouse"**, contact Sampadaa Mahalley, `+91 9850749724`, `artacestudio@gmail.com`, address
  "A 64, 11th Floor, Shaila Building, Mahalaxmi Nagar, Bibwewadi Pune", pincode **411037**,
  Maharashtra — as **inactive**, despite it looking correctly filled in Settings.
- **Confirmed via live re-testing (twice) that this does not affect anything currently live** —
  the pincode-serviceability and rate-calculator APIs don't reference `pickup_location` at all,
  only `o_pin`/`d_pin`/weight. Both calls succeed right now regardless of the portal status.
- It will matter once shipment/waybill creation is built (§8) — that API does require an exact,
  active pickup-location name match.
- Diagnosis given to the user: most likely an account-side Delhivery approval/KYC step (common
  for newly added pickup locations — phone verification or backend approval by Delhivery ops),
  not a website configuration problem, and not something fixable from this codebase. There is no
  known safe, read-only API call (with just the API token, no portal session) to check the real
  status directly.
- Recommended the user contact Delhivery support/their account manager directly. **Offered to
  draft the support message for them — as of the last turn, they hadn't asked for the draft yet.**
  If they come back to this, that offer still stands.

## 8. Paused feature: automatic Delhivery shipment/waybill booking

User approved building this in principle ("Yes go ahead" to the specific description: auto-book
the Delhivery pickup with label generation when a Samora order is paid), then during
brainstorming asked to pause and come back to it later. **Do not resume implementation without
the user explicitly bringing it back up.**

Two clarifying questions were asked; both were deferred, not answered:
1. **Validation strategy** — since a real shipment-creation call can't be safely test-fired
   against their live production Delhivery account (it would create a real record), how should
   we validate it works? Options offered: (a) build it fully automatic behind a kill-switch env
   var and validate on the very first real order together, (b) a manual "click to book" review
   step for the first several orders instead of full automation, (c) use a separate Delhivery
   staging/test token if they have one. **User: "we will come to this after some time."**
2. **Package dimensions** — Delhivery's shipment API wants L×W×H; nothing in the WooCommerce
   catalog tracks per-product dimensions (only weight). Options: (a) one generic flat-pack
   default for every shipment, (b) the user provides real per-category dimensions.
   **User: "We will do it after some time."**

Design sketch for when this resumes (not yet built, not committed to):
- Extend `WooOrderSummary` in `utils/woocommerce-checkout.ts` to also parse `line_items` (product
  id/quantity/name) and full billing/shipping address fields (name, address lines, city, state,
  postcode, phone) — currently it only exposes a handful of billing/shipping fields, not enough
  for a shipment payload.
- Add `createDelhiveryShipment(...)` to `lib/delhivery.ts` (Delhivery's `POST
  /api/cmu/create.json`, form-encoded `format=json&data=<json>` body — not raw JSON — containing
  a `shipments[]` array and a `pickup_location` object whose `name` must exactly match "Artace
  Studio Warehouse" character-for-character).
- Stamp a `_samora_order: "yes"` order meta at checkout-creation time (in `checkout/route.ts`,
  when `storeName === "Samora"`) so the payment-confirmation code can cheaply tell which orders
  need Delhivery booking without re-deriving it from line items.
- Trigger booking from **both** `/api/checkout/verify` and `/api/razorpay/webhook` after they
  mark an order paid (both are legitimate "payment confirmed" entry points in the existing
  design) — must be **idempotent** (skip if `_delhivery_waybill` meta already set, to avoid
  double-booking a real physical shipment) and **fully non-blocking** (a Delhivery failure must
  never prevent the customer from seeing "Order Confirmed"; store the error as order meta for
  manual follow-up instead).
- A kill-switch env var (e.g. `DELHIVERY_AUTO_BOOK_SHIPMENTS`) was the leading idea for the
  rollout-safety piece, pending the user's answer to question 1.

## 9. Product-visibility bug (fixed) — worth remembering the shape of it

Early on, Samora-tagged products leaked into Artace's own shop despite the tag-based filter
existing. Root cause: the filter had only been applied to the server-rendered `/shop` page, but
`components/shop/ShopCatalog.tsx` also does a **client-side refetch** from a *second, parallel*
endpoint (`/api/store/products`, `lib/api-route-handlers/store/products/route.ts`) that
duplicated the same fetching logic without the filter — and immediately overwrote the correctly
filtered server data. Swept and fixed every other unscoped product-listing fetch at the same
time: `/api/store/products`, homepage "featured" highlights, `/collections/[slug]` (direct
category URL access), and the blog article "featured products" fallback (deliberately left
explicit by-ID/by-slug product embeds in blog content alone — that's real editorial intent, not
a leak). **Lesson for future changes**: any time a product-listing surface is touched, check for
a duplicate/parallel fetch path before assuming one filter fix covers it everywhere.

## 10. Git / commits

- Per stored preference, **I do not run `git commit`/`git push` in this repo** — the user commits
  and pushes their own work themselves, in their own batches, with their own messages. Evidence
  this is actively happening: `git log` shows commits like *"Added checkout logic and gift
  charges and delhivery api integration"* and *"fixed the pincode bug"* that correspond directly
  to work done in this chat, committed by the user between turns without asking.
- As of the last check, an **unrelated affiliate/referral program** (new `app/admin/`,
  `app/affiliates/`, Supabase tables, referral-cookie tracking spliced into
  `lib/api-route-handlers/checkout/route.ts`, new admin/affiliate API routes) was sitting
  uncommitted in the working tree. That is **not** something built in this conversation and
  should not be touched, committed, or assumed-away in future sessions — treat it as
  someone/something else's in-progress work.

## 11. Key files reference

```
lib/samora/products.ts              — SAMORA_TAG_SLUG, hasSamoraTag()
lib/samora/pricing.ts               — client-safe constants: gift fee, free-shipping threshold,
                                       Samora-exclusive coupon codes, shipping fallback
lib/samora/pricing.server.ts        — server-only: fetchLineItemTotals() (real price/weight/
                                       Samora-only check per cart, via WooCommerce)
lib/delhivery.ts                    — checkDelhiveryServiceability(), calculateDelhiveryShippingRate()

app/samora/layout.tsx               — banner + navbar (one sticky unit) + footer
app/samora/page.tsx                 — homepage, fetches Festive Special products (tote-bags only)
app/samora/samora-schema.ts         — JSON-LD schema + FAQ data for the homepage
app/samora/shop/page.tsx            — shop listing, fetches all Samora products + categories/attrs
app/samora/shop/[slug]/page.tsx     — single product page, fetches specs/weight/variations
app/samora/cart/                    — cart page + client
app/samora/checkout/                — checkout page + client (gift, coupon, live shipping quote)
app/samora/checkout/success/        — success/polling page

components/samora/                  — all Samora-specific UI components (Navbar, Footer,
                                       PromoBanner, ProductCard, ShopCatalog, SingleProduct,
                                       PincodeChecker, GiftOption, GiftModal, FestiveSpecial,
                                       Reviews, ProductSpecs, festive icons, etc.)
components/chrome/SiteChrome.tsx    — Artace-vs-Samora chrome switch by path

lib/api-route-handlers/checkout/route.ts          — order creation; gift fee, shipping, coupon
                                                     enforcement, all gated on storeName==="Samora"
lib/api-route-handlers/checkout/pincode/route.ts  — India Post + Delhivery combined lookup
lib/api-route-handlers/checkout/coupon/route.ts   — coupon validation, store="samora" param
lib/api-route-handlers/checkout/verify/route.ts   — client-driven payment confirmation
lib/api-route-handlers/razorpay/webhook/route.ts  — server-to-server payment confirmation
lib/api-route-handlers/store/products/route.ts    — the "second" product list (had the leak bug)
lib/api-route-handlers/homepage/highlights/route.ts
lib/api-route-handlers/reviews/route.ts           — GET (list) + POST (submit), shared w/ Artace

.env.local / .env.example           — DELHIVERY_API_TOKEN, DELHIVERY_PICKUP_PINCODE=411037
```

## 12. Live snapshot at time of writing (may go stale)

- Samora catalog: 20+ tagged products observed, split across `tote-bags` (majority, 16+) and
  `tea-coaster` categories. All current products are `type: simple` (no variations).
- WooCommerce product **attributes** (Material/Color as real Attributes, not just meta fields)
  were **not yet tagged** on any product as of the last check — the shop's attribute-facet UI is
  built and will populate automatically the moment they are, no code change needed.
- WooCommerce shipping: a single "India" zone, free shipping above ₹10,000 (Artace's own
  threshold — unrelated to Samora's separate ₹2000 rule described in §5).
