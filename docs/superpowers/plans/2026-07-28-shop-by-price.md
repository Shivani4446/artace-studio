# Shop by Price Homepage Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Shop by Budget" homepage section with 5 price-tier cards that link to the shop page pre-filtered to that price range, reusing the shop page's existing (but not yet URL-aware) price slider.

**Architecture:** A new static Server Component (`ShopByPrice.tsx`) renders 5 hardcoded price-tier cards linking to `/shop?minPrice=X&maxPrice=Y`. `ShopCatalog.tsx` (the shop page's existing client-side filtering component) gains a small, additive extension — reading `minPrice`/`maxPrice` from the URL the same way it already reads `category` — so those links land pre-filtered. No new filtering system, no new page.

**Tech Stack:** Next.js 15.5.2 App Router, TypeScript, Tailwind CSS 4, `lucide-react` icons.

## Global Constraints

- Do NOT run `git commit` or `git push` — the user reviews and commits/pushes everything themselves. Every task ends at verification, not a commit.
- No test framework — verification via `npx tsc --noEmit`, `npm run build`, and live dev-server checks (a fresh port, never 3000).
- The 5 tiers, in order, with their exact query strings:
  1. Under ₹5,000 → `/shop?maxPrice=5000` — label "Starter Pieces"
  2. ₹5,000 – ₹10,000 → `/shop?minPrice=5000&maxPrice=10000` — label "Most Loved"
  3. ₹10,000 – ₹15,000 → `/shop?minPrice=10000&maxPrice=15000` — label "Statement Art"
  4. ₹15,000 – ₹25,000 → `/shop?minPrice=15000&maxPrice=25000` — label "Premium Pieces"
  5. Above ₹25,000 → `/shop?minPrice=25000` — label "Masterworks"
- Section placement: between `<ShopByRoom />` and `<DiscoverEssentials />` in `app/(home)/page.tsx`.
- `ShopCatalog.tsx`'s existing filtering, slider UI, and `category` query-param behavior must be completely unaffected when `minPrice`/`maxPrice` are absent from the URL (the normal, non-tiled `/shop` visit).

---

### Task 1: Create the `ShopByPrice` component

**Files:**
- Create: `components/homepage/ShopByPrice.tsx`

**Interfaces:**
- Produces: default-exported `ShopByPrice` component, no props. Rendered by Task 2.

- [ ] **Step 1: Create `components/homepage/ShopByPrice.tsx`**

```tsx
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type PriceTier = {
  label: string;
  range: string;
  href: string;
  background: string;
  textColor: string;
  subTextColor: string;
};

const PRICE_TIERS: PriceTier[] = [
  {
    label: "Starter Pieces",
    range: "Under ₹5,000",
    href: "/shop?maxPrice=5000",
    background: "bg-[#FAF7F2]",
    textColor: "text-[#1f1f1f]",
    subTextColor: "text-[#8a8478]",
  },
  {
    label: "Most Loved",
    range: "₹5,000 – ₹10,000",
    href: "/shop?minPrice=5000&maxPrice=10000",
    background: "bg-[#EFDFB8]",
    textColor: "text-[#1f1f1f]",
    subTextColor: "text-[#6b5a2f]",
  },
  {
    label: "Statement Art",
    range: "₹10,000 – ₹15,000",
    href: "/shop?minPrice=10000&maxPrice=15000",
    background: "bg-[#D4AF37]",
    textColor: "text-[#1f1f1f]",
    subTextColor: "text-[#4a3d1a]",
  },
  {
    label: "Premium Pieces",
    range: "₹15,000 – ₹25,000",
    href: "/shop?minPrice=15000&maxPrice=25000",
    background: "bg-[#4A3D2A]",
    textColor: "text-white",
    subTextColor: "text-white/70",
  },
  {
    label: "Masterworks",
    range: "Above ₹25,000",
    href: "/shop?minPrice=25000",
    background: "bg-[#1f1f1f]",
    textColor: "text-white",
    subTextColor: "text-[#D4AF37]",
  },
];

const ShopByPrice = () => {
  return (
    <section className="w-full bg-[#f4f2ee] py-14 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12">
        <p className="text-[16px] leading-[1.5] text-[#767676] md:text-[18px]">
          Shop by Budget
        </p>
        <h2 className="mt-4 font-display text-[32px] leading-[1.08] text-[#1f1f1f] sm:text-[40px] md:mt-5 md:text-[52px]">
          Find Art That Fits Your Vision — and Your Budget
        </h2>
        <p className="mt-4 max-w-2xl font-inter text-[16px] leading-[1.6] text-[#5b5b5b] md:mt-5 md:text-[18px]">
          Every price point at Artace Studio is 100% hand-painted — never
          printed, never mass-produced. Pick a range and start browsing.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:mt-12 md:gap-5 lg:grid-cols-5">
          {PRICE_TIERS.map((tier, index) => (
            <Link
              key={tier.label}
              href={tier.href}
              className={`group relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-[12px] p-6 transition-transform duration-500 hover:scale-[1.03] md:min-h-[220px] ${
                tier.background
              } ${index === PRICE_TIERS.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}
            >
              <p
                className={`font-inter text-[12px] font-semibold uppercase tracking-[0.12em] ${tier.subTextColor}`}
              >
                {tier.label}
              </p>
              <div>
                <p
                  className={`font-display text-[22px] leading-[1.15] md:text-[26px] ${tier.textColor}`}
                >
                  {tier.range}
                </p>
                <div
                  className={`mt-3 flex items-center gap-2 text-[13px] font-medium ${tier.textColor}`}
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByPrice;
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors from `components/homepage/ShopByPrice.tsx`.

---

### Task 2: Render the section on the homepage

**Files:**
- Modify: `app/(home)/page.tsx:8` (imports), `app/(home)/page.tsx:157-158` (render)

**Interfaces:**
- Consumes: `ShopByPrice` default export from Task 1.

- [ ] **Step 1: Add the import**

In `app/(home)/page.tsx`, the import block currently reads (around line 7-8):

```tsx
import ArtaceJourney from "@/components/homepage/ArtaceJourney";
import ShopBestSellers from "@/components/homepage/ShopBestSellers";
import ShopByRoom from "@/components/homepage/ShopByRoom";
import DiscoverEssentials from "@/components/homepage/DiscoverEssentials";
```

Add the new import between `ShopByRoom` and `DiscoverEssentials`:

```tsx
import ArtaceJourney from "@/components/homepage/ArtaceJourney";
import ShopBestSellers from "@/components/homepage/ShopBestSellers";
import ShopByRoom from "@/components/homepage/ShopByRoom";
import ShopByPrice from "@/components/homepage/ShopByPrice";
import DiscoverEssentials from "@/components/homepage/DiscoverEssentials";
```

- [ ] **Step 2: Render it between `ShopByRoom` and `DiscoverEssentials`**

Currently (lines 153-158):

```tsx
      <HeroSection />
      <TrustBar />
      <ShopBestSellers />
      <ArtaceJourney />
      <ShopByRoom />
      <DiscoverEssentials categories={discoverCategories} />
```

Change to:

```tsx
      <HeroSection />
      <TrustBar />
      <ShopBestSellers />
      <ArtaceJourney />
      <ShopByRoom />
      <ShopByPrice />
      <DiscoverEssentials categories={discoverCategories} />
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no new errors.

---

### Task 3: Make the shop page's price filter read `minPrice`/`maxPrice` from the URL

**Files:**
- Modify: `components/shop/ShopCatalog.tsx:334-345`

**Interfaces:**
- Consumes: `searchParams` (existing `useSearchParams()` call already in scope at line 210), `minAvailablePrice`/`maxAvailablePrice` (existing `useMemo` values immediately above the edited block).
- Produces: `priceMin`/`priceMax` state now start from the URL's `minPrice`/`maxPrice` when present and numeric, otherwise unchanged (falls back to `minAvailablePrice`/`maxAvailablePrice` exactly as today). No other function in the file changes — `filteredProducts`, `hasPriceFilter`, and the slider UI all read `priceMin`/`priceMax` downstream and need no changes.

- [ ] **Step 1: Add `priceFromQuery` and update the state initializers**

In `components/shop/ShopCatalog.tsx`, this exact block currently exists (lines 334-345):

```tsx
  const minAvailablePrice = useMemo(() => {
    if (pricedProducts.length === 0) return 0;
    return Math.floor(Math.min(...pricedProducts));
  }, [pricedProducts]);

  const maxAvailablePrice = useMemo(() => {
    if (pricedProducts.length === 0) return 0;
    return Math.ceil(Math.max(...pricedProducts));
  }, [pricedProducts]);

  const [priceMin, setPriceMin] = useState<number>(minAvailablePrice);
  const [priceMax, setPriceMax] = useState<number>(maxAvailablePrice);
```

Replace it with:

```tsx
  const minAvailablePrice = useMemo(() => {
    if (pricedProducts.length === 0) return 0;
    return Math.floor(Math.min(...pricedProducts));
  }, [pricedProducts]);

  const maxAvailablePrice = useMemo(() => {
    if (pricedProducts.length === 0) return 0;
    return Math.ceil(Math.max(...pricedProducts));
  }, [pricedProducts]);

  // Mirrors categoryFromQuery above: a homepage "Shop by Budget" tile links
  // here as e.g. /shop?minPrice=5000&maxPrice=10000, and the slider should
  // start already set to that range instead of the full catalog span.
  const priceFromQuery = useMemo(() => {
    const parseQueryPrice = (paramName: string): number | null => {
      const rawValue = searchParams.get(paramName);
      if (rawValue === null) return null;
      const parsedValue = Number(rawValue);
      return Number.isFinite(parsedValue) ? parsedValue : null;
    };

    return {
      min: parseQueryPrice("minPrice"),
      max: parseQueryPrice("maxPrice"),
    };
  }, [searchParams]);

  const [priceMin, setPriceMin] = useState<number>(() =>
    priceFromQuery.min !== null ? priceFromQuery.min : minAvailablePrice
  );
  const [priceMax, setPriceMax] = useState<number>(() =>
    priceFromQuery.max !== null ? priceFromQuery.max : maxAvailablePrice
  );
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Verify the existing, un-tiled `/shop` behavior is unchanged**

Start a dev server on port 3006 (never port 3000 — see Global Constraints):

```bash
npm run dev -- -p 3006
```

```bash
curl -s http://localhost:3006/shop | grep -o 'aria-label="Close filters"' | head -1
```

Expected: the page still loads normally (a non-empty match confirms the filters UI rendered). This is a smoke check, not a full behavioral test — since price filtering is client-side React state, the meaningful check is Step 4 below.

- [ ] **Step 4: Verify a tiled link pre-filters correctly**

With the same dev server running, fetch a tiered URL and confirm it responds successfully (the actual slider-position behavior is client-side state that only a real browser evaluates, but this confirms the route accepts the new query params without erroring):

```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3006/shop?minPrice=5000&maxPrice=10000"
```

Expected: `200`.

Stop the dev server afterward (find and kill the process listening on 3006).

---

### Task 4: Final verification

**Files:** none (verification only).

- [ ] **Step 1: Full type-check**

Run: `npx tsc --noEmit`
Expected: zero errors except the two pre-existing, unrelated ones already known in this project (`app/warli-paintings/page.tsx` and `components/navbar.tsx:1165` — not this task's concern; `next.config.ts` already sets `typescript.ignoreBuildErrors: true`).

- [ ] **Step 2: Full production build**

Run: `npm run build`
Expected: build succeeds, no route's rendering mode (`○` vs `ƒ`) changed from before this plan.

- [ ] **Step 3: Live visual check of the new section**

Start a dev server on port 3006 (not 3000):

```bash
npm run dev -- -p 3006
```

Take a screenshot of the homepage scrolled to the new section (right after "Find the Piece Your Space Is Waiting For", the `ShopByRoom` heading) at both a mobile width (375px) and a desktop width (1440px), and visually confirm:
- All 5 tiers render with their correct labels and price ranges, in ascending order.
- Background color deepens tier-over-tier (light cream → gold → dark).
- On mobile, the grid is 2 columns wide with the 5th ("Masterworks") tile spanning the full width on its own row.
- On desktop, all 5 tiles sit in a single row.

- [ ] **Step 4: Live click-through check**

With the same dev server, in a real browser (or via Playwright), click the "Most Loved" tile from the homepage and confirm:
- It navigates to `/shop?minPrice=5000&maxPrice=10000`.
- The shop page's price slider (in the filters panel) starts already positioned at ₹5,000–₹10,000, not the full catalog range.
- The product grid only shows products in that range.

Stop the dev server afterward.
