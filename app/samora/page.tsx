import type { Metadata } from "next";
import SamoraCraftCategories from "@/components/samora/SamoraCraftCategories";
import SamoraFAQSection from "@/components/samora/SamoraFAQSection";
import SamoraFestiveSpecial from "@/components/samora/SamoraFestiveSpecial";
import SamoraGiftingBanner from "@/components/samora/SamoraGiftingBanner";
import SamoraHero from "@/components/samora/SamoraHero";
import SamoraProcess from "@/components/samora/SamoraProcess";
import SamoraStory from "@/components/samora/SamoraStory";
import SamoraTrustBar from "@/components/samora/SamoraTrustBar";
import type { SamoraProduct } from "@/components/samora/SamoraProductCard";
import { decodeHtmlEntities } from "@/utils/text";
import { fetchWithRetry } from "@/lib/http/fetch-with-retry";
import { SAMORA_TAG_SLUG } from "@/lib/samora/products";
import { samoraFaqs, samoraSchema } from "./samora-schema";

export const runtime = "edge";
export const revalidate = 60;

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";
const FESTIVE_PRODUCTS_LIMIT = 4;

type WooStorePrices = {
  currency_minor_unit: number;
  price: string;
  regular_price: string;
  currency_symbol: string;
};
type WooStoreImage = { src: string; alt?: string };
type WooStoreCategory = { name: string; slug: string };
type WooStoreAttributeTerm = { name: string };
type WooStoreAttribute = { name: string; options?: string[]; terms?: WooStoreAttributeTerm[] };
type WooStoreProduct = {
  id: number;
  slug: string;
  name: string;
  images: WooStoreImage[];
  prices: WooStorePrices;
  categories?: WooStoreCategory[];
  attributes?: WooStoreAttribute[];
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

const getFestiveSamoraProducts = async (): Promise<SamoraProduct[]> => {
  try {
    const apiBaseUrl = (
      process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
      process.env.WOOCOMMERCE_REST_URL ||
      DEFAULT_WOOCOMMERCE_SITE_URL
    ).replace(/\/+$/, "");

    const queryParams = new URLSearchParams({
      per_page: String(FESTIVE_PRODUCTS_LIMIT),
      tag: SAMORA_TAG_SLUG,
      orderby: "date",
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
        attributes: (product.attributes ?? [])
          .map((attribute) => ({
            name: decodeHtmlEntities(attribute.name),
            options: getAttributeOptions(attribute),
          }))
          .filter((attribute) => attribute.options.length > 0),
      };
    });
  } catch {
    return [];
  }
};

const TITLE = "Samora by Artace Studio | Handcrafted Tote Bags, Coasters, Trays & Name Plates";
const DESCRIPTION =
  "Samora is the handcrafted lifestyle sub-brand of Artace Studio. Shop handmade tote bags, tea coasters, trays, and personalized name plates made from natural materials.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/samora",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/samora",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const SamoraHomePage = async () => {
  const festiveProducts = await getFestiveSamoraProducts();

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(samoraSchema) }}
      />
      <SamoraHero />
      <SamoraTrustBar />
      <SamoraFestiveSpecial products={festiveProducts} />
      <SamoraCraftCategories />
      <SamoraStory />
      <SamoraProcess />
      <SamoraGiftingBanner />
      <SamoraFAQSection
        id="faq"
        eyebrow="FAQ"
        title="Questions About Samora"
        intro="Everything you need to know about Samora, its handcrafted collection, and how it connects to Artace Studio."
        items={samoraFaqs}
      />
    </main>
  );
};

export default SamoraHomePage;
