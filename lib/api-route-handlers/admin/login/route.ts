import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS,
  ADMIN_SESSION_COOKIE_NAME,
  deriveAdminToken,
  verifyAdminPassword,
} from "@/lib/admin/auth";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const password = String(body.password || "");

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await deriveAdminToken();
  if (!token) {
    return NextResponse.json(
      { error: "Admin panel is not configured on the server." },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
