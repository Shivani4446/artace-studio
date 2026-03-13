"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { clearPendingCheckout } from "@/utils/checkout-client";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { useCart } from "@/components/cart/CartProvider";

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
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
    }).format(amount);
  } catch {
    return `${currency || "INR"} ${amount.toFixed(2)}`;
  }
};

function CheckoutSuccessInner() {
  const searchParams = useSearchParams();
  const { status: authStatus } = useAuthSession();
  const { clearCart } = useCart();
  const [statusPayload, setStatusPayload] = useState<CheckoutStatusPayload | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const orderId = searchParams.get("orderId") || "";
  const orderKey = searchParams.get("orderKey") || "";

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
        {
          cache: "no-store",
        }
      );

      const payload = (await response.json()) as CheckoutStatusPayload;

      if (!isActive) {
        return;
      }

      if (!response.ok || !payload.success) {
        setError(payload.error || "We could not load your latest payment status.");
        setIsLoading(false);
        return;
      }

      setStatusPayload(payload);
      setIsLoading(false);

      if (payload.paymentState === "success") {
        clearCart();
        clearPendingCheckout();
        return;
      }

      if (payload.paymentState === "pending") {
        window.setTimeout(() => {
          if (isActive) {
            void loadStatus();
          }
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
        description:
          "We are confirming the latest status with WooCommerce and Razorpay.",
        tone: "neutral" as const,
      };
    }

    if (error) {
      return {
        title: "We could not confirm this payment yet",
        description: error,
        tone: "error" as const,
      };
    }

    if (statusPayload?.paymentState === "success") {
      return {
        title: "Order confirmed",
        description:
          "Your payment was verified successfully and your WooCommerce order is now confirmed.",
        tone: "success" as const,
      };
    }

    if (statusPayload?.paymentState === "failed") {
      return {
        title: "Payment was not completed",
        description:
          "Your order exists, but the payment did not go through. You can return to the cart and try again.",
        tone: "error" as const,
      };
    }

    return {
      title: "Payment pending",
      description:
        "Your order was created, and we are still waiting for the final Razorpay confirmation.",
      tone: "neutral" as const,
    };
  }, [error, isLoading, statusPayload]);

  const panelClasses =
    content.tone === "success"
      ? "bg-[#eef7f0] text-[#116329]"
      : content.tone === "error"
        ? "bg-[#f8ece8] text-[#a63b2d]"
        : "bg-[#f5f1e8] text-[#665f57]";

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 md:px-12 md:py-16">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <section className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_22px_60px_rgba(0,0,0,0.06)] sm:p-8 md:p-10">
          <h1 className="font-display text-4xl text-[#222] md:text-5xl">
            {content.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#555] md:text-lg">
            {content.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {statusPayload?.paymentState === "success" ? (
              <>
                <Link
                  href="/shop"
                  className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#1f1f1f] px-6 py-3 text-sm font-medium uppercase tracking-[0.05em] text-white transition-colors hover:bg-black"
                >
                  Continue Shopping
                </Link>
                <Link
                  href={
                    authStatus === "authenticated"
                      ? "/dashboard/orders"
                      : `/login?callbackUrl=${encodeURIComponent("/dashboard/orders")}`
                  }
                  className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-black/10 px-6 py-3 text-sm font-medium text-[#1f1f1f] transition-colors hover:bg-[#f5f0e8]"
                >
                  {authStatus === "authenticated" ? "View Orders" : "Log In to View Orders"}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/cart"
                  className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#1f1f1f] px-6 py-3 text-sm font-medium uppercase tracking-[0.05em] text-white transition-colors hover:bg-black"
                >
                  Return to Cart
                </Link>
                <Link
                  href="/contact-us"
                  className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-black/10 px-6 py-3 text-sm font-medium text-[#1f1f1f] transition-colors hover:bg-[#f5f0e8]"
                >
                  Contact Support
                </Link>
              </>
            )}
          </div>

          {statusPayload?.paymentState === "pending" && (
            <p className="mt-8 text-sm leading-6 text-[#666]">
              We will keep checking for confirmation. If you were charged but this page still
              shows pending after a few minutes, contact support with your order number.
            </p>
          )}
        </section>

        <aside className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_22px_60px_rgba(0,0,0,0.06)] sm:p-7 md:p-8">
          <div className={`rounded-[20px] px-5 py-5 ${panelClasses}`}>
            <p className="text-base font-medium">
              {statusPayload?.status
                ? statusPayload.status.replace(/-/g, " ")
                : isLoading
                  ? "Loading"
                  : "Unavailable"}
            </p>
            <p className="mt-2 text-sm leading-6 opacity-90">
              {statusPayload?.paymentState === "success"
                ? "Payment verified"
                : statusPayload?.paymentState === "failed"
                  ? "Payment failed"
                  : "Awaiting confirmation"}
            </p>
          </div>

          {statusPayload && (
            <div className="mt-6 rounded-[20px] border border-black/8 bg-[#faf8f4] p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <p className="text-sm text-[#7a7368]">Order</p>
                  <p className="mt-1 text-lg font-medium text-[#1f1f1f]">
                    #{statusPayload.orderNumber || statusPayload.orderId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#7a7368]">Total</p>
                  <p className="mt-1 text-lg font-medium text-[#1f1f1f]">
                    {formatCurrency(statusPayload.total || "", statusPayload.currency || "INR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#7a7368]">Gateway</p>
                  <p className="mt-1 text-lg font-medium text-[#1f1f1f]">
                    {statusPayload.paymentMethodTitle || "Razorpay"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#7a7368]">Next step</p>
                  <p className="mt-1 text-lg font-medium text-[#1f1f1f]">
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

export default function CheckoutSuccessPage() {
  // `useSearchParams()` triggers a CSR bailout; wrapping in Suspense allows static
  // rendering to complete with a fallback while hydration reads the query string.
  return (
    <Suspense
      fallback={
        <main className="min-h-[100svh] bg-[#fcfaf7] px-4 py-6 sm:px-6 sm:py-8 lg:px-[50px]">
          <section className="mx-auto w-full max-w-[1100px] rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_22px_60px_rgba(0,0,0,0.06)] md:p-10">
            <h1 className="font-display text-[34px] leading-[1.05] text-[#1f1f1f] md:text-[44px]">
              Checking your payment
            </h1>
            <p className="mt-4 text-[16px] leading-[1.75] text-[#5b5b5b] md:text-[18px]">
              Loading your order status…
            </p>
          </section>
        </main>
      }
    >
      <CheckoutSuccessInner />
    </Suspense>
  );
}
