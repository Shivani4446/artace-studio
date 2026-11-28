import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import YouTubeVideosSection from "@/components/blogarchive/YouTubeVideosSection";
import type { BlogCategory } from "@/lib/blog/categories";
import type { WordPressNormalizedBlogPost } from "@/utils/wordpress-blog";

export type BlogArchivePost = WordPressNormalizedBlogPost;

type BlogArchiveCatalogProps = {
  /** Posts for the current page, newest first. */
  posts: BlogArchivePost[];
  totalPosts: number;
  filteredCount: number;
  categories: BlogCategory[];
  activeCategory: BlogCategory | null;
  page: number;
  totalPages: number;
  loadError?: string | null;
};

const GENERIC_CATEGORIES = new Set(["general", "uncategorized"]);
const DEFAULT_INTRO =
  "Guides to Indian art forms, buying paintings online, and caring for original art.";

const archiveHref = (categorySlug: string | null, page = 1) => {
  const params = new URLSearchParams();
  if (categorySlug) params.set("category", categorySlug);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/blogs?${query}` : "/blogs";
};

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
};

const getTopicLabel = (post: BlogArchivePost, activeCategory: BlogCategory | null) =>
  activeCategory?.name ||
  post.categories.find((category) => !GENERIC_CATEGORIES.has(category.toLowerCase())) ||
  post.categories[0] ||
  "Journal";

const excerptOf = (value: string) =>
  value.replace(/\s+/g, " ").trim() || "Read the full story on Artace Studio.";

/* ------------------------------------------------------------------ cards */

const PostMeta = ({ post, label }: { post: BlogArchivePost; label: string }) => {
  const date = formatDate(post.publishedAt);
  return (
    <p className="flex flex-wrap items-center gap-x-2 text-[12px] font-medium uppercase tracking-[0.08em] text-[#8a7f71]">
      <span>{label}</span>
      {date && (
        <>
          <span aria-hidden="true" className="text-[#c2b8aa]">
            &middot;
          </span>
          <time dateTime={post.publishedAt ?? undefined} className="normal-case tracking-normal">
            {date}
          </time>
        </>
      )}
    </p>
  );
};

const FeaturedCard = ({ post, label }: { post: BlogArchivePost; label: string }) => (
  <article className="group">
    <Link
      href={`/blogs/${post.slug}`}
      className="grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-center md:gap-8"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] bg-[#e4ddd2]">
        <Image
          src={post.image}
          alt={post.imageAlt || post.title}
          fill
          priority
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 55vw, 45vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <div>
        <PostMeta post={post} label={label} />
        <h3 className="mt-3 font-display text-[28px] leading-[1.12] text-[#181512] md:text-[34px]">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-[15px] leading-7 text-[#5b544a]">
          {excerptOf(post.excerpt)}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-[15px] font-medium text-[#181512]">
          Read article
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  </article>
);

const PostCard = ({
  post,
  label,
  priority,
}: {
  post: BlogArchivePost;
  label: string;
  priority: boolean;
}) => (
  <article className="group h-full">
    <Link href={`/blogs/${post.slug}`} className="flex h-full flex-col">
      <div className="relative aspect-[3/2] overflow-hidden rounded-[14px] bg-[#e4ddd2]">
        <Image
          src={post.image}
          alt={post.imageAlt || post.title}
          fill
          priority={priority}
          sizes="(max-width: 639px) 100vw, (max-width: 1279px) 40vw, 28vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <PostMeta post={post} label={label} />
        <h3 className="mt-2 font-display text-[20px] leading-[1.18] text-[#181512] transition-colors group-hover:text-[#4a3f33] md:text-[22px]">
          {post.title}
        </h3>
        <p className="mt-2.5 line-clamp-2 text-[14px] leading-6 text-[#5b544a]">
          {excerptOf(post.excerpt)}
        </p>
      </div>
    </Link>
  </article>
);

/* ------------------------------------------------------------- categories */

type CategoryLink = { slug: string | null; name: string; count: number };

const CategorySidebar = ({
  links,
  activeSlug,
}: {
  links: CategoryLink[];
  activeSlug: string | null;
}) => (
  <nav aria-label="Blog categories" className="hidden lg:sticky lg:top-40 lg:block lg:self-start">
    <p className="px-3 text-[12px] font-medium uppercase tracking-[0.1em] text-[#8a7f71]">
      Categories
    </p>
    <ul className="mt-3 space-y-1">
      {links.map((link) => {
        const isActive = link.slug === activeSlug;
        return (
          <li key={link.slug ?? "all"}>
            <Link
              href={archiveHref(link.slug)}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center justify-between gap-3 rounded-[12px] px-3 py-2.5 text-[15px] transition-colors ${
                isActive
                  ? "bg-[#181512] font-medium text-white"
                  : "text-[#3e3a34] hover:bg-white hover:text-[#181512]"
              }`}
            >
              <span className="min-w-0 truncate">{link.name}</span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[12px] tabular-nums ${
                  isActive ? "bg-white/15 text-white" : "bg-[#ebe4d9] text-[#6d665c]"
                }`}
              >
                {link.count}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  </nav>
);

const CategoryChips = ({
  links,
  activeSlug,
}: {
  links: CategoryLink[];
  activeSlug: string | null;
}) => (
  <nav aria-label="Blog categories" className="-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:hidden">
    <ul className="flex min-w-max gap-2">
      {links.map((link) => {
        const isActive = link.slug === activeSlug;
        return (
          <li key={link.slug ?? "all"}>
            <Link
              href={archiveHref(link.slug)}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-[14px] font-medium transition-colors ${
                isActive
                  ? "border-[#181512] bg-[#181512] text-white"
                  : "border-[#181512]/12 bg-white text-[#181512]"
              }`}
            >
              {link.name}
              <span className={`text-[12px] tabular-nums ${isActive ? "text-white/70" : "text-[#8a7f71]"}`}>
                {link.count}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  </nav>
);

/* ------------------------------------------------------------------- page */

const BlogArchiveCatalog = ({
  posts,
  totalPosts,
  filteredCount,
  categories,
  activeCategory,
  page,
  totalPages,
  loadError = null,
}: BlogArchiveCatalogProps) => {
  const activeSlug = activeCategory?.slug ?? null;
  const links: CategoryLink[] = [
    { slug: null, name: "All blogs", count: totalPosts },
    ...categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      count: category.count,
    })),
  ];

  const showFeatured = page === 1 && posts.length > 0;
  const [featured, ...rest] = showFeatured ? posts : [null, ...posts];
  const heading = activeCategory?.name ?? "All blogs";
  const intro = activeCategory ? activeCategory.description || null : DEFAULT_INTRO;

  return (
    <main className="bg-[#f6f1ea] px-4 pb-20 pt-10 sm:px-6 md:px-10 md:pt-14 lg:px-12">
      <div className="mx-auto max-w-[1320px]">
        <header className="max-w-[820px]">
          <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-[#8a7f71]">
            The Artace Journal
          </p>
          <h1 className="mt-3 font-display text-[40px] leading-[1.02] text-[#181512] sm:text-[48px] md:text-[56px]">
            Artace Blogs &amp; Videos
          </h1>
        </header>

        <div className="mt-8 lg:mt-12 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12 xl:gap-16">
          <CategorySidebar links={links} activeSlug={activeSlug} />

          <div className="min-w-0">
            <CategoryChips links={links} activeSlug={activeSlug} />

            <section aria-labelledby="blog-list-title" id="posts" className="mt-8 scroll-mt-40 lg:mt-0">
              <div className="border-b border-[#e3dbcf] pb-6">
                <h2
                  id="blog-list-title"
                  className="font-display text-[32px] leading-[1.08] text-[#181512] md:text-[40px]"
                >
                  {heading}
                </h2>
                {intro && (
                  <p className="mt-3 max-w-[680px] text-[16px] leading-7 text-[#4f483f]">{intro}</p>
                )}
                <p className="mt-3 text-[14px] text-[#8a7f71]">
                  {filteredCount} {filteredCount === 1 ? "article" : "articles"}
                  {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
                </p>
              </div>

              {loadError ? (
                <div className="mt-8 rounded-[16px] border border-[#d9d0c4] bg-white px-6 py-8 text-[#5f5a52]">
                  <p className="font-semibold text-[#222]">Could not load blogs</p>
                  <p className="mt-2 text-sm">{loadError}</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="mt-8 rounded-[16px] border border-[#d9d0c4] bg-white px-6 py-8 text-[#5f5a52]">
                  <p className="font-semibold text-[#222]">No articles yet</p>
                  <p className="mt-2 text-sm">New stories are on the way.</p>
                </div>
              ) : (
                <>
                  {featured && (
                    <div className="mt-8">
                      <FeaturedCard post={featured} label={getTopicLabel(featured, activeCategory)} />
                    </div>
                  )}

                  {rest.length > 0 && (
                    <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                      {rest.map((post, index) =>
                        post ? (
                          <PostCard
                            key={post.id}
                            post={post}
                            label={getTopicLabel(post, activeCategory)}
                            priority={!showFeatured && index < 3}
                          />
                        ) : null
                      )}
                    </div>
                  )}

                  {totalPages > 1 && (
                    <nav
                      aria-label="Blog pagination"
                      className="mt-14 flex flex-wrap items-center justify-center gap-1.5 text-[14px]"
                    >
                      {page > 1 ? (
                        <Link
                          href={`${archiveHref(activeSlug, page - 1)}#posts`}
                          className="min-h-11 rounded-full px-4 py-3 text-[#5f574d] transition-colors hover:text-[#181512]"
                        >
                          Previous
                        </Link>
                      ) : null}
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                        <Link
                          key={number}
                          href={`${archiveHref(activeSlug, number)}#posts`}
                          aria-current={number === page ? "page" : undefined}
                          className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-2 transition-colors ${
                            number === page
                              ? "bg-[#181512] text-white"
                              : "text-[#756d62] hover:bg-white hover:text-[#181512]"
                          }`}
                        >
                          {number}
                        </Link>
                      ))}
                      {page < totalPages ? (
                        <Link
                          href={`${archiveHref(activeSlug, page + 1)}#posts`}
                          className="min-h-11 rounded-full px-4 py-3 text-[#5f574d] transition-colors hover:text-[#181512]"
                        >
                          Next
                        </Link>
                      ) : null}
                    </nav>
                  )}
                </>
              )}
            </section>
          </div>
        </div>

        {!activeCategory && <YouTubeVideosSection />}
      </div>
    </main>
  );
};

export default BlogArchiveCatalog;
