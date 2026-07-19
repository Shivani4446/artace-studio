# Currency Dropdown — Design

## Problem

All prices on the site are shown and formatted directly from WooCommerce's real values, which are configured in INR (`currencyCode`/`currencySymbol` fields, e.g. `₹`). Shoppers browsing from outside India have no way to see approximate prices in their own currency. The request: add a currency dropdown (USD, AED, INR, AUD, CAD, GBP; default INR) that converts displayed prices sitewide when changed.

## Scope decision: display-only

Switching currency changes **displayed** prices everywhere on the site. It does **not** change what's actually charged at checkout — Razorpay/WooCommerce continue to charge in INR exactly as they do today (confirmed: `lib/api-route-handlers/checkout/route.ts` hardcodes `currency: wooOrder.currency || "INR"`, and there is no existing multi-currency payment setup). Actually charging in a foreign currency would require verifying Razorpay account capabilities for cross-border settlement and reworking WooCommerce order-currency handling — out of scope for this feature. The checkout flow itself is untouched by this design.

## Architecture

**Exchange rates:** fetched server-side from `https://open.er-api.com/v6/latest/INR` — free, no API key, confirmed to return all 6 required currencies (USD, AED, AUD, CAD, GBP) with INR as base. Cached via Next.js `fetch` revalidation with `revalidate: 21600` (6 hours; the API itself only updates once daily, so this is frequent enough to stay current without over-fetching). If a refresh fails, fall back to the last successfully-fetched rates already in cache; if no rates have ever been fetched successfully, prices simply display in INR (untouched) rather than showing broken/zero values.

**Persistence:** the selected currency code is stored in a cookie (not localStorage), so both server-rendered pages and client components can read the same preference — this avoids a flash of INR prices before client JS loads on every page navigation.

**State:** a `CurrencyProvider` React Context, added to the existing global provider tree alongside `CartProvider`/`WishlistProvider` (same established pattern in this codebase). It exposes the selected currency code, the current rates, and a setter that updates both the cookie and context state when the shopper picks a new currency.

**Conversion:** one shared utility (e.g. `lib/currency/convert.ts`) exposing a single conversion/formatting function that takes a raw INR amount and the current currency + rates, and returns a formatted display string. Matches the existing site convention (confirmed in `SingleProduct.tsx`): round to the nearest **whole unit** of the target currency (no decimals — e.g. `$204`, not `$204.37`), with locale-appropriate thousands grouping per currency (e.g. `en-US` for USD/CAD/AUD, `en-GB` for GBP, `en-AE` for AED, `en-IN` for INR). This becomes the single source of truth for "how do we turn an INR number into a displayed price" — replacing each component's own ad-hoc formatting logic.

## UI

A `CurrencyDropdown` client component placed in the navbar's existing icon cluster (next to account/wishlist/cart icons) — the only always-visible, every-page location available today, since there's no separate utility/top bar. Shows all 6 currencies with INR as the default/initial state for a new visitor (no cookie set yet).

## Where prices get converted

Every place currently rendering a WooCommerce-derived price switches to the shared conversion utility instead of its own formatting. Based on the current codebase, this includes:

- `components/shop/ShopCatalog.tsx` (shop listing cards)
- `components/singleproduct/SingleProduct.tsx` (single product page — price, discount, custom-size calculator)
- `components/homepage/ShopBestSellers.tsx` (homepage bestsellers)
- `components/collections/CollectionLandingPage.tsx` (collection pages)
- `components/blog/BlogContentWithProducts.tsx` and `components/article/ArticleLayout.tsx` (product cards embedded in blog content)
- `app/warli-paintings/page.tsx` (standalone landing page with product pricing)
- `components/cart/CartProvider.tsx` and any cart/wishlist/checkout UI that renders `item.price` (client-side, already reads from `useCart()`/`useWishlist()`)

**Explicitly excluded:** `lib/schema/offer.ts` (JSON-LD structured data) — this must keep reporting the real INR transactional price/currency regardless of display selection, per the SEO reasoning above. No other backend/API logic changes; this is purely a display-layer feature.

## Error handling

- Exchange-rate fetch failure → fall back to last-known-good cached rates, or INR display if none exist yet. Never show a broken/NaN price.
- Unrecognized/corrupted currency cookie value → treat as unset, default to INR.

## Out of scope

- Actually charging in a non-INR currency (see Scope decision above).
- Geo-detection or auto-selecting a currency based on visitor location — the dropdown is manual-only, defaulting to INR for everyone.
- Historical order records — past orders keep showing whatever currency they were actually placed in; this feature only affects live browsing/shopping views.
