const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";

const toBasicAuthToken = (username: string, password: string) => {
  const raw = `${username}:${password}`;
  if (typeof btoa === "function") return btoa(raw);
  const maybeBuffer = globalThis as {
    Buffer?: { from: (v: string) => { toString: (enc: string) => string } };
  };
  if (maybeBuffer.Buffer) return maybeBuffer.Buffer.from(raw).toString("base64");
  throw new Error("No base64 encoder available.");
};

/**
 * A product as returned by the WooCommerce Admin API (wc/v3/products).
 *
 * Note the price unit difference from the public Store API used elsewhere in
 * this codebase: wc/v3 returns MAJOR units ("150000.00" for INR 1,50,000),
 * while wc/store/v1 returns MINOR units ("15000000"). Do not mix the two up
 * — this is exactly the class of bug fixed in lib/schema/offer.ts.
 */
export type WooV3Product = {
  id: number;
  name?: string;
  price?: string;
  regular_price?: string;
  weight?: string;
  sku?: string;
  stock_status?: string;
  stock_quantity?: number | null;
  manage_stock?: boolean;
  sold_individually?: boolean;
  categories?: { id: number; name: string; slug: string }[];
  tags?: { id: number; slug: string }[];
  meta_data?: { key: string; value: unknown }[];
};

/**
 * Batch-fetches real catalog prices (and full product records, for callers
 * that need more than price — see fetchLineItemTotals in lib/samora/pricing.server.ts)
 * via the Admin API. Returns an empty map on any failure — callers must treat
 * a missing id as "price unknown," never as zero-and-therefore-free.
 */
export const fetchCatalogProducts = async (
  productIds: number[]
): Promise<Map<number, WooV3Product>> => {
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  const apiBaseUrl = (
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    process.env.WOOCOMMERCE_REST_URL ||
    DEFAULT_WOOCOMMERCE_SITE_URL
  ).replace(/\/+$/, "");

  const uniqueIds = Array.from(new Set(productIds));
  const productsById = new Map<number, WooV3Product>();
  if (!consumerKey || !consumerSecret || uniqueIds.length === 0) return productsById;

  try {
    const basicToken = toBasicAuthToken(consumerKey, consumerSecret);
    const response = await fetch(
      `${apiBaseUrl}/wp-json/wc/v3/products?include=${uniqueIds.join(",")}&per_page=${uniqueIds.length}`,
      { headers: { Authorization: `Basic ${basicToken}` }, cache: "no-store" }
    );
    if (response.ok) {
      const payload = (await response.json()) as WooV3Product[];
      if (Array.isArray(payload)) payload.forEach((product) => productsById.set(product.id, product));
    }
  } catch {
    // Empty map — callers fall back to treating price as unknown.
  }

  return productsById;
};

export const fetchCatalogPrices = async (productIds: number[]): Promise<Map<number, number>> => {
  const products = await fetchCatalogProducts(productIds);
  const prices = new Map<number, number>();
  for (const [id, product] of products) {
    const price = Number(product.price);
    if (Number.isFinite(price)) prices.set(id, price);
  }
  return prices;
};
