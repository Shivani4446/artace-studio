import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatArticleDate } from "@/utils/article";

const SamoraJournalPost = ({
  title,
  contentHtml,
  publishedAt,
  image,
  imageAlt,
}: {
  title: string;
  contentHtml: string;
  publishedAt: string | null;
  image: string;
  imageAlt: string;
}) => {
  return (
    <main className="bg-[#fbf6ef]">
      <article className="mx-auto max-w-[760px] px-5 py-14 md:px-10 md:py-20">
        <Link
          href="/samora/journal"
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#8a7c68] transition-colors hover:text-[#c1683d]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          The Samora Journal
        </Link>

        {publishedAt ? (
          <p className="mt-6 text-[12.5px] font-medium uppercase tracking-[0.08em] text-[#8a7c68]">
            {formatArticleDate(publishedAt)}
          </p>
        ) : null}
        <h1 className="font-samora-display mt-3 text-[30px] leading-[1.2] text-[#2b2420] sm:text-[36px] md:text-[42px]">
          {title}
        </h1>

        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-[20px] bg-[#f3ead9]">
          <Image src={image} alt={imageAlt} fill className="object-cover" sizes="760px" priority />
        </div>

        <div
          className="product-description-content mt-10"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>
    </main>
  );
};

export default SamoraJournalPost;
