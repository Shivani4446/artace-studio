"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

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
  loadError?: string | null;
};

type SortById =
  | "latest"
  | "oldest"
  | "recently-updated"
  | "title-a-z"
  | "title-z-a";

type PostsPerRow = 1 | 2 | 3 | 4;
type ToolbarMenuId = "sort" | "per-page" | "per-row" | null;

const PER_PAGE_OPTIONS = [6, 12, 18, 24];
const POSTS_PER_ROW_OPTIONS: PostsPerRow[] = [1, 2, 3, 4];

const SORT_OPTIONS: Array<{ id: SortById; label: string }> = [
  { id: "latest", label: "Latest First" },
  { id: "oldest", label: "Oldest First" },
  { id: "recently-updated", label: "Recently Updated" },
  { id: "title-a-z", label: "Title A-Z" },
  { id: "title-z-a", label: "Title Z-A" },
];

const toTitleCase = (value: string) =>
  value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const toggleSelection = (current: string[], value: string) => {
  if (current.includes(value)) {
    return current.filter((item) => item !== value);
  }
  return [...current, value];
};

const formatPostDate = (value: string | null) => {
  if (!value) return "Date Unavailable";
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Date Unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
};

const getPostGridClassName = (postsPerRow: PostsPerRow) => {
  switch (postsPerRow) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
    case 4:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4";
    default:
      return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
  }
};

const getPostGridGapClassName = (postsPerRow: PostsPerRow) => {
  if (postsPerRow === 4) return "gap-x-5 gap-y-9";
  return "gap-x-6 gap-y-10";
};

const getCardTypography = (postsPerRow: PostsPerRow) => {
  if (postsPerRow === 4) {
    return {
      category: "text-[12px]",
      title: "text-[18px]",
      excerpt: "text-[13px]",
    };
  }

  return {
    category: "text-[14px]",
    title: "text-[26px]",
    excerpt: "text-[15px]",
  };
};

const FilterChipGroup = ({
  title,
  options,
  selected,
  onToggle,
  getCount,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  getCount?: (value: string) => number;
}) => {
  return (
    <div className="rounded-[12px] border border-[#1f1f1f]/12 bg-transparent p-4">
      <h3 className="text-[14px] font-semibold text-[#24211d]">{title}</h3>
      {options.length === 0 ? (
        <p className="mt-2 text-xs text-[#8a8378]">No Options Available</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = selected.includes(option);
            const count = getCount ? getCount(option) : null;
            const isDisabled = count !== null && count <= 0;

            return (
              <button
                key={option}
                type="button"
                disabled={isDisabled}
                onClick={() => onToggle(option)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  isSelected
                    ? "border-[#1f1f1f] bg-[#1f1f1f] text-white"
                    : "border-[#1f1f1f]/18 bg-transparent text-[#3e3a34] hover:border-[#1f1f1f]/35"
                } ${
                  isDisabled
                    ? "cursor-not-allowed border-[#1f1f1f]/8 text-[#b0aaa1] hover:border-[#1f1f1f]/8"
                    : ""
                }`}
              >
                <span>{toTitleCase(option)}</span>
                {count !== null && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                      isSelected ? "bg-white/20" : "bg-black/5"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const BlogArchiveCatalog = ({
  posts,
  loadError = null,
}: BlogArchiveCatalogProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortById>("latest");
  const [openToolbarMenu, setOpenToolbarMenu] = useState<ToolbarMenuId>(null);
  const [postsPerPage, setPostsPerPage] = useState<number>(12);
  const [postsPerRow, setPostsPerRow] = useState<PostsPerRow>(3);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const toolbarMenusRef = useRef<HTMLDivElement | null>(null);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(posts.flatMap((post) => post.categories))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [posts]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((post) => {
      post.categories.forEach((category) => {
        counts[category] = (counts[category] ?? 0) + 1;
      });
    });
    return counts;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (
        selectedCategories.length > 0 &&
        !post.categories.some((category) => selectedCategories.includes(category))
      ) {
        return false;
      }

      return true;
    });
  }, [posts, selectedCategories]);

  const sortedPosts = useMemo(() => {
    const sortable = [...filteredPosts];
    sortable.sort((first, second) => {
      const firstPublishedAt = first.publishedAt
        ? new Date(first.publishedAt).getTime()
        : 0;
      const secondPublishedAt = second.publishedAt
        ? new Date(second.publishedAt).getTime()
        : 0;
      const firstModifiedAt = first.modifiedAt
        ? new Date(first.modifiedAt).getTime()
        : firstPublishedAt;
      const secondModifiedAt = second.modifiedAt
        ? new Date(second.modifiedAt).getTime()
        : secondPublishedAt;

      switch (sortBy) {
        case "latest":
          return secondPublishedAt - firstPublishedAt;
        case "oldest":
          return firstPublishedAt - secondPublishedAt;
        case "recently-updated":
          return secondModifiedAt - firstModifiedAt;
        case "title-a-z":
          return first.title.localeCompare(second.title);
        case "title-z-a":
          return second.title.localeCompare(first.title);
        default:
          return 0;
      }
    });
    return sortable;
  }, [filteredPosts, sortBy]);

  useEffect(() => {
    if (!openToolbarMenu) return;

    const onMouseDown = (event: MouseEvent) => {
      if (!toolbarMenusRef.current) return;
      if (toolbarMenusRef.current.contains(event.target as Node)) return;
      setOpenToolbarMenu(null);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenToolbarMenu(null);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openToolbarMenu]);

  const selectedSortLabel =
    SORT_OPTIONS.find((option) => option.id === sortBy)?.label ?? "Latest First";
  const selectedPerPageLabel = `${postsPerPage}`;
  const selectedPerRowLabel = `${postsPerRow}`;

  const activeFilterCount = selectedCategories.length;

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / postsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedPosts = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * postsPerPage;
    return sortedPosts.slice(startIndex, startIndex + postsPerPage);
  }, [sortedPosts, safeCurrentPage, postsPerPage]);

  const paginationWindow = useMemo(() => {
    const start = Math.max(1, safeCurrentPage - 2);
    const end = Math.min(totalPages, safeCurrentPage + 2);
    const pages: number[] = [];

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [safeCurrentPage, totalPages]);

  const firstVisibleIndex =
    sortedPosts.length === 0 ? 0 : (safeCurrentPage - 1) * postsPerPage + 1;
  const lastVisibleIndex = Math.min(safeCurrentPage * postsPerPage, sortedPosts.length);

  const clearFilters = () => {
    setSelectedCategories([]);
    setCurrentPage(1);
  };

  return (
    <main className="bg-[#f4f2ee] px-6 py-10 md:px-12 md:py-14 lg:px-24">
      <section className="mx-auto max-w-[1440px]">
        <div className="mb-10 flex flex-col items-start gap-4">
          <h1 className="font-display text-[52px] leading-none text-[#1f1f1f]">
            Artace Studio Blogs
          </h1>
          <p className="max-w-[980px] text-[18px] leading-8 text-[#5f5a52]">
            Explore all published stories from Artace Studio, including artist
            insights, decor ideas, and practical guidance for collecting handmade art.
          </p>
        </div>

        {loadError ? (
          <div className="border border-[#1f1f1f]/10 bg-white px-6 py-8 text-[#5f5a52]">
            <p className="font-semibold text-[#222]">Could Not Load Blogs</p>
            <p className="mt-2 text-sm">{loadError}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="border border-[#1f1f1f]/10 bg-white px-6 py-8 text-[#5f5a52]">
            <p className="font-semibold text-[#222]">No Blogs Found</p>
            <p className="mt-2 text-sm">
              WordPress did not return any published blog posts.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="h-fit rounded-[12px] border border-[#1f1f1f]/12 bg-transparent p-4 lg:sticky lg:top-28">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-[22px] font-semibold text-[#1f1f1f]">Filters</h2>
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-[#1f1f1f] px-2 py-0.5 text-[11px] font-semibold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full border border-[#1f1f1f]/15 px-3 py-1 text-[11px] font-semibold text-[#5f5a52] transition-colors hover:border-[#1f1f1f]/35 hover:text-black"
                >
                  Clear All
                </button>
              </div>

              <FilterChipGroup
                title="By Category"
                options={categoryOptions}
                selected={selectedCategories}
                onToggle={(value) =>
                  setSelectedCategories((current) => toggleSelection(current, value))
                }
                getCount={(value) => categoryCounts[value] ?? 0}
              />
            </aside>

            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[#5f5a52]">
                  Showing{" "}
                  <span className="font-semibold text-[#1f1f1f]">
                    {firstVisibleIndex}-{lastVisibleIndex}
                  </span>{" "}
                  Of {sortedPosts.length} Blogs
                </p>

                <div ref={toolbarMenusRef} className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenToolbarMenu((menu) => (menu === "per-page" ? null : "per-page"))
                      }
                      aria-haspopup="menu"
                      aria-expanded={openToolbarMenu === "per-page"}
                      className="inline-flex items-center gap-2 rounded-[12px] border border-[#1f1f1f]/10 bg-transparent px-3 py-2 transition-colors hover:border-[#1f1f1f]/25"
                    >
                      <span className="text-xs font-semibold text-[#4f4b45]">Per Page</span>
                      <span className="text-sm font-medium text-[#1f1f1f]">
                        {selectedPerPageLabel}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#4f4b45] transition-transform ${
                          openToolbarMenu === "per-page" ? "rotate-180" : ""
                        }`}
                        strokeWidth={1.8}
                      />
                    </button>

                    {openToolbarMenu === "per-page" && (
                      <div
                        role="menu"
                        className="absolute right-0 top-full z-20 mt-2 min-w-[180px] rounded-[12px] border border-[#1f1f1f]/10 bg-[#f4f2ee] p-2 shadow-[0_18px_35px_rgba(0,0,0,0.08)]"
                      >
                        {PER_PAGE_OPTIONS.map((option) => {
                          const isSelected = postsPerPage === option;

                          return (
                            <button
                              key={option}
                              type="button"
                              role="menuitemradio"
                              aria-checked={isSelected}
                              onClick={() => {
                                setPostsPerPage(option);
                                setCurrentPage(1);
                                setOpenToolbarMenu(null);
                              }}
                              className={`block w-full rounded-[6px] px-3 py-2 text-left text-[14px] font-medium transition-colors ${
                                isSelected
                                  ? "bg-[#1f1f1f] text-white"
                                  : "text-[#333333] hover:bg-[#ece8df] hover:text-black"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenToolbarMenu((menu) => (menu === "per-row" ? null : "per-row"))
                      }
                      aria-haspopup="menu"
                      aria-expanded={openToolbarMenu === "per-row"}
                      className="inline-flex items-center gap-2 rounded-[12px] border border-[#1f1f1f]/10 bg-transparent px-3 py-2 transition-colors hover:border-[#1f1f1f]/25"
                    >
                      <span className="text-xs font-semibold text-[#4f4b45]">
                        Posts Per Row
                      </span>
                      <span className="text-sm font-medium text-[#1f1f1f]">
                        {selectedPerRowLabel}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#4f4b45] transition-transform ${
                          openToolbarMenu === "per-row" ? "rotate-180" : ""
                        }`}
                        strokeWidth={1.8}
                      />
                    </button>

                    {openToolbarMenu === "per-row" && (
                      <div
                        role="menu"
                        className="absolute right-0 top-full z-20 mt-2 min-w-[220px] rounded-[12px] border border-[#1f1f1f]/10 bg-[#f4f2ee] p-2 shadow-[0_18px_35px_rgba(0,0,0,0.08)]"
                      >
                        {POSTS_PER_ROW_OPTIONS.map((option) => {
                          const isSelected = postsPerRow === option;

                          return (
                            <button
                              key={option}
                              type="button"
                              role="menuitemradio"
                              aria-checked={isSelected}
                              onClick={() => {
                                setPostsPerRow(option);
                                setOpenToolbarMenu(null);
                              }}
                              className={`block w-full rounded-[6px] px-3 py-2 text-left text-[14px] font-medium transition-colors ${
                                isSelected
                                  ? "bg-[#1f1f1f] text-white"
                                  : "text-[#333333] hover:bg-[#ece8df] hover:text-black"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenToolbarMenu((menu) => (menu === "sort" ? null : "sort"))
                      }
                      aria-haspopup="menu"
                      aria-expanded={openToolbarMenu === "sort"}
                      className="inline-flex items-center gap-2 rounded-[12px] border border-[#1f1f1f]/10 bg-transparent px-3 py-2 transition-colors hover:border-[#1f1f1f]/25"
                    >
                      <span className="text-xs font-semibold text-[#4f4b45]">Sort By</span>
                      <span className="text-sm font-medium text-[#1f1f1f]">
                        {selectedSortLabel}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#4f4b45] transition-transform ${
                          openToolbarMenu === "sort" ? "rotate-180" : ""
                        }`}
                        strokeWidth={1.8}
                      />
                    </button>

                    {openToolbarMenu === "sort" && (
                      <div
                        role="menu"
                        className="absolute right-0 top-full z-20 mt-2 min-w-[220px] rounded-[12px] border border-[#1f1f1f]/10 bg-[#f4f2ee] p-2 shadow-[0_18px_35px_rgba(0,0,0,0.08)]"
                      >
                        {SORT_OPTIONS.map((option) => {
                          const isSelected = sortBy === option.id;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              role="menuitemradio"
                              aria-checked={isSelected}
                              onClick={() => {
                                setSortBy(option.id);
                                setCurrentPage(1);
                                setOpenToolbarMenu(null);
                              }}
                              className={`block w-full rounded-[6px] px-3 py-2 text-left text-[14px] font-medium transition-colors ${
                                isSelected
                                  ? "bg-[#1f1f1f] text-white"
                                  : "text-[#333333] hover:bg-[#ece8df] hover:text-black"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {sortedPosts.length === 0 ? (
                <div className="rounded-[12px] border border-[#1f1f1f]/10 bg-white px-6 py-10 text-center text-[#5f5a52]">
                  <p className="font-semibold text-[#222]">No Blogs Match These Filters</p>
                  <p className="mt-2 text-sm">Try adjusting category filters or clear all.</p>
                </div>
              ) : (
                <div
                  className={`grid ${getPostGridGapClassName(postsPerRow)} ${getPostGridClassName(postsPerRow)}`}
                >
                  {paginatedPosts.map((post) => {
                    const primaryCategory = post.categories[0] || "General";
                    const cardTypography = getCardTypography(postsPerRow);
                    const isSingleRowLayout = postsPerRow === 1;

                    return (
                      <article
                        key={post.id}
                        className={`group relative ${
                          isSingleRowLayout
                            ? "rounded-[12px] border border-[#1f1f1f]/10 bg-[#f7f5f0] p-3 sm:p-4"
                            : "flex flex-col"
                        }`}
                      >
                        <Link
                          href={`/blogs/${post.slug}`}
                          aria-label={`Open ${post.title}`}
                          className="absolute inset-0 z-10"
                        />

                        <div
                          className={`relative z-0 ${
                            isSingleRowLayout
                              ? "grid grid-cols-[42%_58%] gap-4 sm:grid-cols-[34%_66%] md:grid-cols-[30%_70%]"
                              : ""
                          }`}
                        >
                          <div
                            className={`relative overflow-hidden rounded-[12px] bg-[#e7e3dc] ${
                              isSingleRowLayout ? "aspect-[4/3] h-full" : "aspect-[4/3]"
                            }`}
                          >
                            <Image
                              src={post.image}
                              alt={post.imageAlt || post.title}
                              fill
                              sizes={
                                isSingleRowLayout
                                  ? "(max-width: 768px) 42vw, (max-width: 1024px) 34vw, 30vw"
                                  : postsPerRow === 4
                                    ? "(max-width: 640px) 100vw, (max-width: 1400px) 24vw, 22vw"
                                    : "(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              }
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>

                          <div className={isSingleRowLayout ? "" : "mt-4"}>
                            <p
                              className={`${cardTypography.category} uppercase tracking-[0.08em] text-[#7a7368]`}
                            >
                              {toTitleCase(primaryCategory)}
                            </p>
                            <h2
                              className={`mt-2 font-display leading-[1.2] text-[#1f1f1f] ${cardTypography.title}`}
                            >
                              {post.title}
                            </h2>
                            <p
                              className={`mt-3 line-clamp-3 leading-7 text-[#5f5a52] ${cardTypography.excerpt}`}
                            >
                              {post.excerpt}
                            </p>
                            <p className="mt-4 text-[12px] font-medium uppercase tracking-[0.08em] text-[#7a7368]">
                              {formatPostDate(post.publishedAt)}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {sortedPosts.length > 0 && totalPages > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-[#5f5a52]">
                    Page <span className="font-semibold text-[#1f1f1f]">{safeCurrentPage}</span>{" "}
                    Of <span className="font-semibold text-[#1f1f1f]">{totalPages}</span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={safeCurrentPage === 1}
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      className="rounded-[8px] border border-[#1f1f1f]/15 px-3 py-1.5 text-xs font-semibold text-[#4f4b45] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {paginationWindow.map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 min-w-8 rounded-[8px] px-2 text-xs font-semibold transition-colors ${
                          safeCurrentPage === page
                            ? "bg-[#1f1f1f] text-white"
                            : "border border-[#1f1f1f]/15 text-[#4f4b45] hover:border-[#1f1f1f]/30"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={safeCurrentPage === totalPages}
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      className="rounded-[8px] border border-[#1f1f1f]/15 px-3 py-1.5 text-xs font-semibold text-[#4f4b45] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default BlogArchiveCatalog;
