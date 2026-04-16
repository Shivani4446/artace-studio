# Dynamic Product Schema Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement dynamic JSON-LD schema markup for all product pages to improve Google search visibility, AI overviews, and LLM citations.

**Architecture:** Modular schema generation with separate files for each schema type (Product, Offer, AggregateRating, Review, Breadcrumb). Uses WooCommerce Store API for products and REST API for detailed reviews. Schema is injected via Next.js generateMetadata function.

**Tech Stack:** Next.js 16, TypeScript, WooCommerce REST API, JSON-LD schema.org

---

## File Structure

```
lib/schema/
├── types.ts                 # TypeScript interfaces for schema input/output
├── offer.ts                 # Offer schema (price, availability)
├── aggregate-rating.ts      # AggregateRating schema (star ratings)
├── review.ts               # Individual Review schema
├── breadcrumb.ts           # BreadcrumbList schema
├── product.ts              # Product schema (main)
└── index.ts                # Main export combining all schemas
```

---

## Task 1: Create TypeScript Types

**Files:**
- Create: `lib/schema/types.ts`

- [ ] **Step 1: Create types.ts with all interfaces**

```typescript
export interface WooStorePrices {
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  price: string;
  regular_price: string;
  sale_price: string;
}

export interface WooStoreImage {
  id: number;
  src: string;
  thumbnail?: string;
  alt?: string;
  name?: string;
}

export interface WooStoreCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WooStoreAttribute {
  id: number;
  name: string;
  options?: string[];
  terms?: { id: number; name: string; slug: string }[];
}

export interface VariationData {
  id: number;
  attributes: { name: string; value: string }[];
  price: number | null;
  regularPrice: number | null;
  salePrice: number | null;
  onSale: boolean;
  inStock: boolean;
}

export interface WooStoreProduct {
  id: number;
  slug: string;
  permalink: string;
  name: string;
  short_description: string;
  description: string;
  sku: string;
  on_sale: boolean;
  average_rating: string;
  review_count: number;
  stock_status: "instock" | "outofstock" | "onbackorder" | string;
  stock_quantity: number | null;
  images: WooStoreImage[];
  categories: WooStoreCategory[];
  attributes: WooStoreAttribute[];
  prices: WooStorePrices;
  related_ids?: number[];
  upsell_ids?: number[];
  cross_sell_ids?: number[];
  variations?: VariationData[];
  meta_data?: { key: string; value: unknown }[];
}

export interface WooCommerceReview {
  id: number;
  date_created: string;
  review: string;
  reviewer: string;
  reviewer_email: string;
  rating: number;
  verified: boolean;
  product_id: number;
}

export interface ProductSchemaInput {
  product: WooStoreProduct;
  reviews?: WooCommerceReview[];
  baseUrl?: string;
}

export interface SchemaOutput {
  "@context": "https://schema.org";
  "@graph": unknown[];
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/schema/types.ts
git commit -m "feat: add schema types for product schema generation"
```

---

## Task 2: Implement Offer Schema Generator

**Files:**
- Create: `lib/schema/offer.ts`

- [ ] **Step 1: Create offer.ts**

```typescript
import type { WooStoreProduct, VariationData } from "./types";

const STOCK_STATUS_MAPPING: Record<string, string> = {
  instock: "https://schema.org/InStock",
  outofstock: "https://schema.org/OutOfStock",
  onbackorder: "https://schema.org/PreOrder",
};

const DEFAULT_CURRENCY = "INR";

export interface OfferSchemaOptions {
  product: WooStoreProduct;
  variation?: VariationData;
  baseUrl: string;
}

export function generateOfferSchema({ product, variation, baseUrl }: OfferSchemaOptions) {
  const price = variation?.price ?? parseFloat(product.prices.price);
  const regularPrice = variation?.regularPrice ?? parseFloat(product.prices.regular_price);
  const salePrice = variation?.salePrice ?? (product.prices.sale_price ? parseFloat(product.prices.sale_price) : null);
  
  const isOnSale = product.on_sale || (variation?.onSale ?? false);
  
  const stockStatus = variation?.inStock 
    ? "https://schema.org/InStock"
    : STOCK_STATUS_MAPPING[product.stock_status] ?? "https://schema.org/InStock";

  const priceValidUntil = new Date();
  priceValidUntil.setDate(priceValidUntil.getDate() + 30);

  const offerSchema: Record<string, unknown> = {
    "@type": "Offer",
    "price": price.toFixed(2),
    "priceCurrency": product.prices.currency_code || DEFAULT_CURRENCY,
    "availability": stockStatus,
    "url": product.permalink,
    "priceValidUntil": priceValidUntil.toISOString().split("T")[0],
    "itemCondition": "https://schema.org/NewCondition",
  };

  if (isOnSale && salePrice) {
    offerSchema["price"] = salePrice.toFixed(2);
  }

  if (regularPrice && regularPrice > price) {
    offerSchema["highPrice"] = regularPrice.toFixed(2);
  }

  if (variation) {
    const variationName = variation.attributes
      .map((attr) => attr.value)
      .join(" / ");
    
    offerSchema["itemOffered"] = {
      "@type": "Product",
      "name": variationName ? `${product.name} - ${variationName}` : product.name,
    };
  }

  return offerSchema;
}

export function generateAllOffersSchema(product: WooStoreProduct, baseUrl: string) {
  if (product.variations && product.variations.length > 0) {
    return product.variations.map((variation) =>
      generateOfferSchema({ product, variation, baseUrl })
    );
  }

  return [generateOfferSchema({ product, baseUrl })];
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/schema/offer.ts
git commit -m "feat: add offer schema generator"
```

---

## Task 3: Implement AggregateRating Schema Generator

**Files:**
- Create: `lib/schema/aggregate-rating.ts`

- [ ] **Step 1: Create aggregate-rating.ts**

```typescript
import type { WooStoreProduct } from "./types";

export function generateAggregateRatingSchema(product: WooStoreProduct) {
  const ratingValue = parseFloat(product.average_rating);
  const reviewCount = product.review_count;

  if (!ratingValue || !reviewCount) {
    return null;
  }

  return {
    "@type": "AggregateRating",
    "ratingValue": ratingValue.toString(),
    "bestRating": "5",
    "ratingCount": reviewCount.toString(),
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/schema/aggregate-rating.ts
git commit -m "feat: add aggregate rating schema generator"
```

---

## Task 4: Implement Review Schema Generator

**Files:**
- Create: `lib/schema/review.ts`

- [ ] **Step 1: Create review.ts**

```typescript
import type { WooCommerceReview } from "./types";

export function generateReviewSchema(review: WooCommerceReview) {
  return {
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating.toString(),
      "bestRating": "5",
    },
    "author": {
      "@type": "Person",
      "name": review.reviewer,
    },
    "reviewBody": review.review,
    "datePublished": review.date_created,
    "name": review.review.substring(0, 100) + (review.review.length > 100 ? "..." : ""),
  };
}

export function generateReviewsSchema(reviews: WooCommerceReview[]) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return reviews
    .filter((review) => review.rating && review.review)
    .map(generateReviewSchema);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/schema/review.ts
git commit -m "feat: add review schema generator"
```

---

## Task 5: Implement Breadcrumb Schema Generator

**Files:**
- Create: `lib/schema/breadcrumb.ts`

- [ ] **Step 1: Create breadcrumb.ts**

```typescript
import type { WooStoreCategory } from "./types";

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(
  categories: WooStoreCategory[],
  productName: string,
  productUrl: string,
  baseUrl: string
) {
  const items: BreadcrumbItem[] = [
    { name: "Home", url: baseUrl },
  ];

  if (categories && categories.length > 0) {
    const sortedCategories = [...categories].sort((a, b) => a.id - b.id);
    
    for (const category of sortedCategories) {
      const categoryUrl = `${baseUrl}/collections/${category.slug}`;
      items.push({ name: category.name, url: categoryUrl });
    }
  }

  items.push({ name: productName, url: productUrl });

  const itemListElement = items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url,
  }));

  return {
    "@type": "BreadcrumbList",
    "itemListElement": itemListElement,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/schema/breadcrumb.ts
git commit -m "feat: add breadcrumb schema generator"
```

---

## Task 6: Implement Product Schema Generator

**Files:**
- Create: `lib/schema/product.ts`

- [ ] **Step 1: Create product.ts**

```typescript
import type { WooStoreProduct, WooCommerceReview } from "./types";
import { generateAllOffersSchema } from "./offer";
import { generateAggregateRatingSchema } from "./aggregate-rating";
import { generateReviewsSchema } from "./review";
import { generateBreadcrumbSchema } from "./breadcrumb";

const DEFAULT_BRAND = "Artace Studio";
const DEFAULT_BASE_URL = "https://artacestudio.com";

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractAttributeValues(attributes: WooStoreProduct["attributes"], targetNames: string[]): string[] {
  const values: string[] = [];
  
  for (const attr of attributes) {
    const normalizedName = attr.name.toLowerCase();
    for (const targetName of targetNames) {
      if (normalizedName.includes(targetName)) {
        values.push(...(attr.options || []));
      }
    }
  }
  
  return [...new Set(values)];
}

export function generateProductSchema(
  product: WooStoreProduct,
  reviews?: WooCommerceReview[],
  baseUrl: string = DEFAULT_BASE_URL
) {
  const description = [
    stripHtml(product.short_description),
    stripHtml(product.description),
  ]
    .filter(Boolean)
    .join(" ")
    .substring(0, 5000);

  const images = product.images
    .filter((img) => img.src)
    .map((img) => img.src);

  const colors = extractAttributeValues(product.attributes, ["color"]);
  const materials = extractAttributeValues(product.attributes, ["material", "material"]);

  const gtin = product.meta_data?.find(
    (meta) => meta.key === "gtin" || meta.key === "ean" || meta.key === "upc"
  )?.value as string | undefined;

  const productSchema: Record<string, unknown> = {
    "@type": "Product",
    "name": product.name,
    "description": description,
    "image": images,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": DEFAULT_BRAND,
    },
    "offers": generateAllOffersSchema(product, baseUrl),
  };

  if (gtin) {
    productSchema["gtin"] = gtin;
  }

  if (colors.length > 0) {
    productSchema["color"] = colors[0];
  }

  if (materials.length > 0) {
    productSchema["material"] = materials[0];
  }

  const aggregateRating = generateAggregateRatingSchema(product);
  if (aggregateRating) {
    productSchema["aggregateRating"] = aggregateRating;
  }

  if (reviews && reviews.length > 0) {
    const reviewSchemas = generateReviewsSchema(reviews);
    if (reviewSchemas) {
      productSchema["review"] = reviewSchemas;
    }
  }

  const breadcrumb = generateBreadcrumbSchema(
    product.categories || [],
    product.name,
    product.permalink,
    baseUrl
  );

  return {
    "@context": "https://schema.org",
    "@graph": [productSchema, breadcrumb],
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/schema/product.ts
git commit -m "feat: add product schema generator"
```

---

## Task 7: Create Main Export

**Files:**
- Create: `lib/schema/index.ts`

- [ ] **Step 1: Create index.ts**

```typescript
export type { 
  WooStorePrices, 
  WooStoreImage, 
  WooStoreCategory, 
  WooStoreAttribute, 
  VariationData, 
  WooStoreProduct, 
  WooCommerceReview,
  ProductSchemaInput,
  SchemaOutput 
} from "./types";

export { generateProductSchema } from "./product";
export { generateOfferSchema, generateAllOffersSchema } from "./offer";
export { generateAggregateRatingSchema } from "./aggregate-rating";
export { generateReviewsSchema } from "./review";
export { generateBreadcrumbSchema } from "./breadcrumb";
```

- [ ] **Step 2: Commit**

```bash
git add lib/schema/index.ts
git commit -m "feat: add schema module main export"
```

---

## Task 8: Integrate Schema with Product Page

**Files:**
- Modify: `app/shop/[slug]/page.tsx`

- [ ] **Step 1: Read current imports in page.tsx**

Read the first 20 lines of `app/shop/[slug]/page.tsx` to see current imports.

- [ ] **Step 2: Add schema import**

Add after existing imports:
```typescript
import { generateProductSchema } from "@/lib/schema";
```

- [ ] **Step 3: Find where to add generateMetadata**

Locate the SingleProductPage function (around line 833) and add generateMetadata before it:
```typescript
export async function generateMetadata({ params }: SingleProductPageProps) {
  const { slug } = await params;
  const product = await getSingleProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | Artace Studio",
    };
  }

  const schema = generateProductSchema(product);

  return {
    title: `${product.name} | Artace Studio`,
    description: stripHtml(product.short_description).substring(0, 160),
    openGraph: {
      title: product.name,
      description: stripHtml(product.short_description).substring(0, 160),
      images: product.images?.[0]?.src ? [{ url: product.images[0].src }] : [],
    },
    other: {
      "schema": JSON.stringify(schema),
    },
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add app/shop/\[slug\]/page.tsx
git commit -m "feat: integrate product schema with generateMetadata"
```

---

## Task 9: Build and Validate

**Files:**
- Test: Local build

- [ ] **Step 1: Run TypeScript check**

Run: `npm run build`
Expected: Build completes without TypeScript errors

- [ ] **Step 2: Test with a sample product**

Use Google Rich Results Test: https://search.google.com/test/rich-results
Enter a product URL from your site (e.g., https://artacestudio.com/shop/your-product-slug)

Expected: Product schema detected with no errors

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: complete dynamic product schema implementation"
```

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-04-16-dynamic-product-schema.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**