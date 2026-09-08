import { NextRequest, NextResponse } from "next/server";
import { verifyWooCommerceWebhookSignature } from "@/utils/woocommerce-webhook";
import { ensurePositiveInt, sanitizeText } from "@/utils/woocommerce-checkout";
import { clawbackPointsForOrder } from "@/lib/rewards/ledger";

export const runtime = "edge";

type WooOrderWebhookPayload = {
  id?: unknown;
  status?: unknown;
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = sanitizeText(request.headers.get("x-wc-webhook-signature"));

  if (!signature) {
    return NextResponse.json({ error: "Missing WooCommerce webhook signature." }, { status: 400 });
  }

  try {
    const isValidSignature = await verifyWooCommerceWebhookSignature({ body: rawBody, signature });
    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid WooCommerce webhook signature." }, { status: 400 });
    }

    const payload = JSON.parse(rawBody) as WooOrderWebhookPayload;
    const orderId = ensurePositiveInt(payload.id);
    const status = sanitizeText(payload.status).toLowerCase();

    if (!orderId || (status !== "refunded" && status !== "cancelled")) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    await clawbackPointsForOrder(orderId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to process the WooCommerce webhook." },
      { status: 500 }
    );
  }
}
