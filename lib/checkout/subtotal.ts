import { fetchCatalogPrices } from "@/lib/woocommerce/catalog-prices";

type SubtotalLineItem = { product_id: number; quantity: number; subtotal?: string };

/**
 * The real, authoritative pre-discount order total.
 *
 * Each line item's `subtotal` is populated by
 * lib/checkout/verify-line-items.ts, which rebuilds it from WooCommerce
 * catalog data (server-side) and only honours a client price for the small
 * set of products with a genuinely dynamic price — custom portrait deposits,
 * gift cards, and prints. Anything without a `subtotal` is looked up against
 * the catalog here.
 *
 * This is what points/gift-card discounts must be capped against — never the
 * client's own cart total, which isn't trusted for a charge decision anywhere
 * else in this codebase either.
 */
export const calculateOrderSubtotal = async (lineItems: SubtotalLineItem[]): Promise<number> => {
  const idsNeedingLookup = lineItems
    .filter((item) => item.subtotal === undefined)
    .map((item) => item.product_id);
  const catalogPrices = await fetchCatalogPrices(idsNeedingLookup);

  let subtotal = 0;
  for (const item of lineItems) {
    if (item.subtotal !== undefined) {
      const overridden = Number(item.subtotal);
      subtotal += Number.isFinite(overridden) ? overridden : 0;
    } else {
      const price = catalogPrices.get(item.product_id) ?? 0;
      subtotal += price * item.quantity;
    }
  }
  return subtotal;
};
