import { NextRequest, NextResponse } from "next/server";
import {
  createWooCommerceOrder,
  getWooCommercePaymentConfig,
  mergeWooMetaData,
  parseAmountToMinorUnits,
  sanitizeText,
  updateWooCommerceOrder,
} from "@/utils/woocommerce-checkout";
import { createRazorpayOrder, getRazorpayPublicConfig } from "@/utils/razorpay";
import { GIFT_CARD_PRODUCT_ID, DENOMINATIONS } from "@/lib/gift-cards/constants";

export const runtime = "edge";

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

type GiftCardPurchaseRequestBody = {
  amount?: unknown;
  purchaserName?: unknown;
  purchaserEmail?: unknown;
};

export async function POST(request: NextRequest) {
  let body: GiftCardPurchaseRequestBody;

  try {
    body = (await request.json()) as GiftCardPurchaseRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const amount = Number(body.amount);
  const purchaserName = sanitizeText(body.purchaserName);
  const purchaserEmail = sanitizeText(body.purchaserEmail);

  if (!(DENOMINATIONS as readonly number[]).includes(amount)) {
    return NextResponse.json({ error: "Please choose one of the available gift card amounts." }, { status: 400 });
  }
  if (!purchaserName) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!purchaserEmail || !isValidEmail(purchaserEmail)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const parts = purchaserName.split(/\s+/);
  const firstName = parts[0] || purchaserName;
  const lastName = parts.slice(1).join(" ");

  const { paymentMethod, paymentMethodTitle } = getWooCommercePaymentConfig();

  try {
    const wooOrder = await createWooCommerceOrder({
      payment_method: paymentMethod,
      payment_method_title: paymentMethodTitle,
      set_paid: false,
      billing: { first_name: firstName, last_name: lastName, email: purchaserEmail, phone: "" },
      line_items: [
        {
          product_id: GIFT_CARD_PRODUCT_ID,
          quantity: 1,
          subtotal: amount.toFixed(2),
          total: amount.toFixed(2),
        },
      ],
      customer_note: `Artace Gift Card purchase — ₹${amount}`,
    });

    if (!wooOrder.orderId || !wooOrder.orderKey) {
      throw new Error("WooCommerce did not return a valid order identifier.");
    }

    const minorAmount = parseAmountToMinorUnits(wooOrder.total);
    if (!minorAmount) {
      throw new Error("WooCommerce returned an invalid order total for payment.");
    }

    const razorpayOrder = await createRazorpayOrder({
      amount: minorAmount,
      currency: wooOrder.currency || "INR",
      receipt: `giftcard_${wooOrder.orderId}`,
      notes: {
        woo_order_id: String(wooOrder.orderId),
        woo_order_key: wooOrder.orderKey,
        woo_order_number: wooOrder.orderNumber,
      },
    });

    const updatedWooOrder = await updateWooCommerceOrder(wooOrder.orderId, {
      meta_data: mergeWooMetaData(wooOrder.metaData, {
        _artace_razorpay_order_id: razorpayOrder.id,
        _artace_checkout_origin: request.nextUrl.origin,
      }),
    });

    const { keyId } = getRazorpayPublicConfig();

    return NextResponse.json({
      success: true,
      orderId: updatedWooOrder.orderId,
      orderKey: updatedWooOrder.orderKey,
      orderNumber: updatedWooOrder.orderNumber,
      razorpay: {
        keyId,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Artace Gift Card",
        description: `Gift Card — ₹${amount}`,
        prefill: { name: purchaserName, email: purchaserEmail, contact: "" },
        notes: razorpayOrder.notes,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start your gift card purchase." },
      { status: 502 }
    );
  }
}
