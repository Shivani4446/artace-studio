# Currency Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a currency dropdown (INR default, plus USD/AED/AUD/CAD/GBP) that converts displayed prices sitewide, while checkout continues to charge real INR unchanged.

**Architecture:** A pure conversion function + a server-side cached exchange-rate fetcher live in `lib/currency/`, used two ways: client components consume them through a `CurrencyProvider` React Context (`useCurrency()` hook, mirroring the existing `CartProvider`/`WishlistProvider` pattern); server components that render prices call the same pure function directly, reading the currency from a cookie via `next/headers`. The root layout seeds both the cookie value and freshly-fetched rates into the client provider so there's no flash of INR before hydration.

**Tech Stack:** Next.js App Router (Server + Client Components), React Context, `next/headers` cookies, `open.er-api.com` free exchange-rate API. No test framework exists in this project — verification is via `npx tsx` for pure functions and via curling the local dev/production server for integration (consistent with prior work in this codebase).

## Global Constraints

- Currencies: INR (default), USD, AED, AUD, CAD, GBP — exactly these 6, no others.
- Exchange rates from `https://open.er-api.com/v6/latest/INR`, no API key, cached via `next: { revalidate: 21600 }` (6 hours).
- If rates are unavailable (fetch fails, no cache yet), prices display in INR untouched — never show broken/NaN values, never fabricate approximate rates.
- Converted prices round to the nearest **whole unit** (no decimals), with locale-appropriate thousands grouping per currency: `en-IN` (INR), `en-US` (USD), `en-AE` (AED), `en-AU` (AUD), `en-CA` (CAD), `en-GB` (GBP).
- Selected currency persists via a cookie (not localStorage) so server-rendered pages can pre-convert on first paint.
- Unrecognized/corrupted currency cookie value → treat as unset, default to INR.
- Checkout (`app/checkout/checkout-client.tsx`, `app/checkout/success/checkout-success-client.tsx`) is explicitly **out of scope** — stays in real INR always, since that's what's actually charged.
- SEO JSON-LD schema (`lib/schema/offer.ts`) is explicitly **out of scope** — stays in real INR always, regardless of display currency.
- `components/homepage/ShopBestSellers.tsx` computes a `price` field but never renders it visibly anywhere in its JSX — confirmed by inspection, not in scope (nothing to convert).

---

### Task 1: Core currency types, exchange-rate fetcher, and conversion utility

**Files:**
- Create: `lib/currency/types.ts`
- Create: `lib/currency/rates.ts`
- Create: `lib/currency/convert.ts`
- Create: `lib/currency/cookie.ts`

**Interfaces:**
- Produces: `CurrencyCode` type (`"INR" | "USD" | "AED" | "AUD" | "CAD" | "GBP"`), `ExchangeRates` type (`{ base: "INR"; rates: Record<CurrencyCode, number>; fetchedAt: number }`), `getExchangeRates(): Promise<ExchangeRates | null>`, `formatConvertedPrice(amountInInr: number, currency: CurrencyCode, rates: ExchangeRates | null): string`, `CURRENCY_COOKIE_NAME: string`, `SUPPORTED_CURRENCIES: CurrencyCode[]`, `DEFAULT_CURRENCY: CurrencyCode` (`"INR"`), `parseCurrencyCode(value: string | undefined | null): CurrencyCode`.
- All four files have zero dependencies on React/Next UI APIs except `rates.ts`'s use of `fetch` with Next's `next: { revalidate }` option (works in both Server Components and Route Handlers) — none of this is client-only code.

- [ ] **Step 1: Write `lib/currency/types.ts`**

```typescript
// lib/currency/types.ts

export type CurrencyCode = "INR" | "USD" | "AED" | "AUD" | "CAD" | "GBP";

export type ExchangeRates = {
  base: "INR";
  rates: Record<CurrencyCode, number>;
  fetchedAt: number;
};
```

- [ ] **Step 2: Write `lib/currency/cookie.ts`**

```typescript
// lib/currency/cookie.ts
import type { CurrencyCode } from "./types";

export const CURRENCY_COOKIE_NAME = "artace-currency";

export const SUPPORTED_CURRENCIES: CurrencyCode[] = [
  "INR",
  "USD",
  "AED",
  "AUD",
  "CAD",
  "GBP",
];

export const DEFAULT_CURRENCY: CurrencyCode = "INR";

export function parseCurrencyCode(
  value: string | undefined | null
): CurrencyCode {
  if (value && (SUPPORTED_CURRENCIES as string[]).includes(value)) {
    return value as CurrencyCode;
  }
  return DEFAULT_CURRENCY;
}
```

- [ ] **Step 3: Write `lib/currency/rates.ts`**

```typescript
// lib/currency/rates.ts
import type { CurrencyCode, ExchangeRates } from "./types";

const EXCHANGE_RATE_API_URL = "https://open.er-api.com/v6/latest/INR";
const RATES_REVALIDATE_SECONDS = 21600; // 6 hours; the API itself updates once daily

type ExchangeRateApiResponse = {
  result?: string;
  rates?: Record<string, number>;
};

const REQUIRED_CURRENCIES: CurrencyCode[] = [
  "INR",
  "USD",
  "AED",
  "AUD",
  "CAD",
  "GBP",
];

// Returns null on any failure (network error, bad response, missing currency
// in the payload) — callers must treat null as "no rates available" and fall
// back to displaying INR untouched. Never fabricate approximate rates.
//
// Note: within the 6-hour revalidate window, Next.js's fetch Data Cache
// serves the cached response without hitting the network at all, and on a
// failed background revalidation it keeps serving the last good cached
// value — so this only returns null on a cold start with no cache yet, or a
// sustained multi-hour outage.
export async function getExchangeRates(): Promise<ExchangeRates | null> {
  try {
    const response = await fetch(EXCHANGE_RATE_API_URL, {
      next: { revalidate: RATES_REVALIDATE_SECONDS },
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as ExchangeRateApiResponse;
    if (payload.result !== "success" || !payload.rates) return null;

    const rates: Partial<Record<CurrencyCode, number>> = { INR: 1 };
    for (const code of REQUIRED_CURRENCIES) {
      if (code === "INR") continue;
      const rate = payload.rates[code];
      if (typeof rate !== "number" || !Number.isFinite(rate)) return null;
      rates[code] = rate;
    }

    return {
      base: "INR",
      rates: rates as Record<CurrencyCode, number>,
      fetchedAt: Date.now(),
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Write `lib/currency/convert.ts`**

```typescript
// lib/currency/convert.ts
import type { CurrencyCode, ExchangeRates } from "./types";

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: "₹",
  USD: "$",
  AED: "AED ",
  AUD: "A$",
  CAD: "C$",
  GBP: "£",
};

const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  INR: "en-IN",
  USD: "en-US",
  AED: "en-AE",
  AUD: "en-AU",
  CAD: "en-CA",
  GBP: "en-GB",
};

const formatInInr = (amountInInr: number): string =>
  `${CURRENCY_SYMBOLS.INR}${Math.round(amountInInr).toLocaleString(CURRENCY_LOCALES.INR)}`;

// Pure, framework-agnostic — safe to call from both Server and Client
// Components. Always rounds to the nearest whole unit (no decimals), per
// the existing site-wide price-formatting convention.
export function formatConvertedPrice(
  amountInInr: number,
  currency: CurrencyCode,
  rates: ExchangeRates | null
): string {
  if (currency === "INR" || !rates) {
    return formatInInr(amountInInr);
  }

  const rate = rates.rates[currency];
  if (typeof rate !== "number" || !Number.isFinite(rate)) {
    return formatInInr(amountInInr);
  }

  const convertedAmount = amountInInr * rate;
  return `${CURRENCY_SYMBOLS[currency]}${Math.round(convertedAmount).toLocaleString(
    CURRENCY_LOCALES[currency]
  )}`;
}
```

- [ ] **Step 5: Verify with a throwaway script**

Create `scratch-verify-currency.ts` in the project root:

```typescript
import { formatConvertedPrice, CURRENCY_SYMBOLS } from "./lib/currency/convert";
import { parseCurrencyCode, DEFAULT_CURRENCY } from "./lib/currency/cookie";
import { getExchangeRates } from "./lib/currency/rates";
import type { ExchangeRates } from "./lib/currency/types";

let failures = 0;

const check = (label: string, actual: unknown, expected: unknown) => {
  if (actual !== expected) {
    failures++;
    console.log(`FAIL ${label}: expected ${expected}, got ${actual}`);
  } else {
    console.log(`OK ${label}: ${actual}`);
  }
};

// Cookie parsing
check("parseCurrencyCode valid", parseCurrencyCode("USD"), "USD");
check("parseCurrencyCode invalid", parseCurrencyCode("XYZ"), DEFAULT_CURRENCY);
check("parseCurrencyCode null", parseCurrencyCode(null), DEFAULT_CURRENCY);

// Conversion with null rates always falls back to INR
check(
  "formatConvertedPrice null rates",
  formatConvertedPrice(1000, "USD", null),
  `${CURRENCY_SYMBOLS.INR}1,000`
);

// Conversion with real rates
const fakeRates: ExchangeRates = {
  base: "INR",
  rates: { INR: 1, USD: 0.012, AED: 0.044, AUD: 0.018, CAD: 0.016, GBP: 0.0095 },
  fetchedAt: Date.now(),
};
check(
  "formatConvertedPrice USD",
  formatConvertedPrice(10000, "USD", fakeRates),
  `$${Math.round(10000 * 0.012).toLocaleString("en-US")}`
);
check(
  "formatConvertedPrice INR passthrough",
  formatConvertedPrice(10000, "INR", fakeRates),
  `${CURRENCY_SYMBOLS.INR}10,000`
);

async function main() {
  console.log("Fetching live rates (requires network)...");
  const rates = await getExchangeRates();
  if (rates) {
    console.log("OK live rates fetched:", rates.rates);
  } else {
    console.log("FAIL live rates fetch returned null (check network access)");
    failures++;
  }

  console.log(failures === 0 ? "ALL PASS" : `${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
```

Run: `npx tsx scratch-verify-currency.ts`

Expected: all `OK` lines, live rates object printed with all 6 currency keys, ending in `ALL PASS`.

- [ ] **Step 6: Delete the throwaway script**

```bash
rm scratch-verify-currency.ts
```

- [ ] **Step 7: Commit**

```bash
git add lib/currency/types.ts lib/currency/rates.ts lib/currency/convert.ts lib/currency/cookie.ts
git commit -m "feat: add currency conversion core (types, rates fetcher, formatter)"
```

---

### Task 2: CurrencyProvider and useCurrency hook

**Files:**
- Create: `components/currency/CurrencyProvider.tsx`

**Interfaces:**
- Consumes: `CurrencyCode`, `ExchangeRates` from `@/lib/currency/types`; `formatConvertedPrice` from `@/lib/currency/convert`; `CURRENCY_COOKIE_NAME` from `@/lib/currency/cookie`.
- Produces: `CurrencyProvider` component with props `{ initialCurrency: CurrencyCode; initialRates: ExchangeRates | null; children: React.ReactNode }`; `useCurrency(): { currency: CurrencyCode; setCurrency: (c: CurrencyCode) => void; formatPrice: (amountInInr: number) => string }`.

- [ ] **Step 1: Write the provider**

```typescript
// components/currency/CurrencyProvider.tsx
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type { CurrencyCode, ExchangeRates } from "@/lib/currency/types";
import { formatConvertedPrice } from "@/lib/currency/convert";
import { CURRENCY_COOKIE_NAME } from "@/lib/currency/cookie";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (amountInInr: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined
);

const CURRENCY_COOKIE_MAX_AGE_SECONDS = 31536000; // 1 year

type CurrencyProviderProps = {
  initialCurrency: CurrencyCode;
  initialRates: ExchangeRates | null;
  children: React.ReactNode;
};

export const CurrencyProvider = ({
  initialCurrency,
  initialRates,
  children,
}: CurrencyProviderProps) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialCurrency);
  const [rates] = useState<ExchangeRates | null>(initialRates);

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
    if (typeof document !== "undefined") {
      document.cookie = `${CURRENCY_COOKIE_NAME}=${next}; path=/; max-age=${CURRENCY_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    }
  }, []);

  const formatPrice = useCallback(
    (amountInInr: number) => formatConvertedPrice(amountInInr, currency, rates),
    [currency, rates]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit components/currency/CurrencyProvider.tsx 2>&1 | head -30
```

Expected: no errors referencing `CurrencyProvider.tsx` itself (unrelated pre-existing project type-check noise, if any, is fine — this project already has `typescript: { ignoreBuildErrors: true }` in `next.config.ts`, so focus only on errors in the new file).

- [ ] **Step 3: Commit**

```bash
git add components/currency/CurrencyProvider.tsx
git commit -m "feat: add CurrencyProvider context and useCurrency hook"
```

---

### Task 3: Wire into root layout, add the dropdown UI, place it in the navbar

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/currency/CurrencyDropdown.tsx`
- Modify: `components/navbar.tsx:843`

**Interfaces:**
- Consumes: `CurrencyProvider` from `@/components/currency/CurrencyProvider` (Task 2); `useCurrency` from the same file; `getExchangeRates` from `@/lib/currency/rates` (Task 1); `parseCurrencyCode`, `CURRENCY_COOKIE_NAME` from `@/lib/currency/cookie` (Task 1); `CurrencyCode` from `@/lib/currency/types` (Task 1).

- [ ] **Step 1: Make the root layout async and wrap children in `CurrencyProvider`**

Current code (`app/layout.tsx:97-104`):

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
```

Change to:

```typescript
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const cookieStore = await cookies();
  const initialCurrency = parseCurrencyCode(
    cookieStore.get(CURRENCY_COOKIE_NAME)?.value
  );
  const initialRates = await getExchangeRates();

  return (
```

Add these imports near the top of `app/layout.tsx`, alongside the existing `CartProvider`/`WishlistProvider` imports:

```typescript
import { cookies } from "next/headers";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";
import { getExchangeRates } from "@/lib/currency/rates";
import { CURRENCY_COOKIE_NAME, parseCurrencyCode } from "@/lib/currency/cookie";
```

- [ ] **Step 2: Wrap the provider tree**

Current code (`app/layout.tsx:148-174`):

```typescript
        <AuthSessionProvider>
          <CartProvider>
            <WishlistProvider>
              <PromotionModal />
```

Change to:

```typescript
        <AuthSessionProvider>
          <CurrencyProvider initialCurrency={initialCurrency} initialRates={initialRates}>
          <CartProvider>
            <WishlistProvider>
              <PromotionModal />
```

And close it alongside the existing closing tags (`app/layout.tsx:172-174`):

```typescript
            </WishlistProvider>
          </CartProvider>
          </CurrencyProvider>
        </AuthSessionProvider>
```

- [ ] **Step 3: Write the dropdown component**

```typescript
// components/currency/CurrencyDropdown.tsx
"use client";

import { useCurrency } from "@/components/currency/CurrencyProvider";
import type { CurrencyCode } from "@/lib/currency/types";

const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "INR", label: "INR" },
  { code: "USD", label: "USD" },
  { code: "AED", label: "AED" },
  { code: "AUD", label: "AUD" },
  { code: "CAD", label: "CAD" },
  { code: "GBP", label: "GBP" },
];

const CurrencyDropdown = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      value={currency}
      onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
      aria-label="Select currency"
      className="h-9 rounded-[8px] border border-[#d5d5d5] bg-white px-2 text-[13px] font-medium text-[#2f2f2f] transition-colors hover:border-black/40 focus:outline-none md:h-10 md:text-[14px]"
    >
      {CURRENCY_OPTIONS.map((option) => (
        <option key={option.code} value={option.code}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default CurrencyDropdown;
```

- [ ] **Step 4: Place it in the navbar**

Current code (`components/navbar.tsx:843-846`):

```typescript
            <Link
              href="/wishlist"
              aria-label="Open wishlist"
              className="relative inline-flex h-9 w-9 items-center justify-center text-[#2f2f2f] transition-colors hover:text-black md:h-10 md:w-10"
```

Change to (add the dropdown immediately before this `Link`):

```typescript
            <CurrencyDropdown />

            <Link
              href="/wishlist"
              aria-label="Open wishlist"
              className="relative inline-flex h-9 w-9 items-center justify-center text-[#2f2f2f] transition-colors hover:text-black md:h-10 md:w-10"
```

Add the import near the top of `components/navbar.tsx`, alongside the other component imports (e.g. next to the `useCart`/`useWishlist` import lines):

```typescript
import CurrencyDropdown from "@/components/currency/CurrencyDropdown";
```

- [ ] **Step 5: Verify with the dev server**

```bash
npm run dev
```

Wait for it to be ready, then:

```bash
curl -s -o /dev/null -w "STATUS:%{http_code}\n" "http://localhost:3000/" --max-time 30
curl -s "http://localhost:3000/" --max-time 30 | grep -o "Select currency"
```

Expected: `STATUS:200`, and `Select currency` found (confirms the dropdown rendered). Also open `http://localhost:3000/` in a browser if possible and confirm the dropdown appears in the navbar next to the wishlist/account/cart icons, showing "INR" selected by default.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx components/currency/CurrencyDropdown.tsx components/navbar.tsx
git commit -m "feat: wire currency provider into root layout, add dropdown to navbar"
```

---

### Task 4: Wire client components — shop catalog, blog product cards, cart, wishlist

**Files:**
- Modify: `components/shop/ShopCatalog.tsx:1097-1110`
- Modify: `components/blog/BlogContentWithProducts.tsx:180-193`
- Modify: `app/cart/cart-client.tsx:109,147,169`
- Modify: `app/wishlist/wishlist-client.tsx:9-11,68`

**Interfaces:**
- Consumes: `useCurrency` from `@/components/currency/CurrencyProvider` (Task 2). All four files are already Client Components (`"use client"` present).

- [ ] **Step 1: ShopCatalog — replace local `formatPrice` calls**

The local helper at `components/shop/ShopCatalog.tsx:52-66` (`formatPrice(value, currencyCode, currencySymbol)`) has exactly two callers, both replaced below — after this change it becomes unused; delete its definition too (confirm first with `grep -n "formatPrice(" components/shop/ShopCatalog.tsx` — it should show zero matches once both call sites below are updated).

Find the two call sites at `components/shop/ShopCatalog.tsx:1097` and `:1107` (each looks like):

```typescript
                                    {formatPrice(
                                      product.price,
                                      product.currencyCode,
                                      product.currencySymbol
                                    )}
```

Replace each with:

```typescript
                                    {product.price !== null
                                      ? currency.formatPrice(product.price)
                                      : null}
```

(Match the exact surrounding indentation/JSX structure already at each call site — there are two near-identical blocks around lines 1097 and 1107, one for the sale price and one for the regular/strikethrough price; apply the same replacement pattern to both, keeping whichever conditional wrapper already surrounds each.)

Add the hook call near the top of the component function (alongside other hooks like `useState`/`useMemo` calls already in the component):

```typescript
  const currency = useCurrency();
```

Add the import at the top of the file:

```typescript
import { useCurrency } from "@/components/currency/CurrencyProvider";
```

- [ ] **Step 2: BlogContentWithProducts — replace local `formatPrice` calls**

Same pattern. Find the call sites at `components/blog/BlogContentWithProducts.tsx:180` and `:190` (each calling the local `formatPrice(value, currencyCode, currencySymbol)`), replace with `currency.formatPrice(value)`, add `const currency = useCurrency();` near the top of the component, and add the same import as Step 1. Both call sites are the function's only callers, so once replaced, delete its definition too (confirm with `grep -n "formatPrice(" components/blog/BlogContentWithProducts.tsx` — zero matches expected afterward).

- [ ] **Step 3: Cart — replace raw INR display**

Current code (`app/cart/cart-client.tsx:109`):

```typescript
                    INR {(item.price || 0).toLocaleString("en-IN")}
```

Change to:

```typescript
                    {currency.formatPrice(item.price || 0)}
```

Current code (`app/cart/cart-client.tsx:147`):

```typescript
                  INR {((item.price || 0) * item.quantity).toLocaleString("en-IN")}
```

Change to:

```typescript
                  {currency.formatPrice((item.price || 0) * item.quantity)}
```

Current code (`app/cart/cart-client.tsx:169`):

```typescript
                INR {subtotal.toLocaleString("en-IN")}
```

Change to:

```typescript
                {currency.formatPrice(subtotal)}
```

Add `const currency = useCurrency();` near the top of the component and the same import as Step 1.

- [ ] **Step 4: Wishlist — replace local `formatPrice`**

Current code (`app/wishlist/wishlist-client.tsx:9-16`, approximately):

```typescript
const formatPrice = (value?: number) => {
  if (typeof value !== "number") return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};
```

Leave this module-level function in place (or remove it if nothing else in the file uses it — check with `grep -n "formatPrice" app/wishlist/wishlist-client.tsx` first). At the call site (`app/wishlist/wishlist-client.tsx:68`):

```typescript
          const formattedPrice = formatPrice(item.price);
```

Change to:

```typescript
          const formattedPrice =
            typeof item.price === "number" ? currency.formatPrice(item.price) : null;
```

Add `const currency = useCurrency();` near the top of the component and the same import as Step 1. If `grep -n "formatPrice" app/wishlist/wishlist-client.tsx` shows the local function has no other callers after this change, delete the now-unused function definition.

- [ ] **Step 5: Verify with the dev server**

```bash
curl -s -o /dev/null -w "STATUS:%{http_code}\n" "http://localhost:3000/shop" --max-time 30
curl -s -o /dev/null -w "STATUS:%{http_code}\n" "http://localhost:3000/cart" --max-time 30
curl -s -o /dev/null -w "STATUS:%{http_code}\n" "http://localhost:3000/wishlist" --max-time 30
```

Expected: all `STATUS:200`. Since currency conversion is a client-side reactive feature (changes on dropdown selection, not on initial INR-default SSR paint), full manual verification of the *converted* values requires a browser: open each page, change the currency dropdown, and confirm displayed prices update accordingly and cart/wishlist totals recompute correctly.

- [ ] **Step 6: Commit**

```bash
git add components/shop/ShopCatalog.tsx components/blog/BlogContentWithProducts.tsx app/cart/cart-client.tsx app/wishlist/wishlist-client.tsx
git commit -m "feat: convert prices in shop catalog, blog product cards, cart, and wishlist"
```

---

### Task 5: Wire single product page

**Files:**
- Modify: `components/singleproduct/SingleProduct.tsx:961-1003` (custom-size calculator price, main price, regular price)

**Interfaces:**
- Consumes: `useCurrency` from `@/components/currency/CurrencyProvider` (Task 2).

This file already has a module-level `formatPrice(value, currencyCode, currencySymbol)` helper (`SingleProduct.tsx:410-425`, not exported) used by exactly three `useMemo` blocks below. All three are replaced in this task, so once done, delete the module-level `formatPrice` function too (confirm with `grep -n "formatPrice(" components/singleproduct/SingleProduct.tsx` — zero matches expected afterward).

- [ ] **Step 1: Add the hook**

Add near the other hooks already declared in the component body (e.g. alongside `const [selectedSize, setSelectedSize] = useState("");` or similar):

```typescript
  const currency = useCurrency();
```

Add the import at the top of the file:

```typescript
import { useCurrency } from "@/components/currency/CurrencyProvider";
```

- [ ] **Step 2: Custom-size calculator price**

Current code (`components/singleproduct/SingleProduct.tsx:976-981`, approximately):

```typescript
    return formatPrice(
      customCalculatedPrice,
      product.currencyCode,
      product.currencySymbol
    );
  }, [customCalculatedPrice, product]);
```

Change to:

```typescript
    return customCalculatedPrice !== null
      ? currency.formatPrice(customCalculatedPrice)
      : null;
  }, [customCalculatedPrice, currency]);
```

- [ ] **Step 3: Main price**

Current code (`components/singleproduct/SingleProduct.tsx:996-999`):

```typescript
  const formattedPrice = useMemo(() => {
    if (!product || currentPrice === null) return null;
    return formatPrice(currentPrice, product.currencyCode, product.currencySymbol);
  }, [product, currentPrice]);
```

Change to:

```typescript
  const formattedPrice = useMemo(() => {
    if (!product || currentPrice === null) return null;
    return currency.formatPrice(currentPrice);
  }, [product, currentPrice, currency]);
```

- [ ] **Step 4: Regular (strikethrough) price**

Find the `formattedRegularPrice` `useMemo` block starting at `components/singleproduct/SingleProduct.tsx:1001` — it follows the exact same shape as Step 3 (checks `product`/`currentRegularPrice`, calls the module-level `formatPrice` with `product.currencyCode`/`product.currencySymbol`). Apply the same replacement: swap the `formatPrice(...)` call for `currency.formatPrice(currentRegularPrice)` (using whatever the regular-price variable is named at that call site), and add `currency` to the `useMemo` dependency array.

- [ ] **Step 5: Verify with the dev server**

```bash
curl -s "http://localhost:3000/shop/handmade-lord-vitthal-canvas-painting-contemporary-vithoba-wall-art-art-ace-studio" --max-time 30 -o /tmp/currency-check-product.html -w "STATUS:%{http_code}\n"
grep -o "Select currency" /tmp/currency-check-product.html
```

Expected: `STATUS:200`, dropdown present in the rendered navbar HTML. As with Task 4, full verification of live conversion (changing the dropdown and watching the main price, discount price, and custom-size calculator all update) requires a browser.

- [ ] **Step 6: Commit**

```bash
git add components/singleproduct/SingleProduct.tsx
git commit -m "feat: convert prices on single product page"
```

---

### Task 6: Wire server components — collections, article layout, warli-paintings

**Files:**
- Modify: `components/collections/CollectionLandingPage.tsx:94-108,620,743-749`
- Modify: `components/article/ArticleLayout.tsx:517-524`
- Modify: `app/warli-paintings/page.tsx:135-145,415`

**Interfaces:**
- Consumes: `getExchangeRates` from `@/lib/currency/rates`, `formatConvertedPrice` from `@/lib/currency/convert`, `parseCurrencyCode`/`CURRENCY_COOKIE_NAME` from `@/lib/currency/cookie` (all Task 1). None of these three files are Client Components — they read the currency cookie directly via `next/headers` and call the pure `formatConvertedPrice` function directly (no React Context, no hook — Context does not work in Server Components).

These three files are Server Components (confirmed: no `"use client"` directive in any of them). Each currently has its own local `formatPrice(value, currencyCode, currencySymbol)` function (or, for `ArticleLayout.tsx`, an inline `Intl.NumberFormat` call). The fix in each: fetch rates + read the cookie once near the top of the component function (these are `async` Server Components already, since they fetch WooCommerce data), and replace the local formatter's body to delegate to the shared `formatConvertedPrice`.

- [ ] **Step 1: CollectionLandingPage — make it async and replace the local `formatPrice` function**

Unlike the other two files in this task, `CollectionLandingPage` is **not currently async** — it's a plain synchronous Server Component receiving pre-fetched data as props from `app/collections/[slug]/page.tsx`. It must become async to `await cookies()`.

Current code (`components/collections/CollectionLandingPage.tsx:710-720`):

```typescript
const CollectionLandingPage = ({
  categoryName,
  categorySlug,
  description,
  heroImage,
  heroImageAlt,
  topProducts,
  products,
  suggestions,
  faqItems,
}: CollectionLandingPageProps) => {
```

Change to:

```typescript
const CollectionLandingPage = async ({
  categoryName,
  categorySlug,
  description,
  heroImage,
  heroImageAlt,
  topProducts,
  products,
  suggestions,
  faqItems,
}: CollectionLandingPageProps) => {
```

This is safe: it's a Server Component (no `"use client"` in the file), and React's Server Component rendering already supports async function components transparently — no change needed at the call site in `app/collections/[slug]/page.tsx`.

Current code (`components/collections/CollectionLandingPage.tsx:94-108`, the module-level helper):

```typescript
const formatPrice = (
  value: number | null,
  currencyCode: string,
  currencySymbol: string
) => {
  // ... existing body using Intl.NumberFormat / currencySymbol fallback
};
```

Add these imports at the top of the file:

```typescript
import { cookies } from "next/headers";
import { getExchangeRates } from "@/lib/currency/rates";
import { formatConvertedPrice } from "@/lib/currency/convert";
import { CURRENCY_COOKIE_NAME, parseCurrencyCode } from "@/lib/currency/cookie";
```

Inside the component function body, near the top (before the JSX that calls `formatPrice`), add:

```typescript
  const cookieStore = await cookies();
  const selectedCurrency = parseCurrencyCode(
    cookieStore.get(CURRENCY_COOKIE_NAME)?.value
  );
  const exchangeRates = await getExchangeRates();
```

Then replace both call sites:

Current (`components/collections/CollectionLandingPage.tsx:620`):

```typescript
            {formatPrice(product.price, product.currencyCode, product.currencySymbol)}
```

Change to:

```typescript
            {product.price !== null
              ? formatConvertedPrice(product.price, selectedCurrency, exchangeRates)
              : null}
```

Current (`components/collections/CollectionLandingPage.tsx:743-749`, approximately):

```typescript
    ? `Starting from ${formatPrice(
        lowestPriceProduct.price,
        lowestPriceProduct.currencyCode,
        lowestPriceProduct.currencySymbol
      )}`
```

Change to:

```typescript
    ? `Starting from ${formatConvertedPrice(
        lowestPriceProduct.price ?? 0,
        selectedCurrency,
        exchangeRates
      )}`
```

Remove the now-unused local `formatPrice` function if nothing else in the file calls it (`grep -n "formatPrice(" components/collections/CollectionLandingPage.tsx` to confirm before deleting).

- [ ] **Step 2: ArticleLayout — replace inline `Intl.NumberFormat`**

Add the same four imports as Step 1 to the top of `components/article/ArticleLayout.tsx`.

This component is already `async` (`const ArticleLayout = async ({ ... }) => {` at `components/article/ArticleLayout.tsx:309`) — no signature change needed here, unlike Step 1.

Add the same cookie/rates lookup as Step 1 near the top of the component body (after the destructured props, before the JSX that uses `product.price`).

Current code (`components/article/ArticleLayout.tsx:517-524`):

```typescript
                    {typeof product.price === "number" && (
                      <p className="font-inter text-[16px] text-white mt-2">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: product.prices?.currency_code ?? "INR",
                          maximumFractionDigits: 0,
                        }).format(product.price)}
                      </p>
                    )}
```

Change to:

```typescript
                    {typeof product.price === "number" && (
                      <p className="font-inter text-[16px] text-white mt-2">
                        {formatConvertedPrice(product.price, selectedCurrency, exchangeRates)}
                      </p>
                    )}
```

- [ ] **Step 3: warli-paintings page — replace the local `formatPrice` function**

Add the same four imports as Step 1. This component is already `async` (`const WarliPage = async () => {` at `app/warli-paintings/page.tsx:182`) — no signature change needed. Add the cookie/rates lookup near the top of the component body, same as Step 1.

Current code (`app/warli-paintings/page.tsx:135-145`, the module-level helper) — same shape as `CollectionLandingPage.tsx`'s.

Current call site (`app/warli-paintings/page.tsx:415`):

```typescript
                          {formatPrice(product.price, product.currencyCode, product.currencySymbol)}
```

Change to:

```typescript
                          {product.price !== null
                            ? formatConvertedPrice(product.price, selectedCurrency, exchangeRates)
                            : null}
```

Remove the now-unused local `formatPrice` function if nothing else calls it (check first, same as Step 1).

- [ ] **Step 4: Verify with the dev server**

```bash
curl -s -o /dev/null -w "STATUS:%{http_code}\n" "http://localhost:3000/collections/abstract-paintings" --max-time 30
curl -s -o /dev/null -w "STATUS:%{http_code}\n" "http://localhost:3000/blogs/abstract-varanasi-painting-style-guide" --max-time 30
curl -s -o /dev/null -w "STATUS:%{http_code}\n" "http://localhost:3000/warli-paintings" --max-time 30
```

Expected: all `STATUS:200`. To confirm the cookie-based server-side conversion actually works, set the currency cookie manually and re-request:

```bash
curl -s -o /dev/null -w "STATUS:%{http_code}\n" -b "artace-currency=USD" "http://localhost:3000/collections/abstract-paintings" --max-time 30
curl -s -b "artace-currency=USD" "http://localhost:3000/collections/abstract-paintings" --max-time 30 | grep -o '\$[0-9,]*' | head -5
```

Expected: the second command shows `$`-prefixed converted amounts (not `₹`), confirming the server picked up the cookie and rendered USD prices in the initial HTML.

- [ ] **Step 5: Commit**

```bash
git add components/collections/CollectionLandingPage.tsx components/article/ArticleLayout.tsx "app/warli-paintings/page.tsx"
git commit -m "feat: convert prices in server-rendered collection, article, and warli-paintings pages"
```

---

### Task 7: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Confirm default currency is INR for a fresh visitor**

```bash
curl -s "http://localhost:3000/shop" --max-time 30 | grep -o "₹[0-9,]*" | head -3
```

Expected: `₹`-prefixed prices (default, no cookie set).

- [ ] **Step 2: Confirm every modified page still returns 200**

```bash
for path in "/" "/shop" "/cart" "/wishlist" "/collections/abstract-paintings" "/warli-paintings" "/shop/handmade-lord-vitthal-canvas-painting-contemporary-vithoba-wall-art-art-ace-studio"; do
  echo -n "$path -> "
  curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000$path" --max-time 30
done
```

Expected: `200` for every path.

- [ ] **Step 3: Confirm checkout and JSON-LD schema were NOT touched**

```bash
git diff --stat -- app/checkout/checkout-client.tsx app/checkout/success/checkout-success-client.tsx lib/schema/offer.ts
```

Expected: no output (empty diff) — these are intentionally out of scope per the Global Constraints section.

- [ ] **Step 4: Manual browser check**

Open `http://localhost:3000/shop` in a real browser (curl cannot verify client-side reactivity). Change the currency dropdown to USD. Confirm: (a) shop listing prices update immediately without a page reload, (b) navigating to a single product page shows the same USD prices, (c) adding an item to cart and opening `/cart` shows USD prices and a correctly-converted subtotal, (d) reloading the page keeps USD selected (cookie persistence) and prices are already correct on first paint (no flash of INR).

- [ ] **Step 5: Report completion**

No commit needed for this task — it's verification only. If all checks above pass, the feature is complete.
