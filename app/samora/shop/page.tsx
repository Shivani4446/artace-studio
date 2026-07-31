import type { Metadata } from "next";
import Link from "next/link";
import { Coffee, RectangleHorizontal, ShoppingBag, Tag } from "lucide-react";
import { type SamoraProduct } from "@/components/samora/SamoraProductCard";
import SamoraShopCatalog from "@/components/samora/SamoraShopCatalog";
import { decodeHtmlEntities } from "@/utils/text";
import { fetchWithRetry } from "@/lib/http/fetch-with-retry";
import { buildSiteUrl } from "@/lib/site";
import { SAMORA_TAG_SLUG } from "@/lib/samora/products";

export const runtime = "edge";
export const revalidate = 60;

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";
const PRODUCTS_PER_PAGE = 100;
const MAX_PRODUCT_PAGES = 10;
const SHOP_PAGE_URL = buildSiteUrl("/samora/shop");

const TITLE = "Shop Samora | Handcrafted Tote Bags, Coasters, Trays & Name Plates";
const DESCRIPTION =
  "Shop the Samora collection: handcrafted tote bags, tea coasters, trays, and personalized name plates, made from natural materials by Artace Studio's artisans.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/samora/shop",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/samora/shop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const COMING_SOON_CATEGORIES = [
  { name: "Tote Bags", icon: ShoppingBag },
  { name: "Tea Coasters", icon: Coffee },
  { name: "Trays", icon: RectangleHorizontal },
  { name: "Name Plates", icon: Tag },
];

const WHATSAPP_HREF =
  "https://wa.me/9657609102?text=" +
  encodeURIComponent("Hi Samora, I'd like early access to the shop.");

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

type WooStoreCategory = { id: number; name: string; slug: string };

type WooStoreAttributeTerm = { id: number; name: string; slug: string };
type WooStoreAttribute = {
  id: number;
  name: string;
  options?: string[];
  terms?: WooStoreAttributeTerm[];
};

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

const normalizeProducts = (products: WooStoreProduct[]): SamoraProduct[] => {
  return products.map((product) => {
    const minorUnit = product.prices?.currency_minor_unit ?? 2;
    const primaryImage = product.images[0];

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
};

const getSamoraStoreProducts = async (): Promise<WooStoreProduct[]> => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    process.env.WOOCOMMERCE_REST_URL ||
    DEFAULT_WOOCOMMERCE_SITE_URL;
  const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, "");
  const products: WooStoreProduct[] = [];
  let totalPages = 1;

  for (let page = 1; page <= totalPages && page <= MAX_PRODUCT_PAGES; page += 1) {
    const queryParams = new URLSearchParams({
      per_page: String(PRODUCTS_PER_PAGE),
      page: String(page),
      tag: SAMORA_TAG_SLUG,
      orderby: "date",
      order: "desc",
    });
    const response = await fetchWithRetry(
      `${normalizedBaseUrl}/wp-json/wc/store/v1/products?${queryParams.toString()}`,
      { next: { revalidate } }
    );

    if (!response.ok) break;

    const headerTotalPages = Number(response.headers.get("x-wp-totalpages") || "");
    if (Number.isFinite(headerTotalPages) && headerTotalPages > 0) {
      totalPages = headerTotalPages;
    }

    const payload = (await response.json()) as WooStoreProduct[];
    if (!Array.isArray(payload) || payload.length === 0) break;

    products.push(...payload);
    if (payload.length < PRODUCTS_PER_PAGE) break;
  }

  return products;
};

const SamoraShopPage = async () => {
  let products: SamoraProduct[] = [];

  try {
    const storeProducts = await getSamoraStoreProducts();
    products = normalizeProducts(storeProducts);
  } catch {
    products = [];
  }

  const itemListElements = products.slice(0, 24).map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: buildSiteUrl(`/samora/shop/${product.slug}`),
    name: product.name,
  }));

  const shopSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SHOP_PAGE_URL}#webpage`,
        url: SHOP_PAGE_URL,
        name: TITLE,
        description: DESCRIPTION,
      },
      {
        "@type": "ItemList",
        "@id": `${SHOP_PAGE_URL}#itemlist`,
        url: SHOP_PAGE_URL,
        numberOfItems: products.length,
        itemListElement: itemListElements,
      },
    ],
  };

  return (
    <main className="mx-auto max-w-[1320px] px-5 py-14 md:px-10 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shopSchema) }}
      />

      <div className="max-w-[720px]">
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c1683d]">
          The Samora Shop
        </p>
        <h1 className="font-samora-display mt-4 text-[32px] leading-[1.12] text-[#2b2420] sm:text-[38px] md:text-[46px]">
          Handcrafted Tote Bags, Coasters, Trays &amp; Name Plates
        </h1>
        <p className="mt-4 text-[16px] leading-[1.7] text-[#5c5344] md:text-[17px]">
          Every piece here is made by hand, in small batches, from natural materials. New
          additions land as they&apos;re finished.
        </p>
      </div>

      {products.length > 0 ? (
        <SamoraShopCatalog products={products} />
      ) : (
        <div className="mt-10 rounded-[20px] border border-[#2b2420]/10 bg-[#f3ead9] px-6 py-14 text-center md:mt-12 md:py-20">
          <p className="font-samora-display text-[24px] text-[#2b2420] md:text-[28px]">
            New arrivals are on the way
          </p>
          <p className="mx-auto mt-3 max-w-[480px] text-[15px] leading-[1.7] text-[#5c5344]">
            We&apos;re onboarding the full Samora catalog. Reach out for early access, pricing,
            and availability.
          </p>

          <div className="mx-auto mt-8 grid max-w-[480px] grid-cols-2 gap-4 sm:grid-cols-4">
            {COMING_SOON_CATEGORIES.map(({ name, icon: Icon }) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2.5 rounded-[16px] border border-[#2b2420]/10 bg-[#fbf6ef] p-4"
              >
                <Icon className="h-5 w-5 text-[#c1683d]" strokeWidth={1.75} />
                <span className="text-[13px] font-medium text-[#3f382f]">{name}</span>
              </div>
            ))}
          </div>

          <Link
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-[#c1683d] px-7 py-3.5 text-[14.5px] font-medium text-white transition-colors hover:bg-[#a8552f]"
          >
            Get Early Access
          </Link>
        </div>
      )}
    </main>
  );
};

export default SamoraShopPage;
