import type { Metadata } from "next";
import BlogArchiveCatalog from "@/components/blogarchive/BlogArchiveCatalog";
import { buildBlogClusters } from "@/lib/blog/clusters";
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

const LATEST_COUNT = 3;

export const metadata: Metadata = {
  title: "Art Blog | Painting Tips & Artist Stories | Artace Studio",
  description: "Explore Artace Studio's art blog - Read painting tips, artist stories, and guides. Discover techniques, trends, and inspiration for art enthusiasts.",
  keywords: "art blog, painting tips, artist stories, art guide, painting techniques, art inspiration",
  alternates: {
    canonical: buildSiteUrl("/blogs"),
  },
  openGraph: {
    title: "Art Blog | Painting Tips & Artist Stories | Artace Studio",
    description: "Explore art tips, artist stories, and creative guides.",
    url: "https://artacestudio.com/blogs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Art Blog | Artace Studio",
    description: "Painting tips and artist stories.",
  },
};

const getPublishedTime = (value: string | null) => {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const BlogsPage = async () => {
  let posts: WordPressNormalizedBlogPost[] = [];
  let loadError: string | null = null;

  try {
    const [rawPosts, rawCategories, rawTags] = await Promise.all([
      fetchAllWordPressPosts({ revalidate }),
      fetchAllWordPressCategories({ revalidate }),
      fetchAllWordPressTags({ revalidate }),
    ]);
    posts = normalizeWordPressBlogPosts(rawPosts, rawCategories, rawTags);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load blog posts.";
  }

  const { clusters, unclustered } = buildBlogClusters(posts);
  const latest = [...posts]
    .sort((a, b) => getPublishedTime(b.publishedAt) - getPublishedTime(a.publishedAt))
    .slice(0, LATEST_COUNT);

  return (
    <BlogArchiveCatalog
      latest={latest}
      clusters={clusters}
      unclustered={unclustered}
      loadError={loadError}
    />
  );
};

export default BlogsPage;
