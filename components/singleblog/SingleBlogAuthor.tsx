import React from "react";
import { decodeHtmlEntities } from "@/utils/text";

type Props = {
  post: {
    author?: number | null;
  };
};

type WpAuthor = {
  name?: string;
  description?: string;
  avatar_urls?: Record<string, string>;
};

async function getAuthor(authorId: number) {
  const res = await fetch(
    `https://artacestudio.com/wp-json/wp/v2/users/${authorId}`,
    { next: { revalidate: 60 } },
  );

  return (await res.json()) as WpAuthor;
}

const SingleBlogAuthor = async ({ post }: Props) => {
  if (!post.author) return null;

  const author = await getAuthor(post.author);
  const authorName = decodeHtmlEntities(author?.name ?? "");
  const authorDescription = decodeHtmlEntities(author?.description ?? "");

  return (
    <section className="mt-20 max-w-3xl mx-auto border-t pt-10">
      <h3 className="text-lg font-semibold mb-4">About the Author</h3>

      <div className="flex items-center gap-4">
        {author.avatar_urls?.["96"] && (
          <img
            src={author.avatar_urls["96"]}
            alt={authorName}
            className="w-16 h-16 rounded-full"
          />
        )}

        <div>
          <p className="font-medium">{authorName}</p>
          <p className="text-sm text-gray-600">
            {authorDescription || "Contributor at Artace Studio"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default SingleBlogAuthor;
