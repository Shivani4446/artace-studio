"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  publishedAt: string | null;
};

type BlogsResponse = { posts?: BlogPost[] };

const ChatNewsTab = () => {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/blogs")
      .then((response) => response.json())
      .then((payload: BlogsResponse) => {
        if (cancelled) return;
        const sorted = [...(payload.posts || [])].sort((a, b) => {
          const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return bTime - aTime;
        });
        setPosts(sorted);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load news right now.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {error && <p className="text-[13px] text-[#65635d]">{error}</p>}
      {!error && posts === null && <p className="text-[13px] text-[#65635d]">Loading...</p>}
      {posts?.length === 0 && <p className="text-[13px] text-[#65635d]">No news yet.</p>}
      <div className="space-y-3">
        {posts?.map((post) => (
          <Link
            key={post.id}
            href={`/blogs/${post.slug}`}
            className="flex gap-3 rounded-[12px] border border-[#1f1f1f]/10 bg-white p-2 transition-colors hover:border-[#1f1f1f]/25"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt="" className="h-14 w-14 shrink-0 rounded-[8px] object-cover" />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-[#1f1f1f]">{post.title}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[#65635d]">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatNewsTab;
