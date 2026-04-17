import React from "react";
import type { Metadata } from "next";
import HeroSection from "@/components/homepage/HeroSection";
import ShopBestSellers from "@/components/homepage/ShopBestSellers";
import DiscoverEssentials from "@/components/homepage/DiscoverEssentials";
import TrueArtistrySection from "@/components/homepage/TrueArtistrySection";
// import ShopByArtist from "@/components/homepage/ShopByArtist";
import PromotionalBanner from "@/components/homepage/PromotionalBanner";
import Testimonials from "@/components/homepage/Testimonials";
import JournalSection from "@/components/homepage/JournalSection";
import ArtistInvitation from "@/components/homepage/ArtistInvitation";
import FAQSection from "@/components/seo/FAQSection";
import { buildSiteUrl } from "@/lib/site";
import { decodeHtmlEntities } from "@/utils/text";
import { getCollectionHref } from "@/utils/collections";
import { homepageFaqs, homepageSchema } from "./homepage-schema";

export const metadata: Metadata = {
  title: "Handcrafted Canvas Paintings in India | Artace Studio",
  description:
    "Buy handcrafted canvas paintings online in India, including spiritual wall art, abstract canvases, and custom-made commissions for homes, offices, and gifting.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Handcrafted Canvas Paintings in India | Artace Studio",
    description:
      "Shop handcrafted canvas paintings online in India, from spiritual and abstract art to custom commissions designed for your space.",
    url: "/",
    images: [
      {
        url: buildSiteUrl("/artace-studio-home-page-og-image.webp"),
        width: 1200,
        height: 630,
        alt: "Handcrafted canvas paintings from Artace Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Handcrafted Canvas Paintings in India | Artace Studio",
    description:
      "Discover original wall art, spiritual paintings, and custom canvas commissions from Artace Studio.",
    images: [buildSiteUrl("/artace-studio-home-page-og-image.webp")],
  },
};

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const FALLBACK_CATEGORY_IMAGE = "/images/product-ship.png";
const STOREFRONT_REVALIDATE_SECONDS = 60;
const EXCLUDED_DISCOVER_CATEGORY_SLUGS = new Set([
  "all-canvas-paintings",
  "all-canvas-paintngs",
]);
const EXCLUDED_DISCOVER_CATEGORY_NAMES = new Set([
  "all canvas paintings",
  "all canvas paintngs",
]);

type WooStoreCategoryImage = {
  id: number;
  src: string;
  thumbnail?: string;
  alt?: string;
  name?: string;
};

type WooStoreProductCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
  image?: WooStoreCategoryImage | null;
};

type DiscoverCategoryCard = {
  id: number;
  title: string;
  image: string;
  imageAlt: string;
  href: string;
};

const normalizeDiscoverCategories = (
  categories: WooStoreProductCategory[]
): DiscoverCategoryCard[] => {
  return categories
    .filter((category) => {
      if (!category.slug || !category.name) return false;

      const normalizedSlug = category.slug.trim().toLowerCase();
      const normalizedName = decodeHtmlEntities(category.name).trim().toLowerCase();

      if (EXCLUDED_DISCOVER_CATEGORY_SLUGS.has(normalizedSlug)) return false;
      if (EXCLUDED_DISCOVER_CATEGORY_NAMES.has(normalizedName)) return false;

      return true;
    })
    .sort((first, second) => second.count - first.count)
    .map((category) => {
      const title = decodeHtmlEntities(category.name);
      const imageUrl = category.image?.src || FALLBACK_CATEGORY_IMAGE;
      const imageAlt = decodeHtmlEntities(category.image?.alt || category.image?.name || title);

      return {
        id: category.id,
        title,
        image: imageUrl,
        imageAlt,
        href: getCollectionHref(category.slug),
      };
    });
};

const getDiscoverCategories = async (): Promise<DiscoverCategoryCard[]> => {
  try {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || DEFAULT_WOOCOMMERCE_SITE_URL;
    const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, "");

    const response = await fetch(
      `${normalizedBaseUrl}/wp-json/wc/store/v1/products/categories?hide_empty=true&per_page=24`,
      {
        next: { revalidate: STOREFRONT_REVALIDATE_SECONDS },
      }
    );

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as WooStoreProductCategory[];
    if (!Array.isArray(payload)) return [];

    return normalizeDiscoverCategories(payload);
  } catch {
    return [];
  }
};

const Home = async () => {
  const discoverCategories = await getDiscoverCategories();

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />
      <HeroSection />
      <ShopBestSellers />
      <DiscoverEssentials categories={discoverCategories} />
      <TrueArtistrySection />
      {/* <ShopByArtist /> */}
      <Testimonials />
      <PromotionalBanner />
      <JournalSection />
      <FAQSection
        id="homepage-faqs"
        eyebrow="Buyer Questions"
        title="Questions Buyers Ask Before Ordering Handmade Art"
        intro="These answers help search engines and AI assistants understand what Artace Studio offers, while giving buyers the practical detail they need before placing an order."
        items={[...homepageFaqs]}
      />
      <ArtistInvitation />
    </main>
  );
};

export default Home;
