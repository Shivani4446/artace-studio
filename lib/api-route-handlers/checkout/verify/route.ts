import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayPaymentSignature } from "@/utils/razorpay";
import {
  ensurePositiveInt,
  getWooCommerceOrder,
  mapWooOrderStatusToPaymentState,
  sanitizeText,
} from "@/utils/woocommerce-checkout";
import { finalizeOrderAfterPayment } from "@/lib/checkout/finalize-order";

export const runtime = "edge";

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
    const isValidSignature = await verifyRazorpayPaymentSignature({
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

    // Artace Rewards crediting/debiting, gift card redemption/generation, and
    // marking the order paid must only run the first time this order is
    // finalized — never on a retried verify call for an already-paid order.
    const isFirstTimeFinalization = !(
      paymentState === "success" && wooOrder.transactionId === razorpayPaymentId
    );

    let finalizedOrder = wooOrder;
    let generatedGiftCardCode: string | undefined;

    if (isFirstTimeFinalization) {
      const result = await finalizeOrderAfterPayment({
        orderId,
        wooOrder,
        transactionId: razorpayPaymentId,
        gatewayMeta: {
          _artace_razorpay_order_id: razorpayOrderId,
          _artace_razorpay_payment_id: razorpayPaymentId,
          _artace_razorpay_signature: razorpaySignature,
        },
      });
      finalizedOrder = result.finalizedOrder;
      generatedGiftCardCode = result.generatedGiftCardCode;
    }

    return NextResponse.json({
      success: true,
      orderId: finalizedOrder.orderId,
      orderKey: finalizedOrder.orderKey,
      orderNumber: finalizedOrder.orderNumber,
      status: finalizedOrder.status,
      total: finalizedOrder.total,
      currency: finalizedOrder.currency,
      paymentState: mapWooOrderStatusToPaymentState(finalizedOrder.status),
      ...(generatedGiftCardCode ? { giftCardCode: generatedGiftCardCode } : {}),
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
