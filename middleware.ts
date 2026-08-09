import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/utils/auth";
import { getWordPressJwtSecret, isProbablyJwt, verifyHs256Jwt } from "@/utils/jwt";
import {
  AFFILIATE_REF_COOKIE_MAX_AGE_SECONDS,
  AFFILIATE_REF_COOKIE_NAME,
} from "@/lib/affiliates/constants";
import { ADMIN_SESSION_COOKIE_NAME, deriveAdminToken } from "@/lib/admin/auth";

export const runtime = "experimental-edge";

export async function middleware(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/account");
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isProtectedRoute) {
    const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value || "";

    if (!accessToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    // If the JWT secret is configured, validate the token signature in middleware so
    // forged/invalid cookies cannot access protected routes.
    const secret = getWordPressJwtSecret();
    if (secret && isProbablyJwt(accessToken)) {
      const ok = await verifyHs256Jwt(accessToken, secret);
      if (!ok) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  if (isAdminRoute) {
    const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value || "";
    const expectedToken = await deriveAdminToken();
    if (!expectedToken || adminToken !== expectedToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  const response = NextResponse.next();

  // Referral-cookie capture runs on every request this middleware sees,
  // regardless of auth status or which route it is. Last click wins.
  const referralCode = searchParams.get("ref");
  if (referralCode) {
    response.cookies.set(AFFILIATE_REF_COOKIE_NAME, referralCode, {
      maxAge: AFFILIATE_REF_COOKIE_MAX_AGE_SECONDS,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
