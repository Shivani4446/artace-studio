"use client";

import { useEffect, useState } from "react";
import BlogArchiveCatalog, {
  type BlogArchivePost,
} from "@/components/blogarchive/BlogArchiveCatalog";

type BlogsApiResponse = {
  posts?: BlogArchivePost[];
  availableCategories?: string[];
  availableTags?: string[];
  error?: string;
};

const BlogArchivePageClient = () => {
  const [posts, setPosts] = useState<BlogArchivePost[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadBlogs = async () => {
      try {
        const response = await fetch("/api/blogs", {
          cache: "no-store",
        });

        const payload = (await response.json()) as BlogsApiResponse;

        if (isCancelled) return;

        if (!response.ok) {
          setLoadError(payload.error || "Unable to load blog posts.");
          setPosts([]);
          setAvailableCategories([]);
          setAvailableTags([]);
          return;
        }

        setPosts(Array.isArray(payload.posts) ? payload.posts : []);
        setAvailableCategories(
          Array.isArray(payload.availableCategories) ? payload.availableCategories : []
        );
        setAvailableTags(Array.isArray(payload.availableTags) ? payload.availableTags : []);
        setLoadError(payload.error || null);
      } catch (error) {
        if (isCancelled) return;
        setLoadError(error instanceof Error ? error.message : "Unable to load blog posts.");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadBlogs();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <main className="bg-[#f4f2ee] px-6 py-10 md:px-12 md:py-14 lg:px-24">
        <section className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex flex-col items-start gap-4">
            <h1 className="font-display text-[52px] leading-none text-[#1f1f1f]">
              Artace Studio Blogs
            </h1>
            <p className="max-w-[980px] text-[18px] leading-8 text-[#5f5a52]">
              Loading the latest stories from Artace Studio.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <BlogArchiveCatalog
      posts={posts}
      availableCategories={availableCategories}
      availableTags={availableTags}
      loadError={loadError}
    />
  );
};

export default BlogArchivePageClient;
