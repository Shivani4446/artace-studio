import Image from "next/image";
import Link from "next/link";
import { formatArticleDate } from "@/utils/article";
import type { WordPressNormalizedBlogPost } from "@/utils/wordpress-blog";

const SamoraJournalListing = ({ posts }: { posts: WordPressNormalizedBlogPost[] }) => {
  return (
    <main className="bg-[#fbf6ef]">
      <section className="mx-auto max-w-[1320px] px-5 pb-8 pt-14 md:px-10 md:pt-20">
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c1683d]">
          The Samora Journal
        </p>
        <h1 className="font-samora-display mt-4 max-w-[640px] text-[32px] leading-[1.15] text-[#2b2420] sm:text-[38px] md:text-[46px]">
          Stories from the Workshop
        </h1>
        <p className="mt-4 max-w-[560px] text-[16px] leading-[1.7] text-[#5c5344]">
          Notes on materials, the craft behind each piece, and what&apos;s new at Samora.
        </p>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 pb-24 md:px-10">
        {posts.length === 0 ? (
          <div className="rounded-[20px] border border-[#2b2420]/10 bg-[#f3ead9] px-6 py-16 text-center md:py-20">
            <p className="font-samora-display text-[22px] text-[#2b2420] md:text-[26px]">
              More stories are on the way
            </p>
            <p className="mx-auto mt-3 max-w-[440px] text-[14.5px] leading-[1.65] text-[#5c5344]">
              We&apos;re just getting started here. In the meantime, explore the collection or
              read about the maker behind Samora.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/samora/shop"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#c1683d] px-6 py-3 text-[14.5px] font-medium text-white transition-colors hover:bg-[#a8552f]"
              >
                Shop the Collection
              </Link>
              <Link
                href="/samora/our-story"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#2b2420]/20 px-6 py-3 text-[14.5px] font-medium text-[#2b2420] transition-colors hover:border-[#2b2420]/40"
              >
                Meet the Maker
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/samora/journal/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-[16px] border border-[#2b2420]/10 bg-[#f3ead9] transition-colors hover:border-[#c1683d]/40"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e7dcc8]">
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  {post.publishedAt ? (
                    <p className="text-[12.5px] font-medium uppercase tracking-[0.08em] text-[#8a7c68]">
                      {formatArticleDate(post.publishedAt)}
                    </p>
                  ) : null}
                  <h2 className="font-samora-display text-[19px] leading-[1.3] text-[#2b2420]">
                    {post.title}
                  </h2>
                  <p className="mt-auto text-[14px] leading-[1.6] text-[#5c5344]">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default SamoraJournalListing;
