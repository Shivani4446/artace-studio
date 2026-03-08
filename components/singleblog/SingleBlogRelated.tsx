import Link from "next/link";
import { decodeHtmlEntities, stripHtmlAndDecode } from "@/utils/text";

type Props = {
  currentPostId: number;
};

type RelatedPost = {
  id: number;
  slug: string;
  title?: {
    rendered?: string;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url?: string;
    }>;
  };
};

async function getRelatedPosts(currentPostId: number) {
  const res = await fetch(
    "https://api.artacestudio.com/wp-json/wp/v2/posts?per_page=3&_embed",
    { next: { revalidate: 60 } }
  );

  const posts = (await res.json()) as RelatedPost[];

  return posts.filter((post) => post.id !== currentPostId);
}

const SingleBlogRelated = async ({ currentPostId }: Props) => {
  const posts = await getRelatedPosts(currentPostId);

  if (!posts.length) return null;

  return (
    <section className="mt-24 mx-auto max-w-6xl">
      <h3 className="mb-8 text-2xl font-semibold">Related Articles</h3>

      <div className="grid gap-8 md:grid-cols-3">
        {posts.map((post) => {
          const featuredImage =
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
          const decodedTitleHtml = decodeHtmlEntities(post.title?.rendered ?? "");
          const imageAlt = stripHtmlAndDecode(post.title?.rendered ?? "");

          return (
            <div key={post.id} className="overflow-hidden rounded-lg border">
              {featuredImage && (
                <img
                  src={featuredImage}
                  alt={imageAlt}
                  className="h-48 w-full object-cover"
                />
              )}

              <div className="p-4">
                <h4
                  className="mb-2 font-medium"
                  dangerouslySetInnerHTML={{
                    __html: decodedTitleHtml,
                  }}
                />

                <Link href={`/blogs/${post.slug}`} className="text-sm text-blue-600">
                  Read More →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SingleBlogRelated;
