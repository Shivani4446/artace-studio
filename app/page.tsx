import React from "react";
import HeroSection from "@/components/homepage/HeroSection";
import ShopBestSellers from "@/components/homepage/ShopBestSellers";
import DiscoverEssentials from "@/components/homepage/DiscoverEssentials";
import ShopByArtist from "@/components/homepage/ShopByArtist";
import PromotionalBanner from "@/components/homepage/PromotionalBanner";
import Testimonials from "@/components/homepage/Testimonials";
import JournalSection from "@/components/homepage/JournalSection";
import ArtistInvitation from "@/components/homepage/ArtistInvitation";
import { decodeHtmlEntities } from "@/utils/text";

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const FALLBACK_CATEGORY_IMAGE = "/images/product-ship.png";
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
        href: `/shop?category=${encodeURIComponent(category.slug)}`,
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
        next: { revalidate: 120 },
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
      <HeroSection />
      <ShopBestSellers />
      <DiscoverEssentials categories={discoverCategories} />
      <ShopByArtist />
      <Testimonials />
      <PromotionalBanner />
      <JournalSection />
      <ArtistInvitation />
    </main>
  );
};

export default Home;
