import ShopCatalog from "@/components/shop/ShopCatalog";
import type { ShopProduct, SizeBucket } from "@/components/shop/types";
import { decodeHtmlEntities } from "@/utils/text";

export const runtime = "edge";

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://artacestudio.com";
const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";
const MEDIUM_FILTER_OPTIONS = ["Acrylic", "Oil", "Watercolor"] as const;
const MATERIAL_FILTER_OPTIONS = ["Canvas", "Paper"] as const;

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
  thumbnail?: string;
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
  prices: WooStorePrices;
  attributes?: WooStoreAttribute[];
  average_rating?: string;
  review_count?: number;
  total_sales?: number;
  date_created?: string;
  date_created_gmt?: string;
};

const parsePrice = (rawValue: string | undefined, minorUnit: number) => {
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

const detectSizeBucket = (rawSizeValue: string): SizeBucket | null => {
  const value = rawSizeValue.toLowerCase().trim();

  if (value.includes("xl") || value.includes("extra large")) return "XL";
  if (value.includes("large")) return "Large";
  if (value.includes("medium")) return "Medium";
  if (value.includes("small")) return "Small";

  const dimensions = value.match(/(\d+(?:\.\d+)?)\s*[xX\u00D7]\s*(\d+(?:\.\d+)?)/i);
  if (!dimensions) return null;

  const width = Number(dimensions[1]);
  const height = Number(dimensions[2]);
  if (Number.isNaN(width) || Number.isNaN(height)) return null;

  const area = width * height;
  if (area <= 400) return "Small";
  if (area <= 900) return "Medium";
  if (area <= 1600) return "Large";
  return "XL";
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toTitleCase = (value: string) =>
  value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const uniqueValues = (values: string[]) =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

const getProductContextText = (product: WooStoreProduct) => {
  const attributeTokens = (product.attributes ?? []).flatMap((attribute) => [
    attribute.name,
    ...getAttributeOptions(attribute),
  ]);

  return normalizeText(
    [
      decodeHtmlEntities(product.name),
      ...product.categories.map((category) => decodeHtmlEntities(category.name)),
      ...attributeTokens.map((token) => decodeHtmlEntities(token)),
    ]
      .filter(Boolean)
      .join(" ")
  );
};

const inferMoodTags = (product: WooStoreProduct): string[] => {
  const text = getProductContextText(product);

  const moodRules: Array<{ mood: string; keywords: string[] }> = [
    {
      mood: "Spiritual",
      keywords: [
        "radha",
        "krishna",
        "ganesha",
        "buddha",
        "shiva",
        "deity",
        "devotional",
        "sacred",
        "temple",
      ],
    },
    {
      mood: "Serene",
      keywords: [
        "landscape",
        "nature",
        "forest",
        "river",
        "mountain",
        "sunrise",
        "sunset",
        "calm",
        "peaceful",
      ],
    },
    {
      mood: "Contemporary",
      keywords: ["modern", "abstract", "geometric", "minimal", "contemporary"],
    },
    {
      mood: "Vibrant",
      keywords: ["vibrant", "bold", "energetic", "bright", "colorful"],
    },
    {
      mood: "Romantic",
      keywords: ["romantic", "love", "couple", "floral", "flower", "rose"],
    },
    {
      mood: "Classic",
      keywords: ["portrait", "traditional", "heritage", "vintage", "timeless"],
    },
  ];

  const inferred = moodRules
    .filter((rule) => rule.keywords.some((keyword) => text.includes(keyword)))
    .map((rule) => rule.mood);

  if (inferred.length > 0) return uniqueValues(inferred);
  return ["Serene"];
};

const inferMaterialTags = (product: WooStoreProduct): string[] => {
  const text = getProductContextText(product);
  const materials: string[] = [];

  if (/\bpaper\b|handmade paper|cold press|hot press/.test(text)) {
    materials.push("Paper");
  }

  if (/\bcanvas\b|stretched canvas|rolled canvas/.test(text)) {
    materials.push("Canvas");
  }

  if (materials.length > 0) return uniqueValues(materials);
  return ["Canvas"];
};

const inferMediumTags = (product: WooStoreProduct): string[] => {
  const text = getProductContextText(product);
  const detected: string[] = [];

  if (/\bacrylic\b/.test(text)) {
    detected.push("Acrylic");
  }

  if (/\boil\b/.test(text)) {
    detected.push("Oil");
  }

  if (/water\s*colou?r|watercolor|water colour/.test(text)) {
    detected.push("Watercolor");
  }

  const validDetected = uniqueValues(detected).filter((medium) =>
    MEDIUM_FILTER_OPTIONS.includes(medium as (typeof MEDIUM_FILTER_OPTIONS)[number])
  );

  if (validDetected.length > 0) return validDetected;
  return ["Acrylic"];
};

const normalizeProducts = (products: WooStoreProduct[]): ShopProduct[] => {
  return products.map((product) => {
    const minorUnit = product.prices?.currency_minor_unit ?? 2;
    const price = parsePrice(product.prices?.price, minorUnit);
    const regularPrice = parsePrice(product.prices?.regular_price, minorUnit);
    const primaryImage = product.images[0];
    const imageUrl = primaryImage?.src || FALLBACK_PRODUCT_IMAGE;

    const explicitMoodOptions = (product.attributes ?? [])
      .filter((attribute) => /mood/i.test(attribute.name))
      .flatMap(getAttributeOptions)
      .map(toTitleCase);

    const moodOptions = uniqueValues([...explicitMoodOptions, ...inferMoodTags(product)]);

    // "By Colors" is intentionally limited to paint mediums.
    const colorOptions = inferMediumTags(product);

    const materialOptions = inferMaterialTags(product).filter((material) =>
      MATERIAL_FILTER_OPTIONS.includes(material as (typeof MATERIAL_FILTER_OPTIONS)[number])
    );

    const sizeOptions = (product.attributes ?? [])
      .filter((attribute) => /size|dimension/i.test(attribute.name))
      .flatMap(getAttributeOptions);

    const sizeBuckets = Array.from(
      new Set(
        sizeOptions
          .map(detectSizeBucket)
          .filter((bucket): bucket is SizeBucket => bucket !== null)
      )
    );

    return {
      id: product.id,
      slug: product.slug,
      name: decodeHtmlEntities(product.name),
      image: imageUrl,
      imageAlt: decodeHtmlEntities(primaryImage?.alt || product.name),
      categories: product.categories.map((category) => decodeHtmlEntities(category.name)),
      price,
      regularPrice,
      currencyCode: product.prices?.currency_code || "INR",
      currencySymbol: product.prices?.currency_symbol || "Rs. ",
      reviewCount: product.review_count ?? 0,
      averageRating: Number(product.average_rating || 0),
      totalSales: product.total_sales ?? 0,
      dateCreated: product.date_created_gmt || product.date_created || null,
      attributes: {
        moods: moodOptions,
        materials: materialOptions,
        colors: colorOptions,
        sizes: sizeOptions,
      },
      sizeBuckets,
    };
  });
};

const getStoreProducts = async (): Promise<WooStoreProduct[]> => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || DEFAULT_WOOCOMMERCE_SITE_URL;
  const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, "");

  const response = await fetch(
    `${normalizedBaseUrl}/wp-json/wc/store/v1/products?per_page=48`,
    {
      next: { revalidate: 120 },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch WooCommerce products (${response.status}).`);
  }

  const payload = (await response.json()) as WooStoreProduct[];
  return Array.isArray(payload) ? payload : [];
};

type ShopPageProps = {
  searchParams?: Promise<{ category?: string | string[] }>;
};

const resolveInitialCategoryName = (
  products: WooStoreProduct[],
  rawCategorySlug: string | null
) => {
  if (!rawCategorySlug) return null;

  const normalizedSlug = rawCategorySlug.trim().toLowerCase();
  if (!normalizedSlug) return null;

  for (const product of products) {
    for (const category of product.categories) {
      if (category.slug.trim().toLowerCase() === normalizedSlug) {
        return decodeHtmlEntities(category.name);
      }
    }
  }

  return null;
};

const ShopPage = async ({ searchParams }: ShopPageProps) => {
  let products: ShopProduct[] = [];
  let loadError: string | null = null;
  let initialSelectedCategory: string | null = null;

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const rawCategoryParam = resolvedSearchParams?.category;
  const categorySlug =
    typeof rawCategoryParam === "string"
      ? rawCategoryParam
      : Array.isArray(rawCategoryParam)
        ? rawCategoryParam[0] || null
        : null;

  try {
    const storeProducts = await getStoreProducts();
    products = normalizeProducts(storeProducts);
    initialSelectedCategory = resolveInitialCategoryName(storeProducts, categorySlug);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load products.";
  }

  return (
    <ShopCatalog
      key={initialSelectedCategory || "all-products"}
      products={products}
      loadError={loadError}
      initialSelectedCategory={initialSelectedCategory}
    />
  );
};

export default ShopPage;
