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

type WooCustomer = {
  id?: number;
  email?: string;
  username?: string;
  slug?: string;
};

const fetchWooCustomers = async (url: string, authHeader: string) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const rawText = await response.text();
  let parsed: unknown = [];
  try {
    parsed = rawText ? (JSON.parse(rawText) as unknown) : [];
  } catch {
    parsed = [];
  }

  return { response, parsed };
};

const findWooUsernameForEmail = async (email: string) => {
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";

  if (!consumerKey || !consumerSecret) {
    throw new Error("WooCommerce API credentials are missing for login lookup.");
  }

  // Customer lookup must hit the Woo REST origin, not the marketing site and not necessarily the JWT origin.
  const apiUrl = (process.env.WOOCOMMERCE_REST_URL || getWordPressSiteUrl()).replace(/\/+$/, "");
  const authHeader = `Basic ${toBasicAuthToken(consumerKey, consumerSecret)}`;
  const normalizedEmail = email.trim().toLowerCase();

  const wpJsonUrlByEmail = `${apiUrl}/wp-json/wc/v3/customers?email=${encodeURIComponent(
    normalizedEmail
  )}&per_page=10`;

  const attemptUrls = [
    wpJsonUrlByEmail,
    `${apiUrl}/wp-json/wc/v3/customers?search=${encodeURIComponent(
      normalizedEmail
    )}&per_page=10`,
  ];

  for (const url of attemptUrls) {
    const primary = await fetchWooCustomers(url, authHeader);
    const candidates = Array.isArray(primary.parsed) ? (primary.parsed as WooCustomer[]) : [];

    // Fallback for servers without /wp-json rewrite routing.
    const effectiveCandidates =
      primary.response.status === 404
        ? (() => {
            const query = url.split("?")[1] || "";
            const route = `/wc/v3/customers${query ? `?${query}` : ""}`;
            const fallbackUrl = `${apiUrl}/?rest_route=${encodeURIComponent(route)}`;
            return fetchWooCustomers(fallbackUrl, authHeader).then((fallback) =>
              Array.isArray(fallback.parsed) ? (fallback.parsed as WooCustomer[]) : []
            );
          })()
        : candidates;

    const resolved =
      effectiveCandidates instanceof Promise ? await effectiveCandidates : effectiveCandidates;

    const match = resolved.find(
      (customer) => sanitizeText(customer.email).toLowerCase() === normalizedEmail
    );

    const username =
      sanitizeText(match?.username) || sanitizeText(match?.slug);

    if (username) {
      return username;
    }
  }

  return "";
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      username?: unknown;
      password?: unknown;
    };

    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";

    const trimmedUsername = username.trim();

    // If the user typed an email, resolve the WordPress username first so we don't
    // trigger multiple failed JWT attempts (many security plugins lock out quickly).
    if (trimmedUsername.includes("@")) {
      const resolvedUsername = await findWooUsernameForEmail(trimmedUsername);
      if (!resolvedUsername) {
        // Avoid hitting JWT at all if we can't find a matching customer. This prevents
        // unnecessary lockouts and keeps the failure message accurate.
        return NextResponse.json(
          {
            ok: false,
            message:
              "No account matched those credentials. Create an account first if you are new.",
          },
          { status: 401 }
        );
      }

      const session = await authenticateWordPressCredentials(resolvedUsername, password);
      if (session) {
        const response = NextResponse.json({ ok: true });
        return applyAuthCookie(response, session.accessToken);
      }

      return NextResponse.json(
        {
          ok: false,
          message:
            "No account matched those credentials. Create an account first if you are new.",
        },
        { status: 401 }
      );
    }

    const session = await authenticateWordPressCredentials(trimmedUsername, password);

    if (!session) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "No account matched those credentials. Create an account first if you are new.",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      ok: true,
    });

    return applyAuthCookie(response, session.accessToken);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to sign you in right now. Please try again.";

    const lower = message.toLowerCase();
    const status =
      lower.includes("temporarily locked out") ||
      lower.includes("locked out") ||
      lower.includes("lockout")
      ? 429
      : 502;

    return NextResponse.json({ ok: false, message }, { status });
  }
}
