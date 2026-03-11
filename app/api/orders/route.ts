import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { fetchWooCommerceOrdersForToken } from "@/utils/woocommerce-orders";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const accessToken = typeof token?.accessToken === "string" ? token.accessToken : "";

  if (!accessToken) {
    return NextResponse.json({ error: "Please login first." }, { status: 401 });
  }

  try {
    const orders = await fetchWooCommerceOrdersForToken(accessToken);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch customer orders.";
    const status = message === "Invalid session." ? 401 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
