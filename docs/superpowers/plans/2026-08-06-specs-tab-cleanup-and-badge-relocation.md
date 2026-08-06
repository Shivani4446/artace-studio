# Specifications Tab Cleanup & Trust-Badge Relocation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the product page's "Specifications" table from showing duplicated long-form prose that belongs to other tabs, and relocate the trust-badge row (Premium Cotton Canvas / 100% Handmade / Museum Grade / Authenticity Certificate) from the bottom of the info column to directly below the product image, restyled larger and clearer.

**Architecture:** Task 1 is a pure data-filtering fix — trim 4 keys from a static array that feeds the server-side "Product Information" merge used by both the Specifications tab (paintings) and Details and Dimensions tab (photography). Task 2 is a pure JSX relocation + restyle — move an existing static badge block from the info column to the image column, unchanged data, new layout.

**Tech Stack:** Next.js 15 App Router, React, Tailwind CSS, TypeScript, WooCommerce REST APIs (wc/v3).

## Global Constraints

- No new npm dependencies.
- No tabs are added, removed, or renamed — all 7 paintings tabs and all 4 photography tabs stay exactly as they are today, with their existing content untouched.
- Only the 4 named ACF meta keys (`dimensions_&_materials`, `care_&_framing`, `shipping_&_returns`, `about_the_painting`) are removed from the Specifications/Details-and-Dimensions data source; the other 10 genuine spec keys are untouched, in their existing order.
- The trust-badge row keeps its existing `!isPhotography` gating (paintings only) — no new product-type logic, no photography-page changes to this block.
- The trust-badge row's icons (`BadgeCheck`, `ShieldCheck`, `Star`, `ShieldCheck`), colors, and label text stay the same 4 items in the same order; only size, layout, and placement change.
- Do not run `git commit` or `git add` — this repo's owner (the user) handles all commits/pushes themselves. Leave all changes uncommitted in the working tree.
- The working tree may contain other uncommitted changes unrelated to this plan (the user's own concurrent work). Do not touch, revert, or comment on any file this plan doesn't explicitly name.

---

### Task 1: Remove duplicated ACF fields from the Specifications data source

**Files:**
- Modify: `app/shop/[slug]/page.tsx:27-42`

**Interfaces:**
- Consumes: nothing new.
- Produces: a trimmed `PRODUCT_INFORMATION_META_KEYS` array that Task 2 does not depend on (Task 2 is independent — either task can be done first).

- [ ] **Step 1: Read the current array to confirm line numbers haven't shifted**

Run: view `app/shop/[slug]/page.tsx` lines 24-42. Confirm it still reads exactly:

```ts
const PRODUCT_INFORMATION_ATTRIBUTE_NAME = "Product Information";
const PRODUCT_INFORMATION_KEY = "product_information";
const PRODUCT_INFORMATION_GROUP_KEY = "group_68864bb8de1e7";
const PRODUCT_INFORMATION_META_KEYS = [
  "dimensions_&_materials",
  "care_&_framing",
  "shipping_&_returns",
  "about_the_painting",
  "size_in_centimetres",
  "customizable",
  "product_type",
  "colors",
  "material",
  "width_inches",
  "height_inches",
  "orientation",
  "certificate_provided",
  "country_of_origin",
];
```

If the surrounding lines differ (e.g. keys reordered, renamed, or the array holds different entries than listed above), STOP and report back — do not guess which entries to remove.

- [ ] **Step 2: Remove the four duplicated-content keys**

Replace the `PRODUCT_INFORMATION_META_KEYS` array with:

```ts
const PRODUCT_INFORMATION_META_KEYS = [
  "size_in_centimetres",
  "customizable",
  "product_type",
  "colors",
  "material",
  "width_inches",
  "height_inches",
  "orientation",
  "certificate_provided",
  "country_of_origin",
];
```

Only this array changes. `PRODUCT_INFORMATION_ATTRIBUTE_NAME`, `PRODUCT_INFORMATION_KEY`, `PRODUCT_INFORMATION_GROUP_KEY`, and every function below that consumes this array (`isProductInformationMetaKey`, `getProductInformationFromWooV3Product`, `getProductInformationFromWordPressProduct`, etc.) are untouched — they already just iterate whatever this array contains.

- [ ] **Step 3: Verify against real product data**

A dev server should be running at `http://localhost:3000`. Fetch product id `573` (slug `dagdusheth-ganapati-canvas-painting`) directly from the WooCommerce API to confirm its raw data still has the four duplicated fields (this is real store data, not a fixture, so this just re-confirms the bug still exists in the source before checking the UI fixes it):

```bash
CK=$(grep "^WOOCOMMERCE_CONSUMER_KEY" .env.local | cut -d= -f2)
CS=$(grep "^WOOCOMMERCE_CONSUMER_SECRET" .env.local | cut -d= -f2)
curl -s "https://api.artacestudio.com/wp-json/wc/v3/products/573" -u "$CK:$CS" | grep -o '"about_the_painting"'
```

Then load `http://localhost:3000/shop/dagdusheth-ganapati-canvas-painting` in a browser (or fetch the SSR HTML and inspect it — the Specifications tab is not the default active tab, so this requires either clicking the tab in a real browser or reading the component's data flow directly), and confirm:
- The Specifications tab no longer shows rows labeled "About The Painting", "Dimensions & Materials", "Care & Framing", or "Shipping & Returns".
- The Specifications tab still shows genuine rows (e.g. a size/dimensions row, "Customizable: Yes", "Product Type: Handmade Canvas Painting", "Colors: Acrylic", "Material: Canvas", orientation, certificate, country of origin — whatever this product's real values are).
- All 7 tabs (`About the Painting`, `Specifications`, `Care Instructions`, `Delivery`, `Packaging`, `Returns`, `Reviews`) are still present, in the same order, each still showing its own existing content.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`

Expected: only the known pre-existing baseline errors (`.next/types/app/api/[[...path]]/route.ts`, `app/warli-paintings/page.tsx`, `components/navbar.tsx`, `app/samora/shop/[slug]/page.tsx`) — no new errors.

---

### Task 2: Relocate and restyle the trust-badge row

**Files:**
- Modify: `components/singleproduct/SingleProduct.tsx` (two locations: remove from ~line 2005-2026, insert into ~line 1733-1756 area)

**Interfaces:**
- Consumes: the existing `isPhotography` boolean (already computed earlier in the component, line 782) and the existing `BadgeCheck`, `ShieldCheck`, `Star` icon imports (already imported and used elsewhere in this file — no new imports needed).
- Produces: nothing consumed by another task.

- [ ] **Step 1: Read both target regions to confirm line numbers haven't shifted**

View `components/singleproduct/SingleProduct.tsx` lines 1693-1757 (image column) and lines 1995-2029 (bottom of info column, where the current badge block lives). Confirm the badge block still reads exactly:

```tsx
              {!isPhotography && (
                <>
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

directly preceded by a wishlist `<button>` closing at `</button>` then `</div>` (the price/actions row), and directly followed by `</div>` then `</div>` (closing the info column and the two-column grid). And confirm the image column still reads exactly as shown in Step 2 below (main image block, then the thumbnail-strip `<div>`, then two closing `</div>`s).

If either region differs meaningfully from what's quoted here (not just line-number drift — actual content differences), STOP and report back rather than guessing.

- [ ] **Step 2: Remove the badge block from the info column**

Delete this entire block (the `{!isPhotography && (` through its matching `)}`, i.e. the block quoted in Step 1) from its current location at the bottom of the info column. Leave the surrounding code untouched — the wishlist button's closing `</div>` stays, and the info column's closing `</div>` and the two-column grid's closing `</div>` stay. After this removal, that section reads:

```tsx
                  <Heart
                    className={`h-5 w-5 ${
                      isCurrentSelectionWishlisted ? "fill-current" : ""
                    }`}
                  />
                </button>
              </div>

            </div>
          </div>
```

(i.e. the whole `{!isPhotography && (<>...</>)}` wrapper is gone, not just its inner `<div>` — do not leave an empty `{!isPhotography && (<></>)}` fragment behind.)

- [ ] **Step 3: Insert the restyled badge block into the image column**

In the image column, find the thumbnail-strip block:

```tsx
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative h-[62px] w-[62px] shrink-0 overflow-hidden rounded-[8px] ${
                        index === activeImageIndex
                          ? "ring-2 ring-[#3A4980]/40"
                          : ""
                      }`}
                      aria-label={`Select image ${index + 1}`}
                    >
                      <Image
                        src={image.thumbnail || image.src}
                        alt={image.alt || `${stripHtml(product.name)} - Image ${index + 1}`}
                        fill
                        sizes="62px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
```

Insert the new badge block immediately after that thumbnail-strip `<div>` closes and before the wrapper `<div>` (the `mx-auto max-w-[500px] lg:mx-0` one) closes, so the result reads:

```tsx
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative h-[62px] w-[62px] shrink-0 overflow-hidden rounded-[8px] ${
                        index === activeImageIndex
                          ? "ring-2 ring-[#3A4980]/40"
                          : ""
                      }`}
                      aria-label={`Select image ${index + 1}`}
                    >
                      <Image
                        src={image.thumbnail || image.src}
                        alt={image.alt || `${stripHtml(product.name)} - Image ${index + 1}`}
                        fill
                        sizes="62px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>

                {!isPhotography && (
                  <div className="mt-4 grid grid-cols-4 divide-x divide-[#e4ded4] overflow-hidden rounded-[12px] border border-[#e4ded4] bg-white">
                    <div className="flex flex-col items-center gap-2 p-3 text-center">
                      <BadgeCheck className="h-6 w-6 text-[#3a6b96]" />
                      <p className="text-[12px] font-medium leading-tight text-[#5c574f]">
                        Premium Cotton Canvas
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 text-center">
                      <ShieldCheck className="h-6 w-6 text-[#4c8e58]" />
                      <p className="text-[12px] font-medium leading-tight text-[#5c574f]">
                        100% Handmade
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 text-center">
                      <Star className="h-6 w-6 text-[#d4a43d]" />
                      <p className="text-[12px] font-medium leading-tight text-[#5c574f]">
                        Museum Grade
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 text-center">
                      <ShieldCheck className="h-6 w-6 text-[#cf7f33]" />
                      <p className="text-[12px] font-medium leading-tight text-[#5c574f]">
                        Authenticity Certificate
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
```

Same 4 items, same order, same icon components, same icon colors, same label text as before — only size (`h-4 w-4` → `h-6 w-6`, `text-[11px]` → `text-[12px] font-medium`), layout (2-col/4-col responsive grid with a top border → a single-row 4-col grid with a bordered card and dividers, no responsive breakpoint needed since the column itself is already a fixed ~500px width), and location changed.

- [ ] **Step 4: Verify no orphaned imports**

`BadgeCheck`, `ShieldCheck`, and `Star` were already imported and used at this exact spot before the move — confirm they're still imported at the top of the file (they should be untouched; this step is just a sanity check that Step 2/3 didn't accidentally remove or duplicate an import line).

- [ ] **Step 5: Live verification**

With the dev server running at `http://localhost:3000`, load a real painting product page (e.g. `http://localhost:3000/shop/musical-ganesha-canvas-painting`) and confirm:
- The badge row now renders directly below the thumbnail strip, width-matched to the product image, as a single bordered card with 4 items in one row separated by thin dividers, with visibly larger icons and text than before.
- The bottom of the info column (where the badges used to be, just above the tabs section) no longer shows them — nothing is left in their place, no leftover empty spacing artifact.
- Selecting a different frame or size still works normally (this block sits above/beside that UI, not interleaved with it — confirm nothing else broke).

Then load a real photography product page (e.g. `http://localhost:3000/shop/banaras-varanasi-ghat-evening-ritual-limited-edition-fine-art-photograph`) and confirm the badge row does not render anywhere on the page (unchanged behavior — it was never shown for photography, and still isn't).

Check both a narrow (mobile) and wide (desktop) viewport — confirm the 4 labels don't overflow or wrap awkwardly inside the card at either width.

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`

Expected: only the known pre-existing baseline errors (`.next/types/app/api/[[...path]]/route.ts`, `app/warli-paintings/page.tsx`, `components/navbar.tsx`, `app/samora/shop/[slug]/page.tsx`) — no new errors.
