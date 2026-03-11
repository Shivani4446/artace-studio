import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import {
  getWordPressJwtEndpoint,
  getWordPressUserFromToken,
} from "@/utils/wordpress-auth";

type JwtAuthPayload = {
  token?: string;
  user_email?: string;
  user_display_name?: string;
  user_nicename?: string;
  user_id?: number | string;
};

export type AppAuthSession = {
  accessToken: string;
  user: {
    id?: string;
    name?: string;
    email?: string;
    username?: string;
  };
};

export const AUTH_COOKIE_NAME = "artace_wp_session";

const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

const safeText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const safeId = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  const integer = Math.floor(parsed);
  return integer > 0 ? integer : 0;
};

const buildSessionFromToken = async (
  accessToken: string,
  fallback?: Partial<JwtAuthPayload>
): Promise<AppAuthSession | null> => {
  if (!accessToken) {
    return null;
  }

  const wpUser = await getWordPressUserFromToken(accessToken);
  const resolvedId = wpUser?.id || safeId(fallback?.user_id);
  const resolvedName =
    wpUser?.name ||
    safeText(fallback?.user_display_name) ||
    safeText(fallback?.user_nicename) ||
    undefined;
  const resolvedEmail = wpUser?.email || safeText(fallback?.user_email) || undefined;
  const resolvedUsername =
    wpUser?.username || safeText(fallback?.user_nicename) || undefined;

  return {
    accessToken,
    user: {
      id: resolvedId ? String(resolvedId) : undefined,
      name: resolvedName,
      email: resolvedEmail,
      username: resolvedUsername,
    },
  };
};

export const authenticateWordPressCredentials = async (
  username: string,
  password: string
): Promise<AppAuthSession | null> => {
  const normalizedUsername = safeText(username);
  const normalizedPassword = safeText(password);

  if (!normalizedUsername || !normalizedPassword) {
    return null;
  }

  const response = await fetch(getWordPressJwtEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: normalizedUsername,
      password: normalizedPassword,
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as JwtAuthPayload;

  if (!response.ok || !payload.token) {
    return null;
  }

  return buildSessionFromToken(payload.token, payload);
};

export const getAuthSession = async (): Promise<AppAuthSession | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value || "";
  return buildSessionFromToken(accessToken);
};

export const getAuthSessionFromRequest = async (
  request: NextRequest
): Promise<AppAuthSession | null> => {
  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value || "";
  return buildSessionFromToken(accessToken);
};

export const applyAuthCookie = (response: NextResponse, accessToken: string) => {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });

  return response;
};

export const clearAuthCookie = (response: NextResponse) => {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
};
