import React from "react";

type Props = {
  post: any;
};

async function getAuthor(authorId: number) {
  const res = await fetch(
    `https://artacestudio.com/wp-json/wp/v2/users/${authorId}`,
    { next: { revalidate: 60 } },
  );

  return res.json();
}

const SingleBlogAuthor = async ({ post }: Props) => {
  if (!post.author) return null;

  const author = await getAuthor(post.author);

  return (
    <section className="mt-20 max-w-3xl mx-auto border-t pt-10">
      <h3 className="text-lg font-semibold mb-4">About the Author</h3>

      <div className="flex items-center gap-4">
        {author.avatar_urls?.["96"] && (
          <img
            src={author.avatar_urls["96"]}
            alt={author.name}
            className="w-16 h-16 rounded-full"
          />
        )}

        <div>
          <p className="font-medium">{author.name}</p>
          <p className="text-sm text-gray-600">
            {author.description || "Contributor at Artace Studio"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default SingleBlogAuthor;
