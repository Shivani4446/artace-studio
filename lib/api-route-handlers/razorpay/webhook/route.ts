import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/utils/razorpay";
import {
  ensurePositiveInt,
  getWooCommerceOrder,
  mergeWooMetaData,
  sanitizeText,
  updateWooCommerceOrder,
} from "@/utils/woocommerce-checkout";

export const runtime = "edge";

type RazorpayEntityWithNotes = {
  id?: unknown;
  amount?: unknown;
  currency?: unknown;
  notes?: Record<string, unknown>;
  order_id?: unknown;
  payment_id?: unknown;
  status?: unknown;
  error_description?: unknown;
};

type RazorpayWebhookPayload = {
  event?: unknown;
  payload?: {
    payment?: { entity?: RazorpayEntityWithNotes };
    order?: { entity?: RazorpayEntityWithNotes };
  };
};

const readNotes = (payload: RazorpayWebhookPayload) => {
  const paymentNotes = payload.payload?.payment?.entity?.notes || {};
  const orderNotes = payload.payload?.order?.entity?.notes || {};

  return {
    wooOrderId:
      sanitizeText(paymentNotes.woo_order_id) || sanitizeText(orderNotes.woo_order_id),
    wooOrderKey:
      sanitizeText(paymentNotes.woo_order_key) || sanitizeText(orderNotes.woo_order_key),
  };
};

const parseMinorUnitsToMajor = (amountMinor: unknown) => {
  const parsed = Number(amountMinor);
  if (!Number.isFinite(parsed) || parsed <= 0) return "";
  // Razorpay INR amounts are in minor units (paise).
  return (parsed / 100).toFixed(2);
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = sanitizeText(request.headers.get("x-razorpay-signature"));

  if (!signature) {
    return NextResponse.json({ error: "Missing Razorpay webhook signature." }, { status: 400 });
  }

  try {
    const isValidSignature = await verifyRazorpayWebhookSignature({
      body: rawBody,
      signature,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid Razorpay webhook signature." }, { status: 400 });
    }

    const payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
    const event = sanitizeText(payload.event);
    const notes = readNotes(payload);
    const orderId = ensurePositiveInt(notes.wooOrderId);
    const orderKey = sanitizeText(notes.wooOrderKey);

    if (!orderId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const wooOrder = await getWooCommerceOrder(orderId);

    if (orderKey && wooOrder.orderKey !== orderKey) {
      return NextResponse.json({ error: "Webhook order verification failed." }, { status: 400 });
    }

    const paymentEntity = payload.payload?.payment?.entity;
    const razorpayOrderId =
      sanitizeText(paymentEntity?.order_id) ||
      sanitizeText(payload.payload?.order?.entity?.id) ||
      sanitizeText(paymentEntity?.id);
    const razorpayPaymentId =
      sanitizeText(paymentEntity?.id) || sanitizeText(paymentEntity?.payment_id);
    const paidMinor = sanitizeText(paymentEntity?.amount);
    const paidCurrency = sanitizeText(paymentEntity?.currency) || "INR";
    const paidTotal = parseMinorUnitsToMajor(paymentEntity?.amount);

    if (event === "payment.captured" || event === "order.paid") {
      await updateWooCommerceOrder(orderId, {
        set_paid: true,
        status: "processing",
        ...(razorpayPaymentId ? { transaction_id: razorpayPaymentId } : {}),
        meta_data: mergeWooMetaData(wooOrder.metaData, {
          ...(razorpayOrderId ? { _artace_razorpay_order_id: razorpayOrderId } : {}),
          ...(razorpayPaymentId ? { _artace_razorpay_payment_id: razorpayPaymentId } : {}),
          _artace_payment_state: "success",
          ...(paidTotal ? { _artace_paid_total: paidTotal } : {}),
          ...(paidMinor ? { _artace_paid_amount_minor: paidMinor } : {}),
          ...(paidCurrency ? { _artace_paid_currency: paidCurrency } : {}),
        }),
      });
    }

    if (event === "payment.failed") {
      await updateWooCommerceOrder(orderId, {
        status: "failed",
        meta_data: mergeWooMetaData(wooOrder.metaData, {
          ...(razorpayOrderId ? { _artace_razorpay_order_id: razorpayOrderId } : {}),
          ...(razorpayPaymentId ? { _artace_razorpay_payment_id: razorpayPaymentId } : {}),
          _artace_payment_state: "failed",
          _artace_payment_error:
            sanitizeText(paymentEntity?.error_description) || "Payment failed at Razorpay.",
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to process the Razorpay webhook.",
      },
      { status: 500 }
    );
  }
}
