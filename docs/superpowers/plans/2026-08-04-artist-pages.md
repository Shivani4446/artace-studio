# Artist Section + Artist Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real artist data model, a per-product artist section, a dedicated artist profile page, an artist listing page, and replace the homepage's fake "Shop by Artist" data with real entries.

**Architecture:** One new local data module (`lib/artists/data.ts`) is the single source of truth, consumed by four independent call sites: the single-product page, a new `/artists/[slug]` profile page, a new `/artists` listing page, and the homepage's `ShopByArtist.tsx`. No WordPress-side changes at all.

**Tech Stack:** Next.js 15 App Router (edge runtime), TypeScript, Tailwind CSS, the existing WooCommerce Store API (`wc/store/v1/products`), the existing `useCurrency()` context (`components/currency/CurrencyProvider.tsx`).

## Global Constraints

- No new npm dependencies.
- No WordPress-side changes of any kind.
- `app/team/page.tsx` (company staff, mistitled "Our Artists") is out of scope — do not touch it.
- The artist byline and dedicated section on the product page must not render at all for a product with no assigned artist — never a placeholder/fallback artist.
- `lib/artists/data.ts`'s `ARTISTS` array is the single source of truth for artist data everywhere — product pages, `/artists`, `/artists/[slug]`, and the homepage's `ShopByArtist.tsx`. No duplicate datasets.
- A `productSlugs` entry with no matching, currently-fetchable WooCommerce product is silently skipped, not a hard error.
- This project has no test framework. Verification is `npx tsc --noEmit` (compare against the known pre-existing baseline: errors in `.next/types/app/api/[[...path]]/route.ts`, `app/warli-paintings/page.tsx`, `components/navbar.tsx`, `app/samora/shop/[slug]/page.tsx`) plus live checks against the real dev server.
- The project owner handles all `git commit`/`git push` in this repo — do not run `git commit` or `git add`; leave changes in the working tree.

---

### Task 1: Artist data model

**Files:**
- Create: `lib/artists/data.ts`

**Interfaces:**
- Produces:
  - `type Artist = { slug: string; name: string; image: string; tagline: string; bio: string; productSlugs: string[] }`
  - `ARTISTS: Artist[]`
  - `getArtistForProduct(productSlug: string): Artist | undefined`
  - `getArtistBySlug(artistSlug: string): Artist | undefined`

- [ ] **Step 1: Write the file**

```ts
// lib/artists/data.ts
export type Artist = {
  slug: string;
  name: string;
  image: string;
  tagline: string;
  bio: string;
  productSlugs: string[];
};

// Placeholder data — replace these entries with real artists (real name,
// bio, photo under /public, and the real WooCommerce product slugs that
// belong to them). Adding more artists later is just editing this array,
// no other code changes needed.
export const ARTISTS: Artist[] = [
  {
    slug: "placeholder-artist",
    name: "Placeholder Artist",
    image: "/Sahil-mahalley.webp",
    tagline: "Example placeholder artist — replace with a real one",
    bio:
      "This is placeholder bio text for a placeholder artist, used to verify the artist pages and product-page section render correctly end to end. Replace this entire entry with a real artist's name, photo, and biography.",
    productSlugs: [],
  },
];

export const getArtistForProduct = (productSlug: string): Artist | undefined =>
  ARTISTS.find((artist) => artist.productSlugs.includes(productSlug));

export const getArtistBySlug = (artistSlug: string): Artist | undefined =>
  ARTISTS.find((artist) => artist.slug === artistSlug);
```

- [ ] **Step 2: Verify with a throwaway script**

```ts
// scratch-verify-artists.mjs (temporary, delete after running)
import { ARTISTS, getArtistForProduct, getArtistBySlug } from "./lib/artists/data.ts";
import assert from "node:assert";

assert(ARTISTS.length >= 1);
assert(getArtistBySlug("placeholder-artist")?.name === "Placeholder Artist");
assert(getArtistBySlug("no-such-artist") === undefined);
assert(getArtistForProduct("no-such-product") === undefined);

console.log("Artist data assertions passed");
```

Run: `npx tsx scratch-verify-artists.mjs`
Expected: `Artist data assertions passed`. Delete `scratch-verify-artists.mjs` when done.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors beyond the known baseline.

- [ ] **Step 4: Leave the change in the working tree**

Do not run `git add` or `git commit`.

---

### Task 2: Product page artist byline + dedicated section

**Files:**
- Modify: `components/singleproduct/SingleProduct.tsx`

**Interfaces:**
- Consumes: `getArtistForProduct` from `@/lib/artists/data` (Task 1). `product.slug` is already available inside this component (used elsewhere, e.g. line 1116).

- [ ] **Step 1: Add the import**

Near the top of `components/singleproduct/SingleProduct.tsx`, alongside the existing imports:

```ts
import { getArtistForProduct } from "@/lib/artists/data";
```

- [ ] **Step 2: Compute the artist once, near where `product` is derived**

Find this line (around line 721, where `product` is computed via `useMemo`):

```ts
  const product = useMemo(
```

Right after the closing of that `useMemo` block (i.e. after the `product` variable is fully assigned, before it's used later in the component), add:

```ts
  const artist = getArtistForProduct(product.slug);
```

- [ ] **Step 3: Fix the byline to be real and conditional**

Find this exact block (currently around lines 1524-1527):

```tsx
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-[16px] text-[#313131] underline underline-offset-2 md:text-[18px]">
                  By {artistName}
                </span>
```

Replace the inner `<span>` with a conditional `<Link>` that only renders when there's a real matched artist:

```tsx
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                {artist ? (
                  <Link
                    href={`/artists/${artist.slug}`}
                    className="text-[16px] text-[#313131] underline underline-offset-2 hover:text-black md:text-[18px]"
                  >
                    By {artist.name}
                  </Link>
                ) : null}
```

`Link` from `next/link` is already imported in this file (used elsewhere, e.g. the advisor CTA at line 2076) — do not add a duplicate import.

Do not remove the `artistName` prop, its default, or its use in the `highlights` array (lines 236, 715, 840-841) — those are unrelated to this visual byline and out of scope for this task.

- [ ] **Step 4: Add the dedicated artist section**

Find the end of the "Why Artace" section and the start of the Advisor section — this exact boundary (currently around lines 2065-2067):

```tsx
      </section>

      <section className="bg-[#080909] px-4 py-12 text-white sm:px-6 md:px-12 md:py-16 lg:px-24">
```

Insert a new section between them, only rendering when `artist` is truthy, mirroring the Advisor block's layout (dark background, two-column, circular photo) but for the product's real artist:

```tsx
      </section>

      {artist ? (
        <section className="bg-[#1f1f1f] px-4 py-12 text-white sm:px-6 md:px-12 md:py-16 lg:px-24">
          <div className="mx-auto grid max-w-[1440px] items-center gap-y-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:gap-x-[80px]">
            <div>
              <p className="font-inter text-[14px] font-normal text-white/65 md:text-[18px]">
                About the Artist
              </p>
              <h2 className="mt-4 max-w-3xl font-display text-[27px] leading-[1.12] text-white md:text-[36px]">
                {artist.tagline}
              </h2>
              <Link
                href={`/artists/${artist.slug}`}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[4px] bg-white px-5 py-3 text-[15px] font-medium text-[#141414] transition-colors hover:bg-[#f3f3f3] sm:w-auto md:text-[18px]"
              >
                View Artist Profile
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="justify-self-center text-center md:justify-self-end">
              <div className="relative mx-auto h-52 w-52 overflow-hidden rounded-full md:h-72 md:w-72">
                <Image
                  src={artist.image}
                  alt={artist.name}
                  fill
                  sizes="(max-width: 768px) 208px, 288px"
                  className="object-cover"
                />
              </div>
              <p className="mt-5 text-[15px] text-white/70">{artist.name}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-[#080909] px-4 py-12 text-white sm:px-6 md:px-12 md:py-16 lg:px-24">
```

`ArrowUpRight` and `Image` are already imported in this file (used by the existing Advisor block) — do not add duplicate imports.

- [ ] **Step 5: Verify live against the real dev server**

Before testing, temporarily add the real product slug you're testing with to the placeholder artist's `productSlugs` array in `lib/artists/data.ts` (revert this temporary edit after testing — Task 1's file should end this task exactly as Task 1 left it, with an empty `productSlugs: []`).

Start the dev server (`npm run dev`) if not already running. Visit that product's page and confirm:
- The byline reads "By Placeholder Artist" and is a real clickable link to `/artists/placeholder-artist` (this route doesn't exist yet — a 404 here is expected and fine at this point in the plan; you're only confirming the link renders and points to the right URL).
- The new dark artist section appears between the "Why Artace" section and the existing Advisor ("Sahil Mahalley") section, showing the placeholder artist's photo, tagline as the headline, and a "View Artist Profile" button.

Then visit a *different* product (one not in `productSlugs`) and confirm neither the byline nor the new section appears at all.

Revert your temporary `productSlugs` edit in `lib/artists/data.ts` back to `[]` before moving on.

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors beyond the known baseline.

- [ ] **Step 7: Leave the change in the working tree**

Do not run `git add` or `git commit`.

---

### Task 3: Artist profile page (`/artists/[slug]`)

**Files:**
- Create: `app/artists/[slug]/page.tsx`
- Create: `components/artists/ArtistProductGrid.tsx`

**Interfaces:**
- Consumes: `getArtistBySlug` from `@/lib/artists/data` (Task 1); `buildSiteUrl` from `@/lib/site` (existing); `useCurrency` from `@/components/currency/CurrencyProvider` (existing, returns `{ currency, setCurrency, formatPrice }`, call `formatPrice(amountInInr: number): string`); `AddToCartButton` from `@/components/cart/AddToCartButton` (existing, props `{ id, woocommerceProductId, title, image, subtitle, price }`).
- Produces: `ArtistProductGrid` — a client component, props `{ productSlugs: string[] }`, fetches and renders the given products.

- [ ] **Step 1: Create the product-grid client component**

Create `components/artists/ArtistProductGrid.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import AddToCartButton from "@/components/cart/AddToCartButton";

type ArtistGridProduct = {
  id: number;
  slug: string;
  name: string;
  image: string;
  price: number | null;
};

type WooStoreProductDetail = {
  id: number;
  slug: string;
  name: string;
  images?: Array<{ src?: string }>;
  prices?: { price: string; currency_minor_unit: number };
};

const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";

const getStoreApiBaseUrl = () =>
  (
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    "https://api.artacestudio.com/"
  ).replace(/\/+$/, "");

const fetchOneProduct = async (slug: string): Promise<ArtistGridProduct | null> => {
  try {
    const response = await fetch(
      `${getStoreApiBaseUrl()}/wp-json/wc/store/v1/products?slug=${encodeURIComponent(slug)}&per_page=1`,
      { cache: "no-store" }
    );
    if (!response.ok) return null;

    const payload = (await response.json()) as WooStoreProductDetail[];
    const product = Array.isArray(payload) ? payload[0] : undefined;
    if (!product) return null;

    const minorUnit = product.prices?.currency_minor_unit ?? 2;
    const rawPrice = Number(product.prices?.price);
    const price = Number.isFinite(rawPrice) ? rawPrice / 10 ** minorUnit : null;

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0]?.src || FALLBACK_PRODUCT_IMAGE,
      price,
    };
  } catch {
    return null;
  }
};

export default function ArtistProductGrid({ productSlugs }: { productSlugs: string[] }) {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<ArtistGridProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const results = await Promise.all(productSlugs.map(fetchOneProduct));
      if (!cancelled) {
        setProducts(results.filter((product): product is ArtistGridProduct => product !== null));
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [productSlugs]);

  if (loading) {
    return <p className="text-[15px] text-[#666]">Loading available paintings…</p>;
  }

  if (products.length === 0) {
    return <p className="text-[15px] text-[#666]">No paintings currently available from this artist.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
      {products.map((product) => (
        <article key={product.id} className="group relative flex flex-col">
          <Link
            href={`/shop/${product.slug}`}
            aria-label={`Open ${product.name}`}
            className="absolute inset-0 z-10"
          />
          <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-[12px] bg-[#d6d2ca]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1200px) 48vw, 24vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <h3 className="font-display text-[17px] leading-snug text-[#2c2c2c] sm:text-[22px]">
            {product.name}
          </h3>
          {product.price !== null ? (
            <p className="mt-1 text-[14px] text-[#2c2c2c] sm:text-[16px]">
              {formatPrice(product.price)}
            </p>
          ) : null}
          <div className="pointer-events-auto relative z-20 mt-4">
            <AddToCartButton
              id={product.id}
              woocommerceProductId={product.id}
              title={product.name}
              image={product.image}
              price={product.price ?? undefined}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create the artist profile page**

Create `app/artists/[slug]/page.tsx`:

```tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArtistBySlug } from "@/lib/artists/data";
import { buildSiteUrl } from "@/lib/site";
import ArtistProductGrid from "@/components/artists/ArtistProductGrid";

export const runtime = "edge";

type ArtistPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ArtistPageProps) {
  const { slug } = await params;
  const artist = getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  const artistUrl = buildSiteUrl(`/artists/${artist.slug}`);

  return {
    title: `${artist.name} | Artace Studio`,
    description: artist.tagline,
    alternates: {
      canonical: artistUrl,
    },
    openGraph: {
      title: artist.name,
      description: artist.tagline,
      url: artistUrl,
      images: [{ url: buildSiteUrl(artist.image) }],
    },
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params;
  const artist = getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:px-12 md:py-16 lg:px-24">
      <div className="grid gap-10 md:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)] md:items-start">
        <div className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-full">
          <Image
            src={artist.image}
            alt={artist.name}
            fill
            sizes="(max-width: 768px) 240px, 320px"
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="font-display text-[32px] leading-[1.15] text-[#1f1f1f] md:text-[44px]">
            {artist.name}
          </h1>
          <p className="mt-2 text-[16px] text-[#666] md:text-[18px]">{artist.tagline}</p>
          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-[#3f3d37] md:text-[17px] md:leading-8">
            {artist.bio}
          </p>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="font-display text-[24px] text-[#1f1f1f] md:text-[30px]">
          Available Paintings
        </h2>
        <div className="mt-6">
          <ArtistProductGrid productSlugs={artist.productSlugs} />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify live against the real dev server**

Temporarily add a real, currently-published product slug to the placeholder artist's `productSlugs` in `lib/artists/data.ts` (revert after testing, same as Task 2's Step 5). Start the dev server if not already running.

- Visit `/artists/placeholder-artist` — confirm the artist's photo, name, tagline, and bio render, and the "Available Paintings" grid shows the real product you added, with correct image/name/price, and its "Add to Cart" button works.
- Visit `/artists/no-such-artist` — confirm a 404 page.
- Temporarily set `productSlugs: []` again and reload `/artists/placeholder-artist` — confirm the "No paintings currently available" message appears instead of an empty or broken grid.

Revert your temporary `productSlugs` edit back to `[]` before moving on.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors beyond the known baseline.

- [ ] **Step 5: Leave the change in the working tree**

Do not run `git add` or `git commit`.

---

### Task 4: Artist listing page (`/artists`)

**Files:**
- Create: `app/artists/page.tsx`

**Interfaces:**
- Consumes: `ARTISTS` from `@/lib/artists/data` (Task 1).

- [ ] **Step 1: Create the page**

Create `app/artists/page.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ARTISTS } from "@/lib/artists/data";
import { buildSiteUrl } from "@/lib/site";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Our Artists | Artace Studio",
  description: "Meet the artists behind Artace Studio's handcrafted paintings.",
  alternates: {
    canonical: buildSiteUrl("/artists"),
  },
};

export default function ArtistsPage() {
  return (
    <main className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:px-12 md:py-16 lg:px-24">
      <h1 className="font-display text-[32px] text-[#1f1f1f] md:text-[44px]">Our Artists</h1>
      <p className="mt-2 max-w-2xl text-[16px] text-[#666] md:text-[18px]">
        Meet the artists behind our handcrafted paintings.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {ARTISTS.map((artist) => (
          <Link key={artist.slug} href={`/artists/${artist.slug}`} className="group flex flex-col">
            <div className="relative aspect-square w-full overflow-hidden rounded-[12px] bg-[#d6d2ca]">
              <Image
                src={artist.image}
                alt={artist.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <h2 className="mt-4 font-display text-[20px] text-[#2c2c2c]">{artist.name}</h2>
            <p className="mt-1 text-[14px] text-[#666]">{artist.tagline}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify live against the real dev server**

Visit `/artists` and confirm the placeholder artist's card renders (photo, name, tagline) and clicking it navigates to `/artists/placeholder-artist`.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors beyond the known baseline.

- [ ] **Step 4: Leave the change in the working tree**

Do not run `git add` or `git commit`.

---

### Task 5: Homepage `ShopByArtist.tsx` cleanup

**Files:**
- Modify: `components/homepage/ShopByArtist.tsx`

**Interfaces:**
- Consumes: `ARTISTS` from `@/lib/artists/data` (Task 1).

- [ ] **Step 1: Remove the hardcoded fake data**

Delete this exact block (currently lines 20-45):

```ts
const artists = [
  {
    name: "Aarav Mehta",
    style: "Minimalism",
    image: "/Artist-1.webp",
    aspect: "aspect-square"
  },
  {
    name: "Isha Reddy",
    style: "Watercolor Art",
    image: "/Artist-2.webp",
    aspect: "aspect-[3/4]"
  },
  {
    name: "Kabir Sharma",
    style: "Surrealism",
    image: "/Artist-3.webp",
    aspect: "aspect-square"
  },
  {
    name: "Tanvi Deshmukh",
    style: "Expressionism",
    image: "/Artist-4.webp",
    aspect: "aspect-[3/4]"
  }
];
```

- [ ] **Step 2: Add the real import**

Add near the top of the file, alongside the existing imports:

```ts
import { ARTISTS } from '@/lib/artists/data';
```

- [ ] **Step 3: Update the grid to use real data and be clickable**

Find this exact block (currently lines 68-94):

```tsx
        {/* Artists Grid - Staggered Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 align-top">
          {artists.map((artist, index) => (
            <div key={index} className="flex flex-col group cursor-pointer">
              
              {/* Image Container with Dynamic Aspect Ratio */}
              <div className={`relative w-full ${artist.aspect} overflow-hidden mb-5 bg-gray-200`}>
                <Image
                  src={artist.image}
                  alt={`Artwork by ${artist.name}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>

              {/* Artist Info */}
              <div className="flex flex-col gap-1">
                <h3 className="font-playfair text-xl text-[#2C2C2C] leading-snug">
                  {artist.name}
                </h3>
                <span className="font-inter text-[#666666] text-sm md:text-[15px] font-normal">
                  {artist.style}
                </span>
              </div>
            </div>
          ))}
        </div>
```

Replace it with (real data, real clickable link per card — the fake version was never actually clickable):

```tsx
        {/* Artists Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 align-top">
          {ARTISTS.map((artist) => (
            <Link key={artist.slug} href={`/artists/${artist.slug}`} className="flex flex-col group">
              
              {/* Image Container */}
              <div className="relative w-full aspect-square overflow-hidden mb-5 bg-gray-200">
                <Image
                  src={artist.image}
                  alt={`Artwork by ${artist.name}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>

              {/* Artist Info */}
              <div className="flex flex-col gap-1">
                <h3 className="font-playfair text-xl text-[#2C2C2C] leading-snug">
                  {artist.name}
                </h3>
                <span className="font-inter text-[#666666] text-sm md:text-[15px] font-normal">
                  {artist.tagline}
                </span>
              </div>
            </Link>
          ))}
        </div>
```

- [ ] **Step 4: Verify live against the real dev server**

Visit the homepage and confirm the "Shop By Artist" section shows the real placeholder artist (not the old 4 fake names/images), and clicking the card navigates to `/artists/placeholder-artist`. Confirm the "SEE ALL" link still goes to `/artists`.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors beyond the known baseline.

- [ ] **Step 6: Leave the change in the working tree**

Do not run `git add` or `git commit`.

---

## Self-Review Notes

- **Spec coverage:** All 5 spec scope items (data model, product-page section, artist profile page, artist listing page, homepage cleanup) are each covered by exactly one task.
- **Type consistency:** `Artist`, `getArtistForProduct`, `getArtistBySlug`, `ARTISTS` are defined once in Task 1 and consumed with matching names/signatures in Tasks 2-5. `ArtistProductGrid`'s `productSlugs: string[]` prop matches `Artist.productSlugs`'s type exactly.
- **No placeholder scan issues found** — every step contains complete, real code; the one intentionally-placeholder *content* (a fake "Placeholder Artist" entry) is explicitly flagged as temporary data for the user to replace, not a plan gap.
