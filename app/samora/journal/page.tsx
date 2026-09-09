import type { Metadata } from "next";
import SamoraJournalListing from "@/components/samora/SamoraJournalListing";
import {
  getWordPressBlogSiteUrl,
  normalizeWordPressBlogPosts,
  type WordPressBlogPost,
} from "@/utils/wordpress-blog";
import { fetchWithRetry } from "@/lib/http/fetch-with-retry";

export const runtime = "edge";
// Next.js requires route-segment config exports like `revalidate` to be a
// literal in this file — it statically parses this export without
// evaluating imports, so re-exporting an imported constant here silently
// breaks the build ("Unknown identifier ... at revalidate"). Keep this in
// sync with WORDPRESS_BLOG_REVALIDATE_SECONDS in utils/wordpress-blog.ts.
export const revalidate = 120;

// Filtered by WordPress's own category_name query var (a public, unauthenticated
// read — no need to look up the category ID first). Returns an empty array
// until a real post is published under a "Samora" category in WP admin;
// WordPress creates that category automatically the first time it's assigned
// to a post, so nothing needs to be pre-created here.
const getSamoraJournalPosts = async (): Promise<WordPressBlogPost[]> => {
  try {
    const siteUrl = getWordPressBlogSiteUrl();
    const response = await fetchWithRetry(
      `${siteUrl}/wp-json/wp/v2/posts?category_name=samora&status=publish&_embed&per_page=24`,
      { next: { revalidate } }
    );
    if (!response.ok) return [];
    const payload = (await response.json()) as WordPressBlogPost[];
    return Array.isArray(payload) ? payload : [];
  } catch {
    return [];
  }
};

const TITLE = "Journal | Samora by Artace Studio";
const DESCRIPTION =
  "Stories from the Samora workshop — notes on materials, the craft behind each handmade piece, and what's new at Samora.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/samora/journal",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/samora/journal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const SamoraJournalPage = async () => {
  const rawPosts = await getSamoraJournalPosts();
  const posts = normalizeWordPressBlogPosts(rawPosts, [], []);

  return <SamoraJournalListing posts={posts} />;
};

export default SamoraJournalPage;
