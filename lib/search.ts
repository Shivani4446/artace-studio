import { collectionLinkItems, getCollectionHref } from "@/utils/collections";
import { decodeHtmlEntities, stripHtmlAndDecode } from "@/utils/text";

export type SearchProduct = {
  id: number;
  name: string;
  slug: string;
  image?: string;
};

export type SearchBlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
};

export type SearchCollection = {
  id: string;
  title: string;
  href: string;
};

export type SearchPage = {
  id: string;
  title: string;
  href: string;
};

const getSiteUrl = () =>
  (process.env.WOOCOMMERCE_REST_URL ||
    process.env.WORDPRESS_API_URL ||
    process.env.WOOCOMMERCE_SITE_URL ||
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    "https://api.artacestudio.com/")
    .replace(/\/+$/, "");

const getWooAuthHeaders = () => {
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) return {};

  const raw = `${consumerKey}:${consumerSecret}`;
  const encoded =
    typeof btoa === "function"
      ? btoa(raw)
      : (globalThis as { Buffer?: { from: (v: string, enc?: string) => { toString: (enc: string) => string } } })
          .Buffer?.from(raw, "utf8")
          .toString("base64");

  if (!encoded) return {};

  return { Authorization: `Basic ${encoded}` };
};

const buildStoreApiUrl = (query: string, limit: number) => {
  const siteUrl = getSiteUrl();
  const url = new URL(`${siteUrl}/wp-json/wc/store/v1/products`);
  url.searchParams.set("search", query);
  url.searchParams.set("per_page", String(limit));
  return url.toString();
};

const buildWooApiUrl = (query: string, limit: number) => {
  const siteUrl = getSiteUrl();
  const url = new URL(`${siteUrl}/wp-json/wc/v3/products`);
  url.searchParams.set("search", query);
  url.searchParams.set("status", "publish");
  url.searchParams.set("per_page", String(limit));
  return url.toString();
};

const buildBlogApiUrl = (query: string, limit: number) => {
  const siteUrl = getSiteUrl();
  const url = new URL(`${siteUrl}/wp-json/wp/v2/posts`);
  url.searchParams.set("search", query);
  url.searchParams.set("per_page", String(limit));
  url.searchParams.set("_fields", "id,slug,title,excerpt");
  return url.toString();
};

export async function fetchSearchResults(
  query: string,
  {
    productLimit = 8,
    blogLimit = 6,
  }: { productLimit?: number; blogLimit?: number } = {}
) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return {
      products: [] as SearchProduct[],
      blogs: [] as SearchBlogPost[],
      collections: [] as SearchCollection[],
      pages: [] as SearchPage[],
    };
  }

  const normalizedQuery = trimmedQuery.toLowerCase();
  const collections = collectionLinkItems
    .filter((collection) =>
      `${collection.name} ${collection.categorySlug}`
        .toLowerCase()
        .includes(normalizedQuery)
    )
    .map((collection) => ({
      id: collection.categorySlug,
      title: collection.name,
      href: getCollectionHref(collection.categorySlug),
    }));

  const pages: SearchPage[] = [
    { id: "team", title: "Team", href: "/team" },
  ].filter((page) => page.title.toLowerCase().includes(normalizedQuery));

  const [productResponse, blogResponse] = await Promise.all([
    fetch(buildStoreApiUrl(trimmedQuery, productLimit)),
    fetch(buildBlogApiUrl(trimmedQuery, blogLimit)),
  ]);

  const wooAuthHeaders = getWooAuthHeaders();
  const wooResponse =
    Object.keys(wooAuthHeaders).length > 0
      ? await fetch(buildWooApiUrl(trimmedQuery, productLimit), {
          headers: wooAuthHeaders,
        })
      : null;

  let products: SearchProduct[] = [];
  let blogs: SearchBlogPost[] = [];

  if (productResponse.ok) {
    const payload = (await productResponse.json()) as Array<{
      id?: number;
      name?: string;
      slug?: string;
      images?: Array<{ src?: string }>;
    }>;
    products = (payload || [])
      .map((item) => ({
        id: item.id ?? 0,
        name: decodeHtmlEntities(item.name || ""),
        slug: item.slug || "",
        image: item.images?.[0]?.src,
      }))
      .filter((item) => item.id && item.slug);
  }

  if (wooResponse && wooResponse.ok) {
    const payload = (await wooResponse.json()) as Array<{
      id?: number;
      name?: string;
      slug?: string;
      images?: Array<{ src?: string }>;
    }>;
    const wooProducts = (payload || [])
      .map((item) => ({
        id: item.id ?? 0,
        name: decodeHtmlEntities(item.name || ""),
        slug: item.slug || "",
        image: item.images?.[0]?.src,
      }))
      .filter((item) => item.id && item.slug);

    const merged = new Map<string, SearchProduct>();
    for (const item of products) {
      merged.set(item.slug, item);
    }
    for (const item of wooProducts) {
      const existing = merged.get(item.slug);
      if (!existing) {
        merged.set(item.slug, item);
      } else if (!existing.image && item.image) {
        merged.set(item.slug, { ...existing, image: item.image });
      }
    }
    products = Array.from(merged.values());
  }

  if (blogResponse.ok) {
    const payload = (await blogResponse.json()) as Array<{
      id?: number;
      slug?: string;
      title?: { rendered?: string };
      excerpt?: { rendered?: string };
    }>;
    blogs = (payload || [])
      .map((item) => ({
        id: item.id ?? 0,
        slug: item.slug || "",
        title: stripHtmlAndDecode(item.title?.rendered),
        excerpt: stripHtmlAndDecode(item.excerpt?.rendered),
      }))
      .filter((item) => item.id && item.slug);
  }

  return { products, blogs, collections, pages };
}
