import type { Metadata } from "next";
import SamoraCorporateGifting from "@/components/samora/SamoraCorporateGifting";
import type { SamoraProduct } from "@/components/samora/SamoraProductCard";
import { decodeHtmlEntities } from "@/utils/text";
import { fetchWithRetry } from "@/lib/http/fetch-with-retry";
import { SAMORA_TAG_SLUG } from "@/lib/samora/products";

export const runtime = "edge";
export const revalidate = 60;

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";
const GIFTING_PRODUCTS_LIMIT = 4;

type WooStorePrices = {
  currency_minor_unit: number;
  price: string;
  regular_price: string;
  currency_symbol: string;
};
type WooStoreImage = { src: string; alt?: string };
type WooStoreCategory = { name: string; slug: string };
type WooStoreProduct = {
  id: number;
  slug: string;
  name: string;
  images: WooStoreImage[];
  prices: WooStorePrices;
  categories?: WooStoreCategory[];
};

const parsePrice = (rawValue: string | undefined, minorUnit: number) => {
  if (!rawValue) return null;
  const numericValue = Number(rawValue);
  if (Number.isNaN(numericValue)) return null;
  return numericValue / 10 ** minorUnit;
};

const getGiftingProducts = async (): Promise<SamoraProduct[]> => {
  try {
    const apiBaseUrl = (
      process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
      process.env.WOOCOMMERCE_REST_URL ||
      DEFAULT_WOOCOMMERCE_SITE_URL
    ).replace(/\/+$/, "");

    const queryParams = new URLSearchParams({
      per_page: String(GIFTING_PRODUCTS_LIMIT),
      tag: SAMORA_TAG_SLUG,
      orderby: "popularity",
      order: "desc",
    });

    const response = await fetchWithRetry(
      `${apiBaseUrl}/wp-json/wc/store/v1/products?${queryParams.toString()}`,
      { next: { revalidate } }
    );
    if (!response.ok) return [];

    const payload = (await response.json()) as WooStoreProduct[];
    if (!Array.isArray(payload)) return [];

    return payload.map((product) => {
      const minorUnit = product.prices?.currency_minor_unit ?? 2;
      const primaryImage = product.images?.[0];
      return {
        id: product.id,
        slug: product.slug,
        name: decodeHtmlEntities(product.name),
        image: primaryImage?.src || FALLBACK_PRODUCT_IMAGE,
        imageAlt: decodeHtmlEntities(primaryImage?.alt || product.name),
        price: parsePrice(product.prices?.price, minorUnit),
        regularPrice: parsePrice(product.prices?.regular_price, minorUnit),
        currencySymbol: product.prices?.currency_symbol || "Rs. ",
        categories: (product.categories ?? []).map((category) => ({
          name: decodeHtmlEntities(category.name),
          slug: category.slug,
        })),
        attributes: [],
      };
    });
  } catch {
    return [];
  }
};

const TITLE = "Corporate Gifting | Samora by Artace Studio";
const DESCRIPTION =
  "Handcrafted corporate gifts from Samora — personalized tote bags, tea coasters, trays, and name plates for employee gifting, festive client hampers, and events. Bulk pricing, GST invoicing, pan-India delivery.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/samora/corporate-gifting",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/samora/corporate-gifting",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const SamoraCorporateGiftingPage = async () => {
  const products = await getGiftingProducts();

  return <SamoraCorporateGifting products={products} />;
};

export default SamoraCorporateGiftingPage;
