import React from "react";
import SingleProduct from "@/components/singleproduct/SingleProduct";
import { decodeHtmlEntities } from "@/utils/text";

export const revalidate = 120;
export const dynamicParams = false;

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
  "dimensions_&_materials",
  "care_&_framing",
  "shipping_&_returns",
  "about_the_painting",
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
const PRODUCT_SLUGS_PER_PAGE = 100;
const MAX_PRODUCT_SLUG_PAGES = 5;

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
  permalink: string;
  name: string;
  short_description: string;
  description: string;
  sku: string;
  on_sale: boolean;
  average_rating: string;
  review_count: number;
  stock_status: "instock" | "outofstock" | "onbackorder" | string;
  stock_quantity: number | null;
  images: WooStoreImage[];
  categories: WooStoreCategory[];
  attributes: WooStoreAttribute[];
  prices: WooStorePrices;
  related_ids?: number[];
  related?: number[];
  upsell_ids?: number[];
  cross_sell_ids?: number[];
};

type RelatedProductCard = {
  id: number | string;
  title: string;
  sizes: string;
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
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || DEFAULT_WOOCOMMERCE_SITE_URL;
  return apiBaseUrl.replace(/\/+$/, "");
};

const getWooServerConfig = () => {
  const siteUrl =
    process.env.WOOCOMMERCE_SITE_URL ||
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    DEFAULT_WOOCOMMERCE_SITE_URL;

  return {
    siteUrl: siteUrl.replace(/\/+$/, ""),
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

const fetchStoreProducts = async (
  queryString: string
): Promise<WooStoreProduct[]> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/wp-json/wc/store/v1/products?${queryString}`, {
      next: { revalidate: 120 },
    });

    if (!response.ok) return [];
    const payload = (await response.json()) as WooStoreProduct[];
    return Array.isArray(payload) ? payload : [];
  } catch {
    return [];
  }
};

const fetchAllProductSlugs = async () => {
  const slugs: string[] = [];

  for (let page = 1; page <= MAX_PRODUCT_SLUG_PAGES; page += 1) {
    const payload = await fetchStoreProducts(
      `per_page=${PRODUCT_SLUGS_PER_PAGE}&page=${page}`
    );

    if (payload.length === 0) {
      break;
    }

    slugs.push(
      ...payload
        .map((product) => product.slug?.trim())
        .filter((slug): slug is string => Boolean(slug))
    );

    if (payload.length < PRODUCT_SLUGS_PER_PAGE) {
      break;
    }
  }

  return Array.from(new Set(slugs));
};

export async function generateStaticParams() {
  const slugs = await fetchAllProductSlugs();

  return slugs.map((slug) => ({ slug }));
}

const getSingleProduct = async (slug: string): Promise<WooStoreProduct | null> => {
  try {
    const payload = await fetchStoreProducts(
      `slug=${encodeURIComponent(slug)}&per_page=1`
    );
    return Array.isArray(payload) && payload.length > 0 ? payload[0] : null;
  } catch {
    return null;
  }
};

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

const fetchProductInformationFromWooApi = async (productId: number) => {
  const { siteUrl, consumerKey, consumerSecret } = getWooServerConfig();

  if (!consumerKey || !consumerSecret) return [];

  const basicToken = toBasicAuthToken(consumerKey, consumerSecret);

  try {
    const response = await fetch(`${siteUrl}/wp-json/wc/v3/products/${productId}`, {
      headers: {
        Authorization: `Basic ${basicToken}`,
      },
      next: { revalidate: 120 },
    });

    if (!response.ok) return [];
    const payload = (await response.json()) as WooV3Product;
    return getProductInformationFromWooV3Product(payload);
  } catch {
    return [];
  }
};

const fetchProductInformationFromWordPressApi = async (productId: number) => {
  const { siteUrl } = getWooServerConfig();

  try {
    const response = await fetch(
      `${siteUrl}/wp-json/wp/v2/product/${productId}?acf_format=standard&_fields=acf,meta`,
      {
        next: { revalidate: 120 },
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
      const response = await fetch(endpoint, { next: { revalidate: 120 } });
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

const getProductWithProductInformation = async (product: WooStoreProduct) => {
  const existingInformationItems = getProductInformationFromStoreProduct(product);

  if (existingInformationItems.length > 0) {
    return mergeProductInformationIntoProduct(product, existingInformationItems);
  }

  const [acfApiInformationItems, wooApiInformationItems, wordPressApiInformationItems] =
    await Promise.all([
      fetchProductInformationFromAcfApi(product.id),
      fetchProductInformationFromWooApi(product.id),
      fetchProductInformationFromWordPressApi(product.id),
    ]);

  const mergedInformationItems = normalizeProductInformationItems([
    ...acfApiInformationItems,
    ...wooApiInformationItems,
    ...wordPressApiInformationItems,
  ]);

  return mergeProductInformationIntoProduct(product, mergedInformationItems);
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

const getRelatedProductsForProduct = async (
  product: WooStoreProduct
): Promise<RelatedProductCard[]> => {
  const linkedIds = getLinkedProductIds(product);
  const relatedProducts = await getProductsByIds(linkedIds);

  const usedIds = new Set<number>([product.id]);
  const mergedProducts: WooStoreProduct[] = [];

  for (const relatedProduct of relatedProducts) {
    if (usedIds.has(relatedProduct.id)) continue;
    usedIds.add(relatedProduct.id);
    mergedProducts.push(relatedProduct);
    if (mergedProducts.length >= RELATED_PRODUCTS_LIMIT) {
      return mergedProducts.map(toRelatedCard);
    }
  }

  const featuredProducts = await getFeaturedProducts();
  for (const featuredProduct of featuredProducts) {
    if (usedIds.has(featuredProduct.id)) continue;
    usedIds.add(featuredProduct.id);
    mergedProducts.push(featuredProduct);
    if (mergedProducts.length >= RELATED_PRODUCTS_LIMIT) break;
  }

  return mergedProducts.slice(0, RELATED_PRODUCTS_LIMIT).map(toRelatedCard);
};

const SingleProductPage = async ({ params }: SingleProductPageProps) => {
  const { slug } = await params;
  const product = await getSingleProduct(slug);

  if (!product) {
    return <SingleProduct initialProduct={null} relatedProducts={[]} />;
  }

  const [productWithInformation, relatedProducts] = await Promise.all([
    getProductWithProductInformation(product),
    getRelatedProductsForProduct(product),
  ]);

  return (
    <SingleProduct
      initialProduct={productWithInformation}
      relatedProducts={relatedProducts}
    />
  );
};

export default SingleProductPage;
