import { authenticateWordPressCredentials, type AppAuthSession } from "@/utils/auth";
import { getWordPressSiteUrl } from "@/utils/wordpress-auth";

/**
 * Guest checkout: shoppers no longer need to sign up before paying. When a
 * signed-out shopper places an order, we find or create their WooCommerce
 * account from the billing email so the order still lands in an account
 * (order history, Artace Rewards points):
 *
 * - New email: create a customer with a random password and sign them in
 *   (the caller sets the auth cookie). After payment succeeds they get an
 *   email with a link to set their own password (see finalize-order).
 * - Existing email: attach the order to that account but DO NOT sign them
 *   in — knowing an email address must never grant access to an account.
 */

type AddressInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
};

export type GuestCustomerResult = {
  customerId: number;
  /** True when this checkout created the account. */
  created: boolean;
  /** Present only for newly created accounts that signed in successfully. */
  session: AppAuthSession | null;
};

const getWooBase = () => (process.env.WOOCOMMERCE_REST_URL || getWordPressSiteUrl()).replace(/\/+$/, "");

const getWooAuthHeader = () => {
  const key = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  if (!key || !secret) throw new Error("WooCommerce API credentials are not configured.");
  return `Basic ${btoa(`${key}:${secret}`)}`;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

const buildUsername = (email: string, firstName: string, lastName: string) => {
  const base = slugify(`${firstName}-${lastName}`) || slugify(email.split("@")[0] || "") || "artace-user";
  const suffix = Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${base}-${suffix}`;
};

// 24 random bytes → 32-char base64url password. The shopper never sees it;
// they set their own via the emailed "set your password" link.
const randomPassword = () =>
  btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const toWooAddress = (address: AddressInput, includeContact: boolean) => ({
  first_name: address.firstName,
  last_name: address.lastName,
  address_1: address.address1,
  address_2: address.address2 || "",
  city: address.city,
  state: address.state,
  postcode: address.postcode,
  country: address.country,
  ...(includeContact ? { email: address.email, phone: address.phone } : {}),
});

const findCustomerIdByEmail = async (email: string): Promise<number | null> => {
  const response = await fetch(
    `${getWooBase()}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}&role=all&per_page=1`,
    { headers: { Authorization: getWooAuthHeader() }, cache: "no-store" }
  );
  if (!response.ok) throw new Error(`Customer lookup failed (${response.status}).`);
  const list = (await response.json()) as Array<{ id?: number; email?: string }>;
  const match = Array.isArray(list)
    ? list.find((c) => (c.email || "").trim().toLowerCase() === email)
    : undefined;
  return match?.id && match.id > 0 ? match.id : null;
};

export const findOrCreateCheckoutCustomer = async ({
  billing,
  shipping,
}: {
  billing: AddressInput;
  shipping: AddressInput;
}): Promise<GuestCustomerResult> => {
  const email = billing.email.trim().toLowerCase();

  const existingId = await findCustomerIdByEmail(email);
  if (existingId) return { customerId: existingId, created: false, session: null };

  const username = buildUsername(email, billing.firstName, billing.lastName);
  const password = randomPassword();

  const response = await fetch(`${getWooBase()}/wp-json/wc/v3/customers`, {
    method: "POST",
    headers: { Authorization: getWooAuthHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      first_name: billing.firstName,
      last_name: billing.lastName,
      username,
      password,
      billing: toWooAddress({ ...billing, email }, true),
      shipping: toWooAddress(shipping, false),
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as { id?: number; code?: string };

  if (!response.ok || !payload.id) {
    // Race: the same email registered between our lookup and create.
    if (payload.code === "registration-error-email-exists") {
      const raceId = await findCustomerIdByEmail(email);
      if (raceId) return { customerId: raceId, created: false, session: null };
    }
    throw new Error(`Could not create a customer account (${response.status}).`);
  }

  // Sign the new customer in. A failure here (WAF, login lockout plugin)
  // must not block the order — they can still set a password later.
  let session: AppAuthSession | null = null;
  try {
    session = await authenticateWordPressCredentials(username, password);
  } catch {
    session = null;
  }

  return { customerId: payload.id, created: true, session };
};
