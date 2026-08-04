# Photography Product Detail Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three ACF-backed content sections (Story Behind the Capture, Photography Technique, Interior Styling Recommendations) that render only on Photography product pages, each shown independently only when its field has content.

**Architecture:** A new server-side fetch function in `app/shop/[slug]/page.tsx`, mirroring the existing `fetchProductArtistName` function exactly, reads the three ACF field values from the WooCommerce Admin API's `meta_data` (verified live to already contain them — no ACF REST API needed). The result flows to `SingleProduct.tsx` as a new prop, which renders a new standalone section gated by the same Photography-category check already used for the existing badges and "Make an Offer" button.

**Tech Stack:** Next.js 15.5.2 App Router (Server Component data fetch, Client Component render), TypeScript, Tailwind CSS 4, `lucide-react` icons, WooCommerce Admin API.

## Global Constraints

- Do NOT run `git commit` or `git push` — the user reviews and commits/pushes everything themselves. Every task ends at verification, not a commit.
- No test framework — verification via `npx tsc --noEmit`, `npm run build`, and live dev-server checks (a fresh port, never 3000).
- ACF field names (already set up by the user, exact strings — do not alter): `story_behind_the_capture`, `photography_technique`, `interior_styling_recommendations`.
- The new section only renders for products where `product.categories.some((category) => category.slug === "photography")` — same check already used for the existing Photography badges and "Make an Offer" button.
- Each of the three blocks renders independently based on whether its own field has content; if none have content, the whole section is omitted.
- Text renders as plain text (`whitespace-pre-line` to preserve line breaks) — no HTML/rich-text interpretation.

---

### Task 1: Fetch the three ACF fields server-side

**Files:**
- Modify: `app/shop/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getWooServerConfig()`, `toBasicAuthToken()`, `revalidate`, `WooV3Product` type (all already defined in this file, used identically by the existing `fetchProductArtistName`).
- Produces: `fetchPhotographyDetails(productId: number): Promise<{storyBehindTheCapture?: string; photographyTechnique?: string; interiorStylingRecommendations?: string}>`, and a new `photographyDetails` prop passed into `<SingleProduct>`. Consumed by Task 2.

- [ ] **Step 1: Add `fetchPhotographyDetails`**

In `app/shop/[slug]/page.tsx`, this exact function already exists (lines 482-505):

```tsx
const fetchProductArtistName = async (productId: number): Promise<string | undefined> => {
  const { siteUrl, consumerKey, consumerSecret } = getWooServerConfig();

  if (!consumerKey || !consumerSecret) return undefined;

  const basicToken = toBasicAuthToken(consumerKey, consumerSecret);

  try {
    const response = await fetch(`${siteUrl}/wp-json/wc/v3/products/${productId}`, {
      headers: {
        Authorization: `Basic ${basicToken}`,
      },
      next: { revalidate },
    });

    if (!response.ok) return undefined;
    const payload = (await response.json()) as WooV3Product;
    const artistMeta = payload.meta_data?.find((meta) => meta.key === "artist");
    const value = typeof artistMeta?.value === "string" ? artistMeta.value.trim() : "";
    return value || undefined;
  } catch {
    return undefined;
  }
};
```

Immediately after it, add:

```tsx
const fetchPhotographyDetails = async (
  productId: number
): Promise<{
  storyBehindTheCapture?: string;
  photographyTechnique?: string;
  interiorStylingRecommendations?: string;
}> => {
  const { siteUrl, consumerKey, consumerSecret } = getWooServerConfig();

  if (!consumerKey || !consumerSecret) return {};

  const basicToken = toBasicAuthToken(consumerKey, consumerSecret);

  try {
    const response = await fetch(`${siteUrl}/wp-json/wc/v3/products/${productId}`, {
      headers: {
        Authorization: `Basic ${basicToken}`,
      },
      next: { revalidate },
    });

    if (!response.ok) return {};
    const payload = (await response.json()) as WooV3Product;
    const metaData = payload.meta_data ?? [];

    const getMetaValue = (key: string): string | undefined => {
      const entry = metaData.find((meta) => meta.key === key);
      const value = typeof entry?.value === "string" ? entry.value.trim() : "";
      return value || undefined;
    };

    return {
      storyBehindTheCapture: getMetaValue("story_behind_the_capture"),
      photographyTechnique: getMetaValue("photography_technique"),
      interiorStylingRecommendations: getMetaValue("interior_styling_recommendations"),
    };
  } catch {
    return {};
  }
};
```

- [ ] **Step 2: Wire it into the page's `Promise.all` and pass it as a prop**

This exact block currently exists (lines 1026-1046):

```tsx
  const [productWithInformation, relatedProducts, readMorePosts, artistName] = await Promise.all([
    getProductWithProductInformation(product),
    getRelatedProductsForProduct(product),
    getLatestBlogs(),
    fetchProductArtistName(product.id),
  ]);

  const schema = generateProductSchema(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <SingleProduct
        initialProduct={productWithInformation}
        relatedProducts={relatedProducts}
        readMorePosts={readMorePosts}
        artistName={artistName}
      />
    </>
  );
```

Replace it with:

```tsx
  const [productWithInformation, relatedProducts, readMorePosts, artistName, photographyDetails] =
    await Promise.all([
      getProductWithProductInformation(product),
      getRelatedProductsForProduct(product),
      getLatestBlogs(),
      fetchProductArtistName(product.id),
      fetchPhotographyDetails(product.id),
    ]);

  const schema = generateProductSchema(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <SingleProduct
        initialProduct={productWithInformation}
        relatedProducts={relatedProducts}
        readMorePosts={readMorePosts}
        artistName={artistName}
        photographyDetails={photographyDetails}
      />
    </>
  );
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: an error that `SingleProduct` doesn't accept a `photographyDetails` prop yet — that's expected and resolved by Task 2. No other new errors.

---

### Task 2: Render the section in `SingleProduct.tsx`

**Files:**
- Modify: `components/singleproduct/SingleProduct.tsx`

**Interfaces:**
- Consumes: the `photographyDetails` prop shape from Task 1 (structurally: `{storyBehindTheCapture?: string; photographyTechnique?: string; interiorStylingRecommendations?: string}`).
- Produces: nothing consumed elsewhere — final integration point.

- [ ] **Step 1: Add the icon imports**

The existing `lucide-react` import (near the top of the file) currently reads:

```tsx
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Truck,
  X,
} from "lucide-react";
```

Replace it with:

```tsx
import {
  Aperture,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Sofa,
  Star,
  Truck,
  X,
} from "lucide-react";
```

- [ ] **Step 2: Add the `PhotographyDetails` type and the new prop**

This exact block currently exists (around lines 232-239):

```tsx
type SingleProductProps = {
  initialProduct?: WooCommerceStoreProduct | SingleProductData | null;
  relatedProducts?: RelatedProductCard[];
  readMorePosts?: ReadMoreCard[];
  advisor?: AdvisorBlock;
  artistName?: string;
  className?: string;
};
```

Replace it with:

```tsx
type PhotographyDetails = {
  storyBehindTheCapture?: string;
  photographyTechnique?: string;
  interiorStylingRecommendations?: string;
};

type SingleProductProps = {
  initialProduct?: WooCommerceStoreProduct | SingleProductData | null;
  relatedProducts?: RelatedProductCard[];
  readMorePosts?: ReadMoreCard[];
  advisor?: AdvisorBlock;
  artistName?: string;
  photographyDetails?: PhotographyDetails;
  className?: string;
};
```

- [ ] **Step 3: Destructure the new prop**

Find where the component destructures its props (search for `artistName` in the function signature, e.g. `const SingleProduct = ({ initialProduct, relatedProducts, readMorePosts, advisor, artistName, className }: SingleProductProps) => {`) and add `photographyDetails` to that destructuring list, alongside `artistName`.

- [ ] **Step 4: Insert the new section after the tabs section**

This exact block currently exists (the end of the tabs `<section>`, right before the toast notification):

```tsx
          <div className="mt-5 hidden rounded-[16px] border border-[#e1ddd5] bg-white p-4 md:block md:p-7">
            {renderActiveTabContent()}
          </div>
        </div>
      </section>

      {toastState ? (
```

Replace it with:

```tsx
          <div className="mt-5 hidden rounded-[16px] border border-[#e1ddd5] bg-white p-4 md:block md:p-7">
            {renderActiveTabContent()}
          </div>
        </div>
      </section>

      {product.categories.some((category) => category.slug === "photography") &&
        (photographyDetails?.storyBehindTheCapture ||
          photographyDetails?.photographyTechnique ||
          photographyDetails?.interiorStylingRecommendations) && (
          <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16 lg:px-24">
            <div className="mx-auto max-w-[1440px] space-y-10 border-t border-[#e1ddd5] pt-12 md:space-y-14 md:pt-16">
              {photographyDetails?.storyBehindTheCapture && (
                <div className="flex flex-col gap-4 md:flex-row md:gap-10">
                  <div className="flex shrink-0 items-start gap-3 md:w-[280px]">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                      <BookOpen className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-inter text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8a8478]">
                        The Story
                      </p>
                      <h2 className="mt-1 font-display text-[22px] leading-[1.2] text-[#24211d] md:text-[26px]">
                        Story Behind the Capture
                      </h2>
                    </div>
                  </div>
                  <p className="whitespace-pre-line text-[16px] leading-8 text-[#4a453e] md:flex-1 md:text-[17px]">
                    {photographyDetails.storyBehindTheCapture}
                  </p>
                </div>
              )}

              {photographyDetails?.photographyTechnique && (
                <div className="flex flex-col gap-4 border-t border-[#eee9df] pt-10 md:flex-row md:gap-10 md:pt-14">
                  <div className="flex shrink-0 items-start gap-3 md:w-[280px]">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                      <Aperture className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-inter text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8a8478]">
                        The Craft
                      </p>
                      <h2 className="mt-1 font-display text-[22px] leading-[1.2] text-[#24211d] md:text-[26px]">
                        Photography Technique
                      </h2>
                    </div>
                  </div>
                  <p className="whitespace-pre-line text-[16px] leading-8 text-[#4a453e] md:flex-1 md:text-[17px]">
                    {photographyDetails.photographyTechnique}
                  </p>
                </div>
              )}

              {photographyDetails?.interiorStylingRecommendations && (
                <div className="flex flex-col gap-4 border-t border-[#eee9df] pt-10 md:flex-row md:gap-10 md:pt-14">
                  <div className="flex shrink-0 items-start gap-3 md:w-[280px]">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                      <Sofa className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-inter text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8a8478]">
                        Styling Guide
                      </p>
                      <h2 className="mt-1 font-display text-[22px] leading-[1.2] text-[#24211d] md:text-[26px]">
                        Interior Styling Recommendations
                      </h2>
                    </div>
                  </div>
                  <p className="whitespace-pre-line text-[16px] leading-8 text-[#4a453e] md:flex-1 md:text-[17px]">
                    {photographyDetails.interiorStylingRecommendations}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

      {toastState ? (
```

- [ ] **Step 5: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors from either modified file.

---

### Task 3: Final verification

**Files:** none (verification only).

- [ ] **Step 1: Full type-check**

Run: `npx tsc --noEmit`
Expected: zero errors except the known pre-existing, unrelated ones already documented earlier in this project (`app/warli-paintings/page.tsx`, `components/navbar.tsx`, `app/samora/shop/page.tsx`, `app/samora/shop/[slug]/page.tsx`) — none of which this plan touches.

- [ ] **Step 2: Full production build**

Run: `npm run build`
Expected: build succeeds, no route's rendering mode changes.

- [ ] **Step 3: Live verification with a real Photography product**

Create a temporary test product with all three ACF fields set, via the Admin API (credentials in `.env.local` as `WOOCOMMERCE_CONSUMER_KEY`/`WOOCOMMERCE_CONSUMER_SECRET`):

```bash
curl -s -u "$WOOCOMMERCE_CONSUMER_KEY:$WOOCOMMERCE_CONSUMER_SECRET" \
  -X POST "https://api.artacestudio.com/wp-json/wc/v3/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Photography Detail Sections (DELETE ME)",
    "type": "simple",
    "regular_price": "9999",
    "categories": [{"id": 376}],
    "status": "publish",
    "meta_data": [
      {"key": "story_behind_the_capture", "value": "Shot at golden hour on the coast, this piece captures a fleeting moment of stillness before the tide turned."},
      {"key": "photography_technique", "value": "Long-exposure film photography, printed as a limited-edition archival pigment print."},
      {"key": "interior_styling_recommendations", "value": "Pairs beautifully with warm wood tones and neutral linens in a living room or reading nook."}
    ]
  }'
```

Note the returned `id` and `slug`. Start a dev server on port 3008 (never port 3000):

```bash
npm run dev -- -p 3008
```

Fetch the product page and confirm all three sections and their content appear:

```bash
curl -s "http://localhost:3008/shop/{slug}" | grep -o "Story Behind the Capture\|Photography Technique\|Interior Styling Recommendations\|Shot at golden hour\|Long-exposure film\|Pairs beautifully"
```

Expected: all six strings present (three headings, three body-text fragments).

- [ ] **Step 4: Verify partial-content behavior**

Update the same test product to have only one of the three fields set, to confirm the other two blocks correctly don't render:

```bash
curl -s -u "$WOOCOMMERCE_CONSUMER_KEY:$WOOCOMMERCE_CONSUMER_SECRET" \
  -X PUT "https://api.artacestudio.com/wp-json/wc/v3/products/{id}" \
  -H "Content-Type: application/json" \
  -d '{
    "meta_data": [
      {"key": "story_behind_the_capture", "value": "Shot at golden hour on the coast."},
      {"key": "photography_technique", "value": ""},
      {"key": "interior_styling_recommendations", "value": ""}
    ]
  }'
```

```bash
curl -s "http://localhost:3008/shop/{slug}" | grep -o "Story Behind the Capture\|Photography Technique\|Interior Styling Recommendations"
```

Expected: only "Story Behind the Capture" appears, not the other two headings.

- [ ] **Step 5: Delete the temporary test product**

```bash
curl -s -u "$WOOCOMMERCE_CONSUMER_KEY:$WOOCOMMERCE_CONSUMER_SECRET" \
  -X DELETE "https://api.artacestudio.com/wp-json/wc/v3/products/{id}?force=true"
```

Confirm the response shows the product deleted.

Stop the dev server afterward.
