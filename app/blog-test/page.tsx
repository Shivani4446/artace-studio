import React from "react";

async function getPosts() {
  const res = await fetch(
    "https://artacestudio.com/wp-json/wp/v2/posts?_embed",
    {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  return res.json();
}

const Page = async () => {
  const posts = await getPosts();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Our Blogs</h1>

      {posts.map((post: any) => {
        const featuredImage =
          post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

        return (
          <div key={post.id} className="mb-10 border-b pb-6">
            {featuredImage && (
              <img
                src={featuredImage}
                alt={post.title.rendered}
                className="w-full h-60 object-cover rounded-lg mb-4"
              />
            )}

            <h2
              className="text-xl font-semibold"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            <div
              className="text-gray-600 mt-2"
              dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
            />

            <a
              href={`/blogs/${post.slug}`}
              className="text-blue-600 mt-3 inline-block"
            >
              Read More →
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default Page;
