import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SamoraJournalPost from "@/components/samora/SamoraJournalPost";
import { htmlToArticleContent } from "@/utils/article";
import { decodeHtmlEntities, stripHtmlAndDecode } from "@/utils/text";
import { buildSiteUrl } from "@/lib/site";
import {
  getWordPressBlogSiteUrl,
  type WordPressBlogPost,
} from "@/utils/wordpress-blog";

export const runtime = "edge";
// Next.js requires route-segment config exports like `revalidate` to be a
// literal in this file — it statically parses this export without
// evaluating imports, so re-exporting an imported constant here silently
// breaks the build ("Unknown identifier ... at revalidate"). Keep this in
// sync with WORDPRESS_BLOG_REVALIDATE_SECONDS in utils/wordpress-blog.ts.
export const revalidate = 120;

const FALLBACK_IMAGE = "/journal-img.webp";

type Props = {
  params: Promise<{ slug: string }>;
};

const getPost = async (slug: string): Promise<WordPressBlogPost | null> => {
  try {
    const siteUrl = getWordPressBlogSiteUrl();
    const normalizedSlug = decodeURIComponent(slug).trim().toLowerCase();
    const response = await fetch(
      `${siteUrl}/wp-json/wp/v2/posts?slug=${encodeURIComponent(normalizedSlug)}&_embed`,
      { next: { revalidate } }
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as WordPressBlogPost[];
    return payload[0] || null;
  } catch {
    return null;
  }
};

// A post must actually carry the "samora" category to be reachable here —
// otherwise any Artace blog post's slug would also resolve under
// /samora/journal/, the same cross-storefront leak this project has already
// hit once with products (see the sitemap's Samora-exclusion comment).
const hasSamoraCategory = (post: WordPressBlogPost) =>
  (post._embedded?.["wp:term"] ?? [])
    .flat()
    .some((term) => term.taxonomy === "category" && term.slug === "samora");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !hasSamoraCategory(post)) {
    return { title: "Journal | Samora by Artace Studio" };
  }

  const title = stripHtmlAndDecode(post.title?.rendered ?? "");
  const description = stripHtmlAndDecode(post.excerpt?.rendered ?? "");
  const url = buildSiteUrl(`/samora/journal/${slug}`);

  return {
    title: title ? `${title} | Samora Journal` : "Samora Journal",
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

const SamoraJournalPostPage = async ({ params }: Props) => {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post || !hasSamoraCategory(post)) {
    notFound();
  }

  const title = stripHtmlAndDecode(post.title?.rendered ?? "") || "Untitled";
  const { html: contentHtml } = htmlToArticleContent(decodeHtmlEntities(post.content?.rendered ?? ""));
  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
  const image = featuredMedia?.source_url || FALLBACK_IMAGE;
  const imageAlt = stripHtmlAndDecode(featuredMedia?.alt_text || title);

  return (
    <SamoraJournalPost
      title={title}
      contentHtml={contentHtml}
      publishedAt={post.date || null}
      image={image}
      imageAlt={imageAlt}
    />
  );
};

export default SamoraJournalPostPage;
