import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayPaymentSignature } from "@/utils/razorpay";
import {
  ensurePositiveInt,
  getWooCommerceOrder,
  mapWooOrderStatusToPaymentState,
  mergeWooMetaData,
  parseAmountToMinorUnits,
  sanitizeText,
  updateWooCommerceOrder,
} from "@/utils/woocommerce-checkout";

export const runtime = "nodejs";

type VerifyCheckoutRequestBody = {
  orderId: number;
  orderKey: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export async function POST(request: NextRequest) {
  let body: VerifyCheckoutRequestBody;

  try {
    body = (await request.json()) as VerifyCheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const orderId = ensurePositiveInt(body.orderId);
  const orderKey = sanitizeText(body.orderKey);
  const razorpayOrderId = sanitizeText(body.razorpayOrderId);
  const razorpayPaymentId = sanitizeText(body.razorpayPaymentId);
  const razorpaySignature = sanitizeText(body.razorpaySignature);

  if (!orderId || !orderKey || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json(
      { error: "Missing payment verification details." },
      { status: 400 }
    );
  }

  try {
    const isValidSignature = verifyRazorpayPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Razorpay signature verification failed." }, { status: 400 });
    }

    const wooOrder = await getWooCommerceOrder(orderId);

    if (wooOrder.orderKey !== orderKey) {
      return NextResponse.json({ error: "Order verification failed." }, { status: 400 });
    }

    const storedRazorpayOrderId =
      wooOrder.metaData.find((item) => item.key === "_artace_razorpay_order_id")?.value || "";

    if (storedRazorpayOrderId && storedRazorpayOrderId !== razorpayOrderId) {
      return NextResponse.json(
        { error: "This payment does not match the pending checkout order." },
        { status: 400 }
      );
    }

    const paymentState = mapWooOrderStatusToPaymentState(wooOrder.status);
    const paidMinor = parseAmountToMinorUnits(wooOrder.total);
    const paidCurrency = sanitizeText(wooOrder.currency) || "INR";

    const finalizedOrder =
      paymentState === "success" && wooOrder.transactionId === razorpayPaymentId
        ? wooOrder
        : await updateWooCommerceOrder(orderId, {
            set_paid: true,
            status: "processing",
            transaction_id: razorpayPaymentId,
            meta_data: mergeWooMetaData(wooOrder.metaData, {
              _artace_razorpay_order_id: razorpayOrderId,
              _artace_razorpay_payment_id: razorpayPaymentId,
              _artace_razorpay_signature: razorpaySignature,
              _artace_payment_state: "success",
              // Persist the amount charged at checkout so dashboards show what the user actually paid,
              // even if order totals are edited later in Woo admin.
              ...(wooOrder.total ? { _artace_paid_total: wooOrder.total } : {}),
              ...(paidMinor ? { _artace_paid_amount_minor: String(paidMinor) } : {}),
              ...(paidCurrency ? { _artace_paid_currency: paidCurrency } : {}),
            }),
          });

    return NextResponse.json({
      success: true,
      orderId: finalizedOrder.orderId,
      orderKey: finalizedOrder.orderKey,
      orderNumber: finalizedOrder.orderNumber,
      status: finalizedOrder.status,
      total: finalizedOrder.total,
      currency: finalizedOrder.currency,
      paymentState: mapWooOrderStatusToPaymentState(finalizedOrder.status),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to verify the payment right now.",
      },
      { status: 502 }
    );
  }
}
