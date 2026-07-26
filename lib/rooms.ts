import { decodeHtmlEntities } from "@/utils/text";

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";
const STOREFRONT_REVALIDATE_SECONDS = 60;

type WooStorePrices = {
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  price: string;
  regular_price: string;
  sale_price: string;
};

type WooStoreImage = {
  id: number;
  src: string;
  alt?: string;
  name?: string;
};

type WooStoreProduct = {
  id: number;
  slug: string;
  name: string;
  images: WooStoreImage[];
  prices: WooStorePrices;
};

export type RoomProductCard = {
  id: number;
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  price: number | null;
  currencyCode: string;
  currencySymbol: string;
};

const getApiBaseUrl = () => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || DEFAULT_WOOCOMMERCE_SITE_URL;
  return apiBaseUrl.replace(/\/+$/, "");
};

export const fetchProductsBySlugs = async (
  slugs: readonly string[]
): Promise<RoomProductCard[]> => {
  if (slugs.length === 0) return [];

  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(
      `${apiBaseUrl}/wp-json/wc/store/v1/products?slug=${slugs.join(",")}&per_page=${slugs.length}`,
      {
        next: { revalidate: STOREFRONT_REVALIDATE_SECONDS },
      }
    );

    if (!response.ok) {
      return [];
    }

    const products = (await response.json()) as WooStoreProduct[];
    if (!Array.isArray(products)) return [];

    const bySlug = new Map(products.map((product) => [product.slug, product]));

    return slugs
      .map((slug) => bySlug.get(slug))
      .filter((product): product is WooStoreProduct => Boolean(product))
      .map((product) => {
        const minorUnit = product.prices?.currency_minor_unit ?? 2;
        const numericPrice = product.prices?.price
          ? Number(product.prices.price) / 10 ** minorUnit
          : null;

        return {
          id: product.id,
          slug: product.slug,
          name: decodeHtmlEntities(product.name),
          image: product.images?.[0]?.src || FALLBACK_PRODUCT_IMAGE,
          imageAlt: decodeHtmlEntities(
            product.images?.[0]?.alt || product.images?.[0]?.name || product.name
          ),
          price: numericPrice,
          currencyCode: product.prices?.currency_code || "INR",
          currencySymbol: product.prices?.currency_symbol || "Rs. ",
        };
      });
  } catch {
    return [];
  }
};
