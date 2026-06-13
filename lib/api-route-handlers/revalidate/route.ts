import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret, slug, tag } = body;

    const expectedSecret =
      process.env.REVALIDATION_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    const revalidated: string[] = [];

    if (slug) {
      revalidatePath(`/blogs/${slug}`);
      revalidated.push(`/blogs/${slug}`);
    }

    if (tag) {
      revalidateTag(tag);
      revalidated.push(`tag:${tag}`);
    }

    if (!slug && !tag) {
      revalidatePath("/blogs");
      revalidated.push("/blogs");
    }

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
