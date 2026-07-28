# Painting Categories Archive Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `/collections` archive page listing every real painting category from WooCommerce, and point the footer's "Painting Categories" link at it instead of `/shop`.

**Architecture:** A new Server Component page (`app/collections/page.tsx`, edge runtime, matching its `[slug]` sibling) fetches the WooCommerce categories endpoint directly, filters out the catch-all/corporate/junk categories, sorts by product count, and renders a simple image-card grid (reusing the homepage's `DiscoverEssentials` visual language) plus `ItemList` JSON-LD. One footer link is repointed.

**Tech Stack:** Next.js 15.5.2 App Router (Server Component, edge runtime), TypeScript, Tailwind CSS 4, WooCommerce Store API (`/wp-json/wc/store/v1/products/categories`).

## Global Constraints

- Do NOT run `git commit` or `git push` at any point — the user reviews and commits/pushes everything themselves. Every task ends at verification, not a commit.
- No test framework exists in this repo. Verification uses `npx tsc --noEmit`, `npm run build`, and live dev-server checks (a fresh port, never 3000).
- Category list must be **live-fetched from WooCommerce**, not hardcoded, so new categories appear automatically.
- Filter rules (all must pass): category has a real `image.src` (no fallback image), `count >= 2`, and the category's name (case-insensitive, trimmed) is not in the exclusion set `{"all canvas paintings", "all canvas paintngs", "corporate paintings"}`.
- Sort by `count` descending.
- Runtime: `export const runtime = "edge"` + `export const revalidate = 60`, matching the existing sibling route `app/collections/[slug]/page.tsx` exactly — this is a nested route, not the app root, so it is not in the same risk category as the app-root edge-runtime incident earlier in this project.
- Page URL: `/collections` (the index of the existing `/collections/{slug}` detail pages).

---

### Task 1: Create the `/collections` archive page

**Files:**
- Create: `app/collections/page.tsx`

**Interfaces:**
- Consumes: `buildSiteUrl`, `toAbsoluteImageUrl` from `@/lib/site`; `decodeHtmlEntities` from `@/utils/text`; `getCollectionHref` from `@/utils/collections` (existing helper: `(categorySlug: string) => \`/collections/${encodeURIComponent(categorySlug)}\``).
- Produces: default-exported page component at route `/collections`. No other task depends on this file's internals.

- [ ] **Step 1: Create `app/collections/page.tsx`**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildSiteUrl, toAbsoluteImageUrl } from "@/lib/site";
import { decodeHtmlEntities } from "@/utils/text";
import { getCollectionHref } from "@/utils/collections";

export const runtime = "edge";
export const revalidate = 60;

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const MIN_CATEGORY_PRODUCT_COUNT = 2;
const EXCLUDED_CATEGORY_NAMES = new Set([
  "all canvas paintings",
  "all canvas paintngs",
  "corporate paintings",
]);

type WooStoreCategoryImage = {
  id: number;
  src: string;
  alt?: string;
  name?: string;
};

type WooStoreCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
  image?: WooStoreCategoryImage | null;
};

type CategoryCard = {
  id: number;
  name: string;
  slug: string;
  count: number;
  image: string;
  imageAlt: string;
  href: string;
};

const getApiBaseUrl = () => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || DEFAULT_WOOCOMMERCE_SITE_URL;
  return apiBaseUrl.replace(/\/+$/, "");
};

const fetchCategories = async (): Promise<WooStoreCategory[]> => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(
      `${apiBaseUrl}/wp-json/wc/store/v1/products/categories?hide_empty=true&per_page=100`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) return [];

    const payload = (await response.json()) as WooStoreCategory[];
    return Array.isArray(payload) ? payload : [];
  } catch {
    return [];
  }
};

const getCategoryCards = (categories: WooStoreCategory[]): CategoryCard[] => {
  return categories
    .filter((category) => {
      if (!category.slug || !category.name) return false;
      if (!category.image?.src) return false;
      if (category.count < MIN_CATEGORY_PRODUCT_COUNT) return false;

      const normalizedName = decodeHtmlEntities(category.name).trim().toLowerCase();
      if (EXCLUDED_CATEGORY_NAMES.has(normalizedName)) return false;

      return true;
    })
    .sort((first, second) => second.count - first.count)
    .map((category) => {
      const name = decodeHtmlEntities(category.name);
      return {
        id: category.id,
        name,
        slug: category.slug,
        count: category.count,
        image: category.image!.src,
        imageAlt: decodeHtmlEntities(category.image?.alt || category.image?.name || name),
        href: getCollectionHref(category.slug),
      };
    });
};

export const metadata: Metadata = {
  title: "Painting Categories | Shop by Style | Artace Studio",
  description:
    "Browse every handcrafted canvas painting category at Artace Studio — spiritual, abstract, landscape, figurative, and more. Find the style that fits your space.",
  alternates: {
    canonical: "/collections",
  },
  openGraph: {
    title: "Painting Categories | Shop by Style | Artace Studio",
    description:
      "Browse every handcrafted canvas painting category at Artace Studio, from spiritual and abstract art to landscapes and figurative work.",
    url: "/collections",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Painting Categories | Shop by Style | Artace Studio",
    description: "Browse every handcrafted canvas painting category at Artace Studio.",
  },
};

const CollectionsIndexPage = async () => {
  const categories = await fetchCategories();
  const cards = getCategoryCards(categories);
  const pageUrl = buildSiteUrl("/collections");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}#itemlist`,
    url: pageUrl,
    numberOfItems: cards.length,
    itemListElement: cards.map((card, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: buildSiteUrl(card.href),
      name: card.name,
      image: toAbsoluteImageUrl(card.image),
    })),
  };

  return (
    <main className="bg-[#f4f2ee] py-8 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12">
        <p className="text-[16px] leading-[1.5] text-[#767676] md:text-[18px]">
          Shop by Category
        </p>
        <h1 className="mt-4 font-display text-[32px] leading-[1.08] text-[#1f1f1f] sm:text-[40px] md:mt-5 md:text-[52px]">
          Painting Categories
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-[1.7] text-[#5b5b5b] md:mt-5 md:text-[18px]">
          Every handcrafted canvas painting style Artace Studio offers, from
          spiritual and devotional art to abstract, landscape, and figurative
          work. Pick a category to explore the full collection.
        </p>

        {cards.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-10 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {cards.map((card) => (
              <Link
                key={card.id}
                href={card.href}
                className="group relative block min-h-[220px] overflow-hidden rounded-[12px] bg-[#d6d2ca] sm:min-h-[260px] md:min-h-[280px]"
              >
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 md:bottom-5 md:left-5 md:right-5">
                  <h2 className="font-inter text-[17px] font-medium leading-[1.15] text-white md:text-[18px]">
                    {card.name}
                  </h2>
                  <p className="mt-1 text-[13px] text-white/80 md:text-[14px]">
                    {card.count} {card.count === 1 ? "Painting" : "Paintings"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-[#1f1f1f]/10 bg-white p-8 text-center md:mt-10">
            <p className="text-[#5b5b5b]">
              Categories are being updated right now. Check back soon, or{" "}
              <Link href="/shop" className="text-[#8B4513] underline">
                browse the full shop
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default CollectionsIndexPage;
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors from `app/collections/page.tsx`. (This project has two pre-existing, unrelated type errors — `app/warli-paintings/page.tsx` and `components/navbar.tsx:1165` — that are not this task's concern; `next.config.ts` already sets `typescript.ignoreBuildErrors: true` so they don't block builds either.)

- [ ] **Step 3: Verify against the live catalog**

Start a dev server on port 3005 (never port 3000 — see Global Constraints):

```bash
npm run dev -- -p 3005
```

Then:

```bash
curl -s http://localhost:3005/collections | grep -o 'font-inter text-\[17px\] font-medium leading-\[1.15\] text-white md:text-\[18px\]">[^<]*'
```

(This greps for the exact heading className used by the category cards in Step 1's code, not a generic `<h2>` — the footer on this same page also renders `<h2>` tags for its own section titles like "Collections" and "Shop," which a generic `<h2>` match would incorrectly include.)

Expected: 11 category names, matching (in descending order by product count) Religious, Buddha, Ganapati, Vastu, Abstract, Radha Krishna, Art Prints, Landscapes & Cityscapes, Table Top, Abstract Wall Art, Figurative — no "All Canvas Paintings" and no "corporate paintings" among them. (Exact counts may drift slightly from the numbers in the spec if the live catalog has changed since this plan was written — what matters is that the catch-all and corporate categories are absent and everything shown has a real product count of at least 2.)

Stop the dev server afterward (find and kill the process listening on 3005).

---

### Task 2: Point the footer's "Painting Categories" link at the new page

**Files:**
- Modify: `components/footer.tsx:61`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Update the href**

In `components/footer.tsx`, inside the `"Resources"` section's `links` array, change:

```ts
{ label: "Painting Categories", href: "/shop" },
```

to:

```ts
{ label: "Painting Categories", href: "/collections" },
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no new errors.

---

### Task 3: Final verification

**Files:** none (verification only).

- [ ] **Step 1: Full type-check**

Run: `npx tsc --noEmit`
Expected: zero errors except the two pre-existing, unrelated ones noted in Task 1 Step 2.

- [ ] **Step 2: Full production build**

Run: `npm run build`
Expected: build succeeds. Confirm the route table includes `/collections` (new) alongside the existing `/collections/[slug]`, and that no other route's rendering mode (`○` vs `ƒ`) changed.

- [ ] **Step 3: Live end-to-end check**

Start a dev server on port 3005 (not 3000):

```bash
npm run dev -- -p 3005
```

Run:

```bash
curl -s http://localhost:3005/collections | grep -o 'href="/collections/[^"]*"' | sort -u
```

Expected: one `href="/collections/{slug}"` per category card, each slug matching one of the 11 expected categories from Task 1 Step 3, and each one a real, working collection detail page (spot-check by visiting `http://localhost:3005/collections/buddha-paintings` and confirming it loads the existing collection landing page, not a 404).

Then confirm the footer:

```bash
curl -s http://localhost:3005/ | grep -o 'href="/collections"[^>]*>[^<]*<' | head -3
```

Expected: the "Painting Categories" footer link now points to `/collections`.

Stop the dev server afterward.
