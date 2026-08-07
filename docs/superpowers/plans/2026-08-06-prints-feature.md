# Prints Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. (Not subagent-driven-development for this project — that workflow assumes commits between tasks, and this project's standing rule is that the user handles all commits/pushes themselves.)

**Goal:** Let customers buy a fine-art print reproduction (25% of the original's price for that size, +₹350 if framed) of any eligible painting, browsable via a new `/collections/prints` page, purchasable via a modal on the product's own page — with checkout finally charging the price it displays instead of the product's catalog price.

**Architecture:** A foundational checkout fix (Task 1) makes the cart's displayed price the actual charged price for any line item — verified empirically against the live WooCommerce API before writing this plan (see Task 1). Everything else builds on top: a new WooCommerce category for browsing (Task 2), a per-product ACF opt-out gate (Task 3), the purchase modal itself (Task 4), and category-page overrides so the browsing page shows print pricing (Task 5).

**Tech Stack:** Next.js App Router (Edge runtime on the affected pages), TypeScript, Tailwind CSS 4, WooCommerce REST API (Store API + authenticated Admin API), Razorpay (live keys — no test/sandbox mode available on this account).

## Global Constraints

- No `git commit`/`git push` — the user reviews and commits/pushes everything themselves.
- No test framework — verification via `npx tsc --noEmit`, `npm run build`, live dev-server checks (fresh port, never 3000), and safe isolated WooCommerce Admin-API test orders (created with `set_paid: false`, verified, then deleted — never a real Razorpay payment, since this account has no test-mode keys).
- Print price = 25% of the size's **current selling price** (sale price if on sale, else regular), + ₹350 flat if any frame other than "No Frame / Rolled Canvas" is selected.
- "Available in Print" never shows for photography products.
- Prints category id: created in Task 2; every later task references it by the id printed at the end of that task, not a hardcoded guess.
- Excluded from the bulk category assignment: the 22 Samora-tagged products, 18 Tote Bags (category id 335), 4 Tea Coasters (id 377), 1 Photography product (id 376).

---

### Task 1: Checkout price-override

**Files:**
- Modify: `app/checkout/checkout-client.tsx`
- Modify: `lib/api-route-handlers/checkout/route.ts`

**Interfaces:**
- Produces: `CheckoutLineItemInput.unitPrice?: number` (server type), forwarded as WooCommerce `subtotal`/`total` on the line item when positive and finite.
- Consumes: existing `CartItem.price` (already present on every cart item, `components/cart/CartProvider.tsx`).

**Already verified live** (before writing this plan): creating a WooCommerce order via `POST /wc/v3/orders` with a line item carrying explicit `subtotal`/`total` fields produces an order whose `total` matches those fields exactly, not the product's catalog price — confirmed with product 4295 (catalog price ₹5500): sent `subtotal: "123.45", total: "123.45"`, got back `order.total: "123.45"`. Test order was `set_paid: false` (no payment triggered) and permanently deleted (`DELETE /wc/v3/orders/{id}?force=true`) immediately after confirming. This de-risks this task's core assumption — no need to re-derive it.

- [ ] **Step 1: Add `unitPrice` to the checkout request type and forward it**

In `app/checkout/checkout-client.tsx`, find the line-item-building block (currently building an object with `productId`, `quantity`, `variationId?`, `frameLabel?`). Change it from:
```tsx
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
to:
```tsx
          const checkoutLineItem: {
            productId: number;
            variationId?: number;
            quantity: number;
            frameLabel?: string;
            unitPrice?: number;
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

          if (typeof item.price === "number" && Number.isFinite(item.price) && item.price > 0) {
            checkoutLineItem.unitPrice = item.price;
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
            unitPrice?: number;
          } => lineItem !== null
        );
```

- [ ] **Step 2: Accept and forward `unitPrice` on the server**

In `lib/api-route-handlers/checkout/route.ts`, change:
```tsx
type CheckoutLineItemInput = {
  productId: number;
  variationId?: number;
  quantity: number;
  frameLabel?: string;
};
```
to:
```tsx
type CheckoutLineItemInput = {
  productId: number;
  variationId?: number;
  quantity: number;
  frameLabel?: string;
  unitPrice?: number;
};
```

Then change the line-item normalization block from:
```tsx
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
to:
```tsx
  const normalizedLineItems = lineItems
    .map((item) => {
      const productId = ensurePositiveInt(item.productId);
      const quantity = ensurePositiveInt(item.quantity);
      const variationId = ensurePositiveInt(item.variationId);
      const frameLabel = sanitizeText(item.frameLabel);
      if (!productId || !quantity) return null;

      const unitPrice =
        typeof item.unitPrice === "number" && Number.isFinite(item.unitPrice) && item.unitPrice > 0
          ? item.unitPrice
          : null;
      const lineTotal = unitPrice !== null ? (unitPrice * quantity).toFixed(2) : null;

      return {
        product_id: productId,
        quantity,
        ...(variationId ? { variation_id: variationId } : {}),
        ...(frameLabel ? { meta_data: [{ key: "Frame", value: frameLabel }] } : {}),
        ...(lineTotal !== null ? { subtotal: lineTotal, total: lineTotal } : {}),
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
        subtotal?: string;
        total?: string;
      } => Boolean(item)
    );
```

- [ ] **Step 3: Verify**

`npx tsc --noEmit` — expect only the 3 known pre-existing errors (Samora, warli-paintings, navbar.tsx), nothing new in either modified file.

- [ ] **Step 4: Re-run the isolated WooCommerce verification, this time through the actual code path**

This confirms the real code (not just the raw API) produces the override correctly. Using a scratchpad script (not committed), call the modified logic's *shape* directly against the live WooCommerce Admin API one more time — send a line item with `unitPrice` set to something deliberately different from the product's catalog price (e.g. product 4295, catalog ₹5500, send `unitPrice: 999`), confirm the created order's `line_items[0].total` is `"999.00"`, then delete the test order (`DELETE .../orders/{id}?force=true`). This is a final sanity check on the exact `subtotal`/`total` construction (`(unitPrice * quantity).toFixed(2)`) before other tasks build on it.

---

### Task 2: Prints category + bulk assignment

**Files:** none (live WooCommerce data operations via a scratchpad script)

**Interfaces:**
- Produces: a WooCommerce category id (referred to as `PRINTS_CATEGORY_ID` in later tasks) — record it after Step 1, it is used verbatim in Task 5.

- [ ] **Step 1: Create the "Prints" category**

```bash
curl -s -u "$WOOCOMMERCE_CONSUMER_KEY:$WOOCOMMERCE_CONSUMER_SECRET" \
  -X POST "https://api.artacestudio.com/wp-json/wc/v3/products/categories" \
  -H "Content-Type: application/json" \
  -d '{"name": "Prints", "slug": "prints"}'
```
Record the returned `id` — this is `PRINTS_CATEGORY_ID` for every later step and task.

- [ ] **Step 2: Build the exact product id list to include**

Fetch all published products (paginated, `per_page=100`), then exclude:
- any product whose `tags` include the `samora` slug,
- any product in category id 335 (Tote Bags) or 377 (Tea Coaster),
- any product in category id 376 (Photography).

Write this list to a scratchpad JSON file (e.g. `scratchpad/prints-category-target-ids.json`) so Step 3 is resumable without re-deriving the list, and so the exact scope is inspectable before any writes happen.

- [ ] **Step 3: Print a dry-run summary before writing anything**

Print the total count and a handful of sample product names from the built list. This is the last checkpoint before a live, hard-to-reverse bulk write — confirm the count is close to the ~90 expected before continuing.

- [ ] **Step 4: Assign the category, appending — never replacing**

For each product id in the list, in a small scratchpad Node script:
1. `GET /wc/v3/products/{id}` — read its current `categories` array.
2. Skip (already done) if `PRINTS_CATEGORY_ID` is already present in that array — makes the script safely re-runnable.
3. `PUT /wc/v3/products/{id}` with
   `{"categories": [...existingCategories.map(c => ({id: c.id})), {"id": PRINTS_CATEGORY_ID}]}`
   — the existing categories plus the new one, **never** a bare `{"categories": [{"id": PRINTS_CATEGORY_ID}]}` (that silently replaces all of a product's categories with just this one — the exact bug that broke product 4248's Photography categorization earlier this engagement).
4. Log each product id's outcome (success/failure) to the console; on failure, continue to the next product rather than aborting the whole run, and collect failed ids into a summary printed at the end.

- [ ] **Step 5: Verify the assignment**

```bash
curl -s "https://api.artacestudio.com/wp-json/wc/store/v1/products?category=<PRINTS_CATEGORY_ID>&per_page=1" \
  -o /dev/null -w "%{http_code}\n"
curl -s "https://api.artacestudio.com/wp-json/wc/v3/products/categories/<PRINTS_CATEGORY_ID>" \
  -u "$WOOCOMMERCE_CONSUMER_KEY:$WOOCOMMERCE_CONSUMER_SECRET"
```
Confirm the category's `count` field matches the number of products successfully assigned in Step 4 (accounting for any that were skipped as already-done on a re-run).

---

### Task 3: Print eligibility data fetch

**Files:**
- Modify: `app/shop/[slug]/page.tsx`
- Modify: `components/singleproduct/SingleProduct.tsx` (prop only — the modal itself is Task 4)

**Interfaces:**
- Produces: `fetchPrintEligibility(productId: number): Promise<boolean>` in `page.tsx`.
- Produces: `SingleProductProps.isAvailableAsPrint?: boolean`.

- [ ] **Step 1: Add `fetchPrintEligibility`, mirroring `fetchPhotographyDetails` exactly**

In `app/shop/[slug]/page.tsx`, immediately after the existing `fetchPhotographyDetails` function, add:

```tsx
const fetchPrintEligibility = async (productId: number): Promise<boolean> => {
  const { siteUrl, consumerKey, consumerSecret } = getWooServerConfig();
  if (!consumerKey || !consumerSecret) return true;
  const basicToken = toBasicAuthToken(consumerKey, consumerSecret);
  try {
    const response = await fetch(`${siteUrl}/wp-json/wc/v3/products/${productId}`, {
      headers: { Authorization: `Basic ${basicToken}` },
      next: { revalidate },
    });
    if (!response.ok) return true;
    const payload = (await response.json()) as WooV3Product;
    const metaData = payload.meta_data ?? [];
    const entry = metaData.find((meta) => meta.key === "available_as_print");
    if (!entry) return true;
    const rawValue = typeof entry.value === "string" ? entry.value.trim().toLowerCase() : "";
    return rawValue !== "no" && rawValue !== "0" && rawValue !== "false";
  } catch {
    return true;
  }
};
```

- [ ] **Step 2: Call it in the page's `Promise.all` and pass it down**

Add `fetchPrintEligibility(product.id)` alongside the other per-product fetches in the same `Promise.all` used for `fetchPhotographyDetails`; add `isAvailableAsPrint` to the destructured result and pass it as a new prop: `<SingleProduct isAvailableAsPrint={isAvailableAsPrint} ... />`.

- [ ] **Step 3: Accept the new prop**

In `components/singleproduct/SingleProduct.tsx`, add `isAvailableAsPrint?: boolean;` to `SingleProductProps`, and destructure it in the component signature with a default: `isAvailableAsPrint = true`.

- [ ] **Step 4: Verify**

`npx tsc --noEmit` — no new errors. On the dev server, confirm the prop reaches the component (temporarily log it or check via React DevTools) for a product with no `available_as_print` meta yet — expect `true` (default-available).

---

### Task 4: Print modal + cart integration

**Files:**
- Modify: `components/singleproduct/SingleProduct.tsx`

**Interfaces:**
- Consumes: `isAvailableAsPrint` (Task 3), `isPhotography`, `sizeOptions`, `selectedSizeValue`, `FRAME_OPTIONS`, `sizeOptionsMatch`, `currency.formatPrice`, `addItem` (all pre-existing).
- Produces: new local state only — no new props, no new exports.

- [ ] **Step 1: Add an "Order Type" meta tag field to the cart pipeline**

Mirrors the existing `frameLabel` mechanism exactly, for the same reason: to surface a plain-language tag on the WooCommerce order line item.

In `components/cart/CartProvider.tsx`, add to `CartProduct`:
```tsx
  // A plain-language tag for this line item shown to you in WooCommerce
  // (e.g. "Fine Art Print") — forwarded as line-item metadata, same
  // mechanism as frameLabel. Undefined for a normal order.
  orderTypeLabel?: string;
```

In `app/checkout/checkout-client.tsx`, extend the same line-item-building block from Task 1 to also carry it through:
```tsx
          const checkoutLineItem: {
            productId: number;
            variationId?: number;
            quantity: number;
            frameLabel?: string;
            unitPrice?: number;
            orderTypeLabel?: string;
          } = {
            productId,
            quantity: item.quantity,
          };
```
(add the matching field to the `.filter()` type guard too), and:
```tsx
          if (typeof item.orderTypeLabel === "string" && item.orderTypeLabel) {
            checkoutLineItem.orderTypeLabel = item.orderTypeLabel;
          }
```

In `lib/api-route-handlers/checkout/route.ts`, add `orderTypeLabel?: string;` to `CheckoutLineItemInput`, and change the `meta_data` construction to combine both tags when present:
```tsx
      const frameLabel = sanitizeText(item.frameLabel);
      const orderTypeLabel = sanitizeText(item.orderTypeLabel);
      const metaEntries = [
        ...(frameLabel ? [{ key: "Frame", value: frameLabel }] : []),
        ...(orderTypeLabel ? [{ key: "Order Type", value: orderTypeLabel }] : []),
      ];
```
and use `...(metaEntries.length ? { meta_data: metaEntries } : {})` in place of the single-entry `frameLabel` spread from Task 1 Step 2 (the `unitPrice`/`subtotal`/`total` logic from Task 1 is unchanged).

Run `npx tsc --noEmit` after this step — no new errors expected.

- [ ] **Step 2: Add print modal state and a size→price lookup**

Near the other `useState` calls, add:
```tsx
  const NO_FRAME_OPTION =
    FRAME_OPTIONS.find((frame) => frame.id === "no-frame") ?? FRAME_OPTIONS[FRAME_OPTIONS.length - 1];
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printSelectedSize, setPrintSelectedSize] = useState("");
  const [printSelectedFrame, setPrintSelectedFrame] = useState<FrameOption>(NO_FRAME_OPTION);
```

Near `currentVariation`, add a standalone lookup usable for any size value (not just the page's own selected size), mirroring `currentVariation`'s matching logic:
```tsx
  const getPriceForSize = (sizeValue: string): number | null => {
    if (!product) return null;
    if (!sizeValue || !product.variations || product.variations.length === 0) {
      return product?.price ?? null;
    }

    const matchByAttributeName = product.variations.find((variation) =>
      variation.attributes.some(
        (attr) => /size|dimension/i.test(attr.name) && sizeOptionsMatch(attr.value, sizeValue)
      )
    );
    if (matchByAttributeName) return matchByAttributeName.price ?? product.price ?? null;

    const matchByAnyValue = product.variations.find((variation) =>
      variation.attributes.some((attr) => sizeOptionsMatch(attr.value, sizeValue))
    );
    return matchByAnyValue?.price ?? product.price ?? null;
  };

  const printEffectiveSize = printSelectedSize || selectedSizeValue;
  const printBasePrice = getPriceForSize(printEffectiveSize);
  const printFramingCharge = printSelectedFrame.id === "no-frame" ? 0 : 350;
  const printPrice = printBasePrice !== null ? printBasePrice * 0.25 + printFramingCharge : null;
```

- [ ] **Step 3: Add the "Available in Print" trigger button**

Immediately after the existing `!isPhotography && (<button ... Order a Custom Size ...>)` block (the one closed at `)}` before the `{isPhotography && (<Link ... Make an Offer ...>)}` block), add:
```tsx
                {!isPhotography && isAvailableAsPrint && (
                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="order-6 inline-flex w-full items-center justify-center gap-2 rounded-[6px] border border-[#3A4980] px-4 py-3 text-[16px] font-normal text-[#3A4980] transition-colors hover:bg-[#3A4980] hover:text-white md:order-none md:w-auto md:px-6 md:text-[18px]"
                  >
                    Available in Print
                  </button>
                )}
```

- [ ] **Step 4: Add the Add-to-Bag handler for prints**

Near `handleAddCustomSizeToCart`, add:
```tsx
  const handleAddPrintToCart = () => {
    if (!product || !selectedImage || !product.inStock || printPrice === null) return;

    const subtitleParts = [printEffectiveSize, printSelectedFrame.label].filter(Boolean);

    addItem(
      {
        id: `${product.id}-print-${printEffectiveSize || "default"}-${printSelectedFrame.id}`,
        woocommerceProductId: product.id,
        title: `${stripHtml(product.name)} — Fine Art Print`,
        image: selectedImage.src,
        subtitle: subtitleParts.join(" | ") || undefined,
        price: printPrice,
        orderTypeLabel: "Fine Art Print",
        ...(printSelectedFrame.id !== "no-frame" ? { frameLabel: printSelectedFrame.label } : {}),
      },
      1
    );

    setIsPrintModalOpen(false);
    setToastState({
      message: "Print added to bag",
      linkHref: "/cart",
      linkLabel: "View bag",
    });
  };
```

- [ ] **Step 5: Add the modal JSX**

Immediately after the existing `{isCustomSizeModalOpen ? ( ... ) : null}` block closes, add:
```tsx
      {isPrintModalOpen ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:p-4 md:items-center md:p-6">
          <button
            type="button"
            aria-label="Close print options"
            onClick={() => setIsPrintModalOpen(false)}
            className="absolute inset-0 bg-black/55"
          />

          <div className="relative z-[71] w-full max-w-[900px] overflow-hidden rounded-t-[16px] bg-white shadow-[0_22px_48px_rgba(0,0,0,0.28)] sm:rounded-[14px]">
            <div className="grid max-h-[92dvh] overflow-y-auto lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
              <div className="relative aspect-square bg-[#f3f0ea] lg:aspect-auto">
                <Image
                  src={selectedImage?.src || FALLBACK_PRODUCT_IMAGE}
                  alt={selectedImage?.alt || stripHtml(product.name)}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>

              <div className="relative p-4 sm:p-6 md:p-8">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f3f3] text-[#313131] hover:bg-[#e7e7e7] sm:right-4 sm:top-4"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                <p className="font-inter text-[13px] uppercase tracking-[0.08em] text-[#6a655d]">
                  Fine Art Print
                </p>
                <h3 className="mt-2 font-display text-[24px] leading-[1.2] text-[#24211d] md:text-[30px]">
                  {stripHtml(product.name)}
                </h3>
                <p className="mt-3 text-[14px] leading-6 text-[#595959] md:text-[15px]">
                  A high-quality reproduction of this handmade original, at 25%
                  of the original&apos;s price. Choose a size and, if you&apos;d
                  like it framed, a frame style — ready to hang for an extra
                  ₹350.
                </p>

                {sizeOptions.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[14px] text-[#595959] md:text-[16px]">Choose a Size</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sizeOptions.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setPrintSelectedSize(size)}
                          className={`inline-flex items-center gap-2 rounded-[8px] border px-3 py-2 font-inter text-[14px] font-medium transition-colors ${
                            printEffectiveSize === size
                              ? "border-[#3A4980]/20 bg-[#EDF0F8] text-[#3A4980]"
                              : "border-[#d5d5d5] bg-white text-[#595959]"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <p className="text-[14px] text-[#595959] md:text-[16px]">Choose a Frame</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {FRAME_OPTIONS.map((frame) => (
                      <button
                        key={frame.id}
                        type="button"
                        onClick={() => setPrintSelectedFrame(frame)}
                        className={`flex flex-col items-center gap-2 rounded-[8px] border px-3 py-2 transition-colors ${
                          printSelectedFrame.id === frame.id
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
                            printSelectedFrame.id === frame.id ? "text-[#3A4980]" : "text-[#595959]"
                          }`}
                        >
                          {frame.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[12px] text-[#8a8a8a]">
                    {printSelectedFrame.id === "no-frame"
                      ? "No framing charge"
                      : "+ ₹350 framing charge"}
                  </p>
                </div>

                <div className="mt-6 rounded-[12px] border border-[#e3ddd3] bg-[#faf8f4] p-4">
                  <p className="text-[14px] text-[#6a655d]">Print Price</p>
                  <p className="mt-1 font-display text-[28px] leading-none text-[#292929] md:text-[34px]">
                    {printPrice !== null ? currency.formatPrice(printPrice) : "Price on request"}
                  </p>
                  <p className="mt-2 text-[14px] text-[#595959]">
                    25% of the original&apos;s price for this size
                    {printSelectedFrame.id !== "no-frame" ? " + ₹350 framing" : ""}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddPrintToCart}
                  disabled={!product.inStock || printPrice === null}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#1f1f1f] px-6 py-3 text-[16px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-[#8c8578] md:w-auto md:text-[18px]"
                >
                  Add to Bag
                  <Image
                    src="/add-icon.svg"
                    alt=""
                    aria-hidden="true"
                    width={16}
                    height={16}
                    className="h-4 w-4"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
```

- [ ] **Step 6: Verify**

`npx tsc --noEmit` — no new errors. On the dev server, open a non-photography product with print eligibility defaulted true: confirm "Available in Print" appears after "Order a Custom Size"; opening it shows the product's current image, size options, all 5 frame styles (defaulting to "No Frame," no framing line shown as a charge), and a live-updating price equal to 25% of that size's price, +₹350 the moment a real frame is picked. Add to bag, open `/cart`, confirm the line reads "{Product Name} — Fine Art Print" with the size/frame subtitle and the correct price. Confirm a photography product shows no "Available in Print" button at all.

---

### Task 5: `/collections/prints` overrides

**Files:**
- Modify: `app/collections/[slug]/page.tsx`
- Modify: `components/collections/CollectionLandingPage.tsx`

**Interfaces:**
- Consumes: `categorySlug` (both files already receive this).

- [ ] **Step 1: Add an SEO override for the Prints collection**

In `app/collections/[slug]/page.tsx`, add an entry to `COLLECTION_SEO_OVERRIDES`:
```tsx
  prints: {
    title: "Fine Art Prints Online in India | Museum-Quality Reproductions | Artace Studio",
    description:
      "Shop fine-art print reproductions of Artace Studio's handmade paintings, at a fraction of the original's price. Choose your size, add framing, and bring the art you love home.",
  },
```

- [ ] **Step 2: Show print pricing on the card grid for this category**

In the same file, change `toProductCard` from:
```tsx
const toProductCard = (product: WooStoreProduct): CollectionProductCard => {
  const minorUnit = product.prices?.currency_minor_unit ?? 2;
  const primaryImage = product.images?.[0];

  return {
    id: product.id,
    slug: product.slug,
    name: decodeHtmlEntities(product.name),
    image: primaryImage?.src || FALLBACK_PRODUCT_IMAGE,
    imageAlt: decodeHtmlEntities(
      primaryImage?.alt || primaryImage?.name || product.name
    ),
    price: parsePrice(product.prices?.price, minorUnit),
    regularPrice: parsePrice(product.prices?.regular_price, minorUnit),
    currencyCode: product.prices?.currency_code || "INR",
    currencySymbol: product.prices?.currency_symbol || "Rs. ",
    sizeLabel: getSizeLabel(product.attributes ?? []),
    mediumLabel: getMediumLabel(product.attributes ?? []),
  };
};
```
to:
```tsx
const PRINT_PRICE_MULTIPLIER = 0.25;

const toProductCard = (
  product: WooStoreProduct,
  categorySlug?: string
): CollectionProductCard => {
  const minorUnit = product.prices?.currency_minor_unit ?? 2;
  const primaryImage = product.images?.[0];
  const isPrintsCollection = categorySlug === "prints";
  const rawPrice = parsePrice(product.prices?.price, minorUnit);
  const rawRegularPrice = parsePrice(product.prices?.regular_price, minorUnit);

  return {
    id: product.id,
    slug: product.slug,
    name: decodeHtmlEntities(product.name),
    image: primaryImage?.src || FALLBACK_PRODUCT_IMAGE,
    imageAlt: decodeHtmlEntities(
      primaryImage?.alt || primaryImage?.name || product.name
    ),
    price: isPrintsCollection && rawPrice !== null ? rawPrice * PRINT_PRICE_MULTIPLIER : rawPrice,
    regularPrice:
      isPrintsCollection && rawRegularPrice !== null
        ? rawRegularPrice * PRINT_PRICE_MULTIPLIER
        : rawRegularPrice,
    currencyCode: product.prices?.currency_code || "INR",
    currencySymbol: product.prices?.currency_symbol || "Rs. ",
    sizeLabel: getSizeLabel(product.attributes ?? []),
    mediumLabel: getMediumLabel(product.attributes ?? []),
  };
};
```

`toProductCard` has exactly one call site (confirmed): `const productCards = sortedProducts.map(toProductCard);` (line 418). The JSON-LD `itemListElement` block reuses `productCards` rather than calling `toProductCard` again, so only this one line needs to change, to:
```tsx
  const productCards = sortedProducts.map((product) => toProductCard(product, decodedSlug));
```

- [ ] **Step 3: Fix the card subtitle for the Prints collection**

In `components/collections/CollectionLandingPage.tsx` (confirmed current text — lines 110-116), change:
```tsx
const buildProductSubtitle = (product: CollectionProductCard, categorySlug: string) => {
  const isPhotography = categorySlug === "photography";
  const parts = [isPhotography ? "Original Digital Print" : "Handmade Painting"];
  if (product.sizeLabel) parts.push(product.sizeLabel);
  if (!isPhotography && product.mediumLabel) parts.push(product.mediumLabel);
  return parts.join(" | ");
};
```
to:
```tsx
const buildProductSubtitle = (product: CollectionProductCard, categorySlug: string) => {
  const isPhotography = categorySlug === "photography";
  const isPrint = categorySlug === "prints";
  const parts = [
    isPhotography ? "Original Digital Print" : isPrint ? "Fine Art Print" : "Handmade Painting",
  ];
  if (product.sizeLabel) parts.push(product.sizeLabel);
  if (!isPhotography && !isPrint && product.mediumLabel) parts.push(product.mediumLabel);
  return parts.join(" | ");
};
```

- [ ] **Step 4: Verify**

`npx tsc --noEmit` — no new errors. On the dev server, visit `/collections/prints`: confirm the page loads (proving the category has products from Task 2), the SEO title tag matches the override, each card shows "Fine Art Print | {size}" and a price that is exactly 25% of what `/shop/{slug}` shows as that product's own price. Visit `/collections/photography` and any painting collection (e.g. `/collections/ganapati-paintings`) and confirm both are unchanged (still "Original Digital Print" / "Handmade Painting" respectively, full prices).

---

### Task 6: Full-project final verification

**Files:** none (verification only)

- [ ] **Step 1: Full type-check and build**

```bash
npx tsc --noEmit
npm run build
```
Expect only the 3 known pre-existing type errors; build succeeds.

- [ ] **Step 2: End-to-end print purchase, cart, and checkout-display pass**

On a fresh dev-server port: add a print (with a real frame selected, so the ₹350 applies) to the bag from a product page, confirm the cart page shows the correct title/subtitle/price, proceed to the checkout page and confirm the displayed order total matches — **do not submit payment** (this account has no Razorpay test/sandbox mode; stop before triggering a real charge).

- [ ] **Step 3: Regression pass**

Confirm: a painting product page is otherwise unchanged (Customizable tag, Order a Custom Size, frame selector all still present and working); a photography product page still shows no "Available in Print" and no Order a Custom Size; the existing Order a Custom Size flow still adds to cart and now (per Task 1) would charge its displayed custom price rather than the catalog price — spot-check this the same safe way as Task 1 Step 4 if not already covered.

- [ ] **Step 4: Stop the dev server**

Find and stop the verification dev server process (never touch port 3000).
