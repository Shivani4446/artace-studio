import { NextRequest, NextResponse } from "next/server";
import {
  applyAuthCookie,
  authenticateWordPressCredentials,
} from "@/utils/auth";
import { getWordPressSiteUrl } from "@/utils/wordpress-auth";

export const runtime = "edge";

const sanitizeText = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const toBasicAuthToken = (username: string, password: string) => {
  const raw = `${username}:${password}`;
  if (typeof btoa === "function") return btoa(raw);

  const maybeBuffer = globalThis as {
    Buffer?: { from: (v: string) => { toString: (enc: string) => string } };
  };
  if (maybeBuffer.Buffer) return maybeBuffer.Buffer.from(raw).toString("base64");

  throw new Error("No base64 encoder available.");
};

const slugifyUsername = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

const buildUsername = (email: string, firstName: string, lastName: string) => {
  const emailPrefix = email.split("@")[0] || "artace-user";
  const base =
    slugifyUsername(`${firstName}-${lastName}`) ||
    slugifyUsername(emailPrefix) ||
    "artace-user";
  const suffix = Date.now().toString().slice(-6);
  return `${base}-${suffix}`;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    firstName?: unknown;
    lastName?: unknown;
    email?: unknown;
    password?: unknown;
  };

  const firstName = sanitizeText(body.firstName);
  const lastName = sanitizeText(body.lastName);
  const email = sanitizeText(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json(
      { message: "Enter your first name, last name, email, and password." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { message: "Use at least 8 characters for your password." },
      { status: 400 }
    );
  }

  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    return NextResponse.json(
      { message: "WooCommerce customer signup is not configured yet." },
      { status: 500 }
    );
  }

  const basicToken = toBasicAuthToken(consumerKey, consumerSecret);
  const response = await fetch(`${getWordPressSiteUrl()}/wp-json/wc/v3/customers`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      first_name: firstName,
      last_name: lastName,
      username: buildUsername(email, firstName, lastName),
      password,
    }),
    cache: "no-store",
  });

  const rawText = await response.text();
  let parsed: Record<string, unknown> = {};

  try {
    parsed = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {};
  } catch {
    parsed = {};
  }

  if (!response.ok) {
    const apiMessage =
      (typeof parsed.message === "string" && parsed.message) ||
      "Unable to create your account right now.";
    return NextResponse.json({ message: apiMessage }, { status: 400 });
  }

  const session = await authenticateWordPressCredentials(email, password);

  if (!session) {
    return NextResponse.json(
      {
        ok: true,
        message: "Your account has been created. Please log in now.",
        signedIn: false,
      },
      { status: 200 }
    );
  }

  const successResponse = NextResponse.json({
    ok: true,
    message: "Your account has been created. Signing you in now.",
    signedIn: true,
    session,
  });

  return applyAuthCookie(successResponse, session.accessToken);
}
