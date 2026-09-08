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
import { creditPoints, debitPoints, calculatePointsEarned } from "@/lib/rewards/ledger";
import { CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID } from "@/lib/custom-portraits/pricing";
import { createGiftCard, redeemGiftCard } from "@/lib/gift-cards/ledger";
import { sendGiftCardEmail } from "@/lib/gift-cards/email";
import { GIFT_CARD_PRODUCT_ID } from "@/lib/gift-cards/constants";

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
    const paidMinor = parseAmountToMinorUnits(wooOrder.total);
    const paidCurrency = sanitizeText(wooOrder.currency) || "INR";
    let generatedGiftCardCode: string | undefined;

    // Artace Rewards crediting/debiting must only run the first time this
    // order is finalized — never on a retried verify call for an
    // already-paid order (that's exactly what this branch already
    // distinguishes: the `wooOrder` branch means a prior call already
    // finalized it).
    const isFirstTimeFinalization = !(
      paymentState === "success" && wooOrder.transactionId === razorpayPaymentId
    );

    const finalizedOrder = isFirstTimeFinalization
      ? await updateWooCommerceOrder(orderId, {
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
        })
      : wooOrder;

    if (isFirstTimeFinalization) {
      // Custom Portraits deposits reuse this exact endpoint but are out of
      // scope for Artace Rewards (see suggestion.md Section 3, and the
      // spec's Context section) — exclude them positively rather than
      // assuming this endpoint never sees one.
      const isCustomPortraitOrder = wooOrder.lineItems.some(
        (item) => item.productId === CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID
      );

      if (!isCustomPortraitOrder && wooOrder.customerId > 0) {
        try {
          const pointsEarned = calculatePointsEarned(Number(wooOrder.total));
          if (pointsEarned > 0) {
            await creditPoints({
              wpCustomerId: String(wooOrder.customerId),
              wcOrderId: orderId,
              points: pointsEarned,
              description: `Order #${wooOrder.orderNumber}`,
            });
          }

          const pointsToRedeem = Number(
            wooOrder.metaData.find((item) => item.key === "_artace_points_to_redeem")?.value || 0
          );
          if (pointsToRedeem > 0) {
            await debitPoints({
              wpCustomerId: String(wooOrder.customerId),
              wcOrderId: orderId,
              points: pointsToRedeem,
              description: `Redeemed on Order #${wooOrder.orderNumber}`,
            });
          }
        } catch {
          // Never let a rewards-ledger failure affect the checkout response —
          // the payment itself already succeeded by the time this runs (same
          // defensive posture as recordAffiliateConversion in the checkout route).
        }
      }

      // A gift card can be redeemed on any order regardless of whether the
      // same order also earns/redeems Artace Rewards points — these are
      // independent discounts, so this isn't nested inside the block above.
      const redeemedGiftCardCode = wooOrder.metaData.find((item) => item.key === "_artace_gift_card_code")?.value;
      const redeemedGiftCardAmount = Number(
        wooOrder.metaData.find((item) => item.key === "_artace_gift_card_amount")?.value || 0
      );
      if (redeemedGiftCardCode && redeemedGiftCardAmount > 0) {
        try {
          await redeemGiftCard({ code: redeemedGiftCardCode, wcOrderId: orderId, amount: redeemedGiftCardAmount });
        } catch {
          // Never let a redemption failure affect the checkout response.
        }
      }

      const isGiftCardOrder = wooOrder.lineItems.some((item) => item.productId === GIFT_CARD_PRODUCT_ID);

      if (isGiftCardOrder) {
        try {
          const { code } = await createGiftCard({
            amount: Number(wooOrder.total),
            purchaserEmail: wooOrder.billingEmail,
            wcOrderId: orderId,
          });
          generatedGiftCardCode = code;
          await sendGiftCardEmail({ to: wooOrder.billingEmail, code, amount: Number(wooOrder.total) });
        } catch {
          // Never let gift-card generation/email failure affect the checkout response.
        }
      }
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
