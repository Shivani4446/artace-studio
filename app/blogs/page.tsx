import BlogArchiveCatalog, {
  type BlogArchivePost,
} from "@/components/blogarchive/BlogArchiveCatalog";
import { stripHtmlAndDecode } from "@/utils/text";

export const revalidate = 120;

const DEFAULT_WORDPRESS_SITE_URL = "https://artacestudio.com";
const FALLBACK_BLOG_IMAGE = "/journal-img.webp";

type WordPressRendered = {
  rendered?: string;
};

type WordPressEmbeddedCategory = {
  id: number;
  name?: string;
  taxonomy?: string;
};

type WordPressPost = {
  id: number;
  slug: string;
  title?: WordPressRendered;
  excerpt?: WordPressRendered;
  date?: string;
  modified?: string;
  categories?: number[];
  _embedded?: {
    ["wp:featuredmedia"]?: Array<{
      source_url?: string;
      alt_text?: string;
    }>;
    ["wp:term"]?: WordPressEmbeddedCategory[][];
  };
};

type WordPressCategory = {
  id: number;
  name: string;
};

const getWordPressSiteUrl = () =>
  (
    process.env.WOOCOMMERCE_SITE_URL ||
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    DEFAULT_WORDPRESS_SITE_URL
  ).replace(/\/+$/, "");

const fetchAllPosts = async (siteUrl: string): Promise<WordPressPost[]> => {
  const allPosts: WordPressPost[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await fetch(
      `${siteUrl}/wp-json/wp/v2/posts?status=publish&per_page=100&page=${page}&_embed`,
      {
        next: { revalidate: 120 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch posts (${response.status}).`);
    }

    const payload = (await response.json()) as WordPressPost[];
    allPosts.push(...(Array.isArray(payload) ? payload : []));

    const totalPagesHeader = response.headers.get("x-wp-totalpages");
    const parsedTotalPages = totalPagesHeader ? Number(totalPagesHeader) : 1;
    totalPages =
      Number.isFinite(parsedTotalPages) && parsedTotalPages > 0
        ? parsedTotalPages
        : 1;

    page += 1;
  } while (page <= totalPages);

  return allPosts;
};

const fetchAllCategories = async (siteUrl: string): Promise<WordPressCategory[]> => {
  const allCategories: WordPressCategory[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await fetch(
      `${siteUrl}/wp-json/wp/v2/categories?per_page=100&page=${page}`,
      {
        next: { revalidate: 120 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch categories (${response.status}).`);
    }

    const payload = (await response.json()) as WordPressCategory[];
    allCategories.push(...(Array.isArray(payload) ? payload : []));

    const totalPagesHeader = response.headers.get("x-wp-totalpages");
    const parsedTotalPages = totalPagesHeader ? Number(totalPagesHeader) : 1;
    totalPages =
      Number.isFinite(parsedTotalPages) && parsedTotalPages > 0
        ? parsedTotalPages
        : 1;

    page += 1;
  } while (page <= totalPages);

  return allCategories;
};

const normalizePosts = (
  posts: WordPressPost[],
  categories: WordPressCategory[]
): BlogArchivePost[] => {
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  return posts.map((post) => {
    const title = stripHtmlAndDecode(post.title?.rendered ?? "");
    const excerpt = stripHtmlAndDecode(post.excerpt?.rendered ?? "");

    const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
    const image = featuredMedia?.source_url || FALLBACK_BLOG_IMAGE;
    const imageAlt = stripHtmlAndDecode(featuredMedia?.alt_text || title || "Blog image");

    const categoriesFromIds = (post.categories ?? [])
      .map((categoryId) => categoryNameById.get(categoryId))
      .filter((value): value is string => typeof value === "string" && value.length > 0);

    const categoriesFromEmbedded = (post._embedded?.["wp:term"] ?? [])
      .flat()
      .filter((term) => term.taxonomy === "category")
      .map((term) => stripHtmlAndDecode(term.name ?? ""))
      .filter(Boolean);

    const resolvedCategories = Array.from(
      new Set([...categoriesFromIds, ...categoriesFromEmbedded])
    );

    return {
      id: post.id,
      slug: post.slug,
      title: title || "Untitled",
      excerpt: excerpt || "Read the full story to explore this blog post.",
      image,
      imageAlt,
      categories: resolvedCategories.length > 0 ? resolvedCategories : ["Uncategorized"],
      publishedAt: post.date || null,
      modifiedAt: post.modified || post.date || null,
    };
  });
};

const BlogsPage = async () => {
  let posts: BlogArchivePost[] = [];
  let loadError: string | null = null;

  try {
    const siteUrl = getWordPressSiteUrl();
    const [rawPosts, rawCategories] = await Promise.all([
      fetchAllPosts(siteUrl),
      fetchAllCategories(siteUrl),
    ]);
    posts = normalizePosts(rawPosts, rawCategories);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load blog posts.";
  }

  return <BlogArchiveCatalog posts={posts} loadError={loadError} />;
};

export default BlogsPage;
