import {
  mergeWooMetaData,
  parseAmountToMinorUnits,
  updateWooCommerceOrder,
  type WooOrderSummary,
} from "@/utils/woocommerce-checkout";
import { creditPoints, debitPoints, calculatePointsEarned } from "@/lib/rewards/ledger";
import { CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID } from "@/lib/custom-portraits/pricing";
import { createGiftCard, redeemGiftCard } from "@/lib/gift-cards/ledger";
import { sendGiftCardEmail } from "@/lib/gift-cards/email";
import { GIFT_CARD_PRODUCT_ID } from "@/lib/gift-cards/constants";

/**
 * Marks a WooCommerce order paid and runs every gateway-agnostic
 * post-payment side effect (Artace Rewards crediting/debiting, gift card
 * redemption/generation). Extracted from the Razorpay verify route so the
 * new PayU callback route (and any future gateway) shares this logic
 * instead of duplicating it — see
 * docs/superpowers/plans/2026-09-09-payu-gateway.md, Task 2.
 *
 * Callers are responsible for their own idempotency check (only calling
 * this once per real payment event) — this function always runs its full
 * side-effect set unconditionally.
 */
export const finalizeOrderAfterPayment = async (input: {
  orderId: number;
  wooOrder: WooOrderSummary;
  transactionId: string;
  gatewayMeta: Record<string, string>;
}): Promise<{ finalizedOrder: WooOrderSummary; generatedGiftCardCode?: string }> => {
  const { orderId, wooOrder, transactionId, gatewayMeta } = input;

  const paidMinor = parseAmountToMinorUnits(wooOrder.total);
  const paidCurrency = wooOrder.currency || "INR";

  const finalizedOrder = await updateWooCommerceOrder(orderId, {
    set_paid: true,
    status: "processing",
    transaction_id: transactionId,
    meta_data: mergeWooMetaData(wooOrder.metaData, {
      ...gatewayMeta,
      _artace_payment_state: "success",
      // Persist the amount charged at checkout so dashboards show what the user actually paid,
      // even if order totals are edited later in Woo admin.
      ...(wooOrder.total ? { _artace_paid_total: wooOrder.total } : {}),
      ...(paidMinor ? { _artace_paid_amount_minor: String(paidMinor) } : {}),
      ...(paidCurrency ? { _artace_paid_currency: paidCurrency } : {}),
    }),
  });

  let generatedGiftCardCode: string | undefined;

  // Custom Portraits deposits reuse this exact endpoint but are out of
  // scope for Artace Rewards (see suggestion.md Section 3) — exclude them
  // positively rather than assuming this endpoint never sees one.
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

  return { finalizedOrder, generatedGiftCardCode };
};
