import React from "react";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
const SingleProduct = dynamic(() =>
  import("@/components/singleproduct/SingleProduct").then((mod) => mod.default)
);
import { decodeHtmlEntities, stripHtmlAndDecode } from "@/utils/text";
import { generateProductSchema } from "@/lib/schema";
import { getFakeRating } from "@/lib/reviews/fake-rating";
import { isAtelierProduct } from "@/lib/atelier";
import {
  EMPTY_ATELIER_META,
  readAtelierMeta,
  type AtelierMeta,
} from "@/lib/atelier/meta";
import { fetchWithRetry } from "@/lib/http/fetch-with-retry";
import { buildSiteUrl } from "@/lib/site";
import { hasSamoraTag } from "@/lib/samora/products";
import { getArtistForProduct } from "@/lib/artists/directory";

export const runtime = 'edge';
export const revalidate = 120;

type SingleProductPageProps = {
  params: Promise<{ slug: string }>;
};

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const RELATED_PRODUCTS_LIMIT = 4;
const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";
const PRODUCT_INFORMATION_ATTRIBUTE_NAME = "Product Information";
const PRODUCT_INFORMATION_KEY = "product_information";
const PRODUCT_INFORMATION_GROUP_KEY = "group_68864bb8de1e7";
const PRODUCT_INFORMATION_META_KEYS = [
  "size_in_centimetres",
  "customizable",
  "product_type",
  "colors",
  "material",
  "width_inches",
  "height_inches",
  "orientation",
  "certificate_provided",
  "country_of_origin",
];

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
  thumbnail?: string;
  alt?: string;
  name?: string;
};

type WooStoreCategory = {
  id: number;
  name: string;
  slug: string;
};

type WooStoreTag = {
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

type VariationData = {
  id: number;
  attributes: { name: string; value: string }[];
  price: number | null;
  regularPrice: number | null;
  salePrice: number | null;
  onSale: boolean;
  inStock: boolean;
};

type WooStoreProduct = {
  id: number;
  slug: string;
  permalink: string;
  name: string;
  short_description: string;
  description: string;
  sku: string;
  on_sale: boolean;
  average_rating: string;
  review_count: number;
  type?: "simple" | "variable" | string;
  stock_status: "instock" | "outofstock" | "onbackorder" | string;
  stock_quantity: number | null;
  images: WooStoreImage[];
  categories: WooStoreCategory[];
  tags?: WooStoreTag[];
  attributes: WooStoreAttribute[];
  prices: WooStorePrices;
  related_ids?: number[];
  related?: number[];
  upsell_ids?: number[];
  cross_sell_ids?: number[];
  variations?: VariationData[];
  faqs?: { question: string; answer: string }[];
};

type RelatedProductCard = {
  id: number | string;
  title: string;
  sizes: string;
  image: string;
  href?: string;
};

type ReadMoreCard = {
  id: number | string;
  category: string;
  title: string;
  image: string;
  href?: string;
};

type WooV3ProductAttribute = {
  id: number;
  name: string;
  options?: string[];
};

type WooV3MetaDataItem = {
  key?: string;
  value?: unknown;
};

type WooV3Product = {
  attributes?: WooV3ProductAttribute[];
  meta_data?: WooV3MetaDataItem[];
  acf?: Record<string, unknown>;
};

type WordPressProductResponse = {
  acf?: Record<string, unknown>;
  meta?: Record<string, unknown> | unknown[];
};

const getApiBaseUrl = () => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    process.env.WOOCOMMERCE_REST_URL ||
    DEFAULT_WOOCOMMERCE_SITE_URL;
  return apiBaseUrl.replace(/\/+$/, "");
};

const getWooServerConfig = () => {
  // Reuse the same host resolution as the public Store API. WOOCOMMERCE_SITE_URL
  // is commonly set to the storefront domain (e.g. artacestudio.com), which has no
  // /wp-json route — the WordPress/WooCommerce REST API always lives at the host
  // resolved by getApiBaseUrl() (WOOCOMMERCE_REST_URL / api.artacestudio.com).
  return {
    siteUrl: getApiBaseUrl(),
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  };
};

const toBasicAuthToken = (username: string, password: string) => {
  const raw = `${username}:${password}`;
  if (typeof btoa === "function") return btoa(raw);

  const maybeBuffer = (globalThis as { Buffer?: { from: (v: string) => { toString: (enc: string) => string } } }).Buffer;
  if (maybeBuffer) return maybeBuffer.from(raw).toString("base64");

  throw new Error("No base64 encoder available.");
};

const parseWooCommerceDecimalPrice = (rawValue: string | undefined): number | null => {
  if (!rawValue) return null;
  const numericValue = Number(rawValue);
  if (Number.isNaN(numericValue)) return null;
  return numericValue;
};

type StoreProductsResult =
  | { ok: true; products: WooStoreProduct[] }
  // WordPress answered with an error (429 rate limit, 5xx) or was unreachable.
  // Must never be treated as "product doesn't exist" — that's what used to
  // turn every rate-limited request into a 404.
  | { ok: false; status: number };

const fetchStoreProductsResult = async (
  queryString: string,
  cacheOptions: RequestInit = { next: { revalidate } }
): Promise<StoreProductsResult> => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    let response = await fetchWithRetry(
      `${apiBaseUrl}/wp-json/wc/store/v1/products?${queryString}`,
      cacheOptions
    );

    // Only a 404 on the route itself (pretty permalinks disabled) warrants
    // the ?rest_route= fallback — never a 429/5xx, which would just double
    // the load on an already-struggling origin.
    if (response.status === 404) {
      response = await fetchWithRetry(
        `${apiBaseUrl}/?rest_route=${encodeURIComponent(
          `/wc/store/v1/products?${queryString}`
        )}`,
        cacheOptions
      );
    }

    if (!response.ok) return { ok: false, status: response.status };
    const payload = (await response.json()) as WooStoreProduct[];
    return { ok: true, products: Array.isArray(payload) ? payload : [] };
  } catch {
    return { ok: false, status: 0 };
  }
};

const fetchStoreProducts = async (
  queryString: string,
  cacheOptions?: RequestInit
): Promise<WooStoreProduct[]> => {
  const result = await fetchStoreProductsResult(queryString, cacheOptions);
  return result.ok ? result.products : [];
};

// Thrown (not exported — page files may only export Next's known fields) so
// the route's error.tsx renders a "busy, retrying" page instead of a 404.
class StorefrontUnavailableError extends Error {
  constructor(status: number) {
    super(`WooCommerce is temporarily unavailable (status ${status || "network"}).`);
    this.name = "StorefrontUnavailableError";
  }
}

const withFakeRating = (product: WooStoreProduct): WooStoreProduct => {
  // Atelier pieces are one-of-one originals and are deliberately left with
  // WooCommerce's real (empty) rating values. Overwriting them with invented
  // 3.9–5.0 stars and 12–89 reviews would both show fabricated social proof
  // on a premium product and publish an `aggregateRating` for reviews that
  // do not exist. generateAggregateRatingSchema already returns null for
  // empty values, so simply not overwriting here emits no rating at all.
  if (isAtelierProduct(product)) {
    return product;
  }

  const fakeRating = getFakeRating(product.id);
  return {
    ...product,
    average_rating: fakeRating.rating.toFixed(1),
    review_count: fakeRating.reviewCount,
  };
};

// Short window for re-checking an apparent miss. Keeps "just published"
// products from being stuck behind the 120s cache, without letting bots that
// crawl random /shop/<slug> URLs force an uncached WordPress hit every time
// (the old `cache: "no-store"` re-check did exactly that).
const MISS_RECHECK_REVALIDATE_SECONDS = 15;

// React.cache shares one lookup between generateMetadata and the page itself
// within a single request.
const getSingleProduct = React.cache(
  async (slug: string): Promise<WooStoreProduct | null> => {
    const query = `slug=${encodeURIComponent(slug)}&per_page=1`;
    let result = await fetchStoreProductsResult(query);

    if (result.ok && result.products.length === 0) {
      // A cached miss can mean the product was only just published. Re-check
      // on a short-lived cache entry before giving up.
      result = await fetchStoreProductsResult(`${query}&_recheck=1`, {
        next: { revalidate: MISS_RECHECK_REVALIDATE_SECONDS },
      });
    }

    // WordPress errored or rate-limited us: surface it as a temporary error,
    // never as a 404 (a 404 tells Google the painting is gone).
    if (!result.ok) throw new StorefrontUnavailableError(result.status);

    const product = result.products[0];
    if (!product) return null;

    // Samora-tagged products live exclusively at /samora/shop/[slug].
    if (hasSamoraTag(product.tags)) return null;

    return withFakeRating(product);
  }
);

const parseProductInformationText = (value: string) => {
  return value
    .replace(/<\/li>\s*<li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .split(/\r?\n|\|/g)
    .map((item) => decodeHtmlEntities(item).trim())
    .filter(Boolean);
};

const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const productInformationMetaKeySet = new Set(
  PRODUCT_INFORMATION_META_KEYS.map((key) => normalizeKey(key))
);

const isProductInformationKey = (key: string) => {
  const normalized = normalizeKey(key);
  return (
    normalized === normalizeKey(PRODUCT_INFORMATION_GROUP_KEY) ||
    normalized === normalizeKey(PRODUCT_INFORMATION_KEY) ||
    normalized === "productinformation" ||
    normalized === "specifications"
  );
};

const isProductInformationMetaKey = (key: string) => {
  const normalized = normalizeKey(key);
  return (
    productInformationMetaKeySet.has(normalized) || isProductInformationKey(key)
  );
};

const toMetaLabel = (key: string) => {
  const cleanKey = key.trim().replace(/^_+/, "");
  return cleanKey
    .split("_")
    .filter(Boolean)
    .map((part) =>
      part
        .split("&")
        .map((chunk) =>
          chunk ? chunk[0].toUpperCase() + chunk.slice(1).toLowerCase() : chunk
        )
        .join("&")
    )
    .join(" ")
    .replace(/\s*&\s*/g, " & ");
};

const findValuesByMatchingKeys = (value: unknown): unknown[] => {
  if (!value || typeof value !== "object") return [];
  const objectValue = value as Record<string, unknown>;

  const directMatches = Object.entries(objectValue)
    .filter(([key]) => isProductInformationKey(key))
    .map(([, fieldValue]) => fieldValue);

  const nestedMatches = Object.values(objectValue).flatMap((childValue) =>
    findValuesByMatchingKeys(childValue)
  );

  return [...directMatches, ...nestedMatches];
};

const findValuesByGroupKey = (value: unknown): unknown[] => {
  if (!value || typeof value !== "object") return [];
  const objectValue = value as Record<string, unknown>;

  const directGroupMatches = Object.entries(objectValue)
    .filter(([key]) => normalizeKey(key) === normalizeKey(PRODUCT_INFORMATION_GROUP_KEY))
    .map(([, fieldValue]) => fieldValue);

  const nestedGroupMatches = Object.values(objectValue).flatMap((childValue) =>
    findValuesByGroupKey(childValue)
  );

  return [...directGroupMatches, ...nestedGroupMatches];
};

const normalizeInformationValue = (value: unknown): string[] => {
  if (typeof value === "string") return parseProductInformationText(value);
  if (typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeInformationValue(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((item) =>
      normalizeInformationValue(item)
    );
  }

  return [];
};

const normalizeProductInformationItems = (items: string[]) =>
  Array.from(
    new Set(
      items
        .flatMap((item) => parseProductInformationText(item))
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

const getProductInformationFromStoreProduct = (product: WooStoreProduct) => {
  const fromAttributes = (product.attributes ?? [])
    .filter((attribute) => /product information/i.test(attribute.name))
    .flatMap(getAttributeOptions);

  return normalizeProductInformationItems(fromAttributes);
};

const getProductInformationFromWooV3Product = (product: WooV3Product) => {
  const fromAttributes = (product.attributes ?? [])
    .filter((attribute) => /product information/i.test(attribute.name))
    .flatMap((attribute) => normalizeInformationValue(attribute.options ?? []));

  const fromMetaData = (product.meta_data ?? [])
    .filter((meta) => {
      const key = (meta.key ?? "").trim();
      if (!key || key.startsWith("_")) return false;
      return isProductInformationMetaKey(key);
    })
    .flatMap((meta) => {
      const label = toMetaLabel(meta.key ?? "");
      return normalizeInformationValue(meta.value).map((item) =>
        label ? `${label}: ${item}` : item
      );
    });

  const acfPayload = product.acf ?? {};
  const fromAcf = findValuesByMatchingKeys(acfPayload).flatMap((value) =>
    normalizeInformationValue(value)
  );
  const fromAcfGroupKey = findValuesByGroupKey(acfPayload).flatMap((groupValue) =>
    findValuesByMatchingKeys(groupValue).length > 0
      ? findValuesByMatchingKeys(groupValue).flatMap((value) =>
          normalizeInformationValue(value)
        )
      : normalizeInformationValue(groupValue)
  );

  return normalizeProductInformationItems([
    ...fromAttributes,
    ...fromMetaData,
    ...fromAcf,
    ...fromAcfGroupKey,
  ]);
};

const getProductInformationFromWordPressProduct = (
  product: WordPressProductResponse
) => {
  const acfPayload = product.acf ?? {};
  const fromAcf = findValuesByMatchingKeys(acfPayload).flatMap((value) =>
    normalizeInformationValue(value)
  );
  const fromAcfGroupKey = findValuesByGroupKey(acfPayload).flatMap((groupValue) =>
    findValuesByMatchingKeys(groupValue).length > 0
      ? findValuesByMatchingKeys(groupValue).flatMap((value) =>
          normalizeInformationValue(value)
        )
      : normalizeInformationValue(groupValue)
  );

  const fromMetaObject =
    product.meta && !Array.isArray(product.meta)
      ? Object.entries(product.meta)
          .filter(([key]) => isProductInformationMetaKey(key))
          .flatMap(([key, value]) => {
            const label = toMetaLabel(key);
            return normalizeInformationValue(value).map((item) =>
              label ? `${label}: ${item}` : item
            );
          })
      : [];

  const fromMetaArray = Array.isArray(product.meta)
    ? product.meta.flatMap((value) => normalizeInformationValue(value))
    : [];

  return normalizeProductInformationItems([
    ...fromAcf,
    ...fromAcfGroupKey,
    ...fromMetaObject,
    ...fromMetaArray,
  ]);
};

// Single authenticated wc/v3 product fetch, shared (via React.cache) by every
// reader below — product information, artist, photography details, print
// eligibility, Atelier meta and FAQs. Previously each of those issued its own
// request for the same URL (the FAQ one with a different query string, so it
// couldn't even be deduped), multiplying WordPress load per page render.
const getWooV3Product = React.cache(
  async (productId: number): Promise<WooV3Product | null> => {
    const { siteUrl, consumerKey, consumerSecret } = getWooServerConfig();
    if (!consumerKey || !consumerSecret) return null;

    const basicToken = toBasicAuthToken(consumerKey, consumerSecret);

    try {
      const response = await fetchWithRetry(`${siteUrl}/wp-json/wc/v3/products/${productId}`, {
        headers: { Authorization: `Basic ${basicToken}` },
        next: { revalidate },
      });
      if (!response.ok) return null;
      return (await response.json()) as WooV3Product;
    } catch {
      return null;
    }
  }
);

const getV3MetaString = (product: WooV3Product | null, key: string): string | undefined => {
  const entry = product?.meta_data?.find((meta) => meta.key === key);
  const value = typeof entry?.value === "string" ? entry.value.trim() : "";
  return value || undefined;
};

// Reads the "artist" custom field WooCommerce stores per-product — the real,
// admin/dashboard-entered source of truth for which artist painted a given
// product; see lib/artists for how it's matched to a profile.
const readProductArtistName = (product: WooV3Product | null) =>
  getV3MetaString(product, "artist");

const readPhotographyDetails = (product: WooV3Product | null) => ({
  storyBehindTheCapture: getV3MetaString(product, "story_behind_the_capture"),
  photographyTechnique: getV3MetaString(product, "photography_technique"),
  interiorStylingRecommendations: getV3MetaString(product, "interior_styling_recommendations"),
});

const readPrintEligibility = (product: WooV3Product | null): boolean => {
  const entry = product?.meta_data?.find((meta) => meta.key === "available_as_print");
  if (!entry) return true;
  const rawValue = typeof entry.value === "string" ? entry.value.trim().toLowerCase() : "";
  return rawValue !== "no" && rawValue !== "0" && rawValue !== "false";
};

const readAtelierMetaFromV3 = (product: WooV3Product | null): AtelierMeta =>
  product ? readAtelierMeta(product.meta_data) : EMPTY_ATELIER_META;

const fetchProductInformationFromWordPressApi = async (productId: number) => {
  const { siteUrl } = getWooServerConfig();

  try {
    const response = await fetchWithRetry(
      `${siteUrl}/wp-json/wp/v2/product/${productId}?acf_format=standard&_fields=acf,meta`,
      {
        next: { revalidate },
      }
    );

    if (!response.ok) return [];
    const payload = (await response.json()) as WordPressProductResponse;
    return getProductInformationFromWordPressProduct(payload);
  } catch {
    return [];
  }
};

const fetchProductInformationFromAcfApi = async (productId: number) => {
  const { siteUrl } = getWooServerConfig();
  const acfEndpointCandidates = [
    `${siteUrl}/wp-json/acf/v3/product/${productId}`,
    `${siteUrl}/wp-json/acf/v3/posts/${productId}`,
  ];

  for (const endpoint of acfEndpointCandidates) {
    try {
      const response = await fetchWithRetry(endpoint, { next: { revalidate } });
      if (!response.ok) continue;

      const payload = (await response.json()) as { acf?: Record<string, unknown> };
      const acfPayload = payload.acf ?? {};
      const values = findValuesByMatchingKeys(acfPayload).flatMap((value) =>
        normalizeInformationValue(value)
      );
      const groupValues = findValuesByGroupKey(acfPayload).flatMap((groupValue) =>
        findValuesByMatchingKeys(groupValue).length > 0
          ? findValuesByMatchingKeys(groupValue).flatMap((value) =>
              normalizeInformationValue(value)
            )
          : normalizeInformationValue(groupValue)
      );

      const informationItems = normalizeProductInformationItems([
        ...values,
        ...groupValues,
      ]);
      if (informationItems.length > 0) return informationItems;
    } catch {
      // Try the next endpoint candidate.
    }
  }

  return [];
};

type WooV3VariationAttribute = {
  id?: number;
  name?: string;
  option?: string;
  value?: string;
};

type WooV3Variation = {
  id: number;
  attributes?: WooV3VariationAttribute[];
  price?: string;
  regular_price?: string;
  sale_price?: string;
  on_sale?: boolean;
  is_in_stock?: boolean;
};

type WooV3ProductMetaDataItem = {
  id?: number;
  key?: string;
  value?: unknown;
};

const fetchProductVariations = async (productId: number): Promise<VariationData[]> => {
  const { siteUrl, consumerKey, consumerSecret } = getWooServerConfig();
  if (!consumerKey || !consumerSecret) return [];

  const basicToken = toBasicAuthToken(consumerKey, consumerSecret);

  try {
    const response = await fetchWithRetry(
      // Credentials go in the Authorization header only — never the query
      // string, where they'd end up in access logs and cache keys.
      `${siteUrl}/wp-json/wc/v3/products/${productId}/variations?per_page=100`,
      {
        headers: {
          Authorization: `Basic ${basicToken}`,
        },
        next: { revalidate },
      }
    );

    if (!response.ok) return [];
    const payload = (await response.json()) as WooV3Variation[];
    if (!Array.isArray(payload)) return [];

    return payload.map((variation) => ({
      id: variation.id,
      attributes: (variation.attributes ?? []).map((attr) => ({
        name: attr.name ?? '',
        value: attr.option ?? attr.value ?? '',
      })),
      price: parseWooCommerceDecimalPrice(variation.price),
      regularPrice: parseWooCommerceDecimalPrice(variation.regular_price),
      salePrice: parseWooCommerceDecimalPrice(variation.sale_price),
      onSale: Boolean(variation.on_sale),
      inStock: Boolean(variation.is_in_stock),
    }));
  } catch {
    return [];
  }
};

type FAQItemFromApi = {
  type?: string;
  title?: string;
  content?: string;
  question?: string;
  answer?: string;
};

const toFaqItems = (items: unknown[]): { question: string; answer: string }[] =>
  items
    .filter(
      (item): item is FAQItemFromApi =>
        Boolean(item && typeof item === "object" && ((item as FAQItemFromApi).title || (item as FAQItemFromApi).question))
    )
    .map((item) => ({
      question: item.title ?? item.question ?? "",
      answer: item.content ?? item.answer ?? "",
    }));

// Reads FAQs from the shared wc/v3 payload (see getWooV3Product) — no extra
// request.
const readProductFAQ = (product: WooV3Product | null): { question: string; answer: string }[] => {
  const metaData = (product?.meta_data ?? []) as WooV3ProductMetaDataItem[];

  // Try different FAQ meta keys that WooCommerce FAQ plugins might use
  const faqMetaKeys = ["wpcpf_faqs", "_wpcpf_faqs", "faqs", "_faqs", "product_faqs", "_product_faqs"];
  let faqMeta: WooV3ProductMetaDataItem | undefined;

  for (const key of faqMetaKeys) {
    faqMeta = metaData.find((meta) => meta.key === key);
    if (faqMeta && faqMeta.value) break;
  }

  if (!faqMeta || !faqMeta.value) return [];

  let faqValue: unknown = faqMeta.value;

  // If it's a JSON string, try to parse it
  if (typeof faqValue === "string") {
    try {
      faqValue = JSON.parse(faqValue);
    } catch {
      return [];
    }
  }

  if (Array.isArray(faqValue)) return toFaqItems(faqValue);

  // An object with numbered keys (like the wpcpf_faqs plugin format)
  if (faqValue && typeof faqValue === "object") {
    return toFaqItems(Object.values(faqValue as Record<string, unknown>));
  }

  return [];
};

const DERIVED_SIZE_ATTRIBUTE_ID = -2;

// Some products don't carry a proper WooCommerce "Size" attribute — the dimensions
// live as ACF fields (width_inches/height_inches or size_in_centimetres) instead,
// which end up as plain text lines inside the merged "Product Information" items
// (e.g. "Width Inches: 24"). Recover a real, single per-product size from those
// lines so the size selector always reflects actual WordPress data instead of
// falling back to a fabricated placeholder.
const deriveSizeFromInformationItems = (items: string[]): string | null => {
  const findValue = (labelPattern: RegExp): string | null => {
    for (const item of items) {
      const match = item.match(labelPattern);
      if (match) return match[1].trim();
    }
    return null;
  };

  const widthRaw = findValue(/width\s*inches?\s*:\s*(.+)/i);
  const heightRaw = findValue(/height\s*inches?\s*:\s*(.+)/i);

  if (widthRaw && heightRaw) {
    const width = Number(widthRaw.replace(/[^0-9.]/g, ""));
    const height = Number(heightRaw.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0) {
      return `${width}x${height} Inches`;
    }
  }

  const sizeCmRaw = findValue(/size\s*in\s*centimetres?\s*:\s*(.+)/i);
  return sizeCmRaw || null;
};

const hasExplicitSizeAttribute = (product: WooStoreProduct) =>
  (product.attributes ?? []).some((attribute) => /size|dimension/i.test(attribute.name));

const withDerivedSizeAttribute = (
  product: WooStoreProduct,
  informationItems: string[]
): WooStoreProduct => {
  if (hasExplicitSizeAttribute(product)) return product;

  const derivedSize = deriveSizeFromInformationItems(informationItems);
  if (!derivedSize) return product;

  return {
    ...product,
    attributes: [
      ...(product.attributes ?? []),
      { id: DERIVED_SIZE_ATTRIBUTE_ID, name: "Size", options: [derivedSize] },
    ],
  };
};

const mergeProductInformationIntoProduct = (
  product: WooStoreProduct,
  informationItems: string[]
): WooStoreProduct => {
  if (informationItems.length === 0) return product;

  const attributesWithoutInformation = (product.attributes ?? []).filter(
    (attribute) => !/product information/i.test(attribute.name)
  );

  return {
    ...product,
    attributes: [
      ...attributesWithoutInformation,
      {
        id: -1,
        name: PRODUCT_INFORMATION_ATTRIBUTE_NAME,
        options: informationItems,
      },
    ],
  };
};

const getProductWithProductInformation = async (
  product: WooStoreProduct,
  v3Product: WooV3Product | null
) => {
  const existingInformationItems = getProductInformationFromStoreProduct(product);
  // Only variable products have variations; skip the request for simple
  // ones (the vast majority of one-of-a-kind paintings). An unknown type
  // still fetches, to stay safe.
  const variations =
    product.type && product.type !== "variable"
      ? []
      : await fetchProductVariations(product.id);
  const faqs = readProductFAQ(v3Product);

  if (existingInformationItems.length > 0) {
    const productWithExtras = withDerivedSizeAttribute(
      { ...product, variations, faqs },
      existingInformationItems
    );
    return mergeProductInformationIntoProduct(productWithExtras, existingInformationItems);
  }

  // The wc/v3 payload (already fetched) carries ACF-backed meta too, so it
  // usually has everything. Only when it comes up empty do we fall back to
  // the separate ACF / wp/v2 endpoints — previously all three were always hit.
  const wooApiInformationItems = v3Product ? getProductInformationFromWooV3Product(v3Product) : [];
  const [acfApiInformationItems, wordPressApiInformationItems] =
    wooApiInformationItems.length > 0
      ? [[], []]
      : await Promise.all([
          fetchProductInformationFromAcfApi(product.id),
          fetchProductInformationFromWordPressApi(product.id),
        ]);

  const mergedInformationItems = normalizeProductInformationItems([
    ...acfApiInformationItems,
    ...wooApiInformationItems,
    ...wordPressApiInformationItems,
  ]);

  const productWithExtras = withDerivedSizeAttribute(
    { ...product, variations, faqs },
    mergedInformationItems
  );
  return mergeProductInformationIntoProduct(productWithExtras, mergedInformationItems);
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

const getSizesLabel = (attributes: WooStoreAttribute[]) => {
  const sizeOptions = (attributes ?? [])
    .filter((attribute) => /size|dimension/i.test(attribute.name))
    .flatMap(getAttributeOptions);

  const uniqueSizeOptions = Array.from(new Set(sizeOptions));
  if (uniqueSizeOptions.length === 0) return "Custom Sizes";
  return `${uniqueSizeOptions.length} Size${uniqueSizeOptions.length === 1 ? "" : "s"}`;
};

const toRelatedCard = (product: WooStoreProduct): RelatedProductCard => {
  const primaryImage = product.images?.[0];
  const title = decodeHtmlEntities(product.name);
  return {
    id: product.id,
    title,
    sizes: getSizesLabel(product.attributes ?? []),
    image: primaryImage?.src || FALLBACK_PRODUCT_IMAGE,
    href: `/shop/${product.slug}`,
  };
};

const getLinkedProductIds = (product: WooStoreProduct) => {
  const candidateIds = [
    ...(product.related_ids ?? []),
    ...(product.related ?? []),
    ...(product.upsell_ids ?? []),
    ...(product.cross_sell_ids ?? []),
  ];

  return Array.from(
    new Set(
      candidateIds.filter(
        (value): value is number =>
          Number.isInteger(value) && value > 0 && value !== product.id
      )
    )
  );
};

const getProductsByIds = async (ids: number[]) => {
  if (ids.length === 0) return [];

  const limitedIds = ids.slice(0, RELATED_PRODUCTS_LIMIT);
  const products = await fetchStoreProducts(
    `include=${limitedIds.join(",")}&per_page=${RELATED_PRODUCTS_LIMIT}`
  );

  const sortOrder = new Map(limitedIds.map((id, index) => [id, index]));
  return products.sort(
    (a, b) =>
      (sortOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
      (sortOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER)
  );
};

const getFeaturedProducts = async () => {
  return fetchStoreProducts(`featured=true&per_page=${RELATED_PRODUCTS_LIMIT}`);
};

const PHOTOGRAPHY_CATEGORY_ID = 376;

const getRelatedPhotographyProducts = async (
  currentProductId: number
): Promise<RelatedProductCard[]> => {
  const products = await fetchStoreProducts(
    `category=${PHOTOGRAPHY_CATEGORY_ID}&exclude=${currentProductId}&per_page=${RELATED_PRODUCTS_LIMIT}`
  );
  return products.map(toRelatedCard);
};

const DEFAULT_WORDPRESS_SITE_URL = "https://api.artacestudio.com";

const getLatestBlogs = async (): Promise<ReadMoreCard[]> => {
  try {
    const siteUrl = DEFAULT_WORDPRESS_SITE_URL;
    const response = await fetchWithRetry(
      `${siteUrl}/wp-json/wp/v2/posts?per_page=3&_embed`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      console.log("[getLatestBlogs] Response not OK:", response.status);
      return [];
    }

    const posts = (await response.json()) as Array<{
      id: number;
      title: { rendered: string };
      slug: string;
      _embedded?: {
        "wp:featuredmedia"?: Array<{ source_url?: string }>;
      };
    }>;

    if (!Array.isArray(posts) || posts.length === 0) {
      console.log("[getLatestBlogs] No posts found");
      return [];
    }


    return posts.slice(0, 3).map((post) => {
      const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
      return {
        id: post.id,
        title: decodeHtmlEntities(
          post.title.rendered.replace(/<[^>]*>/g, "").trim()
        ),
        category: "Blog",
        image: featuredMedia?.source_url || "/journal-img.webp",
        href: `/blogs/${post.slug}`,
      };
    });
  } catch {

    return [];
  }
};

const getRelatedProductsForProduct = async (
  product: WooStoreProduct
): Promise<RelatedProductCard[]> => {
  const linkedIds = getLinkedProductIds(product);
  const relatedProducts = await getProductsByIds(linkedIds);

  const usedIds = new Set<number>([product.id]);
  const mergedProducts: WooStoreProduct[] = [];

  for (const relatedProduct of relatedProducts) {
    if (usedIds.has(relatedProduct.id) || hasSamoraTag(relatedProduct.tags)) continue;
    usedIds.add(relatedProduct.id);
    mergedProducts.push(relatedProduct);
    if (mergedProducts.length >= RELATED_PRODUCTS_LIMIT) {
      return mergedProducts.map(toRelatedCard);
    }
  }

  const featuredProducts = await getFeaturedProducts();
  for (const featuredProduct of featuredProducts) {
    if (usedIds.has(featuredProduct.id) || hasSamoraTag(featuredProduct.tags)) continue;
    usedIds.add(featuredProduct.id);
    mergedProducts.push(featuredProduct);
    if (mergedProducts.length >= RELATED_PRODUCTS_LIMIT) break;
  }

return mergedProducts.slice(0, RELATED_PRODUCTS_LIMIT).map(toRelatedCard);
};

export async function generateMetadata({ params }: SingleProductPageProps) {
  const { slug } = await params;
  const product = await getSingleProduct(slug);

  if (!product) {
    notFound();
  }

  const productUrl = buildSiteUrl(`/shop/${product.slug}`);

  return {
    title: `${decodeHtmlEntities(product.name)} | Artace Studio`,
    description: stripHtmlAndDecode(product.short_description || "").substring(0, 160),
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: decodeHtmlEntities(product.name),
      description: stripHtmlAndDecode(product.short_description || "").substring(0, 160),
      url: productUrl,
      type: "website",
      images: product.images?.[0]?.src ? [{ url: decodeHtmlEntities(product.images[0].src) }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${decodeHtmlEntities(product.name)} | Artace Studio`,
      description: stripHtmlAndDecode(product.short_description || "").substring(0, 160),
      images: product.images?.[0]?.src ? [decodeHtmlEntities(product.images[0].src)] : [],
    },
  };
}

const SingleProductPage = async ({ params }: SingleProductPageProps) => {
  const { slug } = await params;
  const product = await getSingleProduct(slug);

  if (!product) {
    notFound();
  }

  const isPhotographyProduct = product.categories.some(
    (category) => category.slug === "photography"
  );
  const isAtelier = isAtelierProduct(product);

  const v3Product = await getWooV3Product(product.id);

  const [productWithInformation, relatedProducts, readMorePosts, artist] = await Promise.all([
    getProductWithProductInformation(product, v3Product),
    isPhotographyProduct
      ? getRelatedPhotographyProducts(product.id)
      : getRelatedProductsForProduct(product),
    getLatestBlogs(),
    // Artist taxonomy term (set by the artist portal) first, then the legacy
    // "artist" meta text field.
    getArtistForProduct(product.id, readProductArtistName(v3Product)),
  ]);
  const photographyDetails = readPhotographyDetails(v3Product);
  const isAvailableAsPrint = readPrintEligibility(v3Product);
  const atelierMeta = isAtelier ? readAtelierMetaFromV3(v3Product) : EMPTY_ATELIER_META;

  const schema = generateProductSchema(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <SingleProduct
        initialProduct={productWithInformation}
        relatedProducts={relatedProducts}
        readMorePosts={readMorePosts}
        artist={artist}
        photographyDetails={photographyDetails}
        isAvailableAsPrint={isAvailableAsPrint}
        atelierMeta={atelierMeta}
      />
    </>
  );
};

export default SingleProductPage;
