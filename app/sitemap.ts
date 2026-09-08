import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site";
import { ARTISTS } from "@/lib/artists/data";
import { fetchWithRetry } from "@/lib/http/fetch-with-retry";
import { hasSamoraTag } from "@/lib/samora/products";

// Cloudflare Pages (via @cloudflare/next-on-pages) requires every route to be
// edge-compatible, and this route now does live fetches, so it must declare
// edge explicitly (the old, fully-static version of this file happened to
// work without it, but relied on nothing but hardcoded data).
export const runtime = "edge";
export const revalidate = 3600;

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const PRODUCTS_PER_PAGE = 100;
// Covers up to 5,000 products. If the catalog grows past that, switch to
// Next's generateSitemaps() to split output across multiple sitemap files
// (Google's own 50,000-URL-per-sitemap cap is well beyond this either way).
const MAX_PRODUCT_PAGES = 50;
const BLOG_POSTS_PER_PAGE = 100;
const MAX_BLOG_PAGES = 20;
const ROOM_SLUGS = ["pooja-room", "living-room", "bedroom", "dining-room"];
// Category slugs that next.config.ts permanently (308) redirects elsewhere —
// the sitemap should only ever list the redirect's destination, never a URL
// that immediately bounces.
const REDIRECTED_CATEGORY_SLUGS = new Set(["mahadev-nandi-canvas-painting-shiva-devotional-wall-art"]);

type WooStoreProductSummary = {
  slug?: string;
  date_created?: string;
  categories?: { slug?: string }[];
  tags?: { slug?: string }[];
};
type WpPostSummary = { slug?: string; modified?: string };

const getApiBaseUrl = () => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    process.env.WOOCOMMERCE_REST_URL ||
    process.env.WORDPRESS_API_URL ||
    DEFAULT_WOOCOMMERCE_SITE_URL;
  return apiBaseUrl.replace(/\/+$/, "");
};

// Same paginate-until-short-page pattern used by the shop and collections
// pages (app/shop/page.tsx, app/collections/[slug]/page.tsx) — a network
// failure here degrades to an empty list rather than breaking the whole
// sitemap, since the static pages below are still worth serving on their own.
//
// `categories` is fetched per-product (not from the separate /categories
// endpoint) deliberately: app/collections/[slug]/page.tsx only renders a
// category if some product's own `categories[]` names that exact slug, and
// that's a stricter test than the categories endpoint's `hide_empty` flag —
// WooCommerce's default "all-products" catch-all category, for example, is
// non-empty by that endpoint's count but has no product directly tagged with
// it, so it 404s. Deriving category slugs from the products themselves keeps
// the sitemap in exact sync with what the page actually renders.
//
// `tags` is fetched so Samora-tagged products can be excluded below —
// app/shop/[slug]/page.tsx 404s on them (they live exclusively at
// /samora/shop/[slug], a separate storefront not covered by this sitemap).
async function fetchAllProducts(): Promise<WooStoreProductSummary[]> {
  const apiBaseUrl = getApiBaseUrl();
  const products: WooStoreProductSummary[] = [];

  for (let page = 1; page <= MAX_PRODUCT_PAGES; page += 1) {
    try {
      const response = await fetchWithRetry(
        `${apiBaseUrl}/wp-json/wc/store/v1/products?per_page=${PRODUCTS_PER_PAGE}&page=${page}&_fields=slug,date_created,categories,tags`,
        { next: { revalidate } }
      );
      if (!response.ok) break;
      const payload = (await response.json()) as WooStoreProductSummary[];
      if (!Array.isArray(payload) || payload.length === 0) break;
      products.push(...payload);
      if (payload.length < PRODUCTS_PER_PAGE) break;
    } catch {
      break;
    }
  }

  return products;
}

async function fetchAllBlogPosts(): Promise<WpPostSummary[]> {
  const apiBaseUrl = getApiBaseUrl();
  const posts: WpPostSummary[] = [];

  for (let page = 1; page <= MAX_BLOG_PAGES; page += 1) {
    try {
      const response = await fetchWithRetry(
        `${apiBaseUrl}/wp-json/wp/v2/posts?per_page=${BLOG_POSTS_PER_PAGE}&page=${page}&_fields=slug,modified&status=publish`,
        { next: { revalidate } }
      );
      if (!response.ok) break;
      const payload = (await response.json()) as WpPostSummary[];
      if (!Array.isArray(payload) || payload.length === 0) break;
      posts.push(...payload);
      if (payload.length < BLOG_POSTS_PER_PAGE) break;
    } catch {
      break;
    }
  }

  return posts;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteOrigin();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/collections`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/artists`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/about-us`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact-us`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/terms-of-use`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/return-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/cancellation-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/custom-order`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/custom-portraits`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/corporate-bulk-orders`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/exhibition`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/blogs`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/team`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/warli-paintings`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/original-paintings-for-sale-ireland`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/original-abstract-art-for-sale-uk`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/original-abstract-art-for-sale-nz`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/rentals`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/art-care`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/canvas-rolls`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/interior-designer-partnership`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/trade`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/make-an-offer`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/reviews`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/affiliates`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/rewards`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/gift-cards`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const roomPages: MetadataRoute.Sitemap = ROOM_SLUGS.map((slug) => ({
    url: `${baseUrl}/rooms/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const artistPages: MetadataRoute.Sitemap = ARTISTS.map((artist) => ({
    url: `${baseUrl}/artists/${artist.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const [products, blogPosts] = await Promise.all([
    fetchAllProducts(),
    fetchAllBlogPosts(),
  ]);

  // Samora-tagged products belong to a separate storefront (/samora/shop/[slug])
  // and 404 at /shop/[slug] and on /collections/[slug] — see the comment on
  // fetchAllProducts above.
  const nonSamoraProducts = products.filter((product) => !hasSamoraTag(product.tags ?? []));

  const categorySlugs = new Set<string>();
  for (const product of nonSamoraProducts) {
    for (const category of product.categories ?? []) {
      if (category.slug && !REDIRECTED_CATEGORY_SLUGS.has(category.slug)) {
        categorySlugs.add(category.slug);
      }
    }
  }

  const productPages: MetadataRoute.Sitemap = nonSamoraProducts
    .filter((product) => Boolean(product.slug))
    .map((product) => ({
      url: `${baseUrl}/shop/${product.slug}`,
      lastModified: product.date_created ? new Date(product.date_created) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const categoryPages: MetadataRoute.Sitemap = Array.from(categorySlugs).map((slug) => ({
    url: `${baseUrl}/collections/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts
    .filter((post) => Boolean(post.slug))
    .map((post) => ({
      url: `${baseUrl}/blogs/${post.slug}`,
      lastModified: post.modified ? new Date(post.modified) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [
    ...staticPages,
    ...roomPages,
    ...artistPages,
    ...productPages,
    ...categoryPages,
    ...blogPages,
  ];
}
