import { NextRequest, NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/utils/auth";
import { fetchWooCommerceOrdersForToken } from "@/utils/woocommerce-orders";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const session = await getAuthSessionFromRequest(request);
  const accessToken = session?.accessToken || "";

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
