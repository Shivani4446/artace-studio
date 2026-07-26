# New Zealand Regional Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add NZD currency support site-wide, then build a content-rich SEO landing page targeting New Zealand, reusing the UK page's abstract-art theme and live category fetch.

**Architecture:** NZD is a new supported currency, added the same way EUR was for Ireland — one new entry across the same 5 currency-system files. The NZ page is a standalone page at `app/original-abstract-art-for-sale-nz/page.tsx`, following the exact pattern of `app/original-abstract-art-for-sale-uk/page.tsx` — same live-fetch of the `abstract-paintings` category, same educational/buying-guide content (adapted only where NZ-specific facts apply), same hero image, third and final in this three-country series.

**Tech Stack:** Next.js App Router (Server Component, edge runtime), TypeScript, Tailwind CSS, lucide-react icons, WooCommerce Store API, existing `FAQSection` component.

## Global Constraints

- Design doc: `docs/superpowers/specs/2026-07-25-nz-regional-landing-page-design.md` — read for full rationale, including why "artist nz"/"art nz" are excluded while the rest of the NZ commercial cluster is targeted.
- No test framework exists in this repo. Verification uses `npx tsc --noEmit --project tsconfig.json`, `npm run build`, and a temporary `npm run dev` instance with `curl` against real rendered HTML.
- `export const runtime = 'edge';` required on the new page.
- Do NOT run `git commit` or `git push` at any point — the user handles all commits/pushes themselves. Every task's "Commit" step is skipped.
- Never touch port 3000 (the user's own dev server). Force any verification dev server explicitly to port 3001 (`npm run dev -- -p 3001`). Confirm the PID via `netstat -ano` and cross-check its command line via PowerShell `Get-CimInstance Win32_Process -Filter "ProcessId=<pid>"` before `taskkill`, and re-confirm port 3000's state is unchanged afterward.
- Do NOT state a specific New Zealand delivery timeframe anywhere in this page's copy — the business has not confirmed one. Use only the deliberately vague language given in Task 2's exact copy.
- New Zealand customs duty and GST is the customer's responsibility, charged separately — state this plainly.
- No "artist nz" or "art nz" style local-identity claims anywhere on this page (see design doc Decision 1) — this page must not imply Artace Studio is NZ-based or features NZ artists.
- No mention of the "Art Prints" product line anywhere — this page is originals-only, consistent with the rest of the site's "100% hand-painted, never printed" messaging.
- The WooCommerce Store API's `slug`/multi-item query params truncate to a default page size when `per_page` is not explicitly set — always pass `per_page` explicitly.
- Colors/classes: match the palette already used across the site's landing pages (`#f4f2ee` backgrounds, `#1f1f1f`/`#2c2c2c` text, white cards) — not Warli's brown/cream.

---

### Task 1: Add NZD currency support

**Files:**
- Modify: `lib/currency/types.ts`
- Modify: `lib/currency/cookie.ts`
- Modify: `lib/currency/rates.ts`
- Modify: `lib/currency/convert.ts`
- Modify: `components/currency/CurrencyDropdown.tsx`

**Interfaces:**
- Consumes: none — base currency-system change.
- Produces: `CurrencyCode` now includes `"NZD"`; `SUPPORTED_CURRENCIES`, `REQUIRED_CURRENCIES`, `CURRENCY_SYMBOLS`, `CURRENCY_LOCALES`, and the `CurrencyDropdown` options list all include NZD — consumed by Task 2.

- [ ] **Step 1: Add NZD to the `CurrencyCode` type**

In `lib/currency/types.ts`, change:

```ts
export type CurrencyCode = "INR" | "USD" | "AED" | "AUD" | "CAD" | "GBP" | "EUR";
```

to:

```ts
export type CurrencyCode = "INR" | "USD" | "AED" | "AUD" | "CAD" | "GBP" | "EUR" | "NZD";
```

- [ ] **Step 2: Add NZD to `SUPPORTED_CURRENCIES`**

In `lib/currency/cookie.ts`, change:

```ts
export const SUPPORTED_CURRENCIES: CurrencyCode[] = [
  "INR",
  "USD",
  "AED",
  "AUD",
  "CAD",
  "GBP",
  "EUR",
];
```

to:

```ts
export const SUPPORTED_CURRENCIES: CurrencyCode[] = [
  "INR",
  "USD",
  "AED",
  "AUD",
  "CAD",
  "GBP",
  "EUR",
  "NZD",
];
```

- [ ] **Step 3: Add NZD to `REQUIRED_CURRENCIES`**

In `lib/currency/rates.ts`, change:

```ts
const REQUIRED_CURRENCIES: CurrencyCode[] = [
  "INR",
  "USD",
  "AED",
  "AUD",
  "CAD",
  "GBP",
  "EUR",
];
```

to:

```ts
const REQUIRED_CURRENCIES: CurrencyCode[] = [
  "INR",
  "USD",
  "AED",
  "AUD",
  "CAD",
  "GBP",
  "EUR",
  "NZD",
];
```

- [ ] **Step 4: Add NZD symbol and locale**

In `lib/currency/convert.ts`, change:

```ts
export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: "₹",
  USD: "$",
  AED: "AED ",
  AUD: "A$",
  CAD: "C$",
  GBP: "£",
  EUR: "€",
};

const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  INR: "en-IN",
  USD: "en-US",
  AED: "en-AE",
  AUD: "en-AU",
  CAD: "en-CA",
  GBP: "en-GB",
  EUR: "en-IE",
};
```

to:

```ts
export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: "₹",
  USD: "$",
  AED: "AED ",
  AUD: "A$",
  CAD: "C$",
  GBP: "£",
  EUR: "€",
  NZD: "NZ$",
};

const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  INR: "en-IN",
  USD: "en-US",
  AED: "en-AE",
  AUD: "en-AU",
  CAD: "en-CA",
  GBP: "en-GB",
  EUR: "en-IE",
  NZD: "en-NZ",
};
```

- [ ] **Step 5: Add NZD to the currency dropdown**

In `components/currency/CurrencyDropdown.tsx`, change:

```ts
const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "INR", label: "INR" },
  { code: "USD", label: "USD" },
  { code: "AED", label: "AED" },
  { code: "AUD", label: "AUD" },
  { code: "CAD", label: "CAD" },
  { code: "GBP", label: "GBP" },
  { code: "EUR", label: "EUR" },
];
```

to:

```ts
const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "INR", label: "INR" },
  { code: "USD", label: "USD" },
  { code: "AED", label: "AED" },
  { code: "AUD", label: "AUD" },
  { code: "CAD", label: "CAD" },
  { code: "GBP", label: "GBP" },
  { code: "EUR", label: "EUR" },
  { code: "NZD", label: "NZD" },
];
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: no errors referencing any of the 5 modified files. If tsc reports an error in a file NOT listed above (an exhaustive `Record<CurrencyCode, X>` or switch missing an "NZD" case somewhere else in the codebase), report it back rather than silently patching an unlisted file — this happened once before with EUR (it did not occur, but the check matters) and must be checked again since a second currency addition increases the chance of finding a spot that was missed.

- [ ] **Step 7: Verify the exchange-rate API returns NZD**

Run:
```bash
curl -s "https://open.er-api.com/v6/latest/INR" | node -e "
let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
  const p = JSON.parse(d);
  console.log('NZD rate:', p.rates?.NZD);
});
"
```
Expected: a numeric NZD rate is printed (confirmed live during design: `0.017882`). If this ever returns `undefined`, `getExchangeRates()` fails closed for ALL currencies, not just NZD — do not proceed past this check without a real NZD rate.

- [ ] **Step 8: Prove NZD works end-to-end via SSR, using the existing UK page**

The NZ page doesn't exist yet (Task 2 builds it), so verify NZD the same way EUR was proven for Ireland — by curling the already-live UK page with an NZD cookie, which exercises the exact same `parseCurrencyCode` → `getExchangeRates` → `formatConvertedPrice` → `CURRENCY_SYMBOLS.NZD`/`CURRENCY_LOCALES.NZD` chain Task 2's page will use.

Check `netstat -ano | grep LISTENING` for ports 3000/3001 first. Start `npm run dev -- -p 3001` explicitly forced to port 3001.

Run:
```bash
curl -s -b "artace-currency=NZD" http://localhost:3001/original-abstract-art-for-sale-uk | grep -o 'NZ\$[0-9,]*' | head -3
```
Expected: at least one `NZ$`-prefixed price is found (real SSR-rendered NZD pricing, not just a dropdown-option existence check).

- [ ] **Step 9: Stop the verification dev server**

Identify the PID bound to port 3001 via `netstat -ano`, cross-check its command line via PowerShell `Get-CimInstance Win32_Process -Filter "ProcessId=<pid>"`, confirm it is NOT the user's port-3000 process, then `taskkill //F //PID <pid>`. Re-confirm port 3000's state is unchanged.

- [ ] **Step 10: Commit**

Skip — do not run `git commit`/`git push` per Global Constraints.

---

### Task 2: Build the New Zealand regional landing page

**Files:**
- Create: `app/original-abstract-art-for-sale-nz/page.tsx`

**Interfaces:**
- Consumes: `CurrencyCode` (now includes `"NZD"`, from Task 1) via `buildSiteUrl`, `toAbsoluteImageUrl` from `@/lib/site`; `decodeHtmlEntities` from `@/utils/text`; `AddToCartButton` from `@/components/cart/AddToCartButton`; `getExchangeRates` from `@/lib/currency/rates`; `formatConvertedPrice` from `@/lib/currency/convert`; `CURRENCY_COOKIE_NAME`, `parseCurrencyCode` from `@/lib/currency/cookie`; `FAQSection`, `type FAQItem` from `@/components/seo/FAQSection` — all pre-existing, same interfaces the UK and Ireland pages already use successfully.
- Produces: route `GET /original-abstract-art-for-sale-nz` — final page, nothing downstream consumes it within this plan.

- [ ] **Step 1: Write `app/original-abstract-art-for-sale-nz/page.tsx`**

```tsx
import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowRight,
  Palette,
  Ruler,
  Layers,
  Sparkles,
  Truck,
} from "lucide-react";
import { buildSiteUrl, toAbsoluteImageUrl } from "@/lib/site";
import { decodeHtmlEntities } from "@/utils/text";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { getExchangeRates } from "@/lib/currency/rates";
import { formatConvertedPrice } from "@/lib/currency/convert";
import { CURRENCY_COOKIE_NAME, parseCurrencyCode } from "@/lib/currency/cookie";
import FAQSection, { type FAQItem } from "@/components/seo/FAQSection";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Original Abstract Art For Sale Online | Shipped to New Zealand | Artace Studio",
  description:
    "Shop original, hand-painted abstract canvas art online — shipped to New Zealand. Real brushwork and texture, never printed. Custom sizing and commissioned pieces available.",
  alternates: {
    canonical: "/original-abstract-art-for-sale-nz",
  },
  openGraph: {
    title: "Original Abstract Art For Sale Online | Shipped to New Zealand | Artace Studio",
    description:
      "Shop original, hand-painted abstract canvas art online — shipped to New Zealand. Real brushwork and texture, never printed.",
    url: "/original-abstract-art-for-sale-nz",
    type: "website",
    images: [
      {
        url: buildSiteUrl("/abstract-collection-bg.webp"),
        width: 2103,
        height: 1683,
        alt: "Original abstract canvas paintings by Artace Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Original Abstract Art For Sale Online | Shipped to New Zealand",
    description: "Shop original, hand-painted abstract canvas art online, shipped to New Zealand.",
    images: [buildSiteUrl("/abstract-collection-bg.webp")],
  },
};

const ABSTRACT_CATEGORY_SLUG = "abstract-paintings";
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

type AbstractProductCard = {
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

const fetchAbstractProducts = async (): Promise<AbstractProductCard[]> => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(
      `${apiBaseUrl}/wp-json/wc/store/v1/products?category=${ABSTRACT_CATEGORY_SLUG}&per_page=12`,
      {
        next: { revalidate: STOREFRONT_REVALIDATE_SECONDS },
      }
    );

    if (!response.ok) {
      return [];
    }

    const products = (await response.json()) as WooStoreProduct[];
    if (!Array.isArray(products)) return [];

    return products.map((product) => {
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

const buyingGuideTips = [
  {
    icon: Palette,
    title: "Start With Your Palette",
    description:
      "Pull two or three colors already in the room — your sofa, your rug, your walls — and look for a piece that echoes at least one of them. A strong accent color is often more effective than a perfect blend.",
  },
  {
    icon: Ruler,
    title: "Size for the Wall, Not the Room",
    description:
      "Measure the specific wall the piece will hang on. As a rough guide, aim for artwork that covers roughly two-thirds of the available wall width above a sofa, console, or bed.",
  },
  {
    icon: Layers,
    title: "Consider the Composition's Energy",
    description:
      "Busy, high-contrast abstracts suit a room built for conversation and activity — a living room or hallway. Calmer, more tonal pieces suit spaces meant for rest.",
  },
  {
    icon: Sparkles,
    title: "Let It Lead, Don't Force It to Match",
    description:
      "The best abstract pieces don't blend into a room quietly — they give it a focal point. Choose the piece you keep coming back to, then build smaller accents around it.",
  },
];

const collectorTestimonials = [
  {
    id: "review-3",
    authorName: "Shruti Prabhune",
    location: "Thane, India",
    rating: 5,
    text: "Excellent communication, secure packaging, and authentic handmade art. We are already planning our next purchase.",
  },
  {
    id: "review-4",
    authorName: "Vaibhav Laturkar",
    location: "Pune, India",
    rating: 4.8,
    text: "Best Customizable painting store in Pune. I loved to purchase my own customized painting from Artace Studio.",
  },
  {
    id: "review-6",
    authorName: "Shreyas Bangale",
    location: "Texas, USA",
    rating: 4.9,
    text: "Purchased 2 paintings one form the gallery and second I customized on my own preference. Thank You Artace Studio.",
  },
];

const nzFaqs: FAQItem[] = [
  {
    question: "Do you ship original paintings to New Zealand?",
    answer:
      "Yes. Every original abstract painting in this collection ships from our studio in India to addresses across New Zealand. Framed pieces travel in protective casing; unframed canvases are rolled and shipped in a durable tube.",
  },
  {
    question: "How long does delivery to New Zealand take?",
    answer:
      "Delivery time depends on the piece and your specific location. We'll confirm an estimated delivery window once your order is placed.",
  },
  {
    question: "Will I have to pay customs duty or GST?",
    answer:
      "The price shown at checkout covers the artwork itself. Any New Zealand customs duty or GST is assessed separately by NZ Customs and is the customer's responsibility to pay on delivery.",
  },
  {
    question: "Can I return a painting if it's not right for my space?",
    answer:
      "Stock pieces can be returned within 7 days of delivery if unused and in original packaging — return shipping is the customer's responsibility. Custom commissions can't be returned, since they're made specifically for you, unless there's a confirmed quality issue on our side. Full details are on our Return Policy page.",
  },
  {
    question: "Are these real hand-painted originals, or prints?",
    answer:
      "Every piece is 100% hand-painted in acrylic on canvas by our artists — never a printed reproduction. Because each one is made by hand, small variations in brushwork and color are part of the piece, not a flaw.",
  },
  {
    question: "Can I commission a custom abstract painting instead?",
    answer:
      "Yes. Tell us your preferred size, palette, and composition, and our artists will create a one-of-a-kind piece for your space — we'll share progress photos before it ships.",
  },
  {
    question: "What if I'm not sure which piece is right for my space?",
    answer:
      "Message us with a photo of your wall and the colors already in the room, and we'll help you shortlist pieces that fit — free of charge.",
  },
];

const getStarCount = (rating: number) => {
  const rounded = Math.round(rating);
  if (rounded < 1) return 1;
  if (rounded > 5) return 5;
  return rounded;
};

const NzAbstractArtPage = async () => {
  const cookieStore = await cookies();
  const selectedCurrency = parseCurrencyCode(cookieStore.get(CURRENCY_COOKIE_NAME)?.value);
  const exchangeRates = await getExchangeRates();

  const products = await fetchAbstractProducts();

  const pageUrl = buildSiteUrl("/original-abstract-art-for-sale-nz");

  const pageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "Original Abstract Art For Sale Online | Shipped to New Zealand",
        description:
          "Shop original, hand-painted abstract canvas art online — shipped to New Zealand. Real brushwork and texture, never printed.",
        isPartOf: {
          "@id": `${buildSiteUrl("/")}#website`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#itemlist`,
        url: pageUrl,
        numberOfItems: products.length,
        itemListElement: products.slice(0, 6).map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: buildSiteUrl(`/shop/${product.slug}`),
          name: product.name,
          image: toAbsoluteImageUrl(product.image),
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: nzFaqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <main className="bg-[#fcfaf7] text-[#313131]">
        {/* Section 1: Hero */}
        <section className="relative isolate w-full overflow-hidden bg-black">
          <div className="relative h-[80vh] min-h-[560px] w-full md:h-[88vh] md:min-h-[640px]">
            <Image
              src="/abstract-collection-bg.webp"
              alt="Original abstract canvas paintings by Artace Studio"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />

            <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] items-end px-6 pb-14 md:items-center md:px-12 md:pb-0">
              <div className="w-full max-w-2xl text-left text-white">
                <p className="font-display text-[16px] font-medium uppercase tracking-[0.08em] text-white/80 md:text-[18px]">
                  Hand-Painted, Shipped to New Zealand
                </p>
                <h1 className="mt-4 font-display text-[36px] font-semibold leading-[1.08] sm:text-[42px] md:mt-5 md:text-[52px]">
                  Original Abstract Art For Sale
                </h1>
                <p className="mt-5 max-w-xl text-[16px] leading-[1.65] text-white/85 md:text-[18px]">
                  Discover original, hand-painted abstract canvas art — bold color, real
                  texture, and genuine brushwork, shipped directly from our studio in
                  India to your home in New Zealand.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                  <Link
                    href="#abstract-collection"
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
          </div>
        </section>

        {/* Section 2: Why Original, Hand-Painted Art */}
        <section className="py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mx-auto max-w-[820px] text-center">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                Why Original Art
              </p>
              <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-[#1f1f1f] sm:text-[36px] md:mt-4 md:text-[44px]">
                The Difference Between Original Art and a Print
              </h2>
            </div>
            <div className="mx-auto mt-8 max-w-[820px] space-y-5 text-[16px] leading-[1.7] text-[#5b5b5b] md:mt-10 md:text-[18px] md:leading-[1.65]">
              <p>
                A print reproduces an image. An original painting is the image — every
                brushstroke, every layer of texture, every decision the artist made
                while the paint was still wet. When you buy an original abstract
                painting from Artace Studio, you&apos;re buying a piece that exists
                nowhere else.
              </p>
              <p>
                Each canvas is individually hand-painted in acrylic by our artists,
                built up in real layers with visible texture you can only get from
                paint applied by hand — something no giclée print or mass-produced
                canvas wrap can replicate.
              </p>
              <p>
                That&apos;s also why no two pieces are ever perfectly identical, even
                within the same series. Small variations in brushwork and color are
                part of what makes an original painting worth owning.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Understanding Abstract Art */}
        <section className="bg-[#f4f2ee] py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mx-auto max-w-[820px] text-center">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                The Art Form
              </p>
              <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-[#1f1f1f] sm:text-[36px] md:mt-4 md:text-[44px]">
                What Makes a Painting &apos;Abstract&apos;?
              </h2>
            </div>
            <div className="mx-auto mt-8 max-w-[820px] space-y-5 text-[16px] leading-[1.7] text-[#5b5b5b] md:mt-10 md:text-[18px] md:leading-[1.65]">
              <p>
                Abstract art moves away from depicting recognizable objects or scenes,
                and instead uses color, shape, line, and texture to create a
                composition that works on its own terms. Rather than asking &quot;what
                is this a picture of,&quot; abstract art invites you to respond to how
                it makes you feel — the movement of a brushstroke, the tension between
                two colors, the balance of a composition.
              </p>
              <p>
                The style has roots in early 20th-century movements — Kandinsky,
                Mondrian, and later the American Abstract Expressionists like Rothko
                and Pollock — but it has never stopped evolving. Contemporary abstract
                painting borrows from all of that history while responding to a much
                more modern sense of interior design: bold enough to anchor a room,
                flexible enough to suit almost any palette.
              </p>
              <p>
                That flexibility is exactly why abstract art has become one of the most
                popular categories for original wall art in New Zealand — it
                doesn&apos;t need to match your existing décor the way a literal,
                representational painting does. It sets the tone instead of fitting
                into one.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: How to Choose Abstract Wall Art */}
        <section className="py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mx-auto max-w-[800px] text-center">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                Buying Guide
              </p>
              <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-[#1f1f1f] sm:text-[38px] md:mt-4 md:text-[46px]">
                Choosing Abstract Wall Art for Your Home
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 md:mt-14">
              {buyingGuideTips.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article
                    key={`buying-guide-tip-${index}`}
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

        {/* Section 5: Shop the Abstract Collection */}
        <section id="abstract-collection" className="py-12 md:py-[100px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mb-8 md:mb-12">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                Curated Collection
              </p>
              <h2 className="mt-2 font-display text-[30px] font-semibold leading-[1.1] text-[#1f1f1f] sm:text-[36px] md:mt-3 md:text-[44px]">
                Shop the Abstract Collection
              </h2>
              <p className="mt-3 text-[16px] leading-[1.6] text-[#5b5b5b] md:mt-4 md:text-[18px]">
                Original, hand-painted abstract canvases, ready to ship to New Zealand.
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
                        subtitle="Original Abstract Painting"
                        price={product.price ?? undefined}
                      />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#1f1f1f]/10 bg-white p-8 text-center">
                <p className="text-[#5b5b5b]">
                  No abstract paintings available at the moment. Check back soon or
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

        {/* Section 6: What Collectors Say */}
        <section className="bg-[#f4f2ee] py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mx-auto max-w-[800px] text-center">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                Real Reviews
              </p>
              <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-[#1f1f1f] sm:text-[38px] md:mt-4 md:text-[46px]">
                What Collectors Say
              </h2>
              <p className="mt-4 text-[16px] leading-[1.6] text-[#5b5b5b] md:text-[18px]">
                Real reviews from Artace Studio collectors around the world.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-14">
              {collectorTestimonials.map((testimonial) => (
                <article
                  key={testimonial.id}
                  className="flex h-full flex-col rounded-[12px] border border-[#1f1f1f]/10 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <span
                        key={`${testimonial.id}-star-${index}`}
                        className={
                          index < getStarCount(testimonial.rating)
                            ? "text-[#FFDB4D]"
                            : "text-[#d7d2c8]"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="mt-5 text-[15px] leading-7 text-[#3f3a32]">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className="mt-auto pt-5">
                    <div className="border-t border-[#1f1f1f]/10 pt-5">
                      <p className="font-semibold text-[#1f1f1f]">{testimonial.authorName}</p>
                      <p className="mt-1 text-sm text-[#7a7368]">{testimonial.location}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Section 7: Commission a Custom Piece */}
        <section className="bg-[#1f1f1f] py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="flex flex-col items-center gap-8 text-center text-white lg:flex-row lg:justify-between lg:text-left">
              <div className="max-w-xl">
                <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-white/60 md:text-[17px]">
                  Custom Commissions
                </p>
                <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] sm:text-[36px] md:text-[44px]">
                  Commission a One-of-a-Kind Abstract Piece
                </h2>
                <p className="mt-4 text-[16px] leading-[1.6] text-white/75 md:mt-5 md:text-[18px]">
                  Want a piece sized and toned exactly for your space? Work directly
                  with our artists to commission a custom abstract painting — choose
                  your palette, dimensions, and composition, and we&apos;ll share
                  progress photos at every stage before it ships.
                </p>
              </div>

              <Link
                href="/custom-order"
                className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-white px-8 py-4 text-[17px] font-medium text-[#1f1f1f] transition-transform hover:-translate-y-0.5 sm:w-auto md:text-[18px]"
              >
                Start Your Commission
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section 8: Shipping to New Zealand */}
        <section className="py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mx-auto max-w-[820px] text-center">
              <p className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#8a8a8a] md:text-[17px]">
                Shipping &amp; Delivery
              </p>
              <h2 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-[#1f1f1f] sm:text-[36px] md:mt-4 md:text-[44px]">
                Shipping Original Art to New Zealand
              </h2>
            </div>
            <div className="mx-auto mt-8 max-w-[820px] space-y-5 text-[16px] leading-[1.7] text-[#5b5b5b] md:mt-10 md:text-[18px] md:leading-[1.65]">
              <p>
                Every piece ships directly from our studio in India, carefully packed —
                framed paintings in protective casing, unframed canvases rolled and
                shipped in a durable tube for safe transit.
              </p>
              <p>
                We ship original art to New Zealand on every order. Once your order is
                placed, we&apos;ll confirm an estimated delivery window based on the
                piece and your location.
              </p>
              <p>
                The price you see at checkout covers the artwork and its packaging. Any
                New Zealand customs duty or GST is assessed separately by NZ Customs and
                is the customer&apos;s responsibility to pay on delivery.
              </p>
            </div>
            <div className="mx-auto mt-8 flex max-w-[820px] items-center justify-center gap-3 text-[15px] text-[#5b5b5b] md:text-[16px]">
              <Truck className="h-5 w-5 text-[#1f1f1f]" />
              <span>Shipped worldwide, including New Zealand</span>
            </div>
          </div>
        </section>

        {/* Section 9: FAQ */}
        <FAQSection
          id="nz-abstract-art-faqs"
          eyebrow="Questions Before You Buy"
          title="Original Abstract Art in New Zealand: Frequently Asked Questions"
          intro="Everything New Zealand collectors ask before ordering an original abstract painting from Artace Studio."
          items={nzFaqs}
        />

        {/* Section 10: Final CTA + trust stats */}
        <section className="bg-[#1f1f1f] py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="flex flex-col items-center gap-8 text-center text-white lg:flex-row lg:justify-between lg:text-left">
              <div className="max-w-xl">
                <h2 className="font-display text-[30px] font-semibold leading-[1.15] sm:text-[36px] md:text-[44px]">
                  Bring Original Abstract Art Into Your Home
                </h2>
                <p className="mt-4 text-[16px] leading-[1.6] text-white/75 md:mt-5 md:text-[18px]">
                  Shop the collection, or commission a custom piece made exactly for
                  your space.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="#abstract-collection"
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

        <section className="py-12 md:py-[80px]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {[
                { label: "Handcrafted by", value: "Indian Artists" },
                { label: "Custom Sizing", value: "Available" },
                { label: "Approval", value: "Before It Ships" },
                { label: "Ships to", value: "New Zealand & Worldwide" },
              ].map((stat, index) => (
                <div key={`nz-stat-${index}`} className="text-center">
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

export default NzAbstractArtPage;
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: no errors referencing `app/original-abstract-art-for-sale-nz/page.tsx`.

- [ ] **Step 3: Start a verification dev server on a safe port**

Check `netstat -ano | grep LISTENING` for ports 3000/3001 first. Start `npm run dev -- -p 3001` explicitly forced to port 3001.

- [ ] **Step 4: Curl the live route and verify real content**

Run:
```bash
curl -s http://localhost:3001/original-abstract-art-for-sale-nz | grep -o '<title>[^<]*</title>'
curl -s http://localhost:3001/original-abstract-art-for-sale-nz | grep -c 'FAQPage'
curl -s http://localhost:3001/original-abstract-art-for-sale-nz | grep -o 'aria-label="View [^"]*"' | wc -l
curl -s http://localhost:3001/original-abstract-art-for-sale-nz | grep -ic 'artist nz\|art nz\b'
curl -s http://localhost:3001/original-abstract-art-for-sale-nz | grep -ic 'art print\b'
curl -s http://localhost:3001/original-abstract-art-for-sale-nz | grep -ic '5-7 business days\|10-15 business days\|2-3 weeks'
curl -s http://localhost:3001/original-abstract-art-for-sale-nz | grep -c 'Can I return a painting'
```
Expected: title tag matches `Original Abstract Art For Sale Online | Shipped to New Zealand | Artace Studio`; at least 1 `FAQPage`; at least 1 product `aria-label` (the live `abstract-paintings` category should return around a dozen products, matching what the UK page currently gets from the same category); the "artist nz"/"art nz" check MUST return 0; the "art print" check MUST return 0; the delivery-timeframe check MUST return 0; the returns-FAQ check MUST return ≥1.

- [ ] **Step 5: Stop the verification dev server**

Same PID-safe teardown as Task 1 Step 9.

- [ ] **Step 6: Commit**

Skip — do not run `git commit`/`git push` per Global Constraints.

---

### Task 3: Full build verification

**Files:** none created/modified — verification only.

- [ ] **Step 1: Full production build**

Run: `npm run build`
Expected: build succeeds with no failed page generation for
`/original-abstract-art-for-sale-nz`.

- [ ] **Step 2: Final standalone type-check**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: report the full output. Zero errors should reference any of the 5
currency files or the new page. Pre-existing errors elsewhere are not a
blocker, but must be listed by file so the controller can confirm none are
new.

- [ ] **Step 3: Spot-check the live page once more against the build output**

(If `npm run dev` was already stopped after Task 2, restart it with the same
port-safety check first.)

Run:
```bash
curl -s http://localhost:3001/original-abstract-art-for-sale-nz -o /tmp/nz-page.html
grep -c 'Original Abstract Art For Sale' /tmp/nz-page.html
grep -c 'FAQPage' /tmp/nz-page.html
grep -c 'CollectionPage' /tmp/nz-page.html
grep -c 'ItemList' /tmp/nz-page.html
grep -c "customer.s responsibility" /tmp/nz-page.html
grep -ic '5-7 business days\|10-15 business days\|2-3 weeks' /tmp/nz-page.html
grep -ic 'artist nz\|art nz\b' /tmp/nz-page.html
grep -ic 'art print\b' /tmp/nz-page.html
grep -c 'Can I return a painting' /tmp/nz-page.html
```
Expected: the first 5 checks each return ≥1. The next 3 (specific delivery
timeframe, "artist nz"/"art nz" mentions, "art print" mentions) MUST each
return 0. The last check (returns FAQ) MUST return ≥1.

Also confirm NZD pricing works end-to-end for this page specifically:
```bash
curl -s -b "artace-currency=NZD" http://localhost:3001/original-abstract-art-for-sale-nz | grep -o 'NZ\$[0-9,]*' | head -3
```
Expected: at least one `NZ$`-prefixed price is found.

- [ ] **Step 4: Stop the verification dev server**

Same PID-safe teardown as prior tasks.

- [ ] **Step 5: Report results to the user**

Summarize: NZD currency support added and verified end-to-end, route
created, product count returned by the live `abstract-paintings` category
fetch, build status, and confirmation this work is uncommitted and waiting
for the user to commit/push when ready. Also note: this closes out the
three-country regional landing page phase (UK, Ireland, NZ) per the design
doc's "Out of scope" section — any further regional pages are a new,
separately-scoped phase.

---

## Self-Review Notes

- **Spec coverage:** all 9 design-doc decisions covered — no "artist nz"/
  "art nz" claims (Task 2 Step 4's grep check enforces this), live-fetch of
  `abstract-paintings` (Task 2, same pattern as the UK page), NZD currency
  support (Task 1, verified end-to-end in Task 3), URL slug (Task 2), hero
  image reuse (Task 2), same shipping/customs framing as UK/Ireland
  adapted for NZ GST (Task 2 Section 8 + FAQ), UK-style 10-section
  structure (all present in Task 2's Step 1 code, in the same order as the
  UK page), honest testimonial reuse with a fresh 3-quote mix
  (review-3/review-4/review-6, cross-checked against what UK used —
  review-2/review-3/review-6 — and Ireland used — review-1/review-5/
  review-6 — confirming this is a genuinely different combination, not a
  copy of either prior page), returns FAQ included from the start (Task 2,
  verified in Task 3 Step 3).
- **Placeholder scan:** no TBD/TODO.
- **Type consistency:** `AbstractProductCard` fields match how `product.*`
  is accessed in the JSX, identical shape to the UK page's own
  `AbstractProductCard` (same type name, same fields — intentional, since
  this is the same fetch pattern, not a coincidence to flag). `CurrencyCode`
  widening in Task 1 is consumed correctly by Task 2's existing
  `parseCurrencyCode`/`formatConvertedPrice` calls. `FAQItem` fields
  (`question`, `answer`) match both `nzFaqs`'s literal array shape and how
  `FAQSection` and the `mainEntity` schema mapper each consume it.
