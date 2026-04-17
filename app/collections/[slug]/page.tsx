import React from "react";
import { notFound } from "next/navigation";
import CollectionLandingPage, {
  type CollectionProductCard,
  type CollectionSuggestionCard,
} from "@/components/collections/CollectionLandingPage";
import { type FAQItem } from "@/components/seo/FAQSection";
import { buildSiteUrl, toAbsoluteImageUrl } from "@/lib/site";
import { decodeHtmlEntities } from "@/utils/text";

export const revalidate = 60;
export const dynamicParams = true;

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";
const PRODUCTS_PER_PAGE = 100;
const MAX_PRODUCT_PAGES = 5;
const PUBLIC_WOO_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": "ArtaceStudio-Storefront/1.0",
};

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

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
  name?: string;
};

type WooStoreCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
  image?: WooStoreImage | null;
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

const getApiBaseUrl = () => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || DEFAULT_WOOCOMMERCE_SITE_URL;
  return apiBaseUrl.replace(/\/+$/, "");
};

const fetchWooStoreJson = async <T,>(path: string): Promise<T | null> => {
  const apiBaseUrl = getApiBaseUrl();
  const doFetch = async (url: string) =>
    fetch(url, {
      headers: PUBLIC_WOO_HEADERS,
      next: { revalidate },
    });

  try {
    let response = await doFetch(`${apiBaseUrl}${path}`);

    if (response.status === 404 && path.startsWith("/wp-json/")) {
      const fallbackUrl = `${apiBaseUrl}/?rest_route=${encodeURIComponent(
        path.replace(/^\/wp-json/, "")
      )}`;
      response = await doFetch(fallbackUrl);
    }

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    if (!path.startsWith("/wp-json/")) {
      return null;
    }

    try {
      const fallbackUrl = `${apiBaseUrl}/?rest_route=${encodeURIComponent(
        path.replace(/^\/wp-json/, "")
      )}`;
      const fallbackResponse = await doFetch(fallbackUrl);

      if (!fallbackResponse.ok) {
        return null;
      }

      return (await fallbackResponse.json()) as T;
    } catch {
      return null;
    }
  }
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

const getSizeLabel = (attributes: WooStoreAttribute[] = []) => {
  const sizeOptions = attributes
    .filter((attribute) => /size|dimension/i.test(attribute.name))
    .flatMap(getAttributeOptions);

  const uniqueSizeOptions = Array.from(new Set(sizeOptions));
  if (uniqueSizeOptions.length === 0) return "Custom Sizes";
  if (uniqueSizeOptions.length === 1) return uniqueSizeOptions[0];
  return `${uniqueSizeOptions.length} Sizes`;
};

const getMediumLabel = (attributes: WooStoreAttribute[] = []) => {
  const mediumMatch = attributes.find((attribute) =>
    /medium|material|colors?|technique/i.test(attribute.name)
  );

  if (!mediumMatch) return "Acrylic on Canvas";

  const options = getAttributeOptions(mediumMatch);
  return options[0] || "Acrylic on Canvas";
};

const toProductCard = (product: WooStoreProduct): CollectionProductCard => {
  const minorUnit = product.prices?.currency_minor_unit ?? 2;
  const primaryImage = product.images?.[0];

  return {
    id: product.id,
    slug: product.slug,
    name: decodeHtmlEntities(product.name),
    image: primaryImage?.src || FALLBACK_PRODUCT_IMAGE,
    imageAlt: decodeHtmlEntities(
      primaryImage?.alt || primaryImage?.name || product.name
    ),
    price: parsePrice(product.prices?.price, minorUnit),
    regularPrice: parsePrice(product.prices?.regular_price, minorUnit),
    currencyCode: product.prices?.currency_code || "INR",
    currencySymbol: product.prices?.currency_symbol || "Rs. ",
    sizeLabel: getSizeLabel(product.attributes ?? []),
    mediumLabel: getMediumLabel(product.attributes ?? []),
  };
};

const sortProductsForFeature = (products: WooStoreProduct[]) => {
  return [...products].sort((first, second) => {
    const firstScore =
      (first.total_sales ?? 0) * 10 +
      (first.review_count ?? 0) * 2 +
      Number(first.average_rating || 0);
    const secondScore =
      (second.total_sales ?? 0) * 10 +
      (second.review_count ?? 0) * 2 +
      Number(second.average_rating || 0);

    if (secondScore !== firstScore) return secondScore - firstScore;

    const firstDate = first.date_created_gmt || first.date_created || "";
    const secondDate = second.date_created_gmt || second.date_created || "";
    return new Date(secondDate).getTime() - new Date(firstDate).getTime();
  });
};

const fetchCategories = async (): Promise<WooStoreCategory[] | null> => {
  const payload = await fetchWooStoreJson<unknown>(
    "/wp-json/wc/store/v1/products/categories?hide_empty=true&per_page=100"
  );

  return Array.isArray(payload) ? (payload as WooStoreCategory[]) : null;
};

export async function generateStaticParams() {
  const categories = await fetchCategories();

  if (!categories) {
    return [];
  }

  return categories
    .map((category) => category.slug?.trim())
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug }));
}

const fetchAllProducts = async (): Promise<WooStoreProduct[] | null> => {
  const products: WooStoreProduct[] = [];

  for (let page = 1; page <= MAX_PRODUCT_PAGES; page += 1) {
    const payload = await fetchWooStoreJson<unknown>(
      `/wp-json/wc/store/v1/products?per_page=${PRODUCTS_PER_PAGE}&page=${page}&orderby=date&order=desc`
    );

    if (payload === null) {
      return null;
    }

    if (!Array.isArray(payload) || payload.length === 0) break;

    products.push(...(payload as WooStoreProduct[]));

    if (payload.length < PRODUCTS_PER_PAGE) {
      break;
    }
  }

  return products;
};

const formatPriceStat = (
  value: number | null,
  currencyCode: string,
  currencySymbol: string
) => {
  if (value === null) return "On request";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currencySymbol}${Math.round(value).toLocaleString("en-IN")}`;
  }
};

const getFallbackSuggestionImage = (
  categorySlug: string,
  products: WooStoreProduct[]
) => {
  const matchingProduct = products.find((product) =>
    product.categories.some((category) => category.slug === categorySlug)
  );

  return matchingProduct?.images?.[0]?.src || FALLBACK_PRODUCT_IMAGE;
};

const getCategoryDescription = (categoryName: string, productCount: number) => {
  const baseName = categoryName
    .replace(/\bcollection\b/gi, "")
    .replace(/\bpaintings?\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return `Explore ${productCount} handmade ${baseName.toLowerCase()} works curated for collectors who want a more guided category journey. This page opens with a stronger editorial narrative, surfaces the best-performing works first, then reveals the full collection with proof, advisory, and next-step discovery built in.`;
};

const toReadableCollectionName = (value: string) =>
  decodeHtmlEntities(value)
    .replace(/\bcollection\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

const getCollectionFaqs = (categoryName: string): FAQItem[] => {
  const readableCollectionName = toReadableCollectionName(categoryName);
  const shortName = readableCollectionName.replace(/\bpaintings?\b/gi, "").trim();
  const lowerName = shortName.toLowerCase() || "collection";

  return [
    {
      question: `Are these ${shortName || readableCollectionName} artworks handmade?`,
      answer: `Artace Studio positions this ${lowerName} collection around handcrafted, premium-feel canvas art rather than generic wall decor, with each piece selected to feel more intentional and room-ready.`,
    },
    {
      question: `Can I request a custom size or color direction for ${shortName || readableCollectionName}?`,
      answer: `Yes. If you like the mood of a piece but need a different size, palette, or format for your wall, you can move into the custom-order flow and refine the artwork around your room requirements.`,
    },
    {
      question: `How do I choose the right ${lowerName} painting for my space?`,
      answer: `Start with wall width, room function, and the emotional tone you want the artwork to create. Then shortlist pieces by scale, subject, and finish, or speak with Artace Studio for direct guidance before ordering.`,
    },
    {
      question: `Can these paintings work for gifting, devotional rooms, or statement walls?`,
      answer: `Yes. Many buyers use Artace Studio paintings for living-room focal walls, bedrooms, offices, devotional spaces, and meaningful gifts where handmade presentation matters more than off-the-shelf decor.`,
    },
  ];
};

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const categories = await fetchCategories();
  const matchedCategory = categories?.find((category) => category.slug === decodedSlug);
  const readableName = decodeHtmlEntities(
    matchedCategory?.name ||
      decodedSlug.replace(/-/g, " ").replace(/\b\w/g, (character) => character.toUpperCase())
  );
  const imageUrl = toAbsoluteImageUrl(matchedCategory?.image?.src);
  const title = `${readableName} Online in India | Handmade Canvas Art | Artace Studio`;
  const description = `Browse ${readableName.toLowerCase()} at Artace Studio. Explore handcrafted canvas art, premium wall decor, and custom-order options curated for collectors in India.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/collections/${decodedSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `/collections/${decodedSlug}`,
      type: "website",
      images: [
        {
          url: imageUrl,
          alt: readableName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

const CollectionPage = async ({ params }: CollectionPageProps) => {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const [categories, allProducts] = await Promise.all([fetchCategories(), fetchAllProducts()]);

  if (categories === null || allProducts === null) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-xl border border-[#1f1f1f]/10 bg-white p-8 text-[#5f5a52]">
          <p className="font-semibold text-[#222]">Collection Temporarily Unavailable</p>
          <p className="mt-2 text-sm">
            We could not reach the live catalog service just now. Please refresh in a moment.
          </p>
        </div>
      </main>
    );
  }

  const matchedProducts = allProducts.filter((product) =>
    product.categories.some((category) => category.slug === decodedSlug)
  );

  const matchedCategory =
    categories.find((category) => category.slug === decodedSlug) ??
    matchedProducts
      .flatMap((product) => product.categories)
      .find((category) => category.slug === decodedSlug);

  if (!matchedCategory || matchedProducts.length === 0) {
    notFound();
  }

  const sortedProducts = sortProductsForFeature(matchedProducts);
  const productCards = sortedProducts.map(toProductCard);
  const topProducts = productCards.slice(0, 4);
  const heroImage =
    matchedCategory.image?.src || productCards[0]?.image || FALLBACK_PRODUCT_IMAGE;
  const heroImageAlt = decodeHtmlEntities(
    matchedCategory.image?.alt || matchedCategory.image?.name || matchedCategory.name
  );

  const priceValues = productCards
    .map((product) => product.price)
    .filter((value): value is number => typeof value === "number");
  const minimumPrice = priceValues.length > 0 ? Math.min(...priceValues) : null;
  const stats = [
    { label: "Works", value: `${productCards.length}` },
    { label: "Featured", value: `${topProducts.length}` },
    {
      label: "Starting At",
      value: formatPriceStat(
        minimumPrice,
        productCards[0]?.currencyCode || "INR",
        productCards[0]?.currencySymbol || "Rs. "
      ),
    },
  ];

  const suggestions: CollectionSuggestionCard[] = categories
    .filter(
      (category) =>
        category.slug !== decodedSlug && !/^all-canvas(?:-paintings)?$/i.test(category.slug)
    )
    .sort((first, second) => second.count - first.count)
    .slice(0, 3)
    .map((category) => ({
      slug: category.slug,
      name: decodeHtmlEntities(category.name),
      image:
        category.image?.src || getFallbackSuggestionImage(category.slug, allProducts),
      imageAlt: decodeHtmlEntities(
        category.image?.alt || category.image?.name || category.name
      ),
      productCount: category.count,
    }));

  const faqItems = getCollectionFaqs(matchedCategory.name);
  const collectionUrl = buildSiteUrl(`/collections/${decodedSlug}`);
  const collectionSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${collectionUrl}#webpage`,
        url: collectionUrl,
        name: `${decodeHtmlEntities(matchedCategory.name)} | Artace Studio`,
        description: getCategoryDescription(matchedCategory.name, productCards.length),
        isPartOf: {
          "@id": `${buildSiteUrl("/")}#website`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${collectionUrl}#itemlist`,
        url: collectionUrl,
        numberOfItems: productCards.length,
        itemListElement: productCards.slice(0, 12).map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: buildSiteUrl(`/shop/${product.slug}`),
          name: product.name,
          image: toAbsoluteImageUrl(product.image),
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${collectionUrl}#faq`,
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <CollectionLandingPage
        categoryName={decodeHtmlEntities(matchedCategory.name)}
        categorySlug={decodedSlug}
        description={getCategoryDescription(matchedCategory.name, productCards.length)}
        heroImage={heroImage}
        heroImageAlt={heroImageAlt}
        topProducts={topProducts}
        products={productCards}
        suggestions={suggestions}
        stats={stats}
        faqItems={faqItems}
      />
    </>
  );
};

export default CollectionPage;
