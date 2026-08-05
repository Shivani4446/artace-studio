// Server-only: fetches real per-unit price + weight from WooCommerce so
// checkout pricing (gift fee eligibility, free-shipping threshold, Delhivery
// weight) is based on authoritative data, never trusted from the client.
import { SAMORA_DEFAULT_ITEM_WEIGHT_GRAMS } from "@/lib/samora/pricing";

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

type WooV3Product = { id: number; price?: string; weight?: string };

export const fetchLineItemTotals = async (
  lineItems: { product_id: number; quantity: number }[]
): Promise<{ subtotalInr: number; totalWeightGrams: number }> => {
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  const apiBaseUrl = (
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    process.env.WOOCOMMERCE_REST_URL ||
    DEFAULT_WOOCOMMERCE_SITE_URL
  ).replace(/\/+$/, "");

  const uniqueIds = Array.from(new Set(lineItems.map((item) => item.product_id)));
  const productsById = new Map<number, WooV3Product>();

  if (consumerKey && consumerSecret && uniqueIds.length > 0) {
    try {
      const basicToken = toBasicAuthToken(consumerKey, consumerSecret);
      const response = await fetch(
        `${apiBaseUrl}/wp-json/wc/v3/products?include=${uniqueIds.join(",")}&per_page=${uniqueIds.length}`,
        { headers: { Authorization: `Basic ${basicToken}` }, cache: "no-store" }
      );
      if (response.ok) {
        const payload = (await response.json()) as WooV3Product[];
        if (Array.isArray(payload)) {
          payload.forEach((product) => productsById.set(product.id, product));
        }
      }
    } catch {
      // Fall through — items with unknown price/weight use the fallbacks below.
    }
  }

  let subtotalInr = 0;
  let totalWeightGrams = 0;

  for (const item of lineItems) {
    const product = productsById.get(item.product_id);
    const price = Number(product?.price);
    const weightKg = Number(product?.weight);

    subtotalInr += (Number.isFinite(price) ? price : 0) * item.quantity;
    totalWeightGrams +=
      (Number.isFinite(weightKg) && weightKg > 0
        ? weightKg * 1000
        : SAMORA_DEFAULT_ITEM_WEIGHT_GRAMS) * item.quantity;
  }

  return { subtotalInr, totalWeightGrams };
};
