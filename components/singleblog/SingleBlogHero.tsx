import { Playfair_Display, Inter } from "next/font/google";
import { decodeHtmlEntities, stripHtmlAndDecode } from "@/utils/text";

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
  post: {
    modified: string;
    title?: { rendered?: string };
    excerpt?: { rendered?: string };
    _embedded?: {
      "wp:featuredmedia"?: Array<{
        source_url?: string;
      }>;
    };
  };
};

const SingleBlogHero = ({ post }: Props) => {
  const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const decodedTitleHtml = decodeHtmlEntities(post.title?.rendered ?? "");
  const decodedExcerptHtml = decodeHtmlEntities(post.excerpt?.rendered ?? "");
  const imageAlt = stripHtmlAndDecode(post.title?.rendered ?? "");

  const formattedDate = new Date(post.modified).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section
      className={`bg-[#FAF9F6] py-24 ${playfair.variable} ${inter.variable}`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <h1
          className="font-playfair text-[52px] mb-6"
          dangerouslySetInnerHTML={{ __html: decodedTitleHtml }}
        />

        <div
          className="font-inter text-gray-600 mb-8"
          dangerouslySetInnerHTML={{ __html: decodedExcerptHtml }}
        />

        <div className="text-sm text-gray-500 mb-8">
          Last Updated: {formattedDate}
        </div>

        {featuredImage && (
          <img
            src={featuredImage}
            alt={imageAlt}
            className="rounded-lg w-full"
          />
        )}
      </div>
    </section>
  );
};

export default SingleBlogHero;
