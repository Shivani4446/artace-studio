import { NextResponse } from "next/server";
import {
  fetchAllWordPressCategories,
  fetchAllWordPressPosts,
  fetchAllWordPressTags,
  getWordPressTaxonomyNames,
  normalizeWordPressBlogPosts,
} from "@/utils/wordpress-blog";

export const runtime = "edge";

export async function GET() {
  try {
    const [rawPosts, rawCategories, rawTags] = await Promise.all([
      fetchAllWordPressPosts({ revalidate: 120 }),
      fetchAllWordPressCategories({ revalidate: 120 }),
      fetchAllWordPressTags({ revalidate: 120 }),
    ]);

    const posts = normalizeWordPressBlogPosts(rawPosts, rawCategories, rawTags);
    const availableCategories = getWordPressTaxonomyNames(
      rawCategories,
      posts.flatMap((post) => post.categories)
    );
    const availableTags = getWordPressTaxonomyNames(
      rawTags,
      posts.flatMap((post) => post.tags)
    );

    return NextResponse.json(
      {
        posts,
        availableCategories,
        availableTags,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load blog posts.";

    return NextResponse.json(
      {
        posts: [],
        availableCategories: [],
        availableTags: [],
        error: message,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
