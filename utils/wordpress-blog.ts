import { stripHtmlAndDecode } from "@/utils/text";

export const DEFAULT_WORDPRESS_SITE_URL = "https://api.artacestudio.com/";
export const WORDPRESS_BLOG_REVALIDATE_SECONDS = 120;
const FALLBACK_BLOG_IMAGE = "/journal-img.webp";
const PUBLIC_WORDPRESS_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": "ArtaceStudio-Storefront/1.0",
};

type WordPressRendered = {
  rendered?: string;
};

type WordPressEmbeddedMedia = {
  source_url?: string;
  alt_text?: string;
};

export type WordPressEmbeddedTerm = {
  id: number;
  name?: string;
  slug?: string;
  taxonomy?: string;
};

export type WordPressBlogPost = {
  id: number;
  slug: string;
  title?: WordPressRendered;
  excerpt?: WordPressRendered;
  content?: WordPressRendered;
  date?: string;
  modified?: string;
  author?: number;
  categories?: number[];
  tags?: number[];
  _embedded?: {
    author?: Array<Record<string, unknown>>;
    ["wp:featuredmedia"]?: WordPressEmbeddedMedia[];
    ["wp:term"]?: WordPressEmbeddedTerm[][];
  };
};

export type WordPressTaxonomyTerm = {
  id: number;
  name: string;
  slug?: string;
  count?: number;
};

export type WordPressNormalizedBlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  categories: string[];
  tags: string[];
  publishedAt: string | null;
  modifiedAt: string | null;
};

type FetchOptions = {
  siteUrl?: string;
  revalidate?: number;
};

const uniqueSortedStrings = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean))).sort((first, second) =>
    first.localeCompare(second)
  );

export const getWordPressBlogSiteUrl = () =>
  (
    process.env.WORDPRESS_API_URL ||
    process.env.WOOCOMMERCE_SITE_URL ||
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    DEFAULT_WORDPRESS_SITE_URL
  ).replace(/\/+$/, "");

const fetchWordPressCollection = async <T>(
  path: string,
  { siteUrl = getWordPressBlogSiteUrl(), revalidate = WORDPRESS_BLOG_REVALIDATE_SECONDS }: FetchOptions = {}
): Promise<T[]> => {
  const allItems: T[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const separator = path.includes("?") ? "&" : "?";
    const requestPath = `${path}${separator}per_page=100&page=${page}`;
    const primaryUrl = `${siteUrl}${requestPath}`;
    const restRoutePath = requestPath.replace(/^\/wp-json/, "");

    let response: Response;

    try {
      response = await fetch(primaryUrl, {
        headers: PUBLIC_WORDPRESS_HEADERS,
        next: { revalidate },
      });
    } catch {
      const fallbackUrl = `${siteUrl}/?rest_route=${encodeURIComponent(restRoutePath)}`;
      response = await fetch(fallbackUrl, {
        headers: PUBLIC_WORDPRESS_HEADERS,
        next: { revalidate },
      });
    }

    if (response.status === 404) {
      const fallbackUrl = `${siteUrl}/?rest_route=${encodeURIComponent(restRoutePath)}`;
      response = await fetch(fallbackUrl, {
        headers: PUBLIC_WORDPRESS_HEADERS,
        next: { revalidate },
      });
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch WordPress collection (${response.status}).`);
    }

    const payload = (await response.json()) as T[];
    allItems.push(...(Array.isArray(payload) ? payload : []));

    const totalPagesHeader = response.headers.get("x-wp-totalpages");
    const parsedTotalPages = totalPagesHeader ? Number(totalPagesHeader) : 1;
    totalPages =
      Number.isFinite(parsedTotalPages) && parsedTotalPages > 0 ? parsedTotalPages : 1;

    page += 1;
  } while (page <= totalPages);

  return allItems;
};

export const fetchAllWordPressPosts = async (
  options?: FetchOptions
): Promise<WordPressBlogPost[]> =>
  fetchWordPressCollection<WordPressBlogPost>("/wp-json/wp/v2/posts?status=publish&_embed", options);

export const fetchAllWordPressCategories = async (
  options?: FetchOptions
): Promise<WordPressTaxonomyTerm[]> => {
  try {
    return await fetchWordPressCollection<WordPressTaxonomyTerm>("/wp-json/wp/v2/categories", options);
  } catch {
    return [];
  }
};

export const fetchAllWordPressTags = async (
  options?: FetchOptions
): Promise<WordPressTaxonomyTerm[]> => {
  try {
    return await fetchWordPressCollection<WordPressTaxonomyTerm>("/wp-json/wp/v2/tags", options);
  } catch {
    return [];
  }
};

const getEmbeddedTermsByTaxonomy = (
  post: WordPressBlogPost,
  taxonomy: "category" | "post_tag"
) =>
  (post._embedded?.["wp:term"] ?? [])
    .flat()
    .filter((term) => term.taxonomy === taxonomy);

export const resolveWordPressPostCategories = (
  post: WordPressBlogPost,
  categories: WordPressTaxonomyTerm[]
) => {
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  const categoriesFromIds = (post.categories ?? [])
    .map((categoryId) => categoryNameById.get(categoryId))
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  const categoriesFromEmbedded = getEmbeddedTermsByTaxonomy(post, "category")
    .map((term) => stripHtmlAndDecode(term.name ?? ""))
    .filter(Boolean);

  const resolvedCategories = uniqueSortedStrings([...categoriesFromIds, ...categoriesFromEmbedded]);

  return resolvedCategories.length > 0 ? resolvedCategories : ["Uncategorized"];
};

export const resolveWordPressPostTags = (
  post: WordPressBlogPost,
  tags: WordPressTaxonomyTerm[]
) => {
  const tagNameById = new Map(tags.map((tag) => [tag.id, tag.name]));

  const tagsFromIds = (post.tags ?? [])
    .map((tagId) => tagNameById.get(tagId))
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  const tagsFromEmbedded = getEmbeddedTermsByTaxonomy(post, "post_tag")
    .map((term) => stripHtmlAndDecode(term.name ?? ""))
    .filter(Boolean);

  return uniqueSortedStrings([...tagsFromIds, ...tagsFromEmbedded]);
};

export const normalizeWordPressBlogPosts = (
  posts: WordPressBlogPost[],
  categories: WordPressTaxonomyTerm[],
  tags: WordPressTaxonomyTerm[]
): WordPressNormalizedBlogPost[] =>
  posts.map((post) => {
    const title = stripHtmlAndDecode(post.title?.rendered ?? "");
    const excerpt = stripHtmlAndDecode(post.excerpt?.rendered ?? "");
    const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
    const image = featuredMedia?.source_url || FALLBACK_BLOG_IMAGE;
    const imageAlt = stripHtmlAndDecode(featuredMedia?.alt_text || title || "Blog image");

    return {
      id: post.id,
      slug: post.slug,
      title: title || "Untitled",
      excerpt: excerpt || "Read the full story to explore this blog post.",
      image,
      imageAlt,
      categories: resolveWordPressPostCategories(post, categories),
      tags: resolveWordPressPostTags(post, tags),
      publishedAt: post.date || null,
      modifiedAt: post.modified || post.date || null,
    };
  });

export const getWordPressTaxonomyNames = (
  terms: WordPressTaxonomyTerm[],
  fallbackValues: string[] = []
) => {
  const primaryNames = uniqueSortedStrings(
    terms.map((term) => stripHtmlAndDecode(term.name ?? "")).filter(Boolean)
  );

  if (primaryNames.length > 0) {
    return primaryNames;
  }

  return uniqueSortedStrings(fallbackValues);
};
