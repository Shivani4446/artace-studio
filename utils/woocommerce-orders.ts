import {
  extractWordPressUserFromJwt,
  getWordPressSiteUrl,
  getWordPressUserFromToken,
} from "@/utils/wordpress-auth";
import { getWordPressJwtSecret, verifyHs256Jwt } from "@/utils/jwt";

export type DashboardOrder = {
  id: number;
  number: string;
  status: string;
  dateCreated: string;
  total: string;
  currency: string;
  paymentMethodTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    total: string;
  }>;
};

type WooOrder = {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  meta_data?: Array<{ key?: unknown; value?: unknown }>;
  currency: string;
  payment_method_title: string;
  billing?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  line_items?: Array<{
    id: number;
    name: string;
    quantity: number;
    total: string;
  }>;
};

const sanitizeText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const getMetaValue = (meta: WooOrder["meta_data"], key: string) => {
  if (!Array.isArray(meta)) return "";
  const match = meta.find((item) => sanitizeText(item?.key) === key);
  const raw = match?.value;
  if (raw === null || raw === undefined) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return String(raw);
  try {
    return JSON.stringify(raw);
  } catch {
    return "";
  }
};

const resolvePaidTotal = (order: WooOrder) => {
  // Prefer the persisted "paid amount" set at capture/verify time.
  const paidTotal = sanitizeText(getMetaValue(order.meta_data, "_artace_paid_total"));
  if (paidTotal) return paidTotal;

  // Fallback to order.total (may change if edited later in Woo admin).
  return order.total || "";
};

const toBasicAuthToken = (username: string, password: string) => {
  const raw = `${username}:${password}`;
  if (typeof btoa === "function") return btoa(raw);

  const maybeBuffer = globalThis as {
    Buffer?: { from: (v: string) => { toString: (enc: string) => string } };
  };
  if (maybeBuffer.Buffer) return maybeBuffer.Buffer.from(raw).toString("base64");

  throw new Error("No base64 encoder available.");
};

const getWooCommerceConfig = () => {
  return {
    siteUrl: (process.env.WOOCOMMERCE_REST_URL || getWordPressSiteUrl()).replace(/\/+$/, ""),
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  };
};

export const fetchWooCommerceOrdersForToken = async (
  customerToken: string
): Promise<DashboardOrder[]> => {
  const { siteUrl, consumerKey, consumerSecret } = getWooCommerceConfig();

  if (!customerToken) {
    throw new Error("Please login first.");
  }

  let customerId = 0;

  const secret = getWordPressJwtSecret();
  if (secret) {
    const ok = await verifyHs256Jwt(customerToken, secret);
    if (!ok) {
      throw new Error("Invalid session.");
    }

    const jwtUser = extractWordPressUserFromJwt(customerToken);
    customerId = typeof jwtUser.id === "number" ? jwtUser.id : 0;
  } else {
    const customer = await getWordPressUserFromToken(customerToken);
    customerId = customer?.id || 0;
  }

  if (!customerId) {
    throw new Error("Invalid session.");
  }

  if (!consumerKey || !consumerSecret) {
    throw new Error(
      "WooCommerce API credentials are missing. Set WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET."
    );
  }

  const basicToken = toBasicAuthToken(consumerKey, consumerSecret);
  const wpJsonOrdersUrl = `${siteUrl}/wp-json/wc/v3/orders?per_page=50&orderby=date&order=desc&customer=${customerId}`;

  const response = await fetch(wpJsonOrdersUrl, {
    method: "GET",
    headers: {
      Authorization: `Basic ${basicToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  // Fallback for servers without /wp-json rewrite routing.
  const fallbackResponse =
    response.status === 404
      ? await fetch(
          `${siteUrl}/?rest_route=${encodeURIComponent(
            `/wc/v3/orders?per_page=50&orderby=date&order=desc&customer=${customerId}`
          )}`,
          {
            method: "GET",
            headers: {
              Authorization: `Basic ${basicToken}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        )
      : null;

  const effectiveResponse = fallbackResponse || response;

  const rawText = await effectiveResponse.text();
  let parsed: WooOrder[] | { message?: string } = [];
  try {
    parsed = rawText ? (JSON.parse(rawText) as WooOrder[] | { message?: string }) : [];
  } catch {
    parsed = [];
  }

  if (!effectiveResponse.ok) {
    const apiMessage =
      !Array.isArray(parsed) && typeof parsed.message === "string"
        ? parsed.message
        : `Failed to fetch orders (${effectiveResponse.status}).`;
    throw new Error(apiMessage);
  }

  return (Array.isArray(parsed) ? parsed : []).map((order) => ({
    id: order.id,
    number: order.number || String(order.id),
    status: order.status || "",
    dateCreated: order.date_created || "",
    total: resolvePaidTotal(order),
    currency:
      sanitizeText(getMetaValue(order.meta_data, "_artace_paid_currency")) ||
      order.currency ||
      "INR",
    paymentMethodTitle: order.payment_method_title || "",
    customerName: `${order.billing?.first_name || ""} ${
      order.billing?.last_name || ""
    }`.trim(),
    customerEmail: order.billing?.email || "",
    customerPhone: order.billing?.phone || "",
    items: (order.line_items || []).map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      total: item.total,
    })),
  }));
};
