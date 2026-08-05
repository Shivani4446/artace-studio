import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SamoraSingleProduct, {
  type SamoraProductDetail,
} from "@/components/samora/SamoraSingleProduct";
import type { SamoraProduct } from "@/components/samora/SamoraProductCard";
import { decodeHtmlEntities, stripHtmlAndDecode } from "@/utils/text";
import { generateProductSchema } from "@/lib/schema";
import { fetchWithRetry } from "@/lib/http/fetch-with-retry";
import { buildSiteUrl } from "@/lib/site";
import { hasSamoraTag, SAMORA_TAG_SLUG } from "@/lib/samora/products";

export const runtime = "edge";
export const revalidate = 120;

type SingleProductPageProps = {
  params: Promise<{ slug: string }>;
};

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";
const RELATED_PRODUCTS_LIMIT = 4;

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
};

type WooStoreTag = { id: number; name: string; slug: string };
type WooStoreCategory = { id: number; name: string; slug: string };

type WooStoreAttribute = {
  id: number;
  name: string;
  options?: string[];
  terms?: { id: number; name: string; slug: string }[];
};

type WooStoreProduct = {
  id: number;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  sku: string;
  on_sale: boolean;
  average_rating: string;
  review_count: number;
  stock_status: string;
  images: WooStoreImage[];
  categories: WooStoreCategory[];
  tags?: WooStoreTag[];
  attributes: WooStoreAttribute[];
  prices: WooStorePrices;
};

type WooV3VariationAttribute = { name?: string; option?: string };
type WooV3Variation = {
  id: number;
  attributes?: WooV3VariationAttribute[];
  price?: string;
  regular_price?: string;
  is_in_stock?: boolean;
};

type WooV3MetaDataItem = { key?: string; value?: unknown };
type WooV3Product = { meta_data?: WooV3MetaDataItem[]; weight?: string };

// Same ACF meta keys WooCommerce stores for every product (originally used
// for paintings) — Samora products are tagged with the same fields, so this
// pulls real per-product specs rather than fabricating any.
const SPEC_META_KEY_LABELS: Record<string, string> = {
  artist: "Handcrafted By",
  product_type: "Product Type",
  material: "Material",
  colors: "Color",
  size_in_centimetres: "Size (cm)",
  width_inches: "Width (inches)",
  height_inches: "Height (inches)",
  orientation: "Orientation",
  customizable: "Customizable",
  certificate_provided: "Certificate Provided",
  country_of_origin: "Origin",
};
const SPEC_META_KEY_ORDER = Object.keys(SPEC_META_KEY_LABELS);

const getApiBaseUrl = () => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    process.env.WOOCOMMERCE_REST_URL ||
    DEFAULT_WOOCOMMERCE_SITE_URL;
  return apiBaseUrl.replace(/\/+$/, "");
};

const toBasicAuthToken = (username: string, password: string) => {
  const raw = `${username}:${password}`;
  if (typeof btoa === "function") return btoa(raw);
  const maybeBuffer = (globalThis as { Buffer?: { from: (v: string) => { toString: (enc: string) => string } } })
    .Buffer;
  if (maybeBuffer) return maybeBuffer.from(raw).toString("base64");
  throw new Error("No base64 encoder available.");
};

const parsePrice = (rawValue: string | undefined, minorUnit = 2): number | null => {
  if (!rawValue) return null;
  const numericValue = Number(rawValue);
  if (Number.isNaN(numericValue)) return null;
  return numericValue / 10 ** minorUnit;
};

const fetchStoreProducts = async (queryString: string): Promise<WooStoreProduct[]> => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetchWithRetry(
      `${apiBaseUrl}/wp-json/wc/store/v1/products?${queryString}`,
      { next: { revalidate } }
    );
    if (!response.ok) return [];
    const payload = (await response.json()) as WooStoreProduct[];
    return Array.isArray(payload) ? payload : [];
  } catch {
    return [];
  }
};

const getSingleSamoraProduct = async (slug: string): Promise<WooStoreProduct | null> => {
  const query = `slug=${encodeURIComponent(slug)}&per_page=1`;
  const products = await fetchStoreProducts(query);
  const product = products[0];
  if (!product) return null;

  // This route is exclusively for Samora-tagged products — everything else
  // belongs at /shop/[slug].
  if (!hasSamoraTag(product.tags)) return null;

  return product;
};

const fetchProductVariations = async (productId: number) => {
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) return [];

  const basicToken = toBasicAuthToken(consumerKey, consumerSecret);

  try {
    const response = await fetch(
      `${getApiBaseUrl()}/wp-json/wc/v3/products/${productId}/variations?per_page=100`,
      {
        headers: { Authorization: `Basic ${basicToken}` },
        next: { revalidate },
      }
    );
    if (!response.ok) return [];
    const payload = (await response.json()) as WooV3Variation[];
    if (!Array.isArray(payload)) return [];

    return payload.map((variation) => ({
      id: variation.id,
      attributes: (variation.attributes ?? []).map((attr) => ({
        name: attr.name ?? "",
        value: attr.option ?? "",
      })),
      price: parsePrice(variation.price, 2),
      regularPrice: parsePrice(variation.regular_price, 2),
      inStock: variation.is_in_stock !== false,
    }));
  } catch {
    return [];
  }
};

const fetchProductSpecs = async (
  productId: number,
  sku: string
): Promise<{ specs: { label: string; value: string }[]; weightKg: number | null }> => {
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) return { specs: [], weightKg: null };

  const basicToken = toBasicAuthToken(consumerKey, consumerSecret);

  try {
    const response = await fetch(`${getApiBaseUrl()}/wp-json/wc/v3/products/${productId}`, {
      headers: { Authorization: `Basic ${basicToken}` },
      next: { revalidate },
    });
    if (!response.ok) return { specs: [], weightKg: null };

    const payload = (await response.json()) as WooV3Product;
    const metaByKey = new Map(
      (payload.meta_data ?? []).map((meta) => [meta.key, meta.value])
    );

    const specs = SPEC_META_KEY_ORDER.map((key) => {
      const rawValue = metaByKey.get(key);
      const value = typeof rawValue === "string" ? decodeHtmlEntities(rawValue).trim() : "";
      if (!value) return null;
      return { label: SPEC_META_KEY_LABELS[key], value };
    }).filter((spec): spec is { label: string; value: string } => spec !== null);

    if (sku) specs.push({ label: "SKU", value: sku });

    const weight = Number(payload.weight);
    const weightKg = Number.isFinite(weight) && weight > 0 ? weight : null;
    if (weightKg) {
      specs.push({ label: "Weight", value: `${weightKg} kg` });
    }

    return { specs, weightKg };
  } catch {
    return { specs: [], weightKg: null };
  }
};

const getAttributeOptions = (attribute: WooStoreAttribute) => {
  const optionsFromList = attribute.options ?? [];
  const optionsFromTerms = (attribute.terms ?? []).map((term) => term.name);
  return Array.from(
    new Set(
      [...optionsFromList, ...optionsFromTerms].map((value) => decodeHtmlEntities(value).trim()).filter(Boolean)
    )
  );
};

const toSamoraProductCard = (product: WooStoreProduct): SamoraProduct => {
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
    attributes: (product.attributes ?? [])
      .map((attribute) => ({
        name: decodeHtmlEntities(attribute.name),
        options: getAttributeOptions(attribute),
      }))
      .filter((attribute) => attribute.options.length > 0),
  };
};

const getOtherSamoraProducts = async (excludeId: number): Promise<SamoraProduct[]> => {
  const products = await fetchStoreProducts(
    `tag=${SAMORA_TAG_SLUG}&per_page=${RELATED_PRODUCTS_LIMIT + 1}&orderby=date&order=desc`
  );
  return products
    .filter((product) => product.id !== excludeId)
    .slice(0, RELATED_PRODUCTS_LIMIT)
    .map(toSamoraProductCard);
};

export async function generateMetadata({ params }: SingleProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getSingleSamoraProduct(slug);

  if (!product) {
    notFound();
  }

  const name = decodeHtmlEntities(product.name);
  const description = stripHtmlAndDecode(product.short_description || product.description || "").slice(0, 160);
  const productUrl = buildSiteUrl(`/samora/shop/${product.slug}`);
  const image = product.images?.[0]?.src;

  return {
    title: `${name} | Samora by Artace Studio`,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: name,
      description,
      url: productUrl,
      type: "website",
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | Samora`,
      description,
      images: image ? [image] : [],
    },
  };
}

const SamoraSingleProductPage = async ({ params }: SingleProductPageProps) => {
  const { slug } = await params;
  const product = await getSingleSamoraProduct(slug);

  if (!product) {
    notFound();
  }

  const [variations, relatedProducts, { specs, weightKg }] = await Promise.all([
    fetchProductVariations(product.id),
    getOtherSamoraProducts(product.id),
    fetchProductSpecs(product.id, product.sku || ""),
  ]);

  const minorUnit = product.prices?.currency_minor_unit ?? 2;

  const productDetail: SamoraProductDetail = {
    id: product.id,
    slug: product.slug,
    name: decodeHtmlEntities(product.name),
    shortDescription: product.short_description || "",
    description: product.description || "",
    sku: decodeHtmlEntities(product.sku || ""),
    images: (product.images || []).map((image) => ({
      id: image.id,
      src: image.src,
      alt: decodeHtmlEntities(image.alt || product.name),
    })),
    attributes: (product.attributes || []).map((attribute) => ({
      id: attribute.id,
      name: decodeHtmlEntities(attribute.name),
      options: getAttributeOptions(attribute),
    })),
    price: parsePrice(product.prices?.price, minorUnit),
    regularPrice: parsePrice(product.prices?.regular_price, minorUnit),
    currencySymbol: product.prices?.currency_symbol || "Rs. ",
    onSale: Boolean(product.on_sale),
    stockStatus: product.stock_status || "instock",
    averageRating: Number(product.average_rating) || 0,
    reviewCount: product.review_count || 0,
    variations,
    specs,
    weightKg,
  };

  const schema = generateProductSchema(
    {
      ...product,
      // Samora has no /collections/[slug] pages, so the breadcrumb schema
      // shouldn't link a category there — keep it to Home > Product Name.
      categories: [],
      attributes: product.attributes.map((attribute) => ({
        ...attribute,
        options: attribute.options ?? [],
      })),
    },
    undefined,
    undefined,
    { brand: "Samora", shopPath: "/samora/shop" }
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <SamoraSingleProduct product={productDetail} relatedProducts={relatedProducts} />
    </>
  );
};

export default SamoraSingleProductPage;
