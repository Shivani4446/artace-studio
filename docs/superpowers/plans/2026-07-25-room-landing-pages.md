# Room-Specific Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 4 standalone room-specific landing pages (Bedroom, Living Room, Dining Room, Pooja Room) so the homepage "Shop by Room" tiles link to real, SEO-optimized content instead of the generic `/shop` page.

**Architecture:** Each room is an independent Next.js page under `app/rooms/<room>/page.tsx`, following the existing `app/warli-paintings/page.tsx` pattern (own hero, own editorial copy, own `metadata` export, own JSON-LD) rather than a shared generic template. Product-to-room mapping is manual curation (a hardcoded slug list per page) because no WooCommerce category or tag data reliably groups products by room. One small shared helper, `lib/rooms.ts`, does the WooCommerce Store API fetch-by-slug plumbing all 4 pages need.

**Tech Stack:** Next.js App Router (Server Components, edge runtime), TypeScript, Tailwind CSS, lucide-react icons, WooCommerce Store API.

## Global Constraints

- Design doc: `docs/superpowers/specs/2026-07-25-room-landing-pages-design.md` — read for full rationale.
- No test framework exists in this repo (`package.json` has no jest/vitest/testing-library/playwright). Verification in every task uses this project's established discipline instead: `npx tsc --noEmit --project tsconfig.json`, `npm run build`, and a temporary `npm run dev` instance (auto-bumps to port 3001 since the user's own dev server occupies port 3000) with `curl` against real rendered HTML. Do not invent a unit-test suite that doesn't match the codebase's conventions.
- Every server-fetching page in this app declares `export const runtime = 'edge';` (confirmed present in `app/warli-paintings/page.tsx`, `app/shop/page.tsx`, `app/shop/[slug]/page.tsx`, `app/collections/[slug]/page.tsx`, `app/blogs/[slug]/page.tsx`) — required for the Cloudflare Pages deployment (`next-on-pages` build). All 4 new room pages must declare it too.
- WooCommerce Store API's `slug` query param accepts a comma-separated list and returns all matches in one call, but **does not preserve input order** — confirmed live: requesting `slug=golden-buddha-canvas-painting,water-lily-canvas-painting,silence-peace` returned `water-lily-canvas-painting, golden-buddha-canvas-painting, silence-peace`. The shared fetch helper must re-sort results back into the caller's input order.
- Do NOT run `git commit` or `git push` at any point in this plan — the user handles all commits/pushes themselves in this project. Skip every "Commit" step below; treat it as "stage nothing, move to the next step."
- Never touch port 3000 when starting/stopping a verification dev server — that's the user's own running dev server. Always verify via `netstat -ano | grep LISTENING` + `Get-CimInstance Win32_Process` before any `taskkill`.
- Colors/classes: match the palette already used by `components/homepage/ShopByRoom.tsx` and `components/homepage/HeroSection.tsx` (background `#f4f2ee`, dark text `#1f1f1f`/`#2c2c2c`, white cards, black hero overlay gradients) — do not introduce Warli's brown/cream palette (`#5D4037`/`#8B4513`/`#F5F5DC`), since rooms aren't a distinct sub-brand the way Warli tribal art is.

---

### Task 1: Shared product-fetch helper

**Files:**
- Create: `lib/rooms.ts`

**Interfaces:**
- Consumes: `decodeHtmlEntities` from `@/utils/text` (existing, signature `(value: string) => string`).
- Produces: `export type RoomProductCard = { id: number; slug: string; name: string; image: string; imageAlt: string; price: number | null; currencyCode: string; currencySymbol: string }` and `export const fetchProductsBySlugs: (slugs: readonly string[]) => Promise<RoomProductCard[]>` — both consumed by Tasks 2–5.

- [ ] **Step 1: Write `lib/rooms.ts`**

```ts
import { decodeHtmlEntities } from "@/utils/text";

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";
const STOREFRONT_REVALIDATE_SECONDS = 60;

type WooStorePrices = {
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  price: string;
  regular_price: string;
  sale_price: string;
};

type WooStoreImage = {
  id: number;
  src: string;
  alt?: string;
  name?: string;
};

type WooStoreProduct = {
  id: number;
  slug: string;
  name: string;
  images: WooStoreImage[];
  prices: WooStorePrices;
};

export type RoomProductCard = {
  id: number;
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  price: number | null;
  currencyCode: string;
  currencySymbol: string;
};

const getApiBaseUrl = () => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || DEFAULT_WOOCOMMERCE_SITE_URL;
  return apiBaseUrl.replace(/\/+$/, "");
};

export const fetchProductsBySlugs = async (
  slugs: readonly string[]
): Promise<RoomProductCard[]> => {
  if (slugs.length === 0) return [];

  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(
      `${apiBaseUrl}/wp-json/wc/store/v1/products?slug=${slugs.join(",")}&per_page=${slugs.length}`,
      {
        next: { revalidate: STOREFRONT_REVALIDATE_SECONDS },
      }
    );

    if (!response.ok) {
      return [];
    }

    const products = (await response.json()) as WooStoreProduct[];
    if (!Array.isArray(products)) return [];

    const bySlug = new Map(products.map((product) => [product.slug, product]));

    return slugs
      .map((slug) => bySlug.get(slug))
      .filter((product): product is WooStoreProduct => Boolean(product))
      .map((product) => {
        const minorUnit = product.prices?.currency_minor_unit ?? 2;
        const numericPrice = product.prices?.price
          ? Number(product.prices.price) / 10 ** minorUnit
          : null;

        return {
          id: product.id,
          slug: product.slug,
          name: decodeHtmlEntities(product.name),
          image: product.images?.[0]?.src || FALLBACK_PRODUCT_IMAGE,
          imageAlt: decodeHtmlEntities(
            product.images?.[0]?.alt || product.images?.[0]?.name || product.name
          ),
          price: numericPrice,
          currencyCode: product.prices?.currency_code || "INR",
          currencySymbol: product.prices?.currency_symbol || "Rs. ",
        };
      });
  } catch {
    return [];
  }
};
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: no errors referencing `lib/rooms.ts`.

(Functional verification of the ordering fix happens in Task 2, the first real consumer — this file has no isolated test suite to run against, matching this repo's existing convention of verifying server-fetch code via a live route rather than unit tests.)

---

### Task 2: Bedroom page

**Files:**
- Create: `app/rooms/bedroom/page.tsx`

**Interfaces:**
- Consumes: `fetchProductsBySlugs`, `RoomProductCard` from `@/lib/rooms` (Task 1); `buildSiteUrl`, `toAbsoluteImageUrl` from `@/lib/site`; `AddToCartButton` from `@/components/cart/AddToCartButton`; `getExchangeRates` from `@/lib/currency/rates`; `formatConvertedPrice` from `@/lib/currency/convert`; `CURRENCY_COOKIE_NAME`, `parseCurrencyCode` from `@/lib/currency/cookie` — all pre-existing, same imports `app/warli-paintings/page.tsx` already uses.
- Produces: route `GET /rooms/bedroom` — consumed by Task 6 (homepage tile href).

- [ ] **Step 1: Write `app/rooms/bedroom/page.tsx`**

```tsx
import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Moon, Ruler, Heart, Sparkles } from "lucide-react";
import { buildSiteUrl, toAbsoluteImageUrl } from "@/lib/site";
import { fetchProductsBySlugs } from "@/lib/rooms";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { getExchangeRates } from "@/lib/currency/rates";
import { formatConvertedPrice } from "@/lib/currency/convert";
import { CURRENCY_COOKIE_NAME, parseCurrencyCode } from "@/lib/currency/cookie";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Bedroom Paintings Online India | Calming Canvas Wall Art | Artace Studio",
  description:
    "Shop hand-painted bedroom wall art online in India — calming canvas paintings in soft, soothing palettes, sized for above the headboard or an accent wall. 100% handmade, never printed.",
  alternates: {
    canonical: "/rooms/bedroom",
  },
  openGraph: {
    title: "Bedroom Paintings Online India | Calming Canvas Wall Art | Artace Studio",
    description:
      "Shop hand-painted bedroom wall art online in India — calming canvas paintings in soft, soothing palettes, sized for above the headboard or an accent wall.",
    url: "/rooms/bedroom",
    type: "website",
    images: [
      {
        url: buildSiteUrl("/images/bedroom.jpeg"),
        width: 1402,
        height: 1122,
        alt: "Bedroom styled with a calming wall painting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bedroom Paintings Online India | Calming Canvas Wall Art",
    description: "Shop hand-painted bedroom wall art online in India, in soft, soothing palettes.",
    images: [buildSiteUrl("/images/bedroom.jpeg")],
  },
};

const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";

const BEDROOM_PRODUCT_SLUGS = [
  "water-lily-canvas-painting",
  "golden-buddha-canvas-painting",
  "white-buddha-canvas-painting",
  "meditating-buddha-canvas-painting",
  "silence-peace",
  "beauty-of-bamboo-canvas-painting",
  "sunset-beauty-canavs-painting",
  "four-seasons-tree-canvas-painting",
  "peace-handmade-canvas-painting-vastu",
  "radhe-mohan-canvas-painting",
] as const;

const bedroomTips = [
  {
    icon: Moon,
    title: "Choose a Calming Palette",
    description:
      "Soft blues, warm neutrals, and muted gold read as restful. Save bold reds and high-contrast pieces for more active rooms like the living room.",
  },
  {
    icon: Ruler,
    title: "Size to Your Headboard",
    description:
      "For above-the-bed placement, aim for artwork roughly two-thirds the width of your headboard, so it feels intentional rather than floating.",
  },
  {
    icon: Heart,
    title: "Consider the Subject Carefully",
    description:
      "Water, nature, and meditative figures like Buddha tend to suit a bedroom's purpose better than busy, high-energy scenes.",
  },
  {
    icon: Sparkles,
    title: "One Statement, Not Many",
    description:
      "A single well-chosen piece almost always outperforms a cluttered gallery wall in a room meant for rest.",
  },
];

const BedroomPage = async () => {
  const cookieStore = await cookies();
  const selectedCurrency = parseCurrencyCode(cookieStore.get(CURRENCY_COOKIE_NAME)?.value);
  const exchangeRates = await getExchangeRates();

  const products = await fetchProductsBySlugs(BEDROOM_PRODUCT_SLUGS);

  const bedroomSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${buildSiteUrl("/rooms/bedroom")}#webpage`,
        url: buildSiteUrl("/rooms/bedroom"),
        name: "Bedroom Paintings | Calming Canvas Wall Art",
        description:
          "Shop hand-painted bedroom wall art online in India — calming canvas paintings in soft, soothing palettes.",
        isPartOf: {
          "@id": `${buildSiteUrl("/")}#website`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${buildSiteUrl("/rooms/bedroom")}#itemlist`,
        url: buildSiteUrl("/rooms/bedroom"),
        numberOfItems: products.length,
        itemListElement: products.slice(0, 6).map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: buildSiteUrl(`/shop/${product.slug}`),
          name: product.name,
          image: toAbsoluteImageUrl(product.image),
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bedroomSchema) }}
      />
      <main className="bg-[#fcfaf7] text-[#313131]">
        {/* Section 1: Hero */}
        <section className="relative isolate w-full overflow-hidden bg-black">
          <div className="relative h-[75vh] min-h-[520px] w-full md:h-[85vh] md:min-h-[620px]">
            <Image
              src="/images/bedroom.jpeg"
              alt="Bedroom styled with a calming wall painting"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

            <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] items-end px-6 pb-14 md:items-center md:px-12 md:pb-0">
              <div className="w-full max-w-2xl text-left text-white">
                <p className="font-display text-[16px] font-medium uppercase tracking-[0.08em] text-white/80 md:text-[18px]">
                  A Quiet Retreat, Styled Around You
                </p>
                <h1 className="mt-4 font-display text-[36px] font-semibold leading-[1.08] sm:text-[42px] md:mt-5 md:text-[52px]">
                  Bedroom Paintings
                </h1>
                <p className="mt-5 max-w-xl text-[16px] leading-[1.65] text-white/85 md:text-[18px]">
                  Bring a calming focal point to your bedroom with hand-painted canvas
                  art chosen for soft palettes and quiet subjects — pieces sized to rest
                  above your headboard or anchor a reading corner, so the room feels
                  finished, not just decorated.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                  <Link
                    href="#bedroom-collection"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-white px-8 py-4 text-[17px] font-medium text-[#1f1f1f] transition-transform hover:-translate-y-0.5 sm:w-auto md:text-[18px]"
                  >
                    Shop Bedroom Paintings
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/custom-order"
                    className="inline-flex w-full items-center justify-center rounded-md border border-white/60 bg-transparent px-8 py-4 text-[17px] font-medium text-white transition-colors hover:bg-white/10 sm:w-auto md:text-[18px]"
                  >
                    Commission a Custom Piece
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: About */}
        <section className="py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mx-auto max-w-[820px] text-center">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                About Bedroom Art
              </p>
              <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-[#1f1f1f] sm:text-[36px] md:mt-4 md:text-[44px]">
                Art That Makes a Bedroom Feel Like a Retreat
              </h2>
            </div>
            <div className="mx-auto mt-8 max-w-[820px] space-y-5 text-[16px] leading-[1.7] text-[#5b5b5b] md:mt-10 md:text-[18px] md:leading-[1.65]">
              <p>
                A bedroom is the one room meant purely for rest, so the art on its walls
                should lower the temperature of the space, not raise it. At Artace
                Studio, our bedroom picks lean toward soft blues, warm neutrals, and
                gentle gold — palettes proven to calm rather than energize.
              </p>
              <p>
                Every piece is hand-painted in acrylic on premium canvas, so even a
                quiet, minimal composition carries visible texture and depth up close —
                nothing about it reads as a mass-printed poster.
              </p>
              <p>
                Most homeowners hang bedroom art directly above the headboard or
                centered on the wall facing the bed. We&apos;re happy to help you choose a
                size that fills the wall correctly for your specific bed frame — just
                message us with your dimensions.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Styling tips */}
        <section className="bg-[#f4f2ee] py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mx-auto max-w-[800px] text-center">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                Styling Tips
              </p>
              <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-[#1f1f1f] sm:text-[38px] md:mt-4 md:text-[46px]">
                Choosing the Right Piece for Your Bedroom
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 md:mt-14">
              {bedroomTips.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article
                    key={`bedroom-tip-${index}`}
                    className="rounded-[16px] border border-black/8 bg-white p-6 md:p-8"
                  >
                    <div className="mb-5 inline-flex rounded-[12px] bg-[#f4f2ee] p-3 md:mb-6">
                      <Icon className="h-6 w-6 text-[#1f1f1f]" />
                    </div>
                    <h3 className="font-display text-[19px] font-semibold leading-[1.2] text-[#1f1f1f] md:text-[21px]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-[1.6] text-[#5b5b5b] md:text-[16px]">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 4: Product grid */}
        <section id="bedroom-collection" className="py-12 md:py-[100px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mb-8 md:mb-12">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                Curated Collection
              </p>
              <h2 className="mt-2 font-display text-[30px] font-semibold leading-[1.1] text-[#1f1f1f] sm:text-[36px] md:mt-3 md:text-[44px]">
                Shop Bedroom Paintings
              </h2>
              <p className="mt-3 text-[16px] leading-[1.6] text-[#5b5b5b] md:mt-4 md:text-[18px]">
                Hand-painted pieces chosen for calm, restful spaces.
              </p>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
                {products.map((product) => (
                  <article key={product.id} className="group relative flex flex-col">
                    <Link
                      href={`/shop/${product.slug}`}
                      aria-label={`View ${product.name}`}
                      className="absolute inset-0 z-10"
                    />

                    <div className="relative z-0">
                      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-[12px] bg-[#d6d2ca]">
                        <Image
                          src={product.image || FALLBACK_PRODUCT_IMAGE}
                          alt={product.imageAlt || product.name}
                          fill
                          sizes="(max-width: 767px) 50vw, (max-width: 1200px) 25vw, 20vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <h3 className="font-display text-[15px] leading-snug text-[#2c2c2c] sm:text-[18px] md:text-[20px]">
                          {product.name}
                        </h3>
                        <p className="text-[14px] text-[#5b5b5b] sm:text-[15px] md:text-[16px]">
                          {product.price !== null
                            ? formatConvertedPrice(product.price, selectedCurrency, exchangeRates)
                            : null}
                        </p>
                      </div>
                    </div>

                    <div className="pointer-events-auto relative z-20 mt-4 translate-y-0 opacity-100 transition-all duration-300 md:pointer-events-none md:translate-y-1 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100">
                      <AddToCartButton
                        id={product.id}
                        woocommerceProductId={product.id}
                        title={product.name}
                        image={product.image || FALLBACK_PRODUCT_IMAGE}
                        subtitle="Handmade Bedroom Painting"
                        price={product.price ?? undefined}
                      />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#1f1f1f]/10 bg-white p-8 text-center">
                <p className="text-[#5b5b5b]">
                  No bedroom paintings available at the moment. Check back soon or
                  <Link href="/custom-order" className="text-[#1f1f1f] underline">
                    {" "}
                    commission a custom piece
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Section 5: CTA */}
        <section className="bg-[#1f1f1f] py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="flex flex-col items-center gap-8 text-center text-white lg:flex-row lg:justify-between lg:text-left">
              <div className="max-w-xl">
                <h2 className="font-display text-[30px] font-semibold leading-[1.15] sm:text-[36px] md:text-[44px]">
                  Give Your Bedroom a Quiet Focal Point
                </h2>
                <p className="mt-4 text-[16px] leading-[1.6] text-white/75 md:mt-5 md:text-[18px]">
                  Explore our curated bedroom picks, or commission a custom piece sized
                  and toned exactly for your room.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="#bedroom-collection"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-white px-8 py-4 text-[17px] font-medium text-[#1f1f1f] transition-transform hover:-translate-y-0.5 sm:w-auto md:text-[18px]"
                >
                  Shop the Collection
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/custom-order"
                  className="inline-flex w-full items-center justify-center rounded-md border border-white/60 bg-transparent px-8 py-4 text-[17px] font-medium text-white transition-colors hover:bg-white/10 sm:w-auto md:text-[18px]"
                >
                  Commission a Custom Piece
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Trust stats */}
        <section className="py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {[
                { label: "Handcrafted by", value: "Indian Artists" },
                { label: "Custom Sizing", value: "Available" },
                { label: "Approval", value: "Before It Ships" },
                { label: "Shipping", value: "Across India" },
              ].map((stat, index) => (
                <div key={`bedroom-stat-${index}`} className="text-center">
                  <p className="font-display text-[24px] font-semibold text-[#1f1f1f] md:text-[32px]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[14px] text-[#5b5b5b] md:text-[16px]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default BedroomPage;
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: no errors.

- [ ] **Step 3: Start a verification dev server on a safe port**

Run: `netstat -ano | grep LISTENING | grep -E ":3000 |:3001 "` first — confirm what's already running so you never target the user's own port-3000 server. Then:

Run: `npm run dev` in background (auto-binds 3001 if 3000 is taken).

- [ ] **Step 4: Curl the live route and verify real content**

Run:
```bash
curl -s http://localhost:3001/rooms/bedroom | grep -o '<title>[^<]*</title>'
curl -s http://localhost:3001/rooms/bedroom | grep -c 'water-lily-canvas-painting\|golden-buddha-canvas-painting'
```
Expected: title tag matches `Bedroom Paintings Online India | Calming Canvas Wall Art | Artace Studio`; at least one product slug reference found (confirms `fetchProductsBySlugs` returned real data and the grid rendered).

- [ ] **Step 5: Stop the verification dev server**

Identify the PID bound to port 3001 via `netstat -ano`, cross-check its command line via PowerShell `Get-CimInstance Win32_Process -Filter "ProcessId=<pid>"`, confirm it is NOT the user's port-3000 process, then `taskkill //F //PID <pid>`. Re-confirm port 3000 is still serving afterward.

- [ ] **Step 6: Commit**

Skip — do not run `git commit`/`git push` per Global Constraints.

---

### Task 3: Living Room page

**Files:**
- Create: `app/rooms/living-room/page.tsx`

**Interfaces:**
- Consumes: same as Task 2 (`fetchProductsBySlugs`, `RoomProductCard` from `@/lib/rooms`; same currency/cart/site imports).
- Produces: route `GET /rooms/living-room` — consumed by Task 6.

- [ ] **Step 1: Write `app/rooms/living-room/page.tsx`**

Use the exact same file structure as `app/rooms/bedroom/page.tsx` (Task 2), with these substitutions:

- Icons import: `import { ArrowRight, Maximize2, Palette, Users, Sparkles } from "lucide-react";`
- `metadata`:
  - `title`: `"Living Room Paintings Online India | Statement Canvas Wall Art | Artace Studio"`
  - `description`: `"Shop hand-painted living room wall art online in India — bold, statement-making canvas paintings sized for your largest wall. 100% handmade in acrylic, never printed, with custom sizing available."`
  - `alternates.canonical`: `"/rooms/living-room"`
  - `openGraph.url`: `"/rooms/living-room"`
  - `openGraph.images[0].url`: `buildSiteUrl("/images/living-room.jpeg")`, `width: 1402, height: 1122`, `alt: "Living room styled with a statement canvas painting"`
  - `twitter.images`: `[buildSiteUrl("/images/living-room.jpeg")]`
- `LIVING_ROOM_PRODUCT_SLUGS`:
```ts
const LIVING_ROOM_PRODUCT_SLUGS = [
  "radha-krishna-canvas-painting-bansuri",
  "shri-krishna-canvas-painting-india",
  "ganesha-canvas-painting-playing-mrudanga",
  "abstract-textured-wall-art-for-living-room",
  "axis-of-gold-balance-canvas-art",
  "dagdusheth-ganapati-canvas-painting",
  "lord-krishna-canvas-painting",
  "abstract-city-view",
  "shyam-radha-krishna-painting",
  "baasuri-ganesha-canvas-painting",
] as const;
```
- `livingRoomTips` (replaces `bedroomTips`):
```ts
const livingRoomTips = [
  {
    icon: Maximize2,
    title: "Think Focal Wall First",
    description:
      "Pick the wall your eye lands on first when entering the room, and size the painting to command it — usually the wall behind the sofa or opposite the entryway.",
  },
  {
    icon: Palette,
    title: "Go Bigger Than You Think",
    description:
      "Living room art is viewed from a distance. A piece that looks large in a photo often reads as just-right once it's on the wall.",
  },
  {
    icon: Users,
    title: "Let the Palette Lead the Room",
    description:
      "A living room painting's colors often set the tone for cushions, throws, and accents — choose it before finalizing smaller décor.",
  },
  {
    icon: Sparkles,
    title: "Statement Over Set",
    description:
      "One striking, well-sized piece usually outperforms several smaller ones for living room impact.",
  },
];
```
- Component name: `LivingRoomPage`; state vars: `products = await fetchProductsBySlugs(LIVING_ROOM_PRODUCT_SLUGS)`.
- Schema `@id`/`url` fields: all `buildSiteUrl("/rooms/living-room")` instead of `/rooms/bedroom`; `name: "Living Room Paintings | Statement Canvas Wall Art"`.
- Hero section: `src="/images/living-room.jpeg"`, `alt="Living room styled with a statement canvas painting"`, eyebrow `"A Statement That Greets Every Guest"`, `h1` text `"Living Room Paintings"`, body paragraph:
  > "Anchor your living room with a hand-painted canvas that commands the room — bold color, real texture, and a story worth a second look, chosen to hold its own on your largest wall."
  Primary CTA `href="#living-room-collection"` text `"Shop Living Room Paintings"`.
- About section h2: `"Art Built to Anchor Your Largest Wall"`, body paragraphs:
  > "The living room is where scale matters most — a painting here needs to hold its own from across the room, not just up close. Our living room picks lean toward bolder color, larger formats, and subjects with real presence: Radha Krishna in vivid gold and blue, striking Ganapati pieces, and abstract compositions with genuine movement."

  > "Every canvas is individually hand-painted in acrylic, so the texture and brushwork read clearly even from the sofa — a level of depth no printed poster can match."

  > "As a focal-wall piece, living room art is one of the first things guests notice. We recommend sizing it to at least half the width of the wall it hangs on, and we'll help you get that right for your specific space."
- Styling tips section h2: `"Choosing the Right Piece for Your Living Room"`, maps over `livingRoomTips`.
- Grid section `id="living-room-collection"`, h2 `"Shop Living Room Paintings"`, subhead `"Bold, hand-painted pieces sized to anchor your space."`, `AddToCartButton subtitle="Handmade Living Room Painting"`, empty-state text `"No living room paintings available at the moment."`.
- CTA section h2 `"Find the Piece That Anchors Your Living Room"`, body:
  > "Explore our curated living room picks, or commission a custom piece sized exactly for your focal wall."
  Primary link `href="#living-room-collection"`.
- Trust stats section: same 4 stats as Task 2 (`Handcrafted by / Indian Artists`, `Custom Sizing / Available`, `Approval / Before It Ships`, `Shipping / Across India`) — keys renamed `living-room-stat-${index}`.
- Export default `LivingRoomPage`.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: no errors.

- [ ] **Step 3: Start verification dev server**

Same procedure as Task 2 Step 3 (reuse the same running instance if still up from Task 2; otherwise restart following the same port-safety check).

- [ ] **Step 4: Curl and verify**

Run:
```bash
curl -s http://localhost:3001/rooms/living-room | grep -o '<title>[^<]*</title>'
curl -s http://localhost:3001/rooms/living-room | grep -c 'radha-krishna-canvas-painting-bansuri\|dagdusheth-ganapati-canvas-painting'
```
Expected: title tag matches `Living Room Paintings Online India | Statement Canvas Wall Art | Artace Studio`; at least one product slug reference found.

- [ ] **Step 5: Stop the verification dev server (if not continuing to Task 4 immediately)**

Same PID-safe teardown as Task 2 Step 5. If moving straight to Task 4, leave it running and skip this step there instead.

- [ ] **Step 6: Commit**

Skip — do not run `git commit`/`git push` per Global Constraints.

---

### Task 4: Dining Room page

**Files:**
- Create: `app/rooms/dining-room/page.tsx`

**Interfaces:**
- Consumes: same as Task 2.
- Produces: route `GET /rooms/dining-room` — consumed by Task 6.

- [ ] **Step 1: Write `app/rooms/dining-room/page.tsx`**

Same file structure as Task 2, with these substitutions:

- Icons import: `import { ArrowRight, UtensilsCrossed, Compass, Sun, Ruler } from "lucide-react";`
- `metadata`:
  - `title`: `"Dining Room Paintings Online India | Canvas Wall Art for Dining Spaces | Artace Studio"`
  - `description`: `"Shop hand-painted dining room wall art online in India — warm landscapes, florals, and abstract canvas paintings sized for dining spaces. 100% handmade, custom sizing available."`
  - `alternates.canonical`: `"/rooms/dining-room"`
  - `openGraph.url`: `"/rooms/dining-room"`
  - `openGraph.images[0]`: `url: buildSiteUrl("/images/dining-room.jpeg")`, `width: 1402, height: 1122`, `alt: "Dining room styled with warm wall art"`
  - `twitter.images`: `[buildSiteUrl("/images/dining-room.jpeg")]`
- `DINING_ROOM_PRODUCT_SLUGS`:
```ts
const DINING_ROOM_PRODUCT_SLUGS = [
  "autumn-garden-path-landscape-canvas-painting-india-vibrant-floral-garden-wall-art-in-orange-red-blue-nature-painting-for-indian-home-decor-aratce-studio",
  "beauty-of-landscape",
  "ghats-of-varanasi-canvas-handmade-paint",
  "horse-cart-2-canavs-painting",
  "vibrant-abstract-sunflower",
  "waves-of-fortune-abstract-fish-fantasy",
  "amazing-bird-canvas-painting",
  "a-memory-from-diary",
  "abstract-deer-canvas-wall-art",
] as const;
```
- `diningRoomTips`:
```ts
const diningRoomTips = [
  {
    icon: UtensilsCrossed,
    title: "Match Your Table's Energy",
    description:
      "A rustic wood table pairs naturally with landscapes and folk-art pieces; a modern glass or marble table suits bolder abstract work.",
  },
  {
    icon: Compass,
    title: "Mind the Sightlines",
    description:
      "Choose art visible from the main seats at the table, not just from the doorway — that's where it'll be seen most.",
  },
  {
    icon: Sun,
    title: "Warm Tones Aid Appetite",
    description:
      "Warm oranges, golds, and earthy greens are traditionally associated with comfort and appetite — a natural fit for dining spaces.",
  },
  {
    icon: Ruler,
    title: "Horizontal for Table Walls",
    description:
      "A wide, horizontal composition usually suits the wall behind a dining table better than a tall vertical piece.",
  },
];
```
- Component name: `DiningRoomPage`; `products = await fetchProductsBySlugs(DINING_ROOM_PRODUCT_SLUGS)`.
- Schema fields: all `buildSiteUrl("/rooms/dining-room")`; `name: "Dining Room Paintings | Canvas Wall Art for Dining Spaces"`.
- Hero: `src="/images/dining-room.jpeg"`, `alt="Dining room styled with warm wall art"`, eyebrow `"Where Every Gathering Finds Its Backdrop"`, `h1` `"Dining Room Paintings"`, body:
  > "Set the scene for every meal and gathering with warm, inviting canvas art — landscapes, florals, and abstract pieces chosen to complement your table, not compete with it."
  Primary CTA `href="#dining-room-collection"` text `"Shop Dining Room Paintings"`.
- About h2: `"Art That Sets the Mood for Every Gathering"`, body:
  > "A dining room is a space for connection — meals, conversation, celebrations — so its art should feel warm and inviting rather than stark. Our dining room picks lean toward landscapes, gardens, and gently abstract pieces in warm, appetite-friendly tones."

  > "Every piece is hand-painted on premium canvas, adding real texture to a room that's often otherwise dominated by hard surfaces — table, chairs, flooring."

  > "Dining rooms usually call for a horizontal orientation matched to the length of the table wall, or a striking vertical piece on an adjacent accent wall. We can help you pick the right fit for your layout."
- Styling tips h2: `"Choosing the Right Piece for Your Dining Room"`, maps over `diningRoomTips`.
- Grid section `id="dining-room-collection"`, h2 `"Shop Dining Room Paintings"`, subhead `"Warm, hand-painted pieces chosen to complement every gathering."`, `AddToCartButton subtitle="Handmade Dining Room Painting"`, empty state `"No dining room paintings available at the moment."`.
- CTA h2 `"Set the Scene for Your Next Gathering"`, body:
  > "Explore our curated dining room picks, or commission a custom piece sized for your table wall."
  Primary link `href="#dining-room-collection"`.
- Trust stats: same 4 as Task 2, keys `dining-room-stat-${index}`.
- Export default `DiningRoomPage`.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: no errors.

- [ ] **Step 3: Curl and verify (reuse the running dev server from Task 3, or restart with the same port-safety check)**

Run:
```bash
curl -s http://localhost:3001/rooms/dining-room | grep -o '<title>[^<]*</title>'
curl -s http://localhost:3001/rooms/dining-room | grep -c 'beauty-of-landscape\|ghats-of-varanasi-canvas-handmade-paint'
```
Expected: title tag matches `Dining Room Paintings Online India | Canvas Wall Art for Dining Spaces | Artace Studio`; at least one product slug reference found.

- [ ] **Step 4: Commit**

Skip — do not run `git commit`/`git push` per Global Constraints.

---

### Task 5: Pooja Room page (distinct buying-guide angle)

**Files:**
- Create: `app/rooms/pooja-room/page.tsx`

**Interfaces:**
- Consumes: same as Task 2.
- Produces: route `GET /rooms/pooja-room` — consumed by Task 6. Must NOT duplicate `/collections/vastu-paintings` content (see design doc decision 2) — this page's About/tips sections are a practical buying guide (deity selection, altar-wall sizing, placement), not a restatement of Vastu-compliant-art-across-the-home framing.

- [ ] **Step 1: Write `app/rooms/pooja-room/page.tsx`**

Same file structure as Task 2, with these substitutions:

- Icons import: `import { ArrowRight, Heart, Ruler, Compass, Palette } from "lucide-react";`
- `metadata`:
  - `title`: `"Pooja Room Paintings Online India | Deity Selection & Placement Guide | Artace Studio"`
  - `description`: `"Shop hand-painted pooja room wall art and get guidance on deity selection, altar-wall sizing, and traditional placement. 100% handmade canvas paintings, custom sizing available."`
  - `alternates.canonical`: `"/rooms/pooja-room"`
  - `openGraph.url`: `"/rooms/pooja-room"`
  - `openGraph.images[0]`: `url: buildSiteUrl("/images/pooja-room.jpeg")`, `width: 1408, height: 768`, `alt: "Pooja room altar with devotional wall art"`
  - `twitter.images`: `[buildSiteUrl("/images/pooja-room.jpeg")]`
- `POOJA_ROOM_PRODUCT_SLUGS`:
```ts
const POOJA_ROOM_PRODUCT_SLUGS = [
  "ekdantaya-ganesha",
  "classic-ganesha-canvas-painting-india-modern-om-calligraphy-wall-art-in-grey-gold-devotional-contemporary-art-for-indian-home-decor-aratce-studio",
  "baasuri-ganesha-canvas-painting",
  "dagdusheth-ganapati-canvas-painting",
  "shiv-ganesh-canvas-painting-abhisheka",
  "handmade-lord-vitthal-canvas-painting-contemporary-vithoba-wall-art-art-ace-studio",
  "shri-krishna-canvas-painting-india",
  "multipiece-ganesha-1",
  "complete-focus-canvas-paintings",
  "golden-buddha-canvas-painting",
] as const;
```
- `poojaRoomTips`:
```ts
const poojaRoomTips = [
  {
    icon: Heart,
    title: "Choose by Ishta Devata",
    description:
      "Pick the deity central to your family's practice rather than what's trending — a pooja room painting is lived with daily, so personal meaning matters most.",
  },
  {
    icon: Ruler,
    title: "Size to the Altar, Not the Wall",
    description:
      "Match the painting's width to your altar shelf or mandir unit, not the full wall — this keeps the space feeling proportioned rather than crowded.",
  },
  {
    icon: Compass,
    title: "Mind the Traditional Direction",
    description:
      "Many households place devotional art on the East or Northeast wall, believed to be the most auspicious direction for a pooja room.",
  },
  {
    icon: Palette,
    title: "Keep the Palette Serene",
    description:
      "Gold, white, and soft warm tones are traditional choices that suit the quiet, reverent mood of a pooja room.",
  },
];
```
- Component name: `PoojaRoomPage`; `products = await fetchProductsBySlugs(POOJA_ROOM_PRODUCT_SLUGS)`.
- Schema fields: all `buildSiteUrl("/rooms/pooja-room")`; `name: "Pooja Room Paintings | Deity Selection & Placement Guide"`.
- Hero: `src="/images/pooja-room.jpeg"`, `alt="Pooja room altar with devotional wall art"`, eyebrow `"Devotional Art, Chosen With Care"`, `h1` `"Pooja Room Paintings"`, body:
  > "A buying guide and curated collection for your home altar — hand-painted devotional canvases chosen by deity, direction, and size, so your pooja room feels complete and sacred."
  Primary CTA `href="#pooja-room-collection"` text `"Shop Pooja Room Paintings"`.
- About section h2: `"A Buying Guide for Your Pooja Room Wall"`, body (use `<p>` tags; render with `dangerouslySetInnerHTML`-free plain text — bold key terms with `<strong>` inline via JSX, not markdown):
```tsx
<p>
  Choosing art for a pooja room is different from any other room in the
  house — the painting isn&apos;t just décor, it&apos;s part of daily ritual.
  This guide covers the three decisions that matter most: which deity, what
  size, and where to place it.
</p>
<p>
  <strong className="text-[#1f1f1f]">Deity selection</strong> usually starts
  with your family&apos;s ishta devata (chosen deity) or the deity most
  central to your household&apos;s practice — Ganapati for new beginnings,
  Krishna or Vitthal for devotion, Buddha for meditation-focused spaces.
  There&apos;s no wrong answer; it should reflect what your family already
  prays to.
</p>
<p>
  <strong className="text-[#1f1f1f]">Altar-wall sizing</strong> matters more
  here than in any other room, since pooja rooms are often the smallest
  space in the home. A painting that&apos;s too large overwhelms the altar;
  too small gets lost. As a rule of thumb, size the piece to roughly the
  width of your altar shelf or unit, not the full wall.
</p>
```
  (Replace the plain `<div className="mt-6 space-y-5 ...">{paragraphs}</div>` block used in Task 2 with this JSX directly, keeping the same wrapper classes.)
- Styling tips h2: `"Three Decisions That Matter Most"`, maps over `poojaRoomTips`.
- Grid section `id="pooja-room-collection"`, h2 `"Shop Pooja Room Paintings"`, subhead `"Devotional pieces hand-painted for the altar wall."`, `AddToCartButton subtitle="Handmade Pooja Room Painting"`, empty state `"No pooja room paintings available at the moment."`.
- **Cross-link paragraph** (new, immediately below the grid section, before the CTA section — this is what keeps this page distinct from `/collections/vastu-paintings` rather than competing with it):
```tsx
<section className="pb-4 md:pb-6">
  <div className="mx-auto max-w-[1440px] px-6 md:px-12">
    <p className="text-[15px] text-[#5b5b5b] md:text-[16px]">
      Looking for Vastu-conscious art for the rest of your home?{" "}
      <Link href="/collections/vastu-paintings" className="text-[#1f1f1f] underline">
        Browse the full Vastu Collection
      </Link>
      .
    </p>
  </div>
</section>
```
- CTA h2 `"Complete Your Pooja Room With the Right Piece"`, body:
  > "Explore our curated pooja room picks, or commission a custom piece sized for your altar."
  Primary link `href="#pooja-room-collection"`.
- Trust stats: same 4 as Task 2, keys `pooja-room-stat-${index}`.
- Export default `PoojaRoomPage`.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: no errors.

- [ ] **Step 3: Curl and verify (reuse the running dev server, or restart with the same port-safety check)**

Run:
```bash
curl -s http://localhost:3001/rooms/pooja-room | grep -o '<title>[^<]*</title>'
curl -s http://localhost:3001/rooms/pooja-room | grep -c 'ekdantaya-ganesha\|handmade-lord-vitthal-canvas-painting'
curl -s http://localhost:3001/rooms/pooja-room | grep -c 'vastu-paintings'
```
Expected: title tag matches `Pooja Room Paintings Online India | Deity Selection & Placement Guide | Artace Studio`; at least one product slug reference found; the `vastu-paintings` cross-link is present.

- [ ] **Step 4: Commit**

Skip — do not run `git commit`/`git push` per Global Constraints.

---

### Task 6: Wire homepage "Shop by Room" tiles to the new pages

**Files:**
- Modify: `components/homepage/ShopByRoom.tsx:5-34`

**Interfaces:**
- Consumes: routes produced by Tasks 2–5 (`/rooms/bedroom`, `/rooms/living-room`, `/rooms/dining-room`, `/rooms/pooja-room`).
- Produces: nothing new consumed elsewhere — this is the final integration point.

- [ ] **Step 1: Update `ROOM_TILES` hrefs**

In `components/homepage/ShopByRoom.tsx`, replace the `ROOM_TILES` array (currently lines 5–34) with:

```tsx
const ROOM_TILES = [
  {
    title: "For the Living Room",
    description: "A statement that greets every guest",
    image: "/images/living-room.jpeg",
    alt: "Living room styled with a statement canvas painting",
    href: "/rooms/living-room",
  },
  {
    title: "For the Pooja Room",
    description: "Devotional art with quiet reverence",
    image: "/images/pooja-room.jpeg",
    alt: "Pooja room altar with devotional wall art",
    href: "/rooms/pooja-room",
  },
  {
    title: "For the Bedroom",
    description: "A quiet retreat, styled around you",
    image: "/images/bedroom.jpeg",
    alt: "Bedroom styled with a calming wall painting",
    href: "/rooms/bedroom",
  },
  {
    title: "For the Dining Room",
    description: "Where every gathering finds its backdrop",
    image: "/images/dining-room.jpeg",
    alt: "Dining room styled with warm wall art",
    href: "/rooms/dining-room",
  },
] as const;
```

(Only the four `href` values change — `title`, `description`, `image`, `alt` stay exactly as they are.)

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: no errors.

- [ ] **Step 3: Curl the homepage and verify the tile links point to the new routes**

Run:
```bash
curl -s http://localhost:3001/ | grep -o 'href="/rooms/[a-z-]*"' | sort -u
```
Expected output (4 lines, order may vary):
```
href="/rooms/bedroom"
href="/rooms/dining-room"
href="/rooms/living-room"
href="/rooms/pooja-room"
```

- [ ] **Step 4: Commit**

Skip — do not run `git commit`/`git push` per Global Constraints.

---

### Task 7: Full build verification and cleanup

**Files:** none created/modified — verification only.

- [ ] **Step 1: Full production build**

Run: `npm run build`
Expected: build succeeds with no type errors and no failed page generation for `/rooms/bedroom`, `/rooms/living-room`, `/rooms/dining-room`, `/rooms/pooja-room`.

- [ ] **Step 2: Spot-check all 4 room pages plus the homepage one more time against the build output** (if `npm run dev` was already stopped after Task 5, restart it with the same port-safety check first)

Run:
```bash
for route in bedroom living-room dining-room pooja-room; do
  echo "=== $route ==="
  curl -s "http://localhost:3001/rooms/$route" | grep -o '<title>[^<]*</title>'
done
curl -s http://localhost:3001/ | grep -c 'Shop by Room\|Find the Piece Your Space Is Waiting For'
```
Expected: 4 distinct, correct title tags; homepage still renders the Shop by Room section heading.

- [ ] **Step 3: Stop the verification dev server**

PID-safe teardown per Global Constraints — confirm port 3000 (the user's own server) is untouched and still serving afterward.

- [ ] **Step 4: Report results to the user**

Summarize: routes created, product counts per room (should be 10/10/9/10 unless any slug 404'd — flag by name if so), and remind the user this work (like every other phase) is uncommitted and waiting for them to commit/push when ready.

---

## Self-Review Notes

- **Spec coverage:** all 6 design-doc decisions covered — scope (4 rooms, Task 2–5), pooja-room distinct angle (Task 5's buying-guide content + cross-link), manual curation (slug arrays in each task), standalone page pattern (each task is a fully independent file, no shared `RoomLandingPage` component), one shared fetch helper only (Task 1, nothing else shared), hero images reused from existing assets (all 4 tasks reference `/images/<room>.jpeg`, no new photography). Homepage wiring covered in Task 6. Out-of-scope items (new taxonomy, new photography, regional pages) correctly excluded.
- **Placeholder scan:** no TBD/TODO; Tasks 3–5 use a "substitution list" format instead of repeating the full ~350-line file, but every substitution gives the literal exact string/code to use — not a vague "similar to Task 2."
- **Type consistency:** `RoomProductCard` fields (`id, slug, name, image, imageAlt, price, currencyCode, currencySymbol`) match between Task 1's producer and Tasks 2–5's consumers (`product.id`, `product.slug`, `product.name`, `product.image`, `product.imageAlt`, `product.price`). `fetchProductsBySlugs` signature (`(slugs: readonly string[]) => Promise<RoomProductCard[]>`) matches every call site (`fetchProductsBySlugs(BEDROOM_PRODUCT_SLUGS)` etc., each `as const` array satisfying `readonly string[]`).
