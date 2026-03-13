import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import {
  extractWordPressUserFromJwt,
  getWordPressJwtEndpoint,
  getWordPressUserFromToken,
} from "@/utils/wordpress-auth";
import { getWordPressJwtSecret, verifyHs256Jwt } from "@/utils/jwt";

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

export type AppAuthPublicSession = Omit<AppAuthSession, "accessToken">;

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

  // If we have a fallback payload from the WP JWT token endpoint, treat it as trusted
  // (it came from WordPress along with a freshly minted token).
  if (fallback && (fallback.user_id || fallback.user_email || fallback.user_nicename)) {
    const resolvedId = safeId(fallback.user_id);
    const resolvedName =
      safeText(fallback.user_display_name) ||
      safeText(fallback.user_nicename) ||
      undefined;
    const resolvedEmail = safeText(fallback.user_email) || undefined;
    const resolvedUsername = safeText(fallback.user_nicename) || undefined;

    return {
      accessToken,
      user: {
        id: resolvedId ? String(resolvedId) : undefined,
        name: resolvedName,
        email: resolvedEmail,
        username: resolvedUsername,
      },
    };
  }

  // Prefer local JWT verification when WORDPRESS_JWT_SECRET_KEY is configured. This avoids
  // trusting unverified payloads and reduces dependency on wp/v2/users/me availability.
  const secret = getWordPressJwtSecret();
  if (secret) {
    const isValid = await verifyHs256Jwt(accessToken, secret);
    if (!isValid) {
      return null;
    }

    const jwtUser = extractWordPressUserFromJwt(accessToken);
    const resolvedId = safeId(jwtUser?.id);
    const resolvedEmail = safeText(jwtUser?.email) || undefined;
    const resolvedUsername = safeText(jwtUser?.username) || undefined;

    return {
      accessToken,
      user: {
        id: resolvedId ? String(resolvedId) : undefined,
        email: resolvedEmail,
        username: resolvedUsername,
      },
    };
  }

  // If we cannot verify locally, we only consider the session valid if WordPress confirms the token.
  const wpUser = await getWordPressUserFromToken(accessToken);
  if (!wpUser?.id) {
    return null;
  }

  const resolvedId = wpUser?.id;
  const resolvedName =
    wpUser?.name ||
    undefined;
  const resolvedEmail = wpUser?.email || undefined;
  const resolvedUsername = wpUser?.username || undefined;

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

  const primaryEndpoint = getWordPressJwtEndpoint();

  const buildRestRouteFallback = (endpoint: string) => {
    try {
      const url = new URL(endpoint);
      const marker = "/wp-json/jwt-auth/v1/token";
      const index = url.pathname.indexOf(marker);
      if (index === -1) return "";
      const basePath = url.pathname.slice(0, index);
      const base = `${url.origin}${basePath}`.replace(/\/+$/, "");
      return `${base}/?rest_route=${encodeURIComponent("/jwt-auth/v1/token")}`;
    } catch {
      return "";
    }
  };

  const postToken = async (endpoint: string) => {
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Some WAF/security plugins apply stricter rules to empty/unknown user agents.
          "User-Agent": "ArtaceStudio-Storefront/1.0",
        },
        body: JSON.stringify({
          username: normalizedUsername,
          password: normalizedPassword,
        }),
        cache: "no-store",
      });
    } catch {
      throw new Error("Unable to reach WordPress authentication right now.");
    }

    const rawText = await response.text();
    let payload: JwtAuthPayload & { message?: unknown } = {};

    try {
      payload = rawText ? (JSON.parse(rawText) as JwtAuthPayload & { message?: unknown }) : {};
    } catch {
      payload = {};
    }

    return { response, rawText, payload };
  };

  const buildFailureMessage = ({
    endpoint,
    status,
    payload,
    rawText,
  }: {
    endpoint: string;
    status: number;
    payload: JwtAuthPayload & { message?: unknown };
    rawText: string;
  }) => {
    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    if (message) return `${message} [${status}] ${endpoint}`;

    const preview = rawText.trim().slice(0, 180);
    const lower = rawText.toLowerCase();
    if (status === 503 && (lower.includes("temporarily locked out") || lower.includes("locked out"))) {
      return `WordPress blocked this login attempt (temporary lockout) at ${endpoint}. Unblock this IP / relax brute-force rules in your security plugin/WAF.`;
    }
    return preview
      ? `WordPress auth request failed (${status}) at ${endpoint}. Response: ${preview}`
      : `WordPress auth request failed (${status}) at ${endpoint}.`;
  };

  const primary = await postToken(primaryEndpoint);

  if (!primary.response.ok) {
    if (primary.response.status === 401 || primary.response.status === 403) {
      return null;
    }

    // Only use rest_route fallback when the host doesn't route /wp-json/* (404).
    // A 503 indicates origin unavailability; retrying via rest_route won't help and may confuse debugging.
    if (primary.response.status === 404) {
      const fallbackEndpoint = buildRestRouteFallback(primaryEndpoint);
      if (fallbackEndpoint && fallbackEndpoint !== primaryEndpoint) {
        const fallback = await postToken(fallbackEndpoint);

        if (!fallback.response.ok) {
          if (fallback.response.status === 401 || fallback.response.status === 403) {
            return null;
          }

          const primaryMessage = buildFailureMessage({
            endpoint: primaryEndpoint,
            status: primary.response.status,
            payload: primary.payload,
            rawText: primary.rawText,
          });
          const fallbackMessage = buildFailureMessage({
            endpoint: fallbackEndpoint,
            status: fallback.response.status,
            payload: fallback.payload,
            rawText: fallback.rawText,
          });

          throw new Error(`${primaryMessage} | Fallback: ${fallbackMessage}`);
        }

        if (!fallback.payload.token) {
          return null;
        }

        return buildSessionFromToken(fallback.payload.token, fallback.payload);
      }
    }

    throw new Error(
      buildFailureMessage({
        endpoint: primaryEndpoint,
        status: primary.response.status,
        payload: primary.payload,
        rawText: primary.rawText,
      })
    );
  }

  if (!primary.payload.token) {
    return null;
  }

  return buildSessionFromToken(primary.payload.token, primary.payload);
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

export const toPublicSession = (
  session: AppAuthSession | null
): AppAuthPublicSession | null => (session ? { user: session.user } : null);

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
