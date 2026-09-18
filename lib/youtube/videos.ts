import { fetchWithRetry } from "@/lib/http/fetch-with-retry";
import { decodeHtmlEntities, stripHtmlAndDecode } from "@/utils/text";

const ARTACE_YOUTUBE_CHANNEL_ID = "UC_Fsyff3-GTKwnfGTq2jEbw";
const YOUTUBE_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${ARTACE_YOUTUBE_CHANNEL_ID}`;
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@artacestudio";
const DEFAULT_VIDEO_LIMIT = 6;

export type YouTubeVideo = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt: string | null;
  description: string;
};

const getFirstMatch = (value: string, pattern: RegExp) => {
  return value.match(pattern)?.[1]?.trim() ?? "";
};

const normalizeText = (value: string) =>
  decodeHtmlEntities(value)
    .replace(/\s+/g, " ")
    .trim();

const parseYouTubeFeed = (xml: string, limit: number): YouTubeVideo[] => {
  const entryBlocks = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)).map(
    (match) => match[1] ?? ""
  );

  return entryBlocks
    .map((entry): YouTubeVideo | null => {
      const id = getFirstMatch(entry, /<yt:videoId>([^<]+)<\/yt:videoId>/);
      const title = normalizeText(getFirstMatch(entry, /<title>([\s\S]*?)<\/title>/));
      const url =
        getFirstMatch(entry, /<link[^>]+rel="alternate"[^>]+href="([^"]+)"/) ||
        (id ? `https://www.youtube.com/watch?v=${id}` : "");
      const thumbnail = getFirstMatch(entry, /<media:thumbnail[^>]+url="([^"]+)"/);
      const publishedAt = getFirstMatch(entry, /<published>([^<]+)<\/published>/) || null;
      const description = stripHtmlAndDecode(
        getFirstMatch(entry, /<media:description>([\s\S]*?)<\/media:description>/)
      );

      if (!id || !title || !url || !thumbnail) return null;

      return {
        id,
        title,
        url: decodeHtmlEntities(url),
        thumbnail: decodeHtmlEntities(thumbnail),
        publishedAt,
        description,
      };
    })
    .filter((video): video is YouTubeVideo => video !== null)
    .slice(0, limit);
};

export const fetchArtaceYouTubeVideos = async (limit = DEFAULT_VIDEO_LIMIT) => {
  const response = await fetchWithRetry(YOUTUBE_FEED_URL, {
    headers: {
      Accept: "application/atom+xml, application/xml, text/xml",
      "User-Agent": "ArtaceStudio-Storefront/1.0",
    },
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch YouTube videos (${response.status}).`);
  }

  const xml = await response.text();

  return {
    channelUrl: YOUTUBE_CHANNEL_URL,
    videos: parseYouTubeFeed(xml, limit),
  };
};
