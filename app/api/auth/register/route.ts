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

type WooCustomer = {
  id?: number;
  email?: string;
  username?: string;
  slug?: string;
};

const parseJsonSafe = <T,>(rawText: string, fallback: T): T => {
  try {
    return rawText ? (JSON.parse(rawText) as T) : fallback;
  } catch {
    return fallback;
  }
};

const sanitizeLower = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export async function POST(request: NextRequest) {
  try {
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
        {
          ok: false,
          message: "Enter your first name, last name, email, and password.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, message: "Use at least 8 characters for your password." },
        { status: 400 }
      );
    }

    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      return NextResponse.json(
        { ok: false, message: "WooCommerce customer signup is not configured yet." },
        { status: 500 }
      );
    }

    const basicToken = toBasicAuthToken(consumerKey, consumerSecret);
    const wooApiUrl = process.env.WOOCOMMERCE_REST_URL || getWordPressSiteUrl();
    const wooBase = wooApiUrl.replace(/\/+$/, "");
    const authHeader = `Basic ${basicToken}`;

    // Keep a stable username so we can log in via JWT without relying on email login support.
    const createdUsername = buildUsername(email, firstName, lastName);

    // Pre-check for an existing customer by email so we return a stable, correct message.
    try {
      const primaryLookup = `${wooBase}/wp-json/wc/v3/customers?email=${encodeURIComponent(
        email
      )}&per_page=1`;

      const lookupResponse = await fetch(primaryLookup, {
        method: "GET",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      let lookupPayload: unknown = parseJsonSafe(await lookupResponse.text(), [] as unknown[]);

      if (lookupResponse.status === 404) {
        const fallbackUrl = `${wooBase}/?rest_route=${encodeURIComponent(
          `/wc/v3/customers?email=${encodeURIComponent(email)}&per_page=1`
        )}`;
        const fallbackResponse = await fetch(fallbackUrl, {
          method: "GET",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });
        lookupPayload = parseJsonSafe(await fallbackResponse.text(), [] as unknown[]);
      }

      const existing = Array.isArray(lookupPayload) ? (lookupPayload as WooCustomer[]) : [];
      const match = existing.some(
        (customer) => sanitizeLower(customer.email) === email
      );
      if (match) {
        return NextResponse.json(
          {
            ok: false,
            message: `An account is already registered with ${email}. Please log in or use a different email address.`,
          },
          { status: 409 }
        );
      }
    } catch {
      // Ignore lookup failures and fall back to the create-customer call.
    }

    const response = await fetch(
      `${wooBase}/wp-json/wc/v3/customers`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          username: createdUsername,
          password,
        }),
        cache: "no-store",
      }
    );

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

      return NextResponse.json(
        { ok: false, message: apiMessage },
        { status: 400 }
      );
    }

    let session = null;
    try {
      session = await authenticateWordPressCredentials(createdUsername, password);
    } catch (error) {
      // Account created successfully; sign-in may be blocked by WAF/security plugins.
      const message =
        error instanceof Error
          ? error.message
          : "Your account was created, but we could not sign you in right now.";

      const lower = message.toLowerCase();
      return NextResponse.json(
        {
          ok: true,
          signedIn: false,
          message:
            lower.includes("temporarily locked out") ||
            lower.includes("locked out") ||
            lower.includes("lockout")
              ? "Your account has been created, but login is temporarily blocked. Please try logging in again in a few minutes."
              : "Your account has been created. Please log in now.",
          detail: message,
        },
        { status: 200 }
      );
    }

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
    });

    return applyAuthCookie(successResponse, session.accessToken);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create your account right now.";

    return NextResponse.json({ ok: false, message }, { status: 502 });
  }
}
