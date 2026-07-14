import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";


const CONTENT_TYPE_LISTING_PATHS: Record<string, string> = {
  product: "/shop",
  post: "/blogs",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret, slug, tag, type } = body;

    const expectedSecret =
      process.env.REVALIDATION_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
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
