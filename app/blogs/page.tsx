import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArchiveCatalog from "@/components/blogarchive/BlogArchiveCatalog";
import { buildBlogCategories, type BlogCategory } from "@/lib/blog/categories";
import { buildSiteUrl } from "@/lib/site";
import {
  fetchAllWordPressCategories,
  fetchAllWordPressPosts,
  fetchAllWordPressTags,
  normalizeWordPressBlogPosts,
  type WordPressNormalizedBlogPost,
} from "@/utils/wordpress-blog";

// Rendered on the server so crawlers and AI assistants see every article in
// the HTML. Edge runtime to match the Cloudflare Pages adapter.
export const runtime = "edge";
export const revalidate = 120;

const PAGE_SIZE = 10;

type Props = {
  searchParams: Promise<{ category?: string | string[]; page?: string | string[] }>;
};

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const getPublishedTime = (value: string | null) => {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

type ArchiveData = {
  posts: WordPressNormalizedBlogPost[];
  categories: BlogCategory[];
  loadError: string | null;
};

const loadArchive = async (): Promise<ArchiveData> => {
  try {
    const [rawPosts, rawCategories, rawTags] = await Promise.all([
      fetchAllWordPressPosts({ revalidate }),
      fetchAllWordPressCategories({ revalidate }),
      fetchAllWordPressTags({ revalidate }),
    ]);
    const posts = normalizeWordPressBlogPosts(rawPosts, rawCategories, rawTags).sort(
      (a, b) => getPublishedTime(b.publishedAt) - getPublishedTime(a.publishedAt)
    );
    return { posts, categories: buildBlogCategories(posts, rawCategories), loadError: null };
  } catch (error) {
    return {
      posts: [],
      categories: [],
      loadError: error instanceof Error ? error.message : "Unable to load blog posts.",
    };
  }
};

const DEFAULT_TITLE = "Art Blog | Painting Tips & Artist Stories | Artace Studio";
const DEFAULT_DESCRIPTION =
  "Explore Artace Studio's art blog - Read painting tips, artist stories, and guides. Discover techniques, trends, and inspiration for art enthusiasts.";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const categorySlug = first((await searchParams).category);
  const category = categorySlug
    ? (await loadArchive()).categories.find((item) => item.slug === categorySlug)
    : undefined;

  const title = category ? `${category.name} | Art Blog | Artace Studio` : DEFAULT_TITLE;
  const description = category?.description || DEFAULT_DESCRIPTION;
  const url = buildSiteUrl(category ? `/blogs?category=${category.slug}` : "/blogs");

  return {
    title,
    description,
    keywords: "art blog, painting tips, artist stories, art guide, painting techniques, art inspiration",
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

const BlogsPage = async ({ searchParams }: Props) => {
  const params = await searchParams;
  const categorySlug = first(params.category);
  const { posts, categories, loadError } = await loadArchive();

  const activeCategory = categorySlug
    ? categories.find((category) => category.slug === categorySlug)
    : undefined;
  if (categorySlug && !activeCategory && !loadError) notFound();

  const filtered = activeCategory
    ? posts.filter((post) => post.categories.includes(activeCategory.name))
    : posts;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requestedPage = Number.parseInt(first(params.page) ?? "1", 10);
  const page = Number.isFinite(requestedPage)
    ? Math.min(Math.max(1, requestedPage), totalPages)
    : 1;

  return (
    <BlogArchiveCatalog
      posts={filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
      totalPosts={posts.length}
      filteredCount={filtered.length}
      categories={categories}
      activeCategory={activeCategory ?? null}
      page={page}
      totalPages={totalPages}
      loadError={loadError}
    />
  );
};

export default BlogsPage;
