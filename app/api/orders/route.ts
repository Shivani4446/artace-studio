import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getWordPressSiteUrl, getWordPressUserFromToken } from "@/utils/wordpress-auth";

export const runtime = "edge";

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

const getWooCommerceConfig = () => {
  return {
    siteUrl: getWordPressSiteUrl(),
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  };
};

const toBasicAuthToken = (username: string, password: string) => {
  const raw = `${username}:${password}`;
  if (typeof btoa === "function") return btoa(raw);

  const maybeBuffer = (globalThis as { Buffer?: { from: (v: string) => { toString: (enc: string) => string } } }).Buffer;
  if (maybeBuffer) return maybeBuffer.from(raw).toString("base64");

  throw new Error("No base64 encoder available.");
};

export async function GET() {
  const { siteUrl, consumerKey, consumerSecret } = getWooCommerceConfig();
  const cookieStore = await cookies();
  const token = cookieStore.get("wp_jwt")?.value || "";

  if (!token) {
    return NextResponse.json({ error: "Please login first." }, { status: 401 });
  }

  const customer = await getWordPressUserFromToken(token);
  if (!customer || !customer.id) {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }

  if (!consumerKey || !consumerSecret) {
    return NextResponse.json(
      {
        error:
          "WooCommerce API credentials are missing. Set WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET.",
      },
      { status: 500 }
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
    return NextResponse.json({ error: apiMessage }, { status: 502 });
  }

  const orders = (Array.isArray(parsed) ? parsed : []).map((order) => ({
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

  return NextResponse.json({ success: true, orders });
}
