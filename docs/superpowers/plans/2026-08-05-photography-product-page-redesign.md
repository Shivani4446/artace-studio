# Photography Product Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. (Not subagent-driven-development for this project — that workflow assumes commits between tasks, and this project's standing rule is that the user handles all commits/pushes themselves.)

**Goal:** Redesign the photography-category product page in `SingleProduct.tsx` — trim painting-specific content, add a zoomable image overlay, photography-specific tabs, category-scoped related products, and artist recognition/follow — without touching painting product pages.

**Architecture:** Every change is gated behind one shared `isPhotography` boolean (derived once from `product.categories`, replacing the three duplicated inline checks already in the file). Painting products render exactly as today.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS 4, WooCommerce Admin API (server-side, authenticated), `yet-another-react-lightbox` (new dependency).

## Global Constraints

- No `git commit`/`git push` — the user reviews and commits/pushes everything themselves.
- No test framework — verification via `npx tsc --noEmit`, `npm run build`, and live dev-server checks on a fresh port (never 3000).
- All changes gated to photography products only (`isPhotography`); painting product pages must render unchanged.
- Category id for "Photography" is **376**, slug `photography` (confirmed live in WooCommerce).

---

### Task 1: Shared `isPhotography` flag + trim painting-only content

**Files:**
- Modify: `components/singleproduct/SingleProduct.tsx`

**Interfaces:**
- Produces: `isPhotography: boolean`, a local const in the component body, used by every later task in this plan.

- [ ] **Step 1: Add the shared `isPhotography` const**

In `SingleProduct.tsx`, right after the `product` memo (currently lines 733-736), add:

```tsx
  const product = useMemo(
    () => normalizeSingleProductData(initialProduct),
    [initialProduct]
  );
  const isPhotography = useMemo(
    () =>
      product?.categories.some((category) => category.slug === "photography") ?? false,
    [product]
  );
```

- [ ] **Step 2: Replace the 3 existing duplicated inline checks with `isPhotography`**

Replace each of these three occurrences of
`product.categories.some((category) => category.slug === "photography")`
with `isPhotography`:
- The "Ships in Tube" / "Original Digital Print" pills condition (currently ~line 1535).
- The "Make an Offer" link condition (currently ~line 1707).
- The Photography Detail Sections condition (currently ~line 1858).

- [ ] **Step 3: Hide "Customizable" tag for photography**

Change:
```tsx
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block rounded-full bg-[#1f1f1f] px-3 py-1 text-[13px] font-medium text-white">
                  Customizable
                </span>
                {isPhotography && (
```
to:
```tsx
              <div className="flex flex-wrap items-center gap-2">
                {!isPhotography && (
                  <span className="inline-block rounded-full bg-[#1f1f1f] px-3 py-1 text-[13px] font-medium text-white">
                    Customizable
                  </span>
                )}
                {isPhotography && (
```

- [ ] **Step 4: Hide "Order a Custom Size" button for photography**

Wrap the existing button (currently ~lines 1691-1705, `onClick={openCustomSizeModal}` … "Order a Custom Size") in `{!isPhotography && ( ... )}`:

```tsx
                {!isPhotography && (
                  <button
                    type="button"
                    onClick={openCustomSizeModal}
                    className="order-4 inline-flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#FFDB4B] px-4 py-3 text-[16px] font-normal text-[#2c250f] transition-colors hover:bg-[#f2ce3f] md:order-none md:w-auto md:px-6 md:text-[18px]"
                  >
                    Order a Custom Size
                    <Image
                      src="/custom-order-icon.svg"
                      alt=""
                      aria-hidden="true"
                      width={16}
                      height={16}
                      className="h-4 w-4"
                    />
                  </button>
                )}
```

- [ ] **Step 5: Hide the "Ships rolled" callout and the 4-icon strip for photography**

Wrap both the `<details>` block and the icon grid (currently ~lines 1734-1766) in `{!isPhotography && ( ... )}` as one combined block:

```tsx
              {!isPhotography && (
                <>
                  <details className="group mt-5 overflow-hidden rounded-[6px] bg-transparent md:mt-[24px]">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-3 font-inter text-[15px] leading-6 text-[#3a3a3a] [&::-webkit-details-marker]:hidden md:px-4 md:text-[18px] md:leading-tight">
                      <span className="inline-flex items-center gap-3">
                        <Truck className="h-4 w-4 shrink-0 text-[#3a3a3a] md:h-5 md:w-5" />
                        <span>Ships rolled. Frame it locally in your city to hang it</span>
                      </span>
                      <ChevronDown className="h-4 w-4 text-[#4f4f4f] transition-transform group-open:rotate-180 md:h-5 md:w-5" />
                    </summary>
                    <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out group-open:grid-rows-[1fr]">
                      <p className="overflow-hidden border-t border-[#ededed] px-3 py-3 text-[14px] leading-6 text-[#595959] opacity-0 transition-opacity duration-300 ease-in-out group-open:opacity-100 md:px-4 md:text-[15px]">
                        This reduces shipping costs and prevents damage during transit. You also get to choose the frame as per your decor and taste. Visit any local frame shop for multiple framing options. We ship the artwork carefully rolled in a protective tube. A booklet with framing tips is also included.
                      </p>
                    </div>
                  </details>

                  <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#1f1f1f]/10 pt-6 sm:grid-cols-4">
                    <div className="text-center">
                      <BadgeCheck className="mx-auto h-4 w-4 text-[#3a6b96]" />
                      <p className="mt-2 text-[11px] text-[#5c574f]">Premium Cotton Canvas</p>
                    </div>
                    <div className="text-center">
                      <ShieldCheck className="mx-auto h-4 w-4 text-[#4c8e58]" />
                      <p className="mt-2 text-[11px] text-[#5c574f]">100% Handmade</p>
                    </div>
                    <div className="text-center">
                      <Star className="mx-auto h-4 w-4 text-[#d4a43d]" />
                      <p className="mt-2 text-[11px] text-[#5c574f]">Museum Grade</p>
                    </div>
                    <div className="text-center">
                      <ShieldCheck className="mx-auto h-4 w-4 text-[#cf7f33]" />
                      <p className="mt-2 text-[11px] text-[#5c574f]">Authenticity Certificate</p>
                    </div>
                  </div>
                </>
              )}
```

- [ ] **Step 6: Fix "Authentic Handmade Art" pill for photography**

This pill (in the desktop tabs card, currently ~line 1798, reading "Authentic Handmade Art") makes a false claim for a digital print. Change:
```tsx
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dcd7cf] bg-white px-3 py-1 text-[13px] text-[#57534b]">
                <BadgeCheck className="h-3.5 w-3.5 text-[#3a6b96]" />
                Authentic Handmade Art
              </span>
```
to:
```tsx
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dcd7cf] bg-white px-3 py-1 text-[13px] text-[#57534b]">
                <BadgeCheck className="h-3.5 w-3.5 text-[#3a6b96]" />
                {isPhotography ? "Authentic Fine Art Print" : "Authentic Handmade Art"}
              </span>
```

- [ ] **Step 7: Hide "Complimentary Art Advisory" section for photography**

Wrap the whole advisor `<section>` (currently ~lines 2213-2246, `bg-[#080909]`, "Complimentary Art Advisory") in `{!isPhotography && ( ... )}`.

- [ ] **Step 8: Verify**

Run `npx tsc --noEmit` — expect only the 3 known pre-existing errors (Samora, warli-paintings, navbar.tsx), nothing new from this file.

---

### Task 2: Full-screen zoomable image overlay (photography only)

**Files:**
- Modify: `components/singleproduct/SingleProduct.tsx`
- Modify: `package.json` (via `npm install`)

**Interfaces:**
- Consumes: `isPhotography` (Task 1), `product.images` (existing `SingleProductData.images`), `activeImageIndex` (existing state).
- Produces: `isImageLightboxOpen: boolean` local state, no new props.

- [ ] **Step 1: Install the dependency**

```bash
npm install yet-another-react-lightbox
```

- [ ] **Step 2: Verify the install**

```bash
grep '"yet-another-react-lightbox"' package.json
```
Expected: one line showing the new dependency with a version.

- [ ] **Step 3: Import the lightbox, its zoom plugin, and its CSS**

At the top of `SingleProduct.tsx`, add after the existing `lucide-react` import block:

```tsx
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
```

- [ ] **Step 4: Add lightbox open state**

Near the other `useState` calls (after `isCustomSizeModalOpen`), add:

```tsx
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false);
```

- [ ] **Step 5: Make the main image clickable (photography only) and add the lightbox**

Change the main image block from:
```tsx
                <div className="relative overflow-hidden rounded-[12px] bg-[#e8e5df]">
                  <Image
                    src={selectedImage?.src || FALLBACK_PRODUCT_IMAGE}
                    alt={generateProductImageAlt(
                      product.name,
                      product.categories[0]?.name,
                      product.attributes
                    )}
                    width={500}
                    height={500}
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="h-auto w-full object-cover"
                  />
                </div>
```
to:
```tsx
                <div className="relative overflow-hidden rounded-[12px] bg-[#e8e5df]">
                  {isPhotography ? (
                    <button
                      type="button"
                      onClick={() => setIsImageLightboxOpen(true)}
                      className="block w-full cursor-zoom-in"
                      aria-label="View full-size photograph"
                    >
                      <Image
                        src={selectedImage?.src || FALLBACK_PRODUCT_IMAGE}
                        alt={generateProductImageAlt(
                          product.name,
                          product.categories[0]?.name,
                          product.attributes
                        )}
                        width={500}
                        height={500}
                        sizes="(max-width: 768px) 100vw, 500px"
                        className="h-auto w-full object-cover"
                      />
                    </button>
                  ) : (
                    <Image
                      src={selectedImage?.src || FALLBACK_PRODUCT_IMAGE}
                      alt={generateProductImageAlt(
                        product.name,
                        product.categories[0]?.name,
                        product.attributes
                      )}
                      width={500}
                      height={500}
                      sizes="(max-width: 768px) 100vw, 500px"
                      className="h-auto w-full object-cover"
                    />
                  )}
                </div>
```

- [ ] **Step 6: Render the `Lightbox` component (photography only)**

Immediately after the closing `</section>` of the main product-info section (right before the Photography Detail Sections block added in the earlier phase, currently starting `{product.categories.some(...` — now `{isPhotography &&` per Task 1 Step 3), add:

```tsx
      {isPhotography && (
        <Lightbox
          open={isImageLightboxOpen}
          close={() => setIsImageLightboxOpen(false)}
          index={activeImageIndex}
          slides={product.images.map((image) => ({
            src: image.src,
            alt: image.alt || stripHtml(product.name),
          }))}
          plugins={[Zoom]}
          zoom={{
            maxZoomPixelRatio: 3,
            doubleTapDelay: 300,
            doubleClickDelay: 300,
          }}
          on={{
            view: ({ index }) => setActiveImageIndex(index),
          }}
        />
      )}
```

- [ ] **Step 7: Verify with the dev server**

Start a dev server on a free port (never 3000), open the Banaras photography product page, click the main image, confirm the lightbox opens full-screen over the photograph, scroll/pinch zooms in, dragging while zoomed pans, `Esc` and the outside click both close it. Then open a painting product page and confirm the main image behaves exactly as before (no click affordance, no lightbox).

---

### Task 3: Photography-specific tabs

**Files:**
- Modify: `components/singleproduct/SingleProduct.tsx`

**Interfaces:**
- Consumes: `isPhotography` (Task 1), `aboutPaintingHtml`, `aboutPaintingHighlights`, `specificationRows` (all pre-existing, generic, unchanged).
- Produces: `PHOTOGRAPHY_TAB_LABELS: string[]`, `PHOTOGRAPHY_TAB_HELPER_TEXT: Record<string, string>`.

- [ ] **Step 1: Add the photography tab constants**

Right after the existing `TAB_HELPER_TEXT` constant (currently lines 58-66), add:

```tsx
const PHOTOGRAPHY_TAB_LABELS = [
  "About the Photograph",
  "Details and Dimensions",
  "Shipping and Returns",
  "Reviews",
];

const PHOTOGRAPHY_TAB_HELPER_TEXT: Record<string, string> = {
  "About the Photograph": "Story, technique and artistic vision",
  "Details and Dimensions": "Print medium and size details",
  "Shipping and Returns": "How it ships and our return policy",
  Reviews: "Share your experience with this photograph",
};
```

- [ ] **Step 2: Derive the active tab list and helper text once, and default to the right first tab**

Inside the component, right after the `isPhotography` const added in Task 1 Step 1, add:

```tsx
  const tabLabels = isPhotography ? PHOTOGRAPHY_TAB_LABELS : TAB_LABELS;
  const tabHelperText = isPhotography ? PHOTOGRAPHY_TAB_HELPER_TEXT : TAB_HELPER_TEXT;
```

Then change the tab state's initial value from:
```tsx
  const [activeInfoTab, setActiveInfoTab] = useState(TAB_LABELS[0]);
```
to:
```tsx
  const [activeInfoTab, setActiveInfoTab] = useState(tabLabels[0]);
```
(so a photography product's tab bar opens on "About the Photograph," not "About the Painting.")

- [ ] **Step 3: Use `tabLabels`/`tabHelperText` in both tab renderers**

Replace `TAB_LABELS.map((tab) => (` with `tabLabels.map((tab) => (` in both places it appears (the desktop tab bar ~line 1772, and the mobile accordion ~line 1812).

Replace `TAB_HELPER_TEXT[tab] ?? ""` with `tabHelperText[tab] ?? ""` (desktop tab bar only — the mobile accordion doesn't render helper text).

- [ ] **Step 4: Add the 3 new tab content branches to `renderActiveTabContent`**

Immediately before the final `return null;` in `renderActiveTabContent` (after the existing `"Reviews"` branch), add:

```tsx
    if (activeInfoTab === "About the Photograph") {
      if (!aboutPaintingHtml) {
        return (
          <p className="text-[15px] leading-7 text-[#595959] md:text-[18px] md:leading-8">
            About the photograph is currently unavailable.
          </p>
        );
      }

      return (
        <div className="space-y-6">
          <div className="rounded-[12px] border border-[#e4ded4] bg-[#faf8f4] p-4 md:p-6">
            <p className="font-inter text-[13px] uppercase tracking-[0.08em] text-[#6a655d]">
              About The Photograph
            </p>
            <h3 className="mt-2 font-display text-[24px] leading-[1.2] text-[#313131] md:text-[32px]">
              {stripHtml(product.name)}
            </h3>
            <p className="mt-2 text-[15px] leading-7 text-[#595959] md:text-[17px]">
              Discover the story, technique, and vision behind this photograph.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <article className="rounded-[12px] border border-[#e4ded4] bg-white p-4 md:p-6">
              <div
                className="product-description-content"
                dangerouslySetInnerHTML={{ __html: aboutPaintingHtml }}
              />
            </article>

            <aside className="rounded-[12px] border border-[#e4ded4] bg-[#fcfbf8] p-4 md:p-5">
              <p className="font-inter text-[13px] uppercase tracking-[0.08em] text-[#6a655d]">
                Quick Highlights
              </p>
              <ul className="mt-4 space-y-3">
                {aboutPaintingHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#313131]" />
                    <span className="text-[14px] leading-6 text-[#595959] md:text-[16px] md:leading-7">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[14px] leading-6 text-[#6a655d] md:text-[15px] md:leading-7">
                Every print is produced to museum-grade archival standards and
                quality-checked before dispatch.
              </p>
            </aside>
          </div>
        </div>
      );
    }

    if (activeInfoTab === "Details and Dimensions") {
      return (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-inter text-[20px] font-medium text-[#313131] md:text-[24px]">
              Photograph Details
            </h3>
            <span className="rounded-full bg-[#f4f2ee] px-3 py-1 text-[12px] text-[#595959] md:text-[14px]">
              Archival Fine Art Print
            </span>
          </div>
          {specificationRows.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-[10px] border border-[#e4ded4]">
              <div className="grid grid-cols-[minmax(110px,0.42fr)_minmax(0,1fr)] bg-[#f8f6f2] px-3 py-3 text-[13px] font-medium text-[#313131] md:grid-cols-[minmax(140px,0.38fr)_minmax(0,1fr)] md:px-4 md:text-[15px]">
                <p>Attribute</p>
                <p>Details</p>
              </div>
              <div className="divide-y divide-[#ece7de]">
                {specificationRows.map((row, index) => (
                  <div
                    key={`${row.label}-${index}`}
                    className="grid grid-cols-[minmax(110px,0.42fr)_minmax(0,1fr)] gap-3 px-3 py-3 md:grid-cols-[minmax(140px,0.38fr)_minmax(0,1fr)] md:gap-4 md:px-4"
                  >
                    <p className="text-[14px] font-medium leading-6 text-[#313131] md:text-[17px] md:leading-7">
                      {row.label}
                    </p>
                    <p className="text-[14px] leading-6 text-[#595959] md:text-[17px] md:leading-7">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-[15px] text-[#595959] md:text-[18px]">
              Photograph details are currently unavailable.
            </p>
          )}
        </>
      );
    }

    if (activeInfoTab === "Shipping and Returns") {
      return (
        <div className="space-y-4 text-[15px] leading-7 text-[#595959] md:space-y-5 md:text-[18px] md:leading-8">
          <p>
            Your photograph ships rolled in a protective tube to prevent damage
            in transit. It arrives unframed — visit a local frame shop for
            framing options suited to your space. A booklet with framing tips
            is included.
          </p>
          <p>
            If your order arrives damaged, contact our support team within 24
            hours of delivery and we&apos;ll resolve it quickly.
          </p>
          <p>
            You may return your photograph within 15 days of delivery. It
            must be unframed, in its original packaging, and in the same
            condition it was received in. Limited-edition prints purchased
            through Make an Offer follow the same return window.
          </p>
          <p>
            Delivery times are estimated and may vary by courier and, for
            international orders, customs processing. Any import duties or
            taxes for orders shipped outside India are paid directly to the
            courier on delivery and are not included in our prices.
          </p>
        </div>
      );
    }
```

- [ ] **Step 5: Verify**

`npx tsc --noEmit` — no new errors. Then on the dev server, open the photography product page and confirm exactly 4 tabs appear (About the Photograph / Details and Dimensions / Shipping and Returns / Reviews), each shows the new content, and clicking the ★ rating pill still scrolls to and opens the Reviews tab. Open a painting product page and confirm its 7 original tabs are unchanged.

---

### Task 4: "Shop More Like This" → "Photographs You May Also Like"

**Files:**
- Modify: `app/shop/[slug]/page.tsx`
- Modify: `components/singleproduct/SingleProduct.tsx`

**Interfaces:**
- Produces (page.tsx): `getRelatedPhotographyProducts(currentProductId: number): Promise<RelatedProductCard[]>` — same return type as the existing `getRelatedProductsForProduct`.
- Consumes (SingleProduct.tsx): `isPhotography` (Task 1), existing `relatedProducts: RelatedProductCard[]` prop (type unchanged).

- [ ] **Step 1: Add the category-scoped fetch in `app/shop/[slug]/page.tsx`**

This reuses `fetchStoreProducts` — the same public Store API helper
`getProductsByIds` and `getFeaturedProducts` already call just above it —
so the result is already the right `WooStoreProduct[]` shape for
`toRelatedCard`, with no new auth or type-mapping needed. Verified live:
`GET /wc/store/v1/products?category=376&exclude=4248&per_page=4` correctly
returns only other Photography-category products (confirmed empirically —
today that's zero, since product 4248 is currently the only one).

Immediately after the existing `getFeaturedProducts` function, add:

```tsx
const PHOTOGRAPHY_CATEGORY_ID = 376;

const getRelatedPhotographyProducts = async (
  currentProductId: number
): Promise<RelatedProductCard[]> => {
  const products = await fetchStoreProducts(
    `category=${PHOTOGRAPHY_CATEGORY_ID}&exclude=${currentProductId}&per_page=${RELATED_PRODUCTS_LIMIT}`
  );
  return products.map(toRelatedCard);
};
```

- [ ] **Step 2: Call it conditionally in the page's `Promise.all`**

In `SingleProductPage` (currently lines 1059-1074), change:
```tsx
const SingleProductPage = async ({ params }: SingleProductPageProps) => {
  const { slug } = await params;
  const product = await getSingleProduct(slug);

  if (!product) {
    notFound();
  }

  const [productWithInformation, relatedProducts, readMorePosts, artistName, photographyDetails] =
    await Promise.all([
      getProductWithProductInformation(product),
      getRelatedProductsForProduct(product),
      getLatestBlogs(),
      fetchProductArtistName(product.id),
      fetchPhotographyDetails(product.id),
    ]);
```
to:
```tsx
const SingleProductPage = async ({ params }: SingleProductPageProps) => {
  const { slug } = await params;
  const product = await getSingleProduct(slug);

  if (!product) {
    notFound();
  }

  const isPhotographyProduct = product.categories.some(
    (category) => category.slug === "photography"
  );

  const [productWithInformation, relatedProducts, readMorePosts, artistName, photographyDetails] =
    await Promise.all([
      getProductWithProductInformation(product),
      isPhotographyProduct
        ? getRelatedPhotographyProducts(product.id)
        : getRelatedProductsForProduct(product),
      getLatestBlogs(),
      fetchProductArtistName(product.id),
      fetchPhotographyDetails(product.id),
    ]);
```

(`product.categories` is typed as `WooStoreCategory[]`, non-optional, so no `?.` is needed.)

- [ ] **Step 3: Change the heading, link target, subtitle text, and empty state in `SingleProduct.tsx`**

Change the "Shop More Like This" section (currently ~lines 2106-2144) from:
```tsx
      <section className="px-4 py-10 sm:px-6 md:px-12 md:py-12 lg:px-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-7 flex items-end justify-between gap-4 md:mb-8">
            <h2 className="font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[52px] md:leading-none">
              Shop More Like This
            </h2>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 border-b border-[#1f1f1f] pb-1 text-[11px] uppercase tracking-[0.08em] md:text-[12px]"
            >
              Shop All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {relatedProducts.map((item) => (
              <Link key={item.id} href={item.href || "#"} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[12px] bg-[#e7e3dc]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 46vw, 24vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="mt-3 text-[12px] text-[#7a7368] md:text-[14px]">Handmade Painting</p>
                <h3 className="mt-1 font-display text-[15px] leading-[1.32] text-[#1f1f1f] md:text-[18px]">
                  {item.title}
                </h3>
                <p className="mt-1 text-[12px] text-[#6f685f] md:text-[14px]">
                  Handmade Painting | {item.sizes} | Acrylic Colors on Canvas
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
```
to:
```tsx
      <section className="px-4 py-10 sm:px-6 md:px-12 md:py-12 lg:px-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-7 flex items-end justify-between gap-4 md:mb-8">
            <h2 className="font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[52px] md:leading-none">
              {isPhotography ? "Photographs You May Also Like" : "Shop More Like This"}
            </h2>
            <Link
              href={isPhotography ? "/shop?category=photography" : "/shop"}
              className="inline-flex items-center gap-2 border-b border-[#1f1f1f] pb-1 text-[11px] uppercase tracking-[0.08em] md:text-[12px]"
            >
              Shop All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {relatedProducts.length === 0 && isPhotography ? (
            <p className="rounded-[12px] border border-dashed border-[#d7d2c9] bg-[#faf8f4] px-6 py-10 text-center text-[15px] text-[#6a655d] md:text-[17px]">
              This one&apos;s flying solo in the gallery right now — the only
              photograph in the collection. More frames coming soon.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {relatedProducts.map((item) => (
                <Link key={item.id} href={item.href || "#"} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[12px] bg-[#e7e3dc]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 46vw, 24vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-3 text-[12px] text-[#7a7368] md:text-[14px]">
                    {isPhotography ? "Original Digital Print" : "Handmade Painting"}
                  </p>
                  <h3 className="mt-1 font-display text-[15px] leading-[1.32] text-[#1f1f1f] md:text-[18px]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[12px] text-[#6f685f] md:text-[14px]">
                    {isPhotography
                      ? `Original Digital Print | ${item.sizes}`
                      : `Handmade Painting | ${item.sizes} | Acrylic Colors on Canvas`}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
```

- [ ] **Step 6: Verify**

`npx tsc --noEmit` — no new errors. On the dev server: open the Banaras photography product page and confirm the heading reads "Photographs You May Also Like," "Shop All" points at `/shop?category=photography`, and — since it's currently the only photography product — the humorous empty-state message renders instead of an empty grid. Open a painting product page and confirm "Shop More Like This" still shows other paintings exactly as before.

---

### Task 5: About the Artist — Recognition, View Profile, Follow (photography only)

**Files:**
- Modify: `lib/artists/data.ts`
- Modify: `components/singleproduct/SingleProduct.tsx`

**Interfaces:**
- Produces (`lib/artists/data.ts`): `Artist.recognition: string` (new field, all 3 artists populated).
- Produces (`SingleProduct.tsx`): local `isFollowingArtist: boolean` state + `toggleFollowArtist()`, backed by `localStorage`.

- [ ] **Step 1: Add `recognition` to the `Artist` type and all 3 entries**

In `lib/artists/data.ts`, change:
```ts
export type Artist = {
  slug: string;
  name: string;
  image: string;
  tagline: string;
  bio: string;
};
```
to:
```ts
export type Artist = {
  slug: string;
  name: string;
  image: string;
  tagline: string;
  bio: string;
  recognition: string;
};
```

Add `recognition: "Featured Artist — Artace Studio",` as a new field to each of the three `ARTISTS` entries (Sahil Mahalley, Sampadaa Mahalley, Vekkas Mahalley) — same value for all three.

- [ ] **Step 2: Verify the type change compiles**

`npx tsc --noEmit` — expect no new errors (nothing reads `artist.recognition` yet, so adding the required field to the type and to all 3 data entries should be a self-contained, clean change). If there's an error here, it's in `lib/artists/data.ts` itself; fix before continuing.

- [ ] **Step 3: Add the Follow storage helpers**

In `SingleProduct.tsx`, near the top-level helper functions (alongside `stripHtml`, `toTitleCase`), add:

```tsx
const FOLLOWED_ARTISTS_STORAGE_KEY = "artace_followed_artists";

const readFollowedArtistSlugs = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FOLLOWED_ARTISTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((slug): slug is string => typeof slug === "string")
      : [];
  } catch {
    return [];
  }
};

const writeFollowedArtistSlugs = (slugs: string[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FOLLOWED_ARTISTS_STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // Ignore write failures (private browsing, storage disabled, quota, etc.)
  }
};
```

- [ ] **Step 4: Add `UserPlus`/`UserCheck` icons to the `lucide-react` import**

Add `UserPlus` and `UserCheck` to the existing import list from `lucide-react`.

- [ ] **Step 5: Add follow state and the toggle handler inside the component**

Near the other `useState`/`useEffect` calls, add:

```tsx
  const [isFollowingArtist, setIsFollowingArtist] = useState(false);

  useEffect(() => {
    if (!artist) return;
    setIsFollowingArtist(readFollowedArtistSlugs().includes(artist.slug));
  }, [artist]);

  const toggleFollowArtist = () => {
    if (!artist) return;
    const current = readFollowedArtistSlugs();
    const isCurrentlyFollowed = current.includes(artist.slug);
    const next = isCurrentlyFollowed
      ? current.filter((slug) => slug !== artist.slug)
      : [...current, artist.slug];
    writeFollowedArtistSlugs(next);
    setIsFollowingArtist(!isCurrentlyFollowed);
  };
```

- [ ] **Step 6: Render Recognition + View Profile + Follow under the artist's name**

In the "About the Artist" section, change:
```tsx
              <p className="mt-5 text-[15px] text-white/70">{artist.name}</p>
            </div>
          </div>
        </section>
      ) : null}
```
to:
```tsx
              <p className="mt-5 text-[15px] text-white/70">{artist.name}</p>
              {isPhotography && (
                <>
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white/80">
                    <BadgeCheck className="h-3.5 w-3.5 text-[#8fd3a8]" />
                    {artist.recognition}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Link
                      href={`/artists/${artist.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-[4px] border border-white/30 px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
                    >
                      View Profile
                    </Link>
                    <button
                      type="button"
                      onClick={toggleFollowArtist}
                      className={`inline-flex items-center gap-1.5 rounded-[4px] px-3 py-2 text-[13px] font-medium transition-colors ${
                        isFollowingArtist
                          ? "bg-white text-[#141414] hover:bg-[#f3f3f3]"
                          : "border border-white/30 text-white hover:bg-white/10"
                      }`}
                    >
                      {isFollowingArtist ? (
                        <>
                          <UserCheck className="h-3.5 w-3.5" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5" />
                          Follow
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      ) : null}
```

- [ ] **Step 7: Verify**

`npx tsc --noEmit` — no new errors. On the dev server, open the Banaras photography product page (artist: Sahil Mahalley): confirm "Featured Artist — Artace Studio" appears under his name, plus "View Profile" and "Follow" buttons. Click Follow — button switches to "Following" (filled style). Reload the page — it should still read "Following" (confirms `localStorage` persistence). Click again — reverts to "Follow". Open a painting product page with an artist — confirm none of this new row appears (just the name, as before).

---

### Task 6: Full-page final verification

**Files:** none (verification only)

- [ ] **Step 1: Full project type-check**

```bash
npx tsc --noEmit
```
Expected: only the 3 known pre-existing errors (Samora, warli-paintings, navbar.tsx) — nothing new.

- [ ] **Step 2: Production build**

```bash
npm run build
```
Expected: build succeeds (warnings about `ignoreBuildErrors` for the known pre-existing type errors are fine; no new failures).

- [ ] **Step 3: Live dev-server pass — photography product**

Start a dev server on a free port (never 3000). Open the Banaras photography product page and confirm, in one pass:
- No "Customizable" tag, no "Order a Custom Size" button, no "Ships rolled" callout/icon row, no "Authentic Handmade Art" text, no "Complimentary Art Advisory" section.
- Clicking the main image opens the full-screen zoomable lightbox; zoom and pan work; closes cleanly.
- Exactly 4 tabs: About the Photograph, Details and Dimensions, Shipping and Returns, Reviews — each renders real content; the ★ rating pill still opens Reviews.
- "Photographs You May Also Like" heading, "Shop All" → `/shop?category=photography`, and the humorous empty-state message (since this is currently the only photography product).
- Under the artist's name: "Featured Artist — Artace Studio", "View Profile", and a working "Follow" toggle that persists across reload.

- [ ] **Step 4: Live dev-server pass — painting product**

Open any painting product page and confirm zero regressions: Customizable tag present, Order a Custom Size button present and working, Ships rolled callout + icon row present, "Authentic Handmade Art" text present, Complimentary Art Advisory section present, main image has no click/zoom behavior, all 7 original tabs present and unchanged, "Shop More Like This" unchanged, About the Artist shows just the name with no Recognition/View Profile/Follow row.

- [ ] **Step 5: Stop the dev server**

Find and stop the verification dev server process (never touch port 3000).
