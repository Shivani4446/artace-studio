import type { Metadata } from "next";
import ArticleLayout from "@/components/article/ArticleLayout";
import {
  estimateReadTimeMinutes,
  formatArticleDate,
  htmlToArticleContent,
} from "@/utils/article";
import { decodeHtmlEntities, stripHtmlAndDecode } from "@/utils/text";

export const revalidate = 120;
export const dynamicParams = false;

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
  _embedded?: {
    author?: Array<Record<string, unknown>>;
  };
};

const getSiteUrl = () =>
  (process.env.WOOCOMMERCE_SITE_URL || "https://api.artacestudio.com/").replace(
    /\/+$/,
    ""
  );

async function getPostSlugs() {
  try {
    const siteUrl = getSiteUrl();
    const response = await fetch(
      `${siteUrl}/wp-json/wp/v2/posts?per_page=100&_fields=slug`,
      {
        next: { revalidate: 120 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const posts = (await response.json()) as Array<{ slug?: string }>;
    return posts
      .map((post) => post.slug?.trim())
    .filter((slug): slug is string => Boolean(slug));
  } catch {
    return [];
  }
}
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

export async function generateStaticParams() {
  try {
    const slugs = await getPostSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
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
  const { html: contentHtml, toc } = htmlToArticleContent(decodedContent);
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
      />
    </main>
  );
};

export default SingleBlogPage;
