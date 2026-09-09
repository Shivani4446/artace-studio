import { NextRequest, NextResponse } from "next/server";
import { getWooCommerceOrder } from "@/utils/woocommerce-checkout";
import { verifyPayuResponseHash } from "@/utils/payu";
import { finalizeOrderAfterPayment } from "@/lib/checkout/finalize-order";
import { buildSiteUrl } from "@/lib/site";

export const runtime = "edge";

const failureRedirect = () => NextResponse.redirect(buildSiteUrl("/checkout?payuError=1"));

/**
 * PayU redirects the customer's browser here (POST, not fetch) after they
 * complete or abandon payment on PayU's hosted page — surl and furl both
 * point at this same route (see utils/payu.ts and
 * lib/api-route-handlers/checkout/route.ts). Never returns JSON; always
 * redirects, since a real browser navigation is what lands here.
 */
export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return failureRedirect();
  }

  const status = String(formData.get("status") || "");
  const txnid = String(formData.get("txnid") || "");
  const hash = String(formData.get("hash") || "");
  const mihpayid = String(formData.get("mihpayid") || "");
  const email = String(formData.get("email") || "");
  const firstname = String(formData.get("firstname") || "");
  const productinfo = String(formData.get("productinfo") || "");
  const amount = String(formData.get("amount") || "");

  const orderIdMatch = txnid.match(/^woo_(\d+)$/);
  const orderId = orderIdMatch ? Number(orderIdMatch[1]) : 0;

  if (!orderId || !hash) {
    return failureRedirect();
  }

  try {
    const isValidHash = await verifyPayuResponseHash({ status, email, firstname, productinfo, amount, txnid, hash });
    if (!isValidHash) {
      return failureRedirect();
    }

    const wooOrder = await getWooCommerceOrder(orderId);
    const storedTxnid = wooOrder.metaData.find((item) => item.key === "_artace_payu_txnid")?.value || "";
    if (storedTxnid !== txnid) {
      return failureRedirect();
    }

    if (status !== "success") {
      return failureRedirect();
    }

    // Idempotency: PayU's docs note surl/furl can be hit more than once for
    // the same transaction — never re-run Loyalty/gift-card side effects on
    // a retried callback for an already-finalized order.
    const alreadyFinalized = wooOrder.metaData.some((item) => item.key === "_artace_payu_mihpayid");
    if (!alreadyFinalized) {
      await finalizeOrderAfterPayment({
        orderId,
        wooOrder,
        transactionId: mihpayid,
        gatewayMeta: { _artace_payu_mihpayid: mihpayid },
      });
    }

    return NextResponse.redirect(buildSiteUrl(`/checkout/success?orderId=${orderId}&orderKey=${wooOrder.orderKey}`));
  } catch {
    return failureRedirect();
  }
}
