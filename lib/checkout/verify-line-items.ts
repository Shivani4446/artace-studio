// lib/checkout/verify-line-items.ts
import { fetchCatalogProducts, type WooV3Product } from "@/lib/woocommerce/catalog-prices";
import { CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID } from "@/lib/custom-portraits/pricing";
import { GIFT_CARD_PRODUCT_ID } from "@/lib/gift-cards/constants";

/**
 * Server-authoritative re-validation of checkout line items.
 *
 * ## Why this exists
 *
 * The client used to be able to set its own `unitPrice`, which the route
 * turned into the WooCommerce line `subtotal`/`total` and WooCommerce then
 * honoured over the catalog price. checkout-client.tsx set that field on
 * *every* line whose cart item carried a positive `price` — not only on the
 * three products that genuinely need a dynamic price. So any product, up to
 * and including a Rs 1,50,000 one-of-one original, could be submitted at an
 * arbitrary price.
 *
 * A small number of products legitimately have no fixed catalog price:
 * the Custom Portrait deposit, gift cards, and prints (whose price is derived
 * from the chosen print size). Those are identified HERE, from
 * server-controlled data (product id / WooCommerce product meta), never from
 * a client-supplied label.
 */

/** Reads the same `available_as_print` meta the product page uses. */
const isPrintProduct = (product: WooV3Product): boolean => {
  const entry = (product.meta_data ?? []).find((meta) => meta.key === "available_as_print");
  if (!entry) return false;
  if (typeof entry.value !== "string") return false;
  const raw = entry.value.trim().toLowerCase();
  return raw !== "" && raw !== "no" && raw !== "0" && raw !== "false";
};

/**
 * True only for products whose price is intentionally dynamic and therefore
 * cannot be verified against the catalog. Everything else — including every
 * Atelier original — has its client-supplied price discarded.
 */
const hasDynamicPrice = (productId: number, product: WooV3Product): boolean => {
  if (productId === CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID) return true;
  if (productId === GIFT_CARD_PRODUCT_ID) return true;
  return isPrintProduct(product);
};

export type VerifiedLineItem = {
  product_id: number;
  quantity: number;
  variation_id?: number;
  meta_data?: Array<{ key: string; value: string }>;
  subtotal: string;
  total: string;
};

export type VerifyLineItemsResult =
  | { ok: true; lineItems: VerifiedLineItem[] }
  | { ok: false; error: string };

/**
 * Rebuilds every line item from real WooCommerce data.
 *
 * Fails CLOSED: if a product id cannot be read from the catalog the whole
 * request is rejected. lib/woocommerce/catalog-prices.ts documents that a
 * missing id means "price unknown" and must never be treated as zero —
 * treating it as zero is what allowed a free order, and treating it as "just
 * use the client's number" is the bug this replaces.
 */
export type LineItemRequest = {
  product_id: number;
  quantity: number;
  variation_id?: number;
  meta_data?: Array<{ key: string; value: string }>;
  /** Client-supplied; honoured ONLY for the dynamic-price allowlist above. */
  clientUnitPrice?: number | null;
};

const CATALOG_UNREADABLE_ERROR =
  "We couldn't verify one of the items in your bag against our catalogue. Please refresh the page and try again.";

/**
 * The per-line decision, as a pure function of (request, real product record).
 *
 * Split out from the fetch so every branch below is directly testable without
 * a live WooCommerce instance — these are the checks that decide what the
 * customer is charged, so they should not only be exercised in production.
 */
export const resolveLineItem = (
  item: LineItemRequest,
  product: WooV3Product
): { ok: true; lineItem: VerifiedLineItem } | { ok: false; error: string } => {
  // --- stock gate ------------------------------------------------------
  const stockStatus = (product.stock_status ?? "").toLowerCase();
  if (stockStatus && stockStatus !== "instock") {
    return {
      ok: false,
      error: `"${product.name ?? "An item in your bag"}" is no longer available. Please remove it to continue.`,
    };
  }

  if (typeof product.stock_quantity === "number" && product.stock_quantity < item.quantity) {
    return {
      ok: false,
      error: `Only ${
        product.stock_quantity === 1 ? "1" : product.stock_quantity
      } of "${product.name ?? "an item in your bag"}" ${
        product.stock_quantity === 1 ? "is" : "are"
      } left. Please update your bag to continue.`,
    };
  }

  // --- one-of-one / sold-individually gate ----------------------------
  if (product.sold_individually && item.quantity > 1) {
    return {
      ok: false,
      error: `"${
        product.name ?? "This piece"
      }" is a one-of-one original and can only be purchased once. Please set the quantity to 1.`,
    };
  }

  // --- price -----------------------------------------------------------
  let unitPrice: number;

  if (hasDynamicPrice(item.product_id, product)) {
    const override = item.clientUnitPrice;
    unitPrice =
      typeof override === "number" && Number.isFinite(override) && override > 0
        ? override
        : Number(product.price);
  } else {
    // Number("") is 0, and 0 is finite and non-negative — so a naive
    // isFinite/`< 0` check silently accepts an empty catalog price as a
    // FREE order. Woo sends "" for a product that has no purchasable
    // variation, so the raw value must be validated before coercion, and a
    // purchasable line must have a strictly positive price.
    const rawPrice = typeof product.price === "string" ? product.price.trim() : "";
    const catalogPrice = rawPrice === "" ? Number.NaN : Number(rawPrice);

    if (!Number.isFinite(catalogPrice) || catalogPrice <= 0) {
      return {
        ok: false,
        error: `We couldn't determine the current price for "${
          product.name ?? "an item in your bag"
        }". Please refresh and try again.`,
      };
    }
    unitPrice = catalogPrice;
  }

  const lineTotal = (unitPrice * item.quantity).toFixed(2);

  return {
    ok: true,
    lineItem: {
      product_id: item.product_id,
      quantity: item.quantity,
      ...(item.variation_id ? { variation_id: item.variation_id } : {}),
      ...(item.meta_data && item.meta_data.length ? { meta_data: item.meta_data } : {}),
      subtotal: lineTotal,
      total: lineTotal,
    },
  };
};

/**
 * Rebuilds every line item from real WooCommerce data.
 *
 * Fails CLOSED: if a product id cannot be read from the catalog the whole
 * request is rejected. lib/woocommerce/catalog-prices.ts documents that a
 * missing id means "price unknown" and must never be treated as zero —
 * treating it as zero is what allowed a free order, and treating it as "just
 * use the client's number" is the bug this replaces.
 */
export const verifyLineItemsAgainstCatalog = async (
  lineItems: LineItemRequest[]
): Promise<VerifyLineItemsResult> => {
  const catalog = await fetchCatalogProducts(lineItems.map((item) => item.product_id));
  const verified: VerifiedLineItem[] = [];

  for (const item of lineItems) {
    const product = catalog.get(item.product_id);

    if (!product) {
      return { ok: false, error: CATALOG_UNREADABLE_ERROR };
    }

    const result = resolveLineItem(item, product);
    if (!result.ok) return { ok: false, error: result.error };

    verified.push(result.lineItem);
  }

  return { ok: true, lineItems: verified };
};
