import { sendTransactionalEmail } from "@/lib/email/resend";
import { buildPasswordResetEmail } from "@/lib/email/templates";
import { buildSiteUrl } from "@/lib/site";

export type WordPressAuthUser = {
  id: number;
  name: string;
  email: string;
  username: string;
};

export type WordPressProfile = WordPressAuthUser & {
  firstName: string;
  lastName: string;
  displayName: string;
  nickname: string;
  description: string;
  avatarUrl: string;
  roles: string[];
};

export type WordPressProfileUpdateInput = {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  description?: string;
};

export type WordPressPasswordResult = {
  ok: boolean;
  message: string;
};

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";

const safeText = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const safeId = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  const integer = Math.floor(parsed);
  return integer > 0 ? integer : 0;
};

const safeStringArray = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => safeText(entry)).filter(Boolean);
};

const decodeBase64 = (value: string) => {
  if (typeof atob === "function") {
    return atob(value);
  }

  const maybeBuffer = (globalThis as { Buffer?: { from: (v: string, enc: string) => { toString: (enc: string) => string } } }).Buffer;
  if (maybeBuffer) {
    return maybeBuffer.from(value, "base64").toString("utf-8");
  }

  throw new Error("No base64 decoder available.");
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  return decodeBase64(padded);
};

export const extractWordPressUserFromJwt = (
  token: string
): Partial<WordPressAuthUser> => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return {};
    const payloadRaw = decodeBase64Url(parts[1]);
    const payload = JSON.parse(payloadRaw) as Record<string, unknown>;
    const data =
      payload.data && typeof payload.data === "object"
        ? (payload.data as Record<string, unknown>)
        : null;
    const user =
      data?.user && typeof data.user === "object"
        ? (data.user as Record<string, unknown>)
        : null;

    return {
      id: safeId(user?.id),
      email: safeText(user?.email),
      username: safeText(user?.user_login),
    };
  } catch {
    return {};
  }
};

export const getWordPressSiteUrl = () => {
  const siteUrl =
    process.env.WOOCOMMERCE_SITE_URL ||
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    DEFAULT_WOOCOMMERCE_SITE_URL;
  return siteUrl.replace(/\/+$/, "");
};

export const getWordPressApiUrl = () => {
  const apiUrl =
    safeText(process.env.WORDPRESS_API_URL) ||
    safeText(process.env.WOOCOMMERCE_REST_URL) ||
    getWordPressSiteUrl() ||
    DEFAULT_WOOCOMMERCE_SITE_URL;

  return apiUrl.replace(/\/+$/, "");
};

export const getWordPressJwtEndpoint = () => {
  const configured = safeText(process.env.WORDPRESS_JWT_AUTH_URL);
  if (configured) return configured.replace(/\/+$/, "");
  return `${getWordPressApiUrl()}/wp-json/jwt-auth/v1/token`;
};

const getArtaceAuthBridgeUrl = (path: string) => {
  const base = getWordPressApiUrl();
  if (!base.startsWith("https://")) {
    throw new Error("WordPress API URL must use HTTPS for the auth bridge.");
  }
  return `${base}/wp-json/artace-auth/v1${path}`;
};

const getArtaceAuthBridgeSecret = () => {
  const secret = safeText(process.env.WORDPRESS_INTERNAL_API_SECRET);
  if (!secret) {
    throw new Error("WORDPRESS_INTERNAL_API_SECRET is not configured.");
  }
  return secret;
};

const normalizeAvatarUrl = (value: unknown) => {
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  return (
    safeText(record["96"]) ||
    safeText(record["48"]) ||
    safeText(record["24"]) ||
    ""
  );
};

const mapWordPressProfile = (
  payload: Record<string, unknown>,
  fallback?: Partial<WordPressAuthUser>
): WordPressProfile => ({
  id: safeId(payload.id) || fallback?.id || 0,
  name: safeText(payload.name) || fallback?.name || "",
  displayName: safeText(payload.name) || fallback?.name || "",
  email: safeText(payload.email) || fallback?.email || "",
  username: safeText(payload.slug) || fallback?.username || "",
  firstName: safeText(payload.first_name),
  lastName: safeText(payload.last_name),
  nickname: safeText(payload.nickname),
  description: safeText(payload.description),
  avatarUrl: normalizeAvatarUrl(payload.avatar_urls),
  roles: safeStringArray(payload.roles),
});

export const getWordPressProfile = async (
  token: string
): Promise<WordPressProfile | null> => {
  const siteUrl = getWordPressApiUrl();
  const fallback = extractWordPressUserFromJwt(token);

  try {
    const response = await fetch(`${siteUrl}/wp-json/wp/v2/users/me?context=edit`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Record<string, unknown>;
    return mapWordPressProfile(payload, fallback);
  } catch {
    return null;
  }
};

export const getWordPressUserFromToken = async (
  token: string
): Promise<WordPressAuthUser | null> => {
  const profile = await getWordPressProfile(token);

  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    name: profile.displayName || profile.name,
    email: profile.email,
    username: profile.username,
  };
};

export const updateWordPressProfile = async (
  token: string,
  input: WordPressProfileUpdateInput
): Promise<WordPressProfile | null> => {
  const currentProfile = await getWordPressProfile(token);

  if (!currentProfile?.id) {
    return null;
  }

  const payload = {
    first_name: safeText(input.firstName),
    last_name: safeText(input.lastName),
    name: safeText(input.displayName),
    email: safeText(input.email),
    description: safeText(input.description),
  };

  try {
    const response = await fetch(
      `${getWordPressApiUrl()}/wp-json/wp/v2/users/${currentProfile.id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const updatedPayload = (await response.json()) as Record<string, unknown>;
    return mapWordPressProfile(updatedPayload, currentProfile);
  } catch {
    return null;
  }
};

export const requestWordPressPasswordReset = async (
  username: string
): Promise<WordPressPasswordResult> => {
  const normalizedUsername = safeText(username);

  if (!normalizedUsername) {
    return {
      ok: false,
      message: "Enter your email address or username.",
    };
  }

  const genericSuccess: WordPressPasswordResult = {
    ok: true,
    message: "If an account exists for that email, we've sent a reset link.",
  };

  try {
    const secret = getArtaceAuthBridgeSecret();

    const response = await fetch(getArtaceAuthBridgeUrl("/request-reset"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Artace-Secret": secret,
      },
      body: JSON.stringify({ username_or_email: normalizedUsername }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[wordpress-auth] request-reset bridge call failed:", response.status);
      return {
        ok: false,
        message: "Unable to reach WordPress right now. Please try again.",
      };
    }

    const payload = (await response.json()) as {
      found?: boolean;
      login?: string;
      email?: string;
      firstName?: string;
      key?: string;
    };

    // Enumeration-safe: return the same generic message to the browser
    // whether or not the account was found.
    if (!payload.found || !payload.login || !payload.email || !payload.key) {
      return genericSuccess;
    }

    try {
      const resetUrl = buildSiteUrl(
        `/reset-password?login=${encodeURIComponent(payload.login)}&key=${encodeURIComponent(
          payload.key
        )}`
      );
      const emailContent = buildPasswordResetEmail({
        firstName: payload.firstName || "",
        resetUrl,
      });
      await sendTransactionalEmail({ to: payload.email, ...emailContent });
    } catch (error) {
      // Don't let an email-delivery failure change the (enumeration-safe)
      // response, but do log it — otherwise a broken Resend config would
      // silently mean nobody ever gets a reset email.
      console.error("[wordpress-auth] password reset email failed:", error);
    }

    return genericSuccess;
  } catch (error) {
    console.error("[wordpress-auth] request-reset bridge error:", error);
    return {
      ok: false,
      message: "Unable to reach WordPress right now. Please try again.",
    };
  }
};

export const resetWordPressPassword = async ({
  login,
  key,
  password,
}: {
  login: string;
  key: string;
  password: string;
}): Promise<WordPressPasswordResult> => {
  const normalizedLogin = safeText(login);
  const normalizedKey = safeText(key);

  if (!normalizedLogin || !normalizedKey || !safeText(password)) {
    return {
      ok: false,
      message: "The reset link is incomplete. Request a new password reset email.",
    };
  }

  try {
    const secret = getArtaceAuthBridgeSecret();

    const response = await fetch(getArtaceAuthBridgeUrl("/reset-password"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Artace-Secret": secret,
      },
      body: JSON.stringify({
        login: normalizedLogin,
        key: normalizedKey,
        password,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[wordpress-auth] reset-password bridge call failed:", response.status);
      return {
        ok: false,
        message: "Unable to reset your password right now. Please try again.",
      };
    }

    const payload = (await response.json()) as { ok?: boolean; message?: string };

    return {
      ok: Boolean(payload.ok),
      message: payload.message || "Unable to reset your password right now. Please try again.",
    };
  } catch (error) {
    console.error("[wordpress-auth] reset-password bridge error:", error);
    return {
      ok: false,
      message: "Unable to reset your password right now. Please try again.",
    };
  }
};
