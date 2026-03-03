import Link from "next/link";

type Props = {
  currentPostId: number;
};

async function getRelatedPosts(currentPostId: number) {
  const res = await fetch(
    `https://artacestudio.com/wp-json/wp/v2/posts?per_page=3&_embed`,
    { next: { revalidate: 60 } },
  );

  const posts = await res.json();

  return posts.filter((post: any) => post.id !== currentPostId);
}

const SingleBlogRelated = async ({ currentPostId }: Props) => {
  const posts = await getRelatedPosts(currentPostId);

  if (!posts.length) return null;

  return (
    <section className="mt-24 max-w-6xl mx-auto">
      <h3 className="text-2xl font-semibold mb-8">Related Articles</h3>

      <div className="grid md:grid-cols-3 gap-8">
        {posts.map((post: any) => {
          const featuredImage =
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

          return (
            <div key={post.id} className="border rounded-lg overflow-hidden">
              {featuredImage && (
                <img
                  src={featuredImage}
                  alt={post.title.rendered}
                  className="h-48 w-full object-cover"
                />
              )}

              <div className="p-4">
                <h4
                  className="font-medium mb-2"
                  dangerouslySetInnerHTML={{
                    __html: post.title.rendered,
                  }}
                />

                <Link
                  href={`/blogs/${post.slug}`}
                  className="text-sm text-blue-600"
                >
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
