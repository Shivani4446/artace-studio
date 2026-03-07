import { NextResponse } from "next/server";
import {
  getWordPressJwtEndpoint,
  getWordPressSiteUrl,
  getWordPressUserFromToken,
} from "@/utils/wordpress-auth";

type SignupBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  username?: string;
};

const safeText = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const toUsernameFromEmail = (email: string) => {
  const localPart = email.split("@")[0] || "user";
  return localPart.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 40) || "user";
};

export async function POST(request: Request) {
  let body: SignupBody;
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const firstName = safeText(body.firstName);
  const lastName = safeText(body.lastName);
  const email = safeText(body.email).toLowerCase();
  const password = safeText(body.password);
  const username = safeText(body.username) || toUsernameFromEmail(email);

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json(
      { error: "First name, last name, email and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const siteUrl = getWordPressSiteUrl();
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    return NextResponse.json(
      {
        error:
          "WooCommerce API credentials are missing. Set WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET.",
      },
      { status: 500 }
    );
  }

  const basicToken = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );

  const createResponse = await fetch(`${siteUrl}/wp-json/wc/v3/customers`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      first_name: firstName,
      last_name: lastName,
      username,
      password,
    }),
    cache: "no-store",
  });

  const createRaw = await createResponse.text();
  let createPayload: Record<string, unknown> = {};
  try {
    createPayload = createRaw ? (JSON.parse(createRaw) as Record<string, unknown>) : {};
  } catch {
    createPayload = {};
  }

  if (!createResponse.ok) {
    const message =
      (typeof createPayload.message === "string" && createPayload.message) ||
      "Could not create account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Auto-login after successful signup
  const jwtEndpoint = getWordPressJwtEndpoint();
  const loginResponse = await fetch(jwtEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: email,
      password,
    }),
    cache: "no-store",
  });

  const loginRaw = await loginResponse.text();
  let loginPayload: Record<string, unknown> = {};
  try {
    loginPayload = loginRaw ? (JSON.parse(loginRaw) as Record<string, unknown>) : {};
  } catch {
    loginPayload = {};
  }

  if (!loginResponse.ok) {
    return NextResponse.json({
      success: true,
      requiresLogin: true,
      message: "Account created. Please login to continue.",
    });
  }

  const token = safeText(loginPayload.token);
  if (!token) {
    return NextResponse.json({
      success: true,
      requiresLogin: true,
      message: "Account created. Please login to continue.",
    });
  }

  const me = await getWordPressUserFromToken(token);
  const user = {
    id: me?.id || 0,
    name: me?.name || `${firstName} ${lastName}`.trim(),
    email: me?.email || email,
    username: me?.username || username,
  };

  const result = NextResponse.json({
    success: true,
    requiresLogin: false,
    user,
  });

  result.cookies.set("wp_jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return result;
}
