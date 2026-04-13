import { NextRequest, NextResponse } from "next/server";
import {
  ensurePositiveInt,
  getWooCommerceOrder,
  mapWooOrderStatusToPaymentState,
  sanitizeText,
} from "@/utils/woocommerce-checkout";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const orderId = ensurePositiveInt(request.nextUrl.searchParams.get("orderId"));
  const orderKey = sanitizeText(request.nextUrl.searchParams.get("orderKey"));

  if (!orderId || !orderKey) {
    return NextResponse.json(
      { error: "Order reference is missing from the payment return flow." },
      { status: 400 }
    );
  }

  try {
    const order = await getWooCommerceOrder(orderId);

    if (order.orderKey !== orderKey) {
      return NextResponse.json({ error: "Order verification failed." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      orderKey: order.orderKey,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      currency: order.currency,
      paymentMethodTitle: order.paymentMethodTitle,
      paymentState: mapWooOrderStatusToPaymentState(order.status),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load the latest payment status.",
      },
      { status: 502 }
    );
  }
}
