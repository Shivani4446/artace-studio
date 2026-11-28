"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import YouTubeVideosSection from "@/components/blogarchive/YouTubeVideosSection";
import type { BlogCluster } from "@/lib/blog/clusters";

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
  isPillar: boolean;
  primaryCategory: string | null;
};

type BlogArchiveCatalogProps = {
  latest: BlogArchivePost[];
  clusters: BlogCluster<BlogArchivePost>[];
  unclustered: BlogArchivePost[];
  loadError?: string | null;
};

const MORE_STORIES_PAGE_SIZE = 9;
const CLUSTER_PREVIEW_COUNT = 4;
const GENERIC_CATEGORIES = new Set(["general", "uncategorized"]);

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  // Fixed time zone so server and browser render the same string.
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
};

const getTopicLabel = (post: BlogArchivePost) =>
  post.primaryCategory ||
  post.categories.find((category) => !GENERIC_CATEGORIES.has(category.toLowerCase())) ||
  post.categories[0] ||
  "Journal";

const excerptOf = (value: string) =>
  value.replace(/\s+/g, " ").trim() || "Read the full story on Artace Studio.";

/* ------------------------------------------------------------------ cards */

const StoryCard = ({
  post,
  priority = false,
  size = "md",
}: {
  post: BlogArchivePost;
  priority?: boolean;
  size?: "lg" | "md";
}) => {
  const date = formatDate(post.publishedAt);
  const isLarge = size === "lg";

  return (
    <article className="group h-full">
      <Link href={`/blogs/${post.slug}`} className="flex h-full flex-col">
        <div
          className={`relative overflow-hidden rounded-[14px] bg-[#e4ddd2] ${
            isLarge ? "aspect-[16/10]" : "aspect-[3/2]"
          }`}
        >
          <Image
            src={post.image}
            alt={post.imageAlt || post.title}
            fill
            priority={priority}
            sizes={
              isLarge
                ? "(max-width: 1023px) 100vw, 58vw"
                : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 30vw"
            }
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-1 flex-col pt-4">
          <p className="flex flex-wrap items-center gap-x-2 text-[12px] font-medium uppercase tracking-[0.08em] text-[#8a7f71]">
            <span>{getTopicLabel(post)}</span>
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
          <h3
            className={`mt-2 font-display leading-[1.15] text-[#181512] transition-colors group-hover:text-[#4a3f33] ${
              isLarge ? "text-[26px] md:text-[32px]" : "text-[20px] md:text-[22px]"
            }`}
          >
            {post.title}
          </h3>
          <p
            className={`mt-2.5 text-[#5b544a] ${
              isLarge ? "line-clamp-3 text-[15px] leading-7" : "line-clamp-2 text-[14px] leading-6"
            }`}
          >
            {excerptOf(post.excerpt)}
          </p>
        </div>
      </Link>
    </article>
  );
};

const CornerstoneCard = ({
  post,
  priority,
  wide,
}: {
  post: BlogArchivePost;
  priority: boolean;
  wide: boolean;
}) => {
  const date = formatDate(post.publishedAt);

  return (
    <article className="group">
      <Link
        href={`/blogs/${post.slug}`}
        className={`flex flex-col ${wide ? "md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-center md:gap-8" : ""}`}
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-[14px] bg-[#e4ddd2]">
          <Image
            src={post.image}
            alt={post.imageAlt || post.title}
            fill
            priority={priority}
            sizes={wide ? "(max-width: 767px) 100vw, 55vw" : "(max-width: 1023px) 100vw, 55vw"}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
        <div className="pt-5 md:pt-6">
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] font-medium uppercase tracking-[0.08em] text-[#8a7f71]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#181512] px-2.5 py-1 text-[11px] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e8c37a]" aria-hidden="true" />
              Start here
            </span>
            <span>Cornerstone guide{date ? ` · ${date}` : ""}</span>
          </p>
          <h3 className="mt-2 font-display text-[26px] leading-[1.12] text-[#181512] md:text-[34px]">
            {post.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-[15px] leading-7 text-[#5b544a]">
            {excerptOf(post.excerpt)}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-[15px] font-medium text-[#181512]">
            Read the guide
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </article>
  );
};

const ClusterArticleRow = ({ post }: { post: BlogArchivePost }) => {
  const date = formatDate(post.publishedAt);

  return (
    <li>
      <Link
        href={`/blogs/${post.slug}`}
        className="group flex items-start gap-4 rounded-[12px] p-2 -mx-2 transition-colors hover:bg-[#f6f1ea]"
      >
        <div className="relative aspect-[4/3] w-[104px] shrink-0 overflow-hidden rounded-[10px] bg-[#e4ddd2] sm:w-[120px]">
          <Image
            src={post.image}
            alt={post.imageAlt || post.title}
            fill
            sizes="120px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h4 className="line-clamp-2 font-display text-[17px] leading-[1.25] text-[#181512] md:text-[18px]">
            {post.title}
          </h4>
          {date && (
            <time
              dateTime={post.publishedAt ?? undefined}
              className="mt-1.5 block text-[13px] text-[#8a7f71]"
            >
              {date}
            </time>
          )}
        </div>
        <ArrowUpRight
          className="mt-1 hidden h-4 w-4 shrink-0 text-[#b3a899] transition-colors group-hover:text-[#181512] sm:block"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
};

/* --------------------------------------------------------------- sections */

const ClusterSection = ({
  cluster,
  index,
}: {
  cluster: BlogCluster<BlogArchivePost>;
  index: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const total = cluster.articles.length + 1;
  const hasArticles = cluster.articles.length > 0;
  const visibleArticles = isExpanded
    ? cluster.articles
    : cluster.articles.slice(0, CLUSTER_PREVIEW_COUNT);
  const hiddenCount = cluster.articles.length - visibleArticles.length;

  return (
    <section
      id={cluster.id}
      aria-labelledby={`${cluster.id}-title`}
      className="scroll-mt-40 rounded-[22px] border border-[#e6dfd4] bg-white p-5 sm:p-7 md:p-9"
    >
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[#eee8de] pb-5">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-[#8a7f71]">
            Topic cluster · {total} {total === 1 ? "article" : "articles"}
          </p>
          <h2
            id={`${cluster.id}-title`}
            className="mt-1.5 font-display text-[30px] leading-[1.08] text-[#181512] md:text-[38px]"
          >
            {cluster.name}
          </h2>
        </div>
      </header>

      <div
        className={`mt-6 md:mt-8 ${
          hasArticles ? "grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10" : ""
        }`}
      >
        <CornerstoneCard post={cluster.cornerstone} priority={index === 0} wide={!hasArticles} />

        {hasArticles && (
          <div className="flex flex-col">
            <p className="text-[13px] font-medium text-[#3e3a34]">
              Continue with {cluster.articles.length} related{" "}
              {cluster.articles.length === 1 ? "article" : "articles"}
            </p>
            <ol className="mt-3 divide-y divide-[#eee8de]">
              {visibleArticles.map((post) => (
                <ClusterArticleRow key={post.id} post={post} />
              ))}
            </ol>
            {(hiddenCount > 0 || isExpanded) && cluster.articles.length > CLUSTER_PREVIEW_COUNT && (
              <button
                type="button"
                onClick={() => setIsExpanded((value) => !value)}
                aria-expanded={isExpanded}
                className="mt-4 self-start rounded-full border border-[#181512]/15 px-4 py-2 text-[14px] font-medium text-[#181512] transition-colors hover:border-[#181512]/40 hover:bg-[#f6f1ea]"
              >
                {isExpanded ? "Show fewer" : `Show all ${cluster.articles.length} articles`}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

const MoreStories = ({
  posts,
  title,
}: {
  posts: BlogArchivePost[];
  title: string;
}) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(posts.length / MORE_STORIES_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = useMemo(
    () => posts.slice((safePage - 1) * MORE_STORIES_PAGE_SIZE, safePage * MORE_STORIES_PAGE_SIZE),
    [posts, safePage]
  );

  if (posts.length === 0) return null;

  return (
    <section id="more-stories" aria-labelledby="more-stories-title" className="scroll-mt-40 pt-16 md:pt-20">
      <h2
        id="more-stories-title"
        className="font-display text-[30px] leading-[1.08] text-[#181512] md:text-[38px]"
      >
        {title}
      </h2>
      <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((post) => (
          <StoryCard key={post.id} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="More stories pagination"
          className="mt-12 flex flex-wrap items-center justify-center gap-1.5 text-[14px]"
        >
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="min-h-11 rounded-full px-4 text-[#5f574d] transition-colors hover:text-[#181512] disabled:cursor-not-allowed disabled:text-[#b8b0a4]"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => setPage(number)}
              aria-current={number === safePage ? "page" : undefined}
              className={`min-h-11 min-w-11 rounded-full px-2 transition-colors ${
                number === safePage
                  ? "bg-[#181512] text-white"
                  : "text-[#756d62] hover:bg-white hover:text-[#181512]"
              }`}
            >
              {number}
            </button>
          ))}
          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            className="min-h-11 rounded-full px-4 text-[#5f574d] transition-colors hover:text-[#181512] disabled:cursor-not-allowed disabled:text-[#b8b0a4]"
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
};

/* ------------------------------------------------------------------- page */

const BlogArchiveCatalog = ({
  latest,
  clusters,
  unclustered,
  loadError = null,
}: BlogArchiveCatalogProps) => {
  const hasClusters = clusters.length > 0;
  const [lead, ...supporting] = latest;
  const isEmpty = !lead && !hasClusters && unclustered.length === 0;

  const topicLinks = [
    ...clusters.map((cluster) => ({
      href: `#${cluster.id}`,
      label: cluster.name,
      count: cluster.articles.length + 1,
    })),
    ...(hasClusters && unclustered.length > 0
      ? [{ href: "#more-stories", label: "More stories", count: unclustered.length }]
      : []),
  ];

  return (
    <main className="bg-[#f6f1ea] px-4 pb-20 pt-10 sm:px-6 md:px-10 md:pt-14 lg:px-12">
      <div className="mx-auto max-w-[1260px]">
        <header className="max-w-[820px]">
          <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-[#8a7f71]">
            The Artace Journal
          </p>
          <h1 className="mt-3 font-display text-[40px] leading-[1.02] text-[#181512] sm:text-[48px] md:text-[56px]">
            Artace Blogs &amp; Videos
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-[#4f483f] md:text-[17px]">
            Guides to Indian art forms, buying paintings online, and caring for original art,
            organised by topic so you can start with the essentials and go deeper.
          </p>
        </header>

        {topicLinks.length > 0 && (
          <nav aria-label="Blog topics" className="mt-8">
            <p className="text-[13px] font-medium text-[#3e3a34]">Browse by topic</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {topicLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex items-center gap-2 rounded-full border border-[#181512]/12 bg-white px-4 py-2 text-[14px] font-medium text-[#181512] transition-colors hover:border-[#181512]/35"
                  >
                    {link.label}
                    <span className="rounded-full bg-[#f1ebe2] px-2 py-0.5 text-[12px] tabular-nums text-[#6d665c]">
                      {link.count}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {loadError ? (
          <div className="mt-10 rounded-[16px] border border-[#d9d0c4] bg-white px-6 py-8 text-[#5f5a52]">
            <p className="font-semibold text-[#222]">Could not load blogs</p>
            <p className="mt-2 text-sm">{loadError}</p>
          </div>
        ) : isEmpty ? (
          <div className="mt-10 rounded-[16px] border border-[#d9d0c4] bg-white px-6 py-8 text-[#5f5a52]">
            <p className="font-semibold text-[#222]">No blogs yet</p>
            <p className="mt-2 text-sm">New stories are on the way.</p>
          </div>
        ) : (
          <>
            {lead && (
              <section aria-labelledby="latest-title" className="pt-12 md:pt-16">
                <h2
                  id="latest-title"
                  className="font-display text-[30px] leading-[1.08] text-[#181512] md:text-[38px]"
                >
                  Just published
                </h2>
                <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8">
                  <StoryCard post={lead} size="lg" priority />
                  {supporting.length > 0 && (
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1 lg:gap-8">
                      {supporting.map((post) => (
                        <StoryCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {hasClusters && (
              <div className="space-y-8 pt-16 md:space-y-10 md:pt-20">
                {clusters.map((cluster, index) => (
                  <ClusterSection key={cluster.id} cluster={cluster} index={index} />
                ))}
              </div>
            )}

            <MoreStories
              posts={unclustered}
              title={hasClusters ? "More stories" : "All stories"}
            />

            <YouTubeVideosSection />
          </>
        )}
      </div>
    </main>
  );
};

export default BlogArchiveCatalog;
