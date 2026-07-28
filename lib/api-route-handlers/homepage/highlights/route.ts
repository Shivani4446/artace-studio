import { NextResponse } from "next/server";
import { decodeHtmlEntities } from "@/utils/text";

export const runtime = "edge";

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";
const FEATURED_PRODUCTS_LIMIT = 4;
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

type WooStoreCategory = {
  id: number;
  name: string;
  slug: string;
};

type WooStoreAttributeTerm = {
  id: number;
  name: string;
  slug: string;
};

type WooStoreAttribute = {
  id: number;
  name: string;
  terms?: WooStoreAttributeTerm[];
  options?: string[];
};

type WooStoreProduct = {
  id: number;
  slug: string;
  name: string;
  images: WooStoreImage[];
  categories: WooStoreCategory[];
  attributes?: WooStoreAttribute[];
  prices: WooStorePrices;
};

export type FeaturedProductCard = {
  id: number;
  slug: string;
  title: string;
  sizesLabel: string;
  image: string;
  alt: string;
  categoryLabel: string;
  subtitle: string;
  price: number | null;
};

const getApiBaseUrl = () => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || DEFAULT_WOOCOMMERCE_SITE_URL;
  return apiBaseUrl.replace(/\/+$/, "");
};

const parseMinorUnitPrice = (
  rawValue: string | undefined,
  minorUnit: number
): number | null => {
  if (!rawValue) return null;
  const numericValue = Number(rawValue);
  if (Number.isNaN(numericValue)) return null;
  return numericValue / 10 ** minorUnit;
};

const getAttributeOptions = (attribute: WooStoreAttribute) => {
  const optionsFromList = attribute.options ?? [];
  const optionsFromTerms = (attribute.terms ?? []).map((term) => term.name);
  return Array.from(
    new Set(
      [...optionsFromList, ...optionsFromTerms]
        .map((value) => decodeHtmlEntities(value).trim())
        .filter(Boolean)
    )
  );
};

const getSizesLabel = (attributes: WooStoreAttribute[] | undefined) => {
  const sizeOptions = (attributes ?? [])
    .filter((attribute) => /size|dimension/i.test(attribute.name))
    .flatMap(getAttributeOptions);

  const uniqueSizeOptions = Array.from(new Set(sizeOptions));
  if (uniqueSizeOptions.length === 0) return "Custom Sizes";
  return `${uniqueSizeOptions.length} Size${uniqueSizeOptions.length === 1 ? "" : "s"}`;
};

const normalizeFeaturedProducts = (
  products: WooStoreProduct[]
): FeaturedProductCard[] => {
  return products.slice(0, FEATURED_PRODUCTS_LIMIT).map((product) => {
    const minorUnit = product.prices?.currency_minor_unit ?? 2;
    const primaryImage = product.images?.[0];
    const imageUrl = primaryImage?.src || FALLBACK_PRODUCT_IMAGE;
    const title = decodeHtmlEntities(product.name);
    const categoryLabel = decodeHtmlEntities(
      product.categories?.[0]?.name || "Handmade Painting"
    );
    const sizesLabel = getSizesLabel(product.attributes);
    const subtitle = `Handmade Painting | ${sizesLabel} | Acrylic Colors on Canvas`;

    return {
      id: product.id,
      slug: product.slug,
      title,
      sizesLabel,
      image: imageUrl,
      alt: decodeHtmlEntities(primaryImage?.alt || title),
      categoryLabel,
      subtitle,
      price: parseMinorUnitPrice(product.prices?.price, minorUnit),
    };
  });
};

const getFeaturedProducts = async (): Promise<FeaturedProductCard[]> => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(
      `${apiBaseUrl}/wp-json/wc/store/v1/products?featured=true&per_page=${FEATURED_PRODUCTS_LIMIT}&orderby=date&order=desc`,
      {
        next: { revalidate: STOREFRONT_REVALIDATE_SECONDS },
      }
    );

    if (!response.ok) return [];

    const payload = (await response.json()) as WooStoreProduct[];
    if (!Array.isArray(payload)) return [];

    return normalizeFeaturedProducts(payload);
  } catch {
    return [];
  }
};

export async function GET() {
  try {
    const featuredProducts = await getFeaturedProducts();

    return NextResponse.json(
      { featuredProducts },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load homepage highlights.";

    return NextResponse.json(
      { featuredProducts: [], error: message },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
