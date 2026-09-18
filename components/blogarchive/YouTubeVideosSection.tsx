"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type YouTubeVideo = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt: string | null;
  description: string;
  viewCount: string | null;
  likeCount: string | null;
};

type YouTubeVideosApiResponse = {
  channelUrl?: string;
  videos?: YouTubeVideo[];
  error?: string;
};

const fallbackChannelUrl = "https://www.youtube.com/@artacestudio";

const formatPublishedDate = (value: string | null) => {
  if (!value) return "Latest video";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Latest video";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const trimDescription = (value: string) => {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= 140) return normalized;
  return `${normalized.slice(0, 137).trim()}...`;
};

const formatCount = (value: string | null): string | null => {
  if (!value) return null;
  const num = parseInt(value, 10);
  if (Number.isNaN(num)) return null;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(num);
};

const YouTubeVideosSection = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [channelUrl, setChannelUrl] = useState(fallbackChannelUrl);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadVideos = async () => {
      try {
        const response = await fetch("/api/youtube/videos", { cache: "no-store" });
        const payload = (await response.json()) as YouTubeVideosApiResponse;

        if (isCancelled) return;

        setChannelUrl(payload.channelUrl || fallbackChannelUrl);
        setVideos(Array.isArray(payload.videos) ? payload.videos : []);
      } catch {
        if (!isCancelled) {
          setVideos([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadVideos();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (!isLoading && videos.length === 0) return null;

  return (
    <section className="mt-14 border-y border-[#ded6ca] py-10 md:mt-16 md:py-12">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#8d8377]">
            Studio Videos
          </p>
          <h2 className="mt-3 font-display text-[1.9rem] leading-[1.08] text-[#181512] md:text-[2.45rem]">
            Watch Artace Studio on YouTube
          </h2>
          <p className="mt-3 max-w-[42rem] text-[0.95rem] leading-7 text-[#4f483f]">
            See painting process videos, studio stories, art symbolism explainers, and
            behind-the-scenes updates from our channel.
          </p>
        </div>

        <Link
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-[6px] bg-[#181512] px-5 text-[0.9rem] font-medium text-white transition-colors hover:bg-black md:self-end"
        >
          Visit YouTube Channel
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-video rounded-[12px] bg-[#ded6ca]" />
              <div className="mt-4 h-5 w-4/5 rounded bg-[#ded6ca]" />
              <div className="mt-2 h-4 w-2/3 rounded bg-[#e7dfd4]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {videos.slice(0, 3).map((video, index) => (
            <article key={video.id} className="group">
              <Link href={video.url} target="_blank" rel="noopener noreferrer" className="block">
                <div className="relative aspect-video overflow-hidden rounded-[12px] bg-[#d9d2c8]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- YouTube serves thumbnails from variable i*.ytimg.com hosts. */}
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#181512] shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
                    <span className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-[#181512]" />
                  </div>
                </div>

                <p className="mt-3 text-[0.72rem] uppercase tracking-[0.08em] text-[#8d8377]">
                  {formatPublishedDate(video.publishedAt)}
                </p>
                <h3 className="mt-2 font-display text-[1.15rem] leading-[1.14] text-[#181512] md:text-[1.25rem]">
                  {video.title}
                </h3>
                {(formatCount(video.viewCount) || formatCount(video.likeCount)) && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[0.78rem] text-[#8d8377]">
                    {formatCount(video.viewCount) && (
                      <span>{formatCount(video.viewCount)} views</span>
                    )}
                    {formatCount(video.viewCount) && formatCount(video.likeCount) && (
                      <span aria-hidden="true">·</span>
                    )}
                    {formatCount(video.likeCount) && (
                      <span>{formatCount(video.likeCount)} likes</span>
                    )}
                  </p>
                )}
                {video.description ? (
                  <p className="mt-2 text-[0.84rem] leading-6 text-[#5b544a]">
                    {trimDescription(video.description)}
                  </p>
                ) : null}
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default YouTubeVideosSection;
