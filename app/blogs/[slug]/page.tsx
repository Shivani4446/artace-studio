import type { Metadata } from "next";
import SingleBlogHero from "@/components/singleblog/SingleBlogHero";
import SingleBlogContent from "@/components/singleblog/SingleBlogContent";
import SingleBlogAuthor from "@/components/singleblog/SingleBlogAuthor";
import SingleBlogRelated from "@/components/singleblog/SingleBlogRelated";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string) {
  const res = await fetch(
    `https://artacestudio.com/wp-json/wp/v2/posts?slug=${slug}&_embed`,
    { next: { revalidate: 60 } },
  );

  const data = await res.json();
  return data[0];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post?.title?.rendered
      ? `${post.title.rendered.replace(/<[^>]+>/g, "")} | Artace Studio`
      : "Blog | Artace Studio",
    description: post?.excerpt?.rendered?.replace(/<[^>]+>/g, ""),
  };
}

const SingleBlogPage = async ({ params }: Props) => {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return <div>Post not found</div>;

  return (
    <main className="px-6 py-16 md:px-12 lg:px-24">
      <SingleBlogHero post={post} />
      <SingleBlogContent content={post.content.rendered} />{" "}
      <SingleBlogAuthor post={post} />
      <SingleBlogRelated currentPostId={post.id} />
    </main>
  );
};

export default SingleBlogPage;
