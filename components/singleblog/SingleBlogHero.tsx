import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});

type Props = {
  post: any;
};

const SingleBlogHero = ({ post }: Props) => {
  const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

  const formattedDate = new Date(post.modified).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section
      className={`bg-[#FAF9F6] py-24 ${playfair.variable} ${inter.variable}`}
    >
      <div className="max-w-3xl mx-auto">
        <h1
          className="font-playfair text-4xl md:text-5xl mb-6"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />

        <div
          className="font-inter text-gray-600 mb-8"
          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
        />

        <div className="text-sm text-gray-500 mb-8">
          Last Updated: {formattedDate}
        </div>

        {featuredImage && (
          <img
            src={featuredImage}
            alt={post.title.rendered}
            className="rounded-lg w-full"
          />
        )}
      </div>
    </section>
  );
};

export default SingleBlogHero;
