import React from "react";

export const runtime = "edge";

type BlogPost = {
  id: number;
  slug: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  _embedded?: { ["wp:featuredmedia"]?: Array<{ source_url?: string }> };
};

type PostsResult = {
  posts: BlogPost[];
  error: string;
};

async function getPosts(): Promise<PostsResult> {
  // Use the direct URL to be absolutely sure
  const siteUrl = "https://api.artacestudio.com/";
  const endpoint = `${siteUrl}/wp-json/wp/v2/posts?_embed`;

  try {
    const res = await fetch(endpoint, {
      // 1. Tell Next.js to ignore the previous 401 "Unauthorized" error cache
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        // 2. Add a User-Agent so the server doesn't think this is a bot/script
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        posts: [],
        error: `Failed to fetch posts (${res.status}): ${errorText.slice(0, 100)}`,
      };
    }

    const posts = (await res.json()) as BlogPost[];
    return { posts, error: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      posts: [],
      error: `Network error: ${message}`,
    };
  }
}

const Page = async () => {
  const { posts, error } = await getPosts();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Our Blogs</h1>

      {error && (
        <p className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {posts.map((post) => {
        const featuredImage =
          post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
        const title = post.title?.rendered || "Untitled";
        const excerpt = post.excerpt?.rendered || "";
        const readMoreHref = `/blogs/${post.slug}`;

        return (
          <div key={post.id} className="mb-10 border-b pb-6">
            {featuredImage && (
              <img
                src={featuredImage}
                alt={title}
                className="w-full h-60 object-cover rounded-lg mb-4"
              />
            )}

            <h2
              className="text-xl font-semibold"
              dangerouslySetInnerHTML={{ __html: title }}
            />

            <div
              className="text-gray-600 mt-2"
              dangerouslySetInnerHTML={{ __html: excerpt }}
            />

            <a href={readMoreHref} className="text-blue-600 mt-3 inline-block">
              Read More -&gt;
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default Page;
