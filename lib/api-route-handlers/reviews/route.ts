import { NextResponse } from "next/server";

export const runtime = "edge";

const toBasicAuthToken = (username: string, password: string) => {
  const raw = `${username}:${password}`;
  if (typeof btoa === "function") return btoa(raw);
  const maybeBuffer = globalThis as {
    Buffer?: { from: (v: string) => { toString: (enc: string) => string } };
  };
  if (maybeBuffer.Buffer) return maybeBuffer.Buffer.from(raw).toString("base64");
  throw new Error("No base64 encoder available.");
};

type ReviewPayload = {
  product_id: number;
  review: string;
  reviewer: string;
  reviewer_email: string;
  rating: number;
};

const sanitizeString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export async function POST(request: Request) {
  let payload: ReviewPayload;

  try {
    payload = (await request.json()) as ReviewPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const productId = Number(payload.product_id);
  if (!Number.isFinite(productId) || productId <= 0) {
    return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
  }

  const review = sanitizeString(payload.review);
  if (!review || review.length < 10) {
    return NextResponse.json(
      { error: "Review must be at least 10 characters." },
      { status: 400 }
    );
  }

  const reviewer = sanitizeString(payload.reviewer);
  if (!reviewer) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const reviewerEmail = sanitizeString(payload.reviewer_email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!reviewerEmail || !emailRegex.test(reviewerEmail)) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }

  const rating = Math.round(Number(payload.rating));
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5." },
      { status: 400 }
    );
  }

  const siteUrl = (
    process.env.WOOCOMMERCE_SITE_URL ||
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    "https://api.artacestudio.com/"
  ).replace(/\/+$/, "");

  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  const basicToken = toBasicAuthToken(consumerKey, consumerSecret);

  try {
    const wooResponse = await fetch(
      `${siteUrl}/wp-json/wc/v3/products/reviews`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          review,
          reviewer,
          reviewer_email: reviewerEmail,
          rating,
        }),
      }
    );

    const responseData = await wooResponse.text();

    if (!wooResponse.ok) {
      return NextResponse.json(
        {
          error: "Failed to submit review. Please try again.",
          details: responseData,
        },
        { status: wooResponse.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not connect to the review service." },
      { status: 500 }
    );
  }
}
