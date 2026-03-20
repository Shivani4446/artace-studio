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

export const runtime = "edge";
export const revalidate = 120;
export const dynamicParams = true;

type Props = {
  params: Promise<{ slug: string }>;
};

type WordPressPost = {
  slug: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  modified?: string;
  author?: number;
  tags?: number[];
  _embedded?: {
    author?: Array<Record<string, unknown>>;
    ["wp:term"]?: Array<Array<{ id: number; name?: string; taxonomy?: string }>>;
  };
};

const getSiteUrl = () =>
  (process.env.WORDPRESS_API_URL || process.env.WOOCOMMERCE_SITE_URL || "https://api.artacestudio.com/").replace(
    /\/+$/,
    ""
  );

async function getPost(slug: string): Promise<WordPressPost | null> {
  const siteUrl = getSiteUrl();
  const normalizedSlug = decodeURIComponent(slug).trim().toLowerCase();
  const endpoint = `${siteUrl}/wp-json/wp/v2/posts?slug=${encodeURIComponent(normalizedSlug)}&_embed`;

  try {
    const res = await fetch(endpoint, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    const data = (await res.json()) as WordPressPost[];
    return data[0] || null;
  } catch {
    return null;
  }
}

async function getAuthor(authorId: number) {
  const siteUrl = getSiteUrl();
  const res = await fetch(
    `${siteUrl}/wp-json/wp/v2/users/${authorId}`,
    { next: { revalidate: 60 } },
  );

  return res.json();
}

async function getAllTags() {
  const siteUrl = getSiteUrl();
  const allTags: Array<{ id: number; name: string }> = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await fetch(
      `${siteUrl}/wp-json/wp/v2/tags?per_page=100&page=${page}`,
      { next: { revalidate: 120 } }
    );

    if (!res.ok) {
      return [];
    }

    const payload = await res.json();
    allTags.push(...(Array.isArray(payload) ? payload : []));

    const totalPagesHeader = res.headers.get("x-wp-totalpages");
    const parsedTotalPages = totalPagesHeader ? Number(totalPagesHeader) : 1;
    totalPages = Number.isFinite(parsedTotalPages) && parsedTotalPages > 0 ? parsedTotalPages : 1;

    page += 1;
  } while (page <= totalPages);

  return allTags;
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
  const allTags = await getAllTags();
  const tagNameById = new Map(allTags.map((tag) => [tag.id, tag.name]));
  
  // Get tags from both the tags array and embedded terms
  const tagsFromIds = (post.tags ?? [])
    .map((tagId) => tagNameById.get(tagId))
    .filter((value): value is string => typeof value === "string" && value.length > 0);
  
  const tagsFromEmbedded = (post._embedded?.["wp:term"] ?? [])
    .flat()
    .filter((term) => term.taxonomy === "post_tag")
    .map((term) => stripHtmlAndDecode(term.name ?? ""))
    .filter(Boolean);
  
  const resolvedTags = Array.from(
    new Set([...tagsFromIds, ...tagsFromEmbedded])
  );

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
