"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type BlogArchivePost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  categories: string[];
  tags: string[];
  publishedAt: string | null;
  modifiedAt: string | null;
};

type BlogArchiveCatalogProps = {
  posts: BlogArchivePost[];
  availableCategories?: string[];
  availableTags?: string[];
  loadError?: string | null;
};

const ARCHIVE_PAGE_SIZE = 8;
const ALL_BLOGS_LABEL = "All Blogs";

const toTitleCase = (value: string) =>
  value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const stripExcerpt = (value: string) =>
  value.replace(/\s+/g, " ").trim() || "Read the full story on Artace Studio.";

const getPublishedTime = (value: string | null) => {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getFeaturedYearLabel = (posts: BlogArchivePost[]) => {
  const latestTimestamp = Math.max(...posts.map((post) => getPublishedTime(post.publishedAt)));
  if (!Number.isFinite(latestTimestamp) || latestTimestamp <= 0) {
    return new Date().getFullYear().toString();
  }

  return new Date(latestTimestamp).getFullYear().toString();
};

const EditorialCard = ({
  post,
  imagePriority = false,
  imageClassName,
  imageSizes,
  titleClassName,
  excerptClassName,
  categoryClassName,
  wrapperClassName,
}: {
  post: BlogArchivePost;
  imagePriority?: boolean;
  imageClassName: string;
  imageSizes: string;
  titleClassName: string;
  excerptClassName: string;
  categoryClassName: string;
  wrapperClassName?: string;
}) => {
  const primaryCategory = post.categories[0] || "General";

  return (
    <article className={`group ${wrapperClassName ?? ""}`}>
      <Link href={`/blogs/${post.slug}`} className="block">
        <div
          className={`relative overflow-hidden rounded-[12px] bg-[#d9d2c8] ${imageClassName}`}
        >
          <Image
            src={post.image}
            alt={post.imageAlt || post.title}
            fill
            priority={imagePriority}
            sizes={imageSizes}
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </div>

        <div className="pt-3">
          <p className={categoryClassName}>{toTitleCase(primaryCategory)}</p>
          <h2 className={titleClassName}>{post.title}</h2>
          <p className={excerptClassName}>{stripExcerpt(post.excerpt)}</p>
        </div>
      </Link>
    </article>
  );
};

const StandardStoryCard = ({
  post,
  imagePriority = false,
}: {
  post: BlogArchivePost;
  imagePriority?: boolean;
}) => {
  return (
    <EditorialCard
      post={post}
      imagePriority={imagePriority}
      imageClassName="aspect-[1.42/1]"
      imageSizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 50vw"
      categoryClassName="text-[0.66rem] uppercase tracking-[0.08em] text-[#8d8377]"
      titleClassName="mt-2 font-display text-[1.2rem] leading-[1.12] text-[#181512] md:text-[1.42rem]"
      excerptClassName="mt-3 max-w-[34rem] text-[0.88rem] leading-6 text-[#5b544a]"
    />
  );
};

const BlogArchiveCatalog = ({
  posts,
  availableCategories = [],
  loadError = null,
}: BlogArchiveCatalogProps) => {
  const [activeCategory, setActiveCategory] = useState<string>(ALL_BLOGS_LABEL);
  const [currentPage, setCurrentPage] = useState(1);

  const categoryOptions = useMemo(() => {
    const source = availableCategories.length > 0
      ? availableCategories
      : posts.flatMap((post) => post.categories);

    return [
      ALL_BLOGS_LABEL,
      ...Array.from(new Set(source.filter(Boolean))).sort((first, second) =>
        first.localeCompare(second)
      ),
    ];
  }, [availableCategories, posts]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === ALL_BLOGS_LABEL) {
      return posts;
    }

    return posts.filter((post) => post.categories.includes(activeCategory));
  }, [activeCategory, posts]);

  const shouldUseCompactFeaturedLayout = activeCategory !== ALL_BLOGS_LABEL;

  const latestPosts = useMemo(() => {
    return [...filteredPosts]
      .sort((first, second) => getPublishedTime(second.publishedAt) - getPublishedTime(first.publishedAt))
      .slice(0, 5);
  }, [filteredPosts]);

  const archivePosts = useMemo(() => {
    const featuredIds = new Set(latestPosts.map((post) => post.id));

    return filteredPosts
      .filter((post) => !featuredIds.has(post.id))
      .sort(
        (first, second) =>
          getPublishedTime(second.publishedAt) - getPublishedTime(first.publishedAt)
      );
  }, [filteredPosts, latestPosts]);

  const totalPages = Math.max(1, Math.ceil(archivePosts.length / ARCHIVE_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedArchivePosts = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ARCHIVE_PAGE_SIZE;
    return archivePosts.slice(startIndex, startIndex + ARCHIVE_PAGE_SIZE);
  }, [archivePosts, safeCurrentPage]);

  const paginationNumbers = useMemo(() => {
    const start = Math.max(1, safeCurrentPage - 2);
    const end = Math.min(totalPages, safeCurrentPage + 2);
    const pages: number[] = [];

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [safeCurrentPage, totalPages]);

  const featuredLeadPost = latestPosts[0] ?? null;
  const featuredSupportingPosts = latestPosts.slice(1);
  const featuredYear = latestPosts.length > 0 ? getFeaturedYearLabel(latestPosts) : null;

  return (
    <main className="bg-[#f6f1ea] px-4 pb-16 pt-8 sm:px-6 md:px-10 md:pb-20 md:pt-12 lg:px-12">
      <section className="mx-auto max-w-[1260px]">
        <header className="pb-5 md:pb-6">
          <h1 className="font-display text-[2.4rem] leading-[1.02] text-[#181512] sm:text-[2.8rem] md:text-[3.25rem]">
            Artace Blogs
          </h1>
          <p className="mt-4 max-w-[48rem] text-[0.98rem] leading-7 text-[#4f483f] md:text-[1.02rem]">
            Read about art and how to purchase paintings online with Artace Studio.
          </p>

          <div className="-mx-1 mt-6 overflow-x-auto pb-1">
            <div className="flex min-w-max items-center gap-1 border-b border-[#ded6ca] px-1">
              {categoryOptions.map((category) => {
                const isActive = category === activeCategory;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setActiveCategory(category);
                      setCurrentPage(1);
                    }}
                    className={`min-h-11 whitespace-nowrap border-b px-3 py-3 text-left text-[0.8rem] transition-colors md:text-[0.82rem] ${
                      isActive
                        ? "border-[#16120f] text-[#16120f]"
                        : "border-transparent text-[#6d665c] hover:text-[#16120f]"
                    }`}
                  >
                    {category === ALL_BLOGS_LABEL ? category : toTitleCase(category)}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {loadError ? (
          <div className="mt-10 border border-[#d9d0c4] bg-white px-6 py-8 text-[#5f5a52]">
            <p className="font-semibold text-[#222]">Could Not Load Blogs</p>
            <p className="mt-2 text-sm">{loadError}</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="mt-10 border border-[#d9d0c4] bg-white px-6 py-8 text-[#5f5a52]">
            <p className="font-semibold text-[#222]">No Blogs Found</p>
            <p className="mt-2 text-sm">
              There are no published posts in this category yet.
            </p>
          </div>
        ) : (
          <>
            {featuredLeadPost ? (
              <section className="pt-8 md:pt-10">
                <h2 className="font-display text-[2rem] leading-[1.08] text-[#181512] md:text-[2.65rem]">
                  Our Favorite from {featuredYear}
                </h2>

                <div
                  className={`mt-6 ${
                    shouldUseCompactFeaturedLayout
                      ? "grid gap-x-4 gap-y-10 md:grid-cols-2 md:gap-x-6 md:gap-y-12"
                      : "grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-8"
                  }`}
                >
                  {shouldUseCompactFeaturedLayout ? (
                    latestPosts.map((post, index) => (
                      <StandardStoryCard
                        key={post.id}
                        post={post}
                        imagePriority={index < 2}
                      />
                    ))
                  ) : (
                    <>
                      <EditorialCard
                        post={featuredLeadPost}
                        imagePriority
                        imageClassName="aspect-[1.52/1] sm:aspect-[1.58/1] lg:aspect-[1.48/1]"
                        imageSizes="(max-width: 767px) 100vw, (max-width: 1023px) 100vw, 56vw"
                        categoryClassName="text-[0.72rem] uppercase tracking-[0.08em] text-[#8d8377]"
                        titleClassName="mt-2 max-w-[34rem] font-display text-[1.55rem] leading-[1.1] text-[#181512] md:text-[1.85rem]"
                        excerptClassName="mt-3 max-w-[40rem] text-[0.9rem] leading-6 text-[#5b544a]"
                      />

                      <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2">
                        {featuredSupportingPosts.map((post, index) => (
                          <EditorialCard
                            key={post.id}
                            post={post}
                            imagePriority={index < 2}
                            wrapperClassName="h-full"
                            imageClassName="aspect-[1.42/1]"
                            imageSizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 28vw"
                            categoryClassName="text-[0.66rem] uppercase tracking-[0.08em] text-[#8d8377]"
                            titleClassName="mt-2 font-display text-[1.08rem] leading-[1.12] text-[#181512]"
                            excerptClassName="mt-2 text-[0.82rem] leading-[1.6] text-[#5b544a]"
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </section>
            ) : null}

            <section className="pt-16 md:pt-20">
              <h2 className="font-display text-[1.85rem] leading-[1.08] text-[#181512] md:text-[2.3rem]">
                Latest Stories
              </h2>

              {paginatedArchivePosts.length === 0 ? (
                <p className="mt-6 text-[0.95rem] leading-7 text-[#5b544a]">
                  This category only has the featured stories above.
                </p>
              ) : (
                <div className="mt-8 grid gap-x-4 gap-y-10 md:grid-cols-2 md:gap-x-6 md:gap-y-14">
                  {paginatedArchivePosts.map((post, index) => (
                    <StandardStoryCard
                      key={post.id}
                      post={post}
                      imagePriority={safeCurrentPage === 1 && index < 2}
                    />
                  ))}
                </div>
              )}

              {archivePosts.length > ARCHIVE_PAGE_SIZE ? (
                <nav
                  aria-label="Blog archive pagination"
                  className="mt-12 flex flex-wrap items-center justify-center gap-2 text-[0.85rem] text-[#3f382f] md:mt-14"
                >
                  <button
                    type="button"
                    disabled={safeCurrentPage === 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    className="min-h-11 px-3 text-[#5f574d] transition-colors hover:text-[#181512] disabled:cursor-not-allowed disabled:text-[#b8b0a4]"
                  >
                    Previous
                  </button>

                  {paginationNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`min-h-11 min-w-11 px-2 text-center transition-colors ${
                        safeCurrentPage === page
                          ? "text-[#181512]"
                          : "text-[#756d62] hover:text-[#181512]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    className="min-h-11 px-3 text-[#5f574d] transition-colors hover:text-[#181512] disabled:cursor-not-allowed disabled:text-[#b8b0a4]"
                  >
                    Next
                  </button>
                </nav>
              ) : null}
            </section>
          </>
        )}
      </section>
    </main>
  );
};

export default BlogArchiveCatalog;
