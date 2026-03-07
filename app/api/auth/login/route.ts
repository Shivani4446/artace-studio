import { NextResponse } from "next/server";
import {
  getWordPressJwtEndpoint,
  getWordPressUserFromToken,
} from "@/utils/wordpress-auth";

type LoginBody = {
  username?: string;
  password?: string;
};

const safeText = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const username = safeText(body.username);
  const password = safeText(body.password);

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 }
    );
  }

  const jwtEndpoint = getWordPressJwtEndpoint();
  const response = await fetch(jwtEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
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
    const message =
      (typeof parsed.message === "string" && parsed.message) ||
      "Invalid login credentials.";
    return NextResponse.json({ error: message }, { status: 401 });
  }

  const token = safeText(parsed.token);
  if (!token) {
    return NextResponse.json(
      {
        error:
          "JWT token was not returned by WordPress. Ensure JWT auth plugin is active.",
      },
      { status: 502 }
    );
  }

  const me = await getWordPressUserFromToken(token);
  const user = {
    id: me?.id || 0,
    name: me?.name || safeText(parsed.user_display_name),
    email: me?.email || safeText(parsed.user_email),
    username: me?.username || safeText(parsed.user_nicename),
  };

  const result = NextResponse.json({ success: true, user });
  result.cookies.set("wp_jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return result;
}
