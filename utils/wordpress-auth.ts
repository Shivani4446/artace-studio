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

const extractUserFromJwt = (token: string): Partial<WordPressAuthUser> => {
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

export const getWordPressJwtEndpoint = () => {
  const configured = safeText(process.env.WORDPRESS_JWT_AUTH_URL);
  if (configured) return configured.replace(/\/+$/, "");
  return `${getWordPressSiteUrl()}/wp-json/jwt-auth/v1/token`;
};

const getWordPressLostPasswordEndpoint = () =>
  `${getWordPressSiteUrl()}/wp-login.php?action=lostpassword`;

const getWordPressResetPasswordEntryEndpoint = (login: string, key: string) =>
  `${getWordPressSiteUrl()}/wp-login.php?action=rp&login=${encodeURIComponent(
    login
  )}&key=${encodeURIComponent(key)}`;

const getWordPressResetPasswordSubmitEndpoint = () =>
  `${getWordPressSiteUrl()}/wp-login.php?action=resetpass`;

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

const parseWordPressErrorMessage = (html: string) => {
  const loginErrorMatch = html.match(
    /<div[^>]+id=["']login_error["'][^>]*>([\s\S]*?)<\/div>/i
  );
  const messageSource = loginErrorMatch?.[1] || html;
  const stripped = messageSource
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

  return stripped || "Something went wrong. Please try again.";
};

const getSetCookies = (headers: Headers) => {
  const cookieHeaders = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof cookieHeaders.getSetCookie === "function") {
    return cookieHeaders.getSetCookie();
  }

  const singleHeader = headers.get("set-cookie");
  return singleHeader ? [singleHeader] : [];
};

const getCookieHeader = (cookies: string[]) =>
  cookies
    .map((cookie) => cookie.split(";")[0]?.trim() || "")
    .filter(Boolean)
    .join("; ");

export const getWordPressProfile = async (
  token: string
): Promise<WordPressProfile | null> => {
  const siteUrl = getWordPressSiteUrl();
  const fallback = extractUserFromJwt(token);

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
      `${getWordPressSiteUrl()}/wp-json/wp/v2/users/${currentProfile.id}`,
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

  try {
    const response = await fetch(getWordPressLostPasswordEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        user_login: normalizedUsername,
        "wp-submit": "Get New Password",
        redirect_to: "",
      }),
      redirect: "manual",
      cache: "no-store",
    });

    const location = response.headers.get("location") || "";

    if (response.status >= 300 && response.status < 400) {
      if (location.includes("checkemail=confirm")) {
        return {
          ok: true,
          message:
            "If an account exists for that email, WordPress has sent a reset link.",
        };
      }
    }

    const html = await response.text();
    return {
      ok: false,
      message: parseWordPressErrorMessage(html),
    };
  } catch {
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
    const bootstrapResponse = await fetch(
      getWordPressResetPasswordEntryEndpoint(normalizedLogin, normalizedKey),
      {
        method: "GET",
        redirect: "manual",
        cache: "no-store",
      }
    );

    const bootstrapLocation = bootstrapResponse.headers.get("location") || "";
    const cookieHeader = getCookieHeader(getSetCookies(bootstrapResponse.headers));

    if (
      bootstrapResponse.status < 300 ||
      bootstrapResponse.status >= 400 ||
      !cookieHeader ||
      !bootstrapLocation.includes("action=resetpass")
    ) {
      const html = await bootstrapResponse.text();
      return {
        ok: false,
        message: parseWordPressErrorMessage(html),
      };
    }

    const submitResponse = await fetch(getWordPressResetPasswordSubmitEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookieHeader,
      },
      body: new URLSearchParams({
        pass1: password,
        pass2: password,
        rp_key: normalizedKey,
        rp_login: normalizedLogin,
        "wp-submit": "Save Password",
      }),
      redirect: "manual",
      cache: "no-store",
    });

    const submitLocation = submitResponse.headers.get("location") || "";

    if (
      submitResponse.status >= 300 &&
      submitResponse.status < 400 &&
      submitLocation.includes("password-reset=true")
    ) {
      return {
        ok: true,
        message: "Your password has been updated. You can sign in now.",
      };
    }

    const html = await submitResponse.text();
    return {
      ok: false,
      message: parseWordPressErrorMessage(html),
    };
  } catch {
    return {
      ok: false,
      message: "Unable to reset your password right now. Please try again.",
    };
  }
};
