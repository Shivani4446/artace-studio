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
    <section className="mt-20 max-w-[1440px] mx-auto px-6 md:px-12">
      <div className="bg-[#FAF9F6] rounded-2xl p-8 md:p-12 border border-gray-100">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          {author.avatar_urls?.["96"] && (
            <img
              src={author.avatar_urls["96"]}
              alt={authorName}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-md"
            />
          )}

          <div className="text-center md:text-left flex-1">
            <p className="text-sm text-[#66645f] uppercase tracking-wider font-medium mb-2">
              About the Author
            </p>
            <p className="font-display text-[28px] text-[#1c1d1f] mb-2">
              {authorName}
            </p>
            <p className="text-lg text-[#65635d] mb-4">
              {authorDescription || "Contributor at Artace Studio"}
            </p>
            <p className="text-[15px] text-[#6b6962] leading-relaxed max-w-2xl">
              Passionate about art and creativity. Sharing insights and stories from the world of art at Artace Studio.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SingleBlogAuthor;
