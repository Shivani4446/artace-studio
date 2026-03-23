import type { Metadata } from "next";
import ArticleLayout from "@/components/article/ArticleLayout";
import {
  estimateReadTimeMinutes,
  formatArticleDate,
  htmlToArticleContent,
  extractWooCommerceProductIds,
  extractWooCommerceProductSlugs,
  extractRankMathToc,
} from "@/utils/article";
import { decodeHtmlEntities, stripHtmlAndDecode } from "@/utils/text";
import {
  fetchAllWordPressTags,
  getWordPressBlogSiteUrl,
  resolveWordPressPostTags,
  type WordPressBlogPost,
} from "@/utils/wordpress-blog";

export const runtime = "edge";
export const revalidate = 120;
export const dynamicParams = true;

type Props = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string): Promise<WordPressBlogPost | null> {
  const siteUrl = getWordPressBlogSiteUrl();
  const normalizedSlug = decodeURIComponent(slug).trim().toLowerCase();
  const endpoint = `${siteUrl}/wp-json/wp/v2/posts?slug=${encodeURIComponent(normalizedSlug)}&_embed`;

  try {
    const res = await fetch(endpoint, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    const data = (await res.json()) as WordPressBlogPost[];
    return data[0] || null;
  } catch {
    return null;
  }
}

async function getAuthor(authorId: number) {
  const siteUrl = getWordPressBlogSiteUrl();
  const res = await fetch(
    `${siteUrl}/wp-json/wp/v2/users/${authorId}`,
    { next: { revalidate: 60 } },
  );

  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  const plainTitle = stripHtmlAndDecode(post?.title?.rendered ?? "");
  const plainDescription = stripHtmlAndDecode(post?.excerpt?.rendered ?? "");

  return {
    title: plainTitle ? `${plainTitle} | Artace Studio` : "Blog | Artace Studio",
    description: plainDescription,
  };
}

const SingleBlogPage = async ({ params }: Props) => {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return <div>Post not found</div>;
  const titleHtml = decodeHtmlEntities(post.title?.rendered ?? "");
  const introHtml = decodeHtmlEntities(post.excerpt?.rendered ?? "");
  const decodedContent = decodeHtmlEntities(post.content?.rendered ?? "");
  const { html: contentWithoutRankMathToc, toc: rankMathToc } =
    extractRankMathToc(decodedContent);
  const { html: contentHtml, toc: fallbackToc } = htmlToArticleContent(
    contentWithoutRankMathToc
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

  // Fetch all tags and extract tags for this post
  const allTags = await fetchAllWordPressTags();
  const resolvedTags = resolveWordPressPostTags(post, allTags);

  // Extract product IDs from WooCommerce blocks in the content
  const embeddedProductIds =
    extractWooCommerceProductIds(contentWithoutRankMathToc);
  const embeddedProductSlugs =
    extractWooCommerceProductSlugs(contentWithoutRankMathToc);

  return (
    <main>
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
      />
    </main>
  );
};

export default SingleBlogPage;
