# Product Page Framing Options Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old "ships rolled, frame it locally" messaging with a real framing-style selector on the product page, and make sure the chosen frame reaches the real WooCommerce order for fulfillment.

**Architecture:** A new local data module (`lib/framing/data.ts`) is the single source of truth for the 5 frame options, consumed by the product page's new selector. The selection flows through the existing cart-item shape (extended with one new field) and the existing checkout submission path (extended to forward it as WooCommerce line-item metadata), mirroring exactly how the existing Size selector already flows through the same two paths.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, the existing `CartProvider` context, the existing checkout REST flow (`/api/checkout` → WooCommerce `wc/v3/orders`).

## Global Constraints

- No new npm dependencies.
- The old "ships rolled, frame it locally" `<details>` accordion in `SingleProduct.tsx` must be fully removed, not reworded.
- The "Packaging" info tab and the photography-specific "Shipping and Returns" text in `SingleProduct.tsx` are explicitly out of scope — do not touch them.
- Selecting a frame must never change the displayed price.
- The chosen frame must reach the real WooCommerce order as line-item `meta_data` (key `"Frame"`), not just the client-side cart/checkout display.
- This project has no test framework. Verification is `npx tsc --noEmit` (compare against the known pre-existing baseline: errors in `.next/types/app/api/[[...path]]/route.ts`, `app/warli-paintings/page.tsx`, `components/navbar.tsx`, `app/samora/shop/[slug]/page.tsx`) plus live checks against the real dev server.
- The project owner handles all `git commit`/`git push` in this repo — do not run `git commit` or `git add`; leave changes in the working tree.

---

### Task 1: Frame options data

**Files:**
- Create: `lib/framing/data.ts`

**Interfaces:**
- Produces:
  - `type FrameOption = { id: string; label: string; image: string }`
  - `FRAME_OPTIONS: FrameOption[]`

- [ ] **Step 1: Write the file**

```ts
// lib/framing/data.ts
export type FrameOption = {
  id: string;
  label: string;
  image: string;
};

// Every painting now ships framed by default — framing is included in the
// displayed price, not an add-on. This is the single list of frame styles
// offered on every product page; adding, renaming, or reordering styles is
// just editing this array, no other code changes needed.
export const FRAME_OPTIONS: FrameOption[] = [
  {
    id: "black-brown",
    label: "Black & Brown",
    image: "/frame-black-brown.png",
  },
  {
    id: "oak-brown-wood-gold-lining",
    label: "Oak Brown Wood & Gold Lining",
    image: "/frame-oak-brown-wood-gold-lining.png",
  },
  {
    id: "royal-silver-white",
    label: "Royal Silver & White",
    image: "/frame-royal-silver-white.png",
  },
  {
    id: "rustic-brown-textured-lining",
    label: "Rustic Brown with Textured Lining",
    image: "/frame-rustic-brown-textured-lining.png",
  },
  {
    id: "no-frame",
    label: "No Frame / Rolled Canvas",
    image: "/images/product-ship.png",
  },
];
```

- [ ] **Step 2: Verify with a throwaway script**

```ts
// scratch-verify-framing.mjs (temporary, delete after running)
import { FRAME_OPTIONS } from "./lib/framing/data.ts";
import assert from "node:assert";

assert(FRAME_OPTIONS.length === 5);
assert(FRAME_OPTIONS[0].label === "Black & Brown");
assert(FRAME_OPTIONS[FRAME_OPTIONS.length - 1].id === "no-frame");
assert(new Set(FRAME_OPTIONS.map((f) => f.id)).size === 5, "ids must be unique");

console.log("Frame options assertions passed");
```

Run: `npx tsx scratch-verify-framing.mjs`
Expected: `Frame options assertions passed`. Delete `scratch-verify-framing.mjs` when done.

Also confirm the 4 real image files exist (the fifth, `no-frame`, reuses an existing site asset and doesn't need checking):
```bash
ls "public/frame-black-brown.png" "public/frame-oak-brown-wood-gold-lining.png" "public/frame-royal-silver-white.png" "public/frame-rustic-brown-textured-lining.png"
```
Expected: all 4 files listed, no "No such file" errors.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors beyond the known baseline.

- [ ] **Step 4: Leave the change in the working tree**

Do not run `git add` or `git commit`.

---

### Task 2: Product page frame selector + cart wiring

**Files:**
- Modify: `components/singleproduct/SingleProduct.tsx`
- Modify: `components/cart/CartProvider.tsx`

**Interfaces:**
- Consumes: `FRAME_OPTIONS`, `type FrameOption` from `@/lib/framing/data` (Task 1).
- Produces: `CartProduct` (in `CartProvider.tsx`) gains an optional `frameLabel?: string` field — this is what Task 3 reads to build the real order's line-item metadata.

- [ ] **Step 1: Add `frameLabel` to the cart item type**

In `components/cart/CartProvider.tsx`, find this exact block:

```ts
export type CartProduct = {
  id: number | string;
  woocommerceProductId?: number;
  woocommerceVariationId?: number;
  title: string;
  image: string;
  subtitle?: string;
  price?: number;
  // Real per-unit weight (kg) from WooCommerce — used by Samora's checkout
  // to get an accurate Delhivery shipping rate for the whole cart.
  weightKg?: number;
};
```

Add `frameLabel` to it:

```ts
export type CartProduct = {
  id: number | string;
  woocommerceProductId?: number;
  woocommerceVariationId?: number;
  title: string;
  image: string;
  subtitle?: string;
  price?: number;
  // Real per-unit weight (kg) from WooCommerce — used by Samora's checkout
  // to get an accurate Delhivery shipping rate for the whole cart.
  weightKg?: number;
  // Which frame style was chosen on the product page (e.g. "Black & Brown"),
  // if any. Forwarded to the real WooCommerce order as line-item metadata —
  // see lib/api-route-handlers/checkout/route.ts.
  frameLabel?: string;
};
```

- [ ] **Step 2: Add the import to `SingleProduct.tsx`**

Near the top of `components/singleproduct/SingleProduct.tsx`, alongside the existing imports:

```ts
import { FRAME_OPTIONS, type FrameOption } from "@/lib/framing/data";
```

- [ ] **Step 3: Add `selectedFrame` state**

Find this line (the existing size state, near the other `useState` declarations):

```ts
  const [selectedSize, setSelectedSize] = useState("");
```

Add the new state right after it:

```ts
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedFrame, setSelectedFrame] = useState<FrameOption>(FRAME_OPTIONS[0]);
```

- [ ] **Step 4: Remove the outdated "ships rolled" accordion**

Find this exact block (inside `{!isPhotography && (<>`, immediately before the 4-badge grid `<div>`):

```tsx
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

```

Delete this entire block (including the blank line after `</details>`). Leave the surrounding `{!isPhotography && (<>` wrapper and the badge-grid `<div>` that follows it untouched — only this `<details>...</details>` element and the blank line after it are removed. Do not remove the `Truck` or `ChevronDown` imports — both are still used elsewhere in this same file (a badge row and a different accordion further down).

- [ ] **Step 5: Add the "Choose a Frame" selector**

Find this exact block (the end of the existing "Choose a Size" selector):

```tsx
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              )}

              {product.shortDescription && (
```

Insert the new frame selector between the size selector's closing `)}` and the short-description block:

```tsx
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              )}

              <div className="mt-6 md:mt-[30px]">
                <p className="text-[14px] text-[#595959] md:text-[16px]">Choose a Frame</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {FRAME_OPTIONS.map((frame) => (
                    <button
                      key={frame.id}
                      type="button"
                      onClick={() => setSelectedFrame(frame)}
                      className={`flex flex-col items-center gap-2 rounded-[8px] border px-3 py-2 transition-colors ${
                        selectedFrame.id === frame.id
                          ? "border-[#3A4980]/40 bg-[#EDF0F8]"
                          : "border-[#d5d5d5] bg-white"
                      }`}
                    >
                      <span className="relative h-12 w-12 overflow-hidden rounded-[6px] bg-[#f1f0ed]">
                        <Image
                          src={frame.image}
                          alt={frame.label}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>
                      <span
                        className={`max-w-[80px] text-center text-[12px] font-medium leading-tight ${
                          selectedFrame.id === frame.id ? "text-[#3A4980]" : "text-[#595959]"
                        }`}
                      >
                        {frame.label}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-[#8a8a8a]">Framing included in the price</p>
              </div>

              {product.shortDescription && (
```

`Image` from `next/image` is already imported in this file (used elsewhere, e.g. the product gallery and the advisor block) — do not add a duplicate import.

- [ ] **Step 6: Wire the selected frame into the standard add-to-cart flow**

Find this exact block (the standard `handleAddToCart` function):

```tsx
  const handleAddToCart = () => {
    if (!product || !selectedImage || !product.inStock) return;

    const subtitleParts: string[] = [];
    if (selectedSizeValue) subtitleParts.push(selectedSizeValue);
    if (product.categories.length > 0) {
      subtitleParts.push(product.categories[0].name);
    }

    addItem(
      {
        id: `${product.id}-${selectedSizeValue || "default"}`,
        woocommerceProductId: product.id,
        title: stripHtml(product.name),
        image: selectedImage.src,
        subtitle: subtitleParts.join(" | ") || undefined,
        price: currentPrice ?? undefined,
      },
      quantity
    );

    setToastState({
      message: "Added to bag",
      linkHref: "/cart",
      linkLabel: "View bag",
    });
  };
```

Replace it with:

```tsx
  const handleAddToCart = () => {
    if (!product || !selectedImage || !product.inStock) return;

    const subtitleParts: string[] = [];
    if (selectedSizeValue) subtitleParts.push(selectedSizeValue);
    if (product.categories.length > 0) {
      subtitleParts.push(product.categories[0].name);
    }
    subtitleParts.push(selectedFrame.label);

    addItem(
      {
        id: `${product.id}-${selectedSizeValue || "default"}-${selectedFrame.id}`,
        woocommerceProductId: product.id,
        title: stripHtml(product.name),
        image: selectedImage.src,
        subtitle: subtitleParts.join(" | ") || undefined,
        price: currentPrice ?? undefined,
        frameLabel: selectedFrame.label,
      },
      quantity
    );

    setToastState({
      message: "Added to bag",
      linkHref: "/cart",
      linkLabel: "View bag",
    });
  };
```

- [ ] **Step 7: Wire the selected frame into the custom-size add-to-cart flow**

Find this exact block (the custom-size `addItem` call, a separate flow from Step 6's standard one):

```tsx
    const subtitleParts: string[] = [];
    subtitleParts.push(
      `Custom: ${formatDimensionValue(widthValue)} x ${formatDimensionValue(heightValue)} ${customSizeUnit}`
    );
    if (product.categories.length > 0) {
      subtitleParts.push(product.categories[0].name);
    }

    addItem(
      {
        id: `${product.id}-custom-${formatDimensionValue(widthValue)}x${formatDimensionValue(heightValue)}-${customSizeUnit}`,
        woocommerceProductId: product.id,
        title: `${stripHtml(product.name)} (Custom Size)`,
        image: selectedImage.src,
        subtitle: subtitleParts.join(" | ") || undefined,
        price: customCalculatedPrice ?? currentPrice ?? undefined,
      },
      1
    );
```

Replace it with:

```tsx
    const subtitleParts: string[] = [];
    subtitleParts.push(
      `Custom: ${formatDimensionValue(widthValue)} x ${formatDimensionValue(heightValue)} ${customSizeUnit}`
    );
    if (product.categories.length > 0) {
      subtitleParts.push(product.categories[0].name);
    }
    subtitleParts.push(selectedFrame.label);

    addItem(
      {
        id: `${product.id}-custom-${formatDimensionValue(widthValue)}x${formatDimensionValue(heightValue)}-${customSizeUnit}-${selectedFrame.id}`,
        woocommerceProductId: product.id,
        title: `${stripHtml(product.name)} (Custom Size)`,
        image: selectedImage.src,
        subtitle: subtitleParts.join(" | ") || undefined,
        price: customCalculatedPrice ?? currentPrice ?? undefined,
        frameLabel: selectedFrame.label,
      },
      1
    );
```

- [ ] **Step 8: Verify live against the real dev server**

Start the dev server (`npm run dev`) if not already running. Visit any painting's product page (not a photography product) and confirm:
- The old "Ships rolled. Frame it locally in your city to hang it" accordion no longer appears anywhere on the page.
- A "Choose a Frame" selector appears directly below "Choose a Size", showing all 5 options (4 real frame thumbnails + "No Frame / Rolled Canvas"), with "Black & Brown" selected by default.
- Clicking a different frame option visually updates the selection (border/background change).
- "Framing included in the price" appears under the selector, and the displayed price does not change when switching frames.
- Add the product to cart with a non-default frame selected, then check the cart page (`/cart`) — confirm the frame name appears in that item's subtitle text.
- Add the same product/size again with a *different* frame selected — confirm it appears as a separate cart line item, not merged with the first.
- If the product has a "Custom Size" option, test that flow too and confirm the frame choice is reflected there as well.

- [ ] **Step 9: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors beyond the known baseline.

- [ ] **Step 10: Leave the change in the working tree**

Do not run `git add` or `git commit`.

---

### Task 3: Carry the frame choice through checkout to the real order

**Files:**
- Modify: `app/checkout/checkout-client.tsx`
- Modify: `lib/api-route-handlers/checkout/route.ts`

**Interfaces:**
- Consumes: `CartProduct.frameLabel` (Task 2, via the cart's `items` array already available in `checkout-client.tsx`); `sanitizeText` from `@/utils/woocommerce-checkout` (existing, already imported in `route.ts`).

- [ ] **Step 1: Forward `frameLabel` in the client-side line-item builder**

In `app/checkout/checkout-client.tsx`, find this exact block:

```tsx
      const lineItems = items
        .map((item) => {
          const productId = getCheckoutProductId(item.id, item.woocommerceProductId);
          if (!productId) return null;

          const checkoutLineItem: {
            productId: number;
            variationId?: number;
            quantity: number;
          } = {
            productId,
            quantity: item.quantity,
          };

          if (typeof item.woocommerceVariationId === "number") {
            checkoutLineItem.variationId = item.woocommerceVariationId;
          }

          return checkoutLineItem;
        })
        .filter(
          (
            lineItem
          ): lineItem is {
            productId: number;
            variationId?: number;
            quantity: number;
          } => lineItem !== null
        );
```

Replace it with (adding `frameLabel` alongside the existing `variationId` handling):

```tsx
      const lineItems = items
        .map((item) => {
          const productId = getCheckoutProductId(item.id, item.woocommerceProductId);
          if (!productId) return null;

          const checkoutLineItem: {
            productId: number;
            variationId?: number;
            quantity: number;
            frameLabel?: string;
          } = {
            productId,
            quantity: item.quantity,
          };

          if (typeof item.woocommerceVariationId === "number") {
            checkoutLineItem.variationId = item.woocommerceVariationId;
          }

          if (typeof item.frameLabel === "string" && item.frameLabel) {
            checkoutLineItem.frameLabel = item.frameLabel;
          }

          return checkoutLineItem;
        })
        .filter(
          (
            lineItem
          ): lineItem is {
            productId: number;
            variationId?: number;
            quantity: number;
            frameLabel?: string;
          } => lineItem !== null
        );
```

- [ ] **Step 2: Accept and forward `frameLabel` on the server**

In `lib/api-route-handlers/checkout/route.ts`, find this exact block:

```ts
type CheckoutLineItemInput = {
  productId: number;
  variationId?: number;
  quantity: number;
};
```

Replace it with:

```ts
type CheckoutLineItemInput = {
  productId: number;
  variationId?: number;
  quantity: number;
  frameLabel?: string;
};
```

Then find this exact block (the line-item normalization):

```ts
  const lineItems = Array.isArray(body.lineItems) ? body.lineItems : [];
  const normalizedLineItems = lineItems
    .map((item) => {
      const productId = ensurePositiveInt(item.productId);
      const quantity = ensurePositiveInt(item.quantity);
      const variationId = ensurePositiveInt(item.variationId);
      if (!productId || !quantity) return null;

      return {
        product_id: productId,
        quantity,
        ...(variationId ? { variation_id: variationId } : {}),
      };
    })
    .filter((item): item is { product_id: number; quantity: number; variation_id?: number } =>
      Boolean(item)
    );
```

Replace it with (adding a `frameLabel`-derived `meta_data` entry when present):

```ts
  const lineItems = Array.isArray(body.lineItems) ? body.lineItems : [];
  const normalizedLineItems = lineItems
    .map((item) => {
      const productId = ensurePositiveInt(item.productId);
      const quantity = ensurePositiveInt(item.quantity);
      const variationId = ensurePositiveInt(item.variationId);
      const frameLabel = sanitizeText(item.frameLabel);
      if (!productId || !quantity) return null;

      return {
        product_id: productId,
        quantity,
        ...(variationId ? { variation_id: variationId } : {}),
        ...(frameLabel ? { meta_data: [{ key: "Frame", value: frameLabel }] } : {}),
      };
    })
    .filter(
      (
        item
      ): item is {
        product_id: number;
        quantity: number;
        variation_id?: number;
        meta_data?: Array<{ key: string; value: string }>;
      } => Boolean(item)
    );
```

- [ ] **Step 3: Verify live against the real dev server**

Start the dev server (`npm run dev`) if not already running. Add a painting to the cart with a non-default frame selected (per Task 2's Step 8), then go through checkout with real test details, completing a real order if your test setup allows it (Cash on Delivery or your usual test payment path — whatever this project's existing checkout testing convention already is).

After the order is created, check it in wp-admin (WooCommerce → Orders → the new order → open the line item) and confirm the "Frame" metadata with the chosen frame's label appears on that line item. If you cannot safely place a real test order, at minimum confirm via the Network tab that the POST request to `/api/checkout` includes `frameLabel` in its `lineItems`, and add a temporary `console.log(JSON.stringify(normalizedLineItems))` in the route handler to confirm the outgoing payload to WooCommerce includes the `meta_data` field correctly — remove the temporary log before finishing.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors beyond the known baseline.

- [ ] **Step 5: Leave the change in the working tree**

Do not run `git add` or `git commit`.

---

## Self-Review Notes

- **Spec coverage:** All 5 spec scope items (frame data, remove old messaging, new selector, cart data, checkout → real order) are covered — Task 1 (data), Task 2 (messaging removal + selector + cart wiring, both add-to-cart flows), Task 3 (checkout → order).
- **Type consistency:** `FrameOption`/`FRAME_OPTIONS` (Task 1) are consumed identically in Task 2. `CartProduct.frameLabel` (Task 2) is consumed identically in Task 3's `item.frameLabel` reads. `CheckoutLineItemInput.frameLabel` (Task 3) matches what the client now sends.
- **No placeholder scan issues found** — every step contains complete, real code.
