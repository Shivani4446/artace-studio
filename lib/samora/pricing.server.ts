// Server-only: fetches real per-unit price + weight from WooCommerce so
// checkout pricing (gift fee eligibility, free-shipping threshold, Delhivery
// weight) is based on authoritative data, never trusted from the client.
import { SAMORA_DEFAULT_ITEM_WEIGHT_GRAMS } from "@/lib/samora/pricing";
import { hasSamoraTag } from "@/lib/samora/products";
import { fetchCatalogProducts } from "@/lib/woocommerce/catalog-prices";

export const fetchLineItemTotals = async (
  lineItems: { product_id: number; quantity: number }[]
): Promise<{ subtotalInr: number; totalWeightGrams: number; allItemsAreSamora: boolean }> => {
  const uniqueIds = Array.from(new Set(lineItems.map((item) => item.product_id)));
  const productsById = await fetchCatalogProducts(uniqueIds);

  let subtotalInr = 0;
  let totalWeightGrams = 0;
  let allItemsAreSamora = uniqueIds.length > 0;

  for (const item of lineItems) {
    const product = productsById.get(item.product_id);
    const price = Number(product?.price);
    const weightKg = Number(product?.weight);

    subtotalInr += (Number.isFinite(price) ? price : 0) * item.quantity;
    totalWeightGrams +=
      (Number.isFinite(weightKg) && weightKg > 0
        ? weightKg * 1000
        : SAMORA_DEFAULT_ITEM_WEIGHT_GRAMS) * item.quantity;

    // Unknown product (lookup failed) or a non-Samora product both fail the
    // "cart is Samora-only" check — err on the side of not applying
    // Samora-exclusive perks (gift wrap fee still applies either way).
    if (!product || !hasSamoraTag(product.tags)) {
      allItemsAreSamora = false;
    }
  }

  return { subtotalInr, totalWeightGrams, allItemsAreSamora };
};
