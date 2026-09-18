import { NextResponse } from "next/server";
import { fetchArtaceYouTubeVideos } from "@/lib/youtube/videos";

export const runtime = "edge";

export async function GET() {
  try {
    const payload = await fetchArtaceYouTubeVideos(6);

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load YouTube videos.";

    return NextResponse.json(
      {
        channelUrl: "https://www.youtube.com/@artacestudio",
        videos: [],
        error: message,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=900",
        },
      }
    );
  }
}
