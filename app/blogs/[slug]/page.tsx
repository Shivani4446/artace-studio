import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import ArticleLayout from "@/components/article/ArticleLayout";
import {
  estimateReadTimeMinutes,
  formatArticleDate,
  htmlToArticleContent,
  extractWooCommerceProductIds,
  extractWooCommerceProductSlugs,
  extractRankMathToc,
  extractRankMathFaq,
} from "@/utils/article";
import { decodeHtmlEntities, stripHtmlAndDecode } from "@/utils/text";
import { generateFaqSchema } from "@/lib/schema";
import { buildSiteUrl } from "@/lib/site";
import { fetchWithRetry } from "@/lib/http/fetch-with-retry";
import {
  getWordPressBlogSiteUrl,
  resolveWordPressPostTags,
  type WordPressBlogPost,
} from "@/utils/wordpress-blog";

export const runtime = 'edge';
export const revalidate = 120;

const WORDPRESS_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": "ArtaceStudio-Storefront/1.0",
};

type Props = {
  params: Promise<{ slug: string }>;
};

// Returns null only when WordPress answers successfully with no matching post.
// A rate limit (429), 5xx or network failure throws instead, so the page shows
// the self-retrying error boundary (error.tsx) rather than a false 404 that
// tells visitors and Google the article no longer exists.
async function fetchPost(
  endpoint: string,
  cacheOptions: RequestInit
): Promise<WordPressBlogPost | null> {
  const res = await fetchWithRetry(endpoint, {
    headers: WORDPRESS_HEADERS,
    ...cacheOptions,
  });
  if (!res.ok) {
    throw new Error(`WordPress post lookup failed (${res.status}).`);
  }
  const data = (await res.json()) as WordPressBlogPost[];
  return (Array.isArray(data) && data[0]) || null;
}

const getPost = cache(async (slug: string): Promise<WordPressBlogPost | null> => {
  const siteUrl = getWordPressBlogSiteUrl();
  const normalizedSlug = decodeURIComponent(slug).trim().toLowerCase();
  const endpoint = `${siteUrl}/wp-json/wp/v2/posts?slug=${encodeURIComponent(normalizedSlug)}&_embed`;

  const cachedPost = await fetchPost(endpoint, { next: { revalidate: 120 } });
  if (cachedPost) return cachedPost;

  // A cached miss can mean the post was only just published and hasn't reached
  // the cache yet. Re-check with a short cache (not no-store, so bots hitting
  // dead URLs can't hammer WordPress) before returning a 404.
  return fetchPost(endpoint, { next: { revalidate: 15 } });
});

async function getAuthor(authorId: number) {
  const siteUrl = getWordPressBlogSiteUrl();
  try {
    const res = await fetchWithRetry(
      `${siteUrl}/wp-json/wp/v2/users/${authorId}`,
      { next: { revalidate: 60 } },
    );

    if (!res.ok) return null;

    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Metadata falls back to generic values if WordPress is unavailable; the
  // page itself then shows the retry boundary.
  const post = await getPost(slug).catch(() => null);
  const plainTitle = stripHtmlAndDecode(post?.title?.rendered ?? "");
  const plainDescription = stripHtmlAndDecode(post?.excerpt?.rendered ?? "");

  const postUrl = buildSiteUrl(`/blogs/${slug}`);

  return {
    title: plainTitle ? `${plainTitle} | Artace Studio` : "Blog | Artace Studio",
    description: plainDescription,
    keywords: `${plainTitle}, art blog, painting guide, art tutorial`,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: plainTitle ? `${plainTitle} | Artace Studio` : "Blog | Artace Studio",
      description: plainDescription,
      type: "article",
      url: postUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: plainTitle ? `${plainTitle} | Artace Studio` : "Blog | Artace Studio",
      description: plainDescription,
    },
  };
}

const SingleBlogPage = async ({ params }: Props) => {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }
  const titleHtml = decodeHtmlEntities(post.title?.rendered ?? "");
  const introHtml = decodeHtmlEntities(post.excerpt?.rendered ?? "");
  const decodedContent = decodeHtmlEntities(post.content?.rendered ?? "");
  const { html: contentWithoutRankMathToc, toc: rankMathToc } =
    extractRankMathToc(decodedContent);
  const { html: contentWithoutFaq, faqItems } =
    extractRankMathFaq(contentWithoutRankMathToc);
  const { html: contentHtml, toc: fallbackToc } = htmlToArticleContent(
    contentWithoutFaq
  );
  const toc = rankMathToc.length > 0 ? rankMathToc : fallbackToc;
  const readTimeMinutes = estimateReadTimeMinutes(decodedContent);
  const formattedDate = post.modified
    ? formatArticleDate(post.modified)
    : undefined;

  // Fetch author data if available
  let author = null;
  if (post._embedded?.author?.[0]) {
    author = post._embedded.author[0];
  } else if (post.author) {
    author = await getAuthor(post.author);
  }

  // Tag names come from the embedded terms (_embed), so no extra request.
  const resolvedTags = resolveWordPressPostTags(post, []);

  // Extract product IDs from WooCommerce blocks in the content
  const embeddedProductIds =
    extractWooCommerceProductIds(contentWithoutRankMathToc);
  const embeddedProductSlugs =
    extractWooCommerceProductSlugs(contentWithoutRankMathToc);

  const faqSchema = generateFaqSchema(faqItems);

  return (
    <main>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              ...faqSchema,
            }),
          }}
        />
      )}
      <ArticleLayout
        eyebrow="Our Philosophy: A Commitment to Creation"
        titleHtml={titleHtml}
        introHtml={introHtml}
        lastUpdated={formattedDate}
        readTimeMinutes={readTimeMinutes}
        toc={toc}
        contentHtml={contentHtml}
        author={author}
        tags={resolvedTags}
        embeddedProductIds={embeddedProductIds}
        embeddedProductSlugs={embeddedProductSlugs}
        faqItems={faqItems}
        aiShareUrl={buildSiteUrl(`/blogs/${slug}`)}
        aiShareTitle={stripHtmlAndDecode(post.title?.rendered ?? "") || undefined}
      />
    </main>
  );
};

export default SingleBlogPage;
