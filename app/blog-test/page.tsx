import React from "react";

export const revalidate = 120;

type BlogPost = {
  id: number;
  slug: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  tags?: number[];
  _embedded?: { 
    ["wp:featuredmedia"]?: Array<{ source_url?: string }>;
    ["wp:term"]?: Array<Array<{ id: number; name?: string; taxonomy?: string }>>;
  };
};

type PostsResult = {
  posts: BlogPost[];
  error: string;
  categoriesError?: string;
  tagsError?: string;
  categoriesCount?: number;
  tagsCount?: number;
};

async function getPosts(): Promise<PostsResult> {
  // Use the direct URL to be absolutely sure
  const siteUrl = "https://api.artacestudio.com/";
  const postsEndpoint = `${siteUrl}/wp-json/wp/v2/posts?_embed`;
  const categoriesEndpoint = `${siteUrl}/wp-json/wp/v2/categories?per_page=100`;
  const tagsEndpoint = `${siteUrl}/wp-json/wp/v2/tags?per_page=100`;

  try {
    // Fetch posts, categories, and tags in parallel
    const [postsRes, categoriesRes, tagsRes] = await Promise.all([
      fetch(postsEndpoint, {
        next: { revalidate: 120 },
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }),
      fetch(categoriesEndpoint, {
        next: { revalidate: 120 },
        headers: { "Content-Type": "application/json" },
      }),
      fetch(tagsEndpoint, {
        next: { revalidate: 120 },
        headers: { "Content-Type": "application/json" },
      }),
    ]);

    let posts: BlogPost[] = [];
    let postsError = "";
    let categoriesError = "";
    let tagsError = "";

    // Check posts
    if (!postsRes.ok) {
      const errorText = await postsRes.text();
      postsError = `Posts: ${postsRes.status} - ${errorText.slice(0, 100)}`;
    } else {
      posts = (await postsRes.json()) as BlogPost[];
    }

    // Check categories
    let categoriesCount = 0;
    if (!categoriesRes.ok) {
      categoriesError = `Categories: ${categoriesRes.status}`;
    } else {
      const categories = await categoriesRes.json();
      categoriesCount = Array.isArray(categories) ? categories.length : 0;
    }

    // Check tags
    let tagsCount = 0;
    if (!tagsRes.ok) {
      tagsError = `Tags: ${tagsRes.status}`;
    } else {
      const tags = await tagsRes.json();
      tagsCount = Array.isArray(tags) ? tags.length : 0;
    }

    return { 
      posts, 
      error: postsError || (categoriesError || tagsError ? `${categoriesError}${categoriesError && tagsError ? ' | ' : ''}${tagsError}` : ""),
      categoriesError,
      tagsError,
      categoriesCount,
      tagsCount
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      posts: [],
      error: `Network error: ${message}`,
    };
  }
}

const Page = async () => {
  const { posts, error, categoriesCount, tagsCount, categoriesError, tagsError } = await getPosts();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Our Blogs - Diagnostic</h1>

      {/* Debug Info */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="font-semibold mb-2">API Status:</h2>
        <ul className="text-sm space-y-1">
          <li>Categories: {categoriesError ? `❌ ${categoriesError}` : `✅ ${categoriesCount} found`}</li>
          <li>Tags: {tagsError ? `❌ ${tagsError}` : `✅ ${tagsCount} found`}</li>
        </ul>
      </div>

      {error && (
        <p className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <p className="mb-4 text-gray-600">Found {posts.length} posts</p>

      {posts.map((post) => {
        const featuredImage =
          post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
        const title = post.title?.rendered || "Untitled";
        const excerpt = post.excerpt?.rendered || "";
        const readMoreHref = `/blogs/${post.slug}`;
        
        // Extract tags from embedded terms
        const embeddedTags = post._embedded?.["wp:term"]?.flat()?.filter(t => t.taxonomy === "post_tag") || [];

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

            {/* Show tags */}
            {embeddedTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {embeddedTags.map((tag: any) => (
                  <span key={tag.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

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
