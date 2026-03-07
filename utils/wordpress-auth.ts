export type WordPressAuthUser = {
  id: number;
  name: string;
  email: string;
  username: string;
};

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://artacestudio.com";

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

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  return Buffer.from(padded, "base64").toString("utf-8");
};

const extractUserFromJwt = (token: string): Partial<WordPressAuthUser> => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return {};
    const payloadRaw = decodeBase64Url(parts[1]);
    const payload = JSON.parse(payloadRaw) as Record<string, unknown>;
    return {
      id: safeId(payload?.data ? (payload.data as Record<string, unknown>).user?.id : 0),
      email: safeText(
        payload?.data ? (payload.data as Record<string, unknown>).user?.email : ""
      ),
      username: safeText(
        payload?.data
          ? (payload.data as Record<string, unknown>).user?.user_login
          : ""
      ),
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

export const getWordPressUserFromToken = async (
  token: string
): Promise<WordPressAuthUser | null> => {
  const siteUrl = getWordPressSiteUrl();

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
    const fallback = extractUserFromJwt(token);

    return {
      id: safeId(payload.id) || fallback.id || 0,
      name: safeText(payload.name),
      email: safeText(payload.email) || fallback.email || "",
      username: safeText(payload.slug) || fallback.username || "",
    };
  } catch {
    return null;
  }
};
