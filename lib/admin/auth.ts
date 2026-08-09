// Simple single-admin password gate — deliberately not a full user/account
// system (the site has none for staff). The raw password is never stored
// client-side: the cookie holds a SHA-256 derivation of it, which changes
// automatically if ADMIN_PANEL_PASSWORD is ever rotated, invalidating any
// previously issued cookie.
export const ADMIN_SESSION_COOKIE_NAME = "artace_admin_session";
export const ADMIN_SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const encoder = new TextEncoder();

export const deriveAdminToken = async (): Promise<string | null> => {
  const password = process.env.ADMIN_PANEL_PASSWORD || "";
  if (!password) return null;

  const data = encoder.encode(`artace-admin::${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const verifyAdminPassword = (submittedPassword: string): boolean => {
  const password = process.env.ADMIN_PANEL_PASSWORD || "";
  return Boolean(password) && submittedPassword === password;
};

// Middleware's matcher excludes all of /api (see middleware.ts), so it does
// not protect /api/admin/* data routes — each one calls this directly.
export const verifyAdminRequest = async (
  request: { cookies: { get: (name: string) => { value: string } | undefined } }
): Promise<boolean> => {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value || "";
  if (!token) return false;

  const expectedToken = await deriveAdminToken();
  return Boolean(expectedToken) && token === expectedToken;
};
