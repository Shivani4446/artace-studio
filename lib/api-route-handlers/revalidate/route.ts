import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const runtime = "edge";

// Only storefront content paths can be revalidated through `paths`.
const REVALIDATABLE_PATH = /^\/(shop|artists|blogs|collections)(\/[a-z0-9-]{1,120})?$/;

const CONTENT_TYPE_LISTING_PATHS: Record<string, string> = {
  product: "/shop",
  post: "/blogs",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { slug, tag, type } = body;
    // WordPress hooks send the secret in the body; the artist portal
    // (dashboard.artacestudio.com) sends it as `x-revalidate-secret` along
    // with `{ paths: [...] }`.
    const secret = request.headers.get("x-revalidate-secret") || body.secret;

    const expectedSecret =
      process.env.REVALIDATION_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!expectedSecret || !secret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    if (Array.isArray(body.paths)) {
      const paths = (body.paths as unknown[])
        .filter((p): p is string => typeof p === "string")
        .filter((p) => REVALIDATABLE_PATH.test(p))
        .slice(0, 20);
      for (const path of paths) revalidatePath(path);
      // Artist pages read cached portal/WordPress data tagged "artists".
      if (paths.some((p) => p.startsWith("/artists") || p.startsWith("/shop/"))) {
        revalidateTag("artists");
      }
      return NextResponse.json({ revalidated: paths, now: Date.now() });
    }

    // Defaults to "post" so existing blog-only callers keep working unchanged.
    const listingPath = CONTENT_TYPE_LISTING_PATHS[type] ?? CONTENT_TYPE_LISTING_PATHS.post;
    const detailPrefix = listingPath;

    const revalidated: string[] = [];

    if (slug) {
      revalidatePath(`${detailPrefix}/${slug}`);
      revalidated.push(`${detailPrefix}/${slug}`);
    }

    if (tag) {
      revalidateTag(tag);
      revalidated.push(`tag:${tag}`);
    }

    revalidatePath(listingPath);
    revalidated.push(listingPath);

    return NextResponse.json({
      revalidated,
      now: Date.now(),
    });
  } catch {
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
