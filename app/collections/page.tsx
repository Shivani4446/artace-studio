import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildSiteUrl, toAbsoluteImageUrl } from "@/lib/site";
import { decodeHtmlEntities } from "@/utils/text";
import { getCollectionHref } from "@/utils/collections";

export const runtime = "edge";
export const revalidate = 60;

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const MIN_CATEGORY_PRODUCT_COUNT = 2;
const EXCLUDED_CATEGORY_NAMES = new Set([
  "all canvas paintings",
  "all canvas paintngs",
  "corporate paintings",
]);

type WooStoreCategoryImage = {
  id: number;
  src: string;
  alt?: string;
  name?: string;
};

type WooStoreCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
  image?: WooStoreCategoryImage | null;
};

type CategoryCard = {
  id: number;
  name: string;
  slug: string;
  count: number;
  image: string;
  imageAlt: string;
  href: string;
};

const getApiBaseUrl = () => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || DEFAULT_WOOCOMMERCE_SITE_URL;
  return apiBaseUrl.replace(/\/+$/, "");
};

const fetchCategories = async (): Promise<WooStoreCategory[]> => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(
      `${apiBaseUrl}/wp-json/wc/store/v1/products/categories?hide_empty=true&per_page=100`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) return [];

    const payload = (await response.json()) as WooStoreCategory[];
    return Array.isArray(payload) ? payload : [];
  } catch {
    return [];
  }
};

const getCategoryCards = (categories: WooStoreCategory[]): CategoryCard[] => {
  return categories
    .filter((category) => {
      if (!category.slug || !category.name) return false;
      if (!category.image?.src) return false;
      if (category.count < MIN_CATEGORY_PRODUCT_COUNT) return false;

      const normalizedName = decodeHtmlEntities(category.name).trim().toLowerCase();
      if (EXCLUDED_CATEGORY_NAMES.has(normalizedName)) return false;

      return true;
    })
    .sort((first, second) => second.count - first.count)
    .map((category) => {
      const name = decodeHtmlEntities(category.name);
      return {
        id: category.id,
        name,
        slug: category.slug,
        count: category.count,
        image: category.image!.src,
        imageAlt: decodeHtmlEntities(category.image?.alt || category.image?.name || name),
        href: getCollectionHref(category.slug),
      };
    });
};

export const metadata: Metadata = {
  title: "Painting Categories | Shop by Style | Artace Studio",
  description:
    "Browse every handcrafted canvas painting category at Artace Studio — spiritual, abstract, landscape, figurative, and more. Find the style that fits your space.",
  alternates: {
    canonical: "/collections",
  },
  openGraph: {
    title: "Painting Categories | Shop by Style | Artace Studio",
    description:
      "Browse every handcrafted canvas painting category at Artace Studio, from spiritual and abstract art to landscapes and figurative work.",
    url: "/collections",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Painting Categories | Shop by Style | Artace Studio",
    description: "Browse every handcrafted canvas painting category at Artace Studio.",
  },
};

const CollectionsIndexPage = async () => {
  const categories = await fetchCategories();
  const cards = getCategoryCards(categories);
  const pageUrl = buildSiteUrl("/collections");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}#itemlist`,
    url: pageUrl,
    numberOfItems: cards.length,
    itemListElement: cards.map((card, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: buildSiteUrl(card.href),
      name: card.name,
      image: toAbsoluteImageUrl(card.image),
    })),
  };

  return (
    <main className="bg-[#f4f2ee] py-8 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12">
        <p className="text-[16px] leading-[1.5] text-[#767676] md:text-[18px]">
          Shop by Category
        </p>
        <h1 className="mt-4 font-display text-[36px] leading-[1.1] text-[#1f1f1f] md:mt-5 md:text-[56px]">
          Painting Categories
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-[1.7] text-[#5b5b5b] md:mt-5 md:text-[18px]">
          Every handcrafted canvas painting style Artace Studio offers, from
          spiritual and devotional art to abstract, landscape, and figurative
          work. Pick a category to explore the full collection.
        </p>

        {cards.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-10 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {cards.map((card) => (
              <Link
                key={card.id}
                href={card.href}
                className="group relative block min-h-[220px] overflow-hidden rounded-[12px] bg-[#d6d2ca] sm:min-h-[260px] md:min-h-[280px]"
              >
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 md:bottom-5 md:left-5 md:right-5">
                  <h2 className="font-inter text-[17px] font-medium leading-[1.15] text-white md:text-[18px]">
                    {card.name}
                  </h2>
                  <p className="mt-1 text-[13px] text-white/80 md:text-[14px]">
                    {card.count} {card.count === 1 ? "Painting" : "Paintings"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-[#1f1f1f]/10 bg-white p-8 text-center md:mt-10">
            <p className="text-[#5b5b5b]">
              Categories are being updated right now. Check back soon, or{" "}
              <Link href="/shop" className="text-[#8B4513] underline">
                browse the full shop
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default CollectionsIndexPage;
