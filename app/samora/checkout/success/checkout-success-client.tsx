"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { clearPendingCheckout } from "@/utils/checkout-client";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { useCart } from "@/components/cart/CartProvider";
import { trackPurchase } from "@/utils/gtm";

type CheckoutStatusPayload = {
  success?: boolean;
  error?: string;
  orderId?: number;
  orderKey?: string;
  orderNumber?: string;
  status?: string;
  total?: string;
  currency?: string;
  paymentMethodTitle?: string;
  paymentState?: "success" | "pending" | "failed";
};

const formatCurrency = (total: string, currency: string) => {
  const amount = Number(total);
  if (!Number.isFinite(amount)) return total || "Amount unavailable";

  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR" }).format(amount);
  } catch {
    return `${currency || "INR"} ${amount.toFixed(2)}`;
  }
};

function SamoraCheckoutSuccessPageClient() {
  const searchParams = useSearchParams();
  const { status: authStatus } = useAuthSession();
  const { clearCart, items } = useCart();
  const [statusPayload, setStatusPayload] = useState<CheckoutStatusPayload | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const purchaseItemsRef = useRef(items);

  const orderId = searchParams.get("orderId") || "";
  const orderKey = searchParams.get("orderKey") || "";

  useEffect(() => {
    if (items.length > 0) {
      purchaseItemsRef.current = items;
    }
  }, [items]);

  useEffect(() => {
    let isActive = true;

    const loadStatus = async () => {
      if (!orderId || !orderKey) {
        if (!isActive) return;
        setError("We could not find your checkout reference. Please contact support if you were charged.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `/api/checkout/status?orderId=${encodeURIComponent(orderId)}&orderKey=${encodeURIComponent(orderKey)}`,
        { cache: "no-store" }
      );

      const payload = (await response.json()) as CheckoutStatusPayload;
      if (!isActive) return;

      if (!response.ok || !payload.success) {
        setError(payload.error || "We could not load your latest payment status.");
        setIsLoading(false);
        return;
      }

      setStatusPayload(payload);
      setIsLoading(false);

      if (payload.paymentState === "success") {
        trackPurchase({
          orderId: payload.orderId ?? orderId,
          orderNumber: payload.orderNumber,
          total: payload.total,
          currency: payload.currency || "INR",
          paymentMethod: payload.paymentMethodTitle,
          dedupeKey: `purchase:${payload.orderId ?? orderId}`,
          items: purchaseItemsRef.current,
        });
        clearCart();
        clearPendingCheckout();
        return;
      }

      if (payload.paymentState === "pending") {
        window.setTimeout(() => {
          if (isActive) void loadStatus();
        }, 3500);
      }
    };

    void loadStatus();

    return () => {
      isActive = false;
    };
  }, [clearCart, orderId, orderKey]);

  const content = useMemo(() => {
    if (isLoading) {
      return {
        title: "Checking your payment",
        description: "We are confirming the latest status with WooCommerce and Razorpay.",
        tone: "neutral" as const,
      };
    }

    if (error) {
      return { title: "We could not confirm this payment yet", description: error, tone: "error" as const };
    }

    if (statusPayload?.paymentState === "success") {
      return {
        title: "Order confirmed",
        description: "Your payment was verified successfully and your order is now confirmed.",
        tone: "success" as const,
      };
    }

    if (statusPayload?.paymentState === "failed") {
      return {
        title: "Payment was not completed",
        description: "Your order exists, but the payment did not go through. You can return to the cart and try again.",
        tone: "error" as const,
      };
    }

    return {
      title: "Payment pending",
      description: "Your order was created, and we are still waiting for the final Razorpay confirmation.",
      tone: "neutral" as const,
    };
  }, [error, isLoading, statusPayload]);

  const panelClasses =
    content.tone === "success"
      ? "bg-[#eef7f0] text-[#116329]"
      : content.tone === "error"
        ? "bg-[#f8ece8] text-[#a63b2d]"
        : "bg-[#f3ead9] text-[#5c5344]";

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-10 md:py-16">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <section className="rounded-[24px] border border-[#2b2420]/10 bg-[#fbf6ef] p-6 sm:p-8 md:p-10">
          <h1 className="font-samora-display text-[32px] text-[#2b2420] md:text-[42px]">
            {content.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-[1.7] text-[#5c5344] md:text-[17px]">
            {content.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {statusPayload?.paymentState === "success" ? (
              <>
                <Link
                  href="/samora/shop"
                  className="inline-flex items-center justify-center rounded-full bg-[#c1683d] px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#a8552f]"
                >
                  Continue Shopping
                </Link>
                <Link
                  href={
                    authStatus === "authenticated"
                      ? "/dashboard/orders"
                      : `/login?callbackUrl=${encodeURIComponent("/dashboard/orders")}`
                  }
                  className="inline-flex items-center justify-center rounded-full border border-[#2b2420]/15 px-6 py-3 text-[14px] font-medium text-[#2b2420] transition-colors hover:bg-[#f3ead9]"
                >
                  {authStatus === "authenticated" ? "View Orders" : "Log In to View Orders"}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/samora/cart"
                  className="inline-flex items-center justify-center rounded-full bg-[#c1683d] px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#a8552f]"
                >
                  Return to Cart
                </Link>
                <Link
                  href="/samora#faq"
                  className="inline-flex items-center justify-center rounded-full border border-[#2b2420]/15 px-6 py-3 text-[14px] font-medium text-[#2b2420] transition-colors hover:bg-[#f3ead9]"
                >
                  Contact Support
                </Link>
              </>
            )}
          </div>

          {statusPayload?.paymentState === "pending" && (
            <p className="mt-8 text-[13.5px] leading-[1.6] text-[#8a7c68]">
              We will keep checking for confirmation. If you were charged but this page still
              shows pending after a few minutes, contact support with your order number.
            </p>
          )}
        </section>

        <aside className="rounded-[24px] border border-[#2b2420]/10 bg-[#fbf6ef] p-6 sm:p-7 md:p-8">
          <div className={`rounded-[18px] px-5 py-5 ${panelClasses}`}>
            <p className="text-[15px] font-medium">
              {statusPayload?.status ? statusPayload.status.replace(/-/g, " ") : isLoading ? "Loading" : "Unavailable"}
            </p>
            <p className="mt-2 text-[13.5px] leading-[1.6] opacity-90">
              {statusPayload?.paymentState === "success"
                ? "Payment verified"
                : statusPayload?.paymentState === "failed"
                  ? "Payment failed"
                  : "Awaiting confirmation"}
            </p>
          </div>

          {statusPayload && (
            <div className="mt-6 rounded-[18px] border border-[#2b2420]/10 bg-[#f3ead9] p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <p className="text-[13px] text-[#8a7c68]">Order</p>
                  <p className="mt-1 text-[16px] font-medium text-[#2b2420]">
                    #{statusPayload.orderNumber || statusPayload.orderId}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] text-[#8a7c68]">Total</p>
                  <p className="mt-1 text-[16px] font-medium text-[#2b2420]">
                    {formatCurrency(statusPayload.total || "", statusPayload.currency || "INR")}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] text-[#8a7c68]">Gateway</p>
                  <p className="mt-1 text-[16px] font-medium text-[#2b2420]">
                    {statusPayload.paymentMethodTitle || "Razorpay"}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] text-[#8a7c68]">Next step</p>
                  <p className="mt-1 text-[16px] font-medium text-[#2b2420]">
                    {statusPayload.paymentState === "success"
                      ? "Order is confirmed"
                      : statusPayload.paymentState === "failed"
                        ? "Retry payment from cart"
                        : "Waiting for confirmation"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

export default SamoraCheckoutSuccessPageClient;
