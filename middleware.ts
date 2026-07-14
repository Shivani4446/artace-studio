import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/utils/auth";
import { getWordPressJwtSecret, isProbablyJwt, verifyHs256Jwt } from "@/utils/jwt";

export const runtime = "experimental-edge";

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value || "";

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  // If the JWT secret is configured, validate the token signature in middleware so
  // forged/invalid cookies cannot access protected routes.
  const secret = getWordPressJwtSecret();
  if (secret && isProbablyJwt(accessToken)) {
    const ok = await verifyHs256Jwt(accessToken, secret);
    if (!ok) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
