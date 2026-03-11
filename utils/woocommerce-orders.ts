import {
  getWordPressSiteUrl,
  getWordPressUserFromToken,
} from "@/utils/wordpress-auth";

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
    siteUrl: getWordPressSiteUrl(),
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

  const customer = await getWordPressUserFromToken(customerToken);
  if (!customer || !customer.id) {
    throw new Error("Invalid session.");
  }

  if (!consumerKey || !consumerSecret) {
    throw new Error(
      "WooCommerce API credentials are missing. Set WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET."
    );
  }

  const basicToken = toBasicAuthToken(consumerKey, consumerSecret);

  const response = await fetch(
    `${siteUrl}/wp-json/wc/v3/orders?per_page=50&orderby=date&order=desc&customer=${customer.id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${basicToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const rawText = await response.text();
  let parsed: WooOrder[] | { message?: string } = [];
  try {
    parsed = rawText ? (JSON.parse(rawText) as WooOrder[] | { message?: string }) : [];
  } catch {
    parsed = [];
  }

  if (!response.ok) {
    const apiMessage =
      !Array.isArray(parsed) && typeof parsed.message === "string"
        ? parsed.message
        : `Failed to fetch orders (${response.status}).`;
    throw new Error(apiMessage);
  }

  return (Array.isArray(parsed) ? parsed : []).map((order) => ({
    id: order.id,
    number: order.number || String(order.id),
    status: order.status || "",
    dateCreated: order.date_created || "",
    total: order.total || "",
    currency: order.currency || "INR",
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
