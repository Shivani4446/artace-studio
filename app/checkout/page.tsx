"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { useCart } from "@/components/cart/CartProvider";
import { writePendingCheckout } from "@/utils/checkout-client";
import { trackBeginCheckout } from "@/utils/gtm";

type CheckoutFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  customerNote: string;
};

type CheckoutStage = "idle" | "creating" | "paying" | "verifying";

type RazorpayCheckoutPayload = {
  success?: boolean;
  error?: string;
  orderId?: number;
  orderKey?: string;
  orderNumber?: string;
  total?: string;
  currency?: string;
  razorpay?: {
    keyId: string;
    orderId: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    notes?: Record<string, string>;
  };
};

type CouponValidationPayload = {
  ok?: boolean;
  message?: string;
  coupon?: {
    code: string;
    amount: string;
    discountType: string;
    description: string;
    freeShipping: boolean;
    minimumAmount: string;
    maximumAmount: string;
    expiresAt: string;
  };
};

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: RazorpayHandlerResponse) => void | Promise<void>;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const INITIAL_FORM: CheckoutFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postcode: "",
  country: "IN",
  customerNote: "",
};

const getCheckoutProductId = (
  id: number | string,
  woocommerceProductId?: number
) => {
  if (typeof woocommerceProductId === "number" && woocommerceProductId > 0) {
    return woocommerceProductId;
  }

  if (typeof id === "number" && id > 0) return id;
  const parsedFromPrefix = Number(String(id).split("-")[0]);
  return Number.isFinite(parsedFromPrefix) && parsedFromPrefix > 0
    ? parsedFromPrefix
    : null;
};

const getPayButtonLabel = (stage: CheckoutStage, isReady: boolean) => {
  if (!isReady) return "Loading Payment...";
  if (stage === "creating") return "Preparing Payment...";
  if (stage === "paying") return "Complete Payment in Razorpay";
  if (stage === "verifying") return "Verifying Payment...";
  return "Pay with Razorpay";
};

export default function CheckoutPage() {
  const router = useRouter();
  const { status: authStatus, session } = useAuthSession();
  const { items, itemCount, subtotal } = useCart();
  const [form, setForm] = useState<CheckoutFormState>(INITIAL_FORM);
  const [checkoutStage, setCheckoutStage] = useState<CheckoutStage>("idle");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationPayload["coupon"] | null>(null);

  const hasCheckoutReadyItems = useMemo(
    () => items.some((item) => getCheckoutProductId(item.id, item.woocommerceProductId)),
    [items]
  );
  const beginCheckoutTrackingKey = useMemo(
    () =>
      items
        .map((item) =>
          [
            item.id,
            item.woocommerceProductId ?? "",
            item.woocommerceVariationId ?? "",
            item.quantity,
          ].join(":")
        )
        .join("|"),
    [items]
  );

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent("/checkout")}`);
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (!hasCheckoutReadyItems || items.length === 0) return;

    trackBeginCheckout(items, {
      value: subtotal,
      dedupeKey: `begin_checkout:${beginCheckoutTrackingKey}`,
    });
  }, [beginCheckoutTrackingKey, hasCheckoutReadyItems, items, subtotal]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    setForm((current) => {
      if (current.email || !session?.user?.email) return current;
      return { ...current, email: session.user.email };
    });
  }, [authStatus, session?.user?.email]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Razorpay) {
      setIsRazorpayReady(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-razorpay-checkout="true"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => setIsRazorpayReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => setIsRazorpayReady(true);
    script.onerror = () =>
      setCheckoutError("Razorpay checkout failed to load. Refresh and try again.");
    document.body.appendChild(script);
  }, []);

  const handleFieldChange =
    (field: keyof CheckoutFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleCheckout = async () => {
    if (checkoutStage !== "idle") return;

    setCheckoutError(null);
    setCheckoutStage("creating");

    try {
      if (authStatus !== "authenticated") {
        router.push(`/login?callbackUrl=${encodeURIComponent("/checkout")}`);
        return;
      }

      if (!isRazorpayReady || !window.Razorpay) {
        throw new Error("Razorpay checkout is still loading. Please try again.");
      }

      const lineItems = items
        .map((item) => {
          const productId = getCheckoutProductId(item.id, item.woocommerceProductId);
          if (!productId) return null;

          const checkoutLineItem: {
            productId: number;
            variationId?: number;
            quantity: number;
          } = {
            productId,
            quantity: item.quantity,
          };

          if (typeof item.woocommerceVariationId === "number") {
            checkoutLineItem.variationId = item.woocommerceVariationId;
          }

          return checkoutLineItem;
        })
        .filter(
          (
            lineItem
          ): lineItem is {
            productId: number;
            variationId?: number;
            quantity: number;
          } => lineItem !== null
        );

      if (lineItems.length === 0) {
        throw new Error("No valid WooCommerce products found in your cart.");
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems,
          billing: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            address1: form.address1,
            address2: form.address2,
            city: form.city,
            state: form.state,
            postcode: form.postcode,
            country: form.country,
          },
          customerNote: form.customerNote,
          couponCode: appliedCoupon?.code || undefined,
        }),
      });

      const payload = (await response.json()) as RazorpayCheckoutPayload;

      if (response.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent("/checkout")}`);
        return;
      }

      if (
        !response.ok ||
        !payload.success ||
        !payload.orderId ||
        !payload.orderKey ||
        !payload.orderNumber ||
        !payload.razorpay
      ) {
        throw new Error(payload.error || "Unable to start Razorpay checkout.");
      }

      const orderId = payload.orderId;
      const orderKey = payload.orderKey;
      const orderNumber = payload.orderNumber;

      writePendingCheckout({
        orderId,
        orderKey,
        orderNumber,
        razorpayOrderId: payload.razorpay.orderId,
      });

      const razorpay = new window.Razorpay({
        key: payload.razorpay.keyId,
        amount: payload.razorpay.amount,
        currency: payload.razorpay.currency,
        name: payload.razorpay.name,
        description: payload.razorpay.description,
        order_id: payload.razorpay.orderId,
        prefill: payload.razorpay.prefill,
        notes: payload.razorpay.notes,
        theme: { color: "#1f1f1f" },
        modal: {
          ondismiss: () => {
            setCheckoutStage("idle");
            setCheckoutError("Payment window closed before completion.");
          },
        },
        handler: async (razorpayResponse) => {
          try {
            setCheckoutStage("verifying");

            const verifyResponse = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                orderKey,
                razorpayOrderId: razorpayResponse.razorpay_order_id,
                razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                razorpaySignature: razorpayResponse.razorpay_signature,
              }),
            });

            const verifyPayload = (await verifyResponse.json()) as {
              success?: boolean;
              error?: string;
            };

            if (!verifyResponse.ok || !verifyPayload.success) {
              setCheckoutStage("idle");
              setCheckoutError(
                verifyPayload.error ||
                  "Payment was completed, but we could not verify it yet. Please contact support if the status does not update."
              );
              return;
            }

            router.push(
              `/checkout/success?orderId=${orderId}&orderKey=${encodeURIComponent(orderKey)}`
            );
          } catch {
            setCheckoutStage("idle");
            setCheckoutError(
              "Payment was completed, but we could not verify it yet. Please contact support if the status does not update."
            );
          }
        },
      });

      setCheckoutStage("paying");
      razorpay.open();
    } catch (error) {
      setCheckoutStage("idle");
      setCheckoutError(
        error instanceof Error ? error.message : "Checkout failed. Please try again."
      );
    }
  };

  const handleApplyCoupon = async () => {
    if (isApplyingCoupon) return;
    const code = couponInput.trim();
    if (!code) {
      setCouponError("Enter a coupon code.");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError("");

    try {
      const response = await fetch(
        `/api/checkout/coupon?code=${encodeURIComponent(code)}`,
        { method: "GET", cache: "no-store" }
      );

      const payload = (await response.json()) as CouponValidationPayload;

      if (!response.ok || !payload.ok || !payload.coupon?.code) {
        setAppliedCoupon(null);
        setCouponError(payload.message || "Unable to apply that coupon right now.");
        setIsApplyingCoupon(false);
        return;
      }

      setAppliedCoupon(payload.coupon);
      setCouponInput(payload.coupon.code);
      setIsApplyingCoupon(false);
    } catch {
      setAppliedCoupon(null);
      setCouponError("Unable to apply that coupon right now.");
      setIsApplyingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[1200px] flex-col items-center justify-center px-4 py-16 text-center sm:px-6 md:px-12">
        <h1 className="font-display text-4xl text-[#222] md:text-5xl">Checkout</h1>
        <p className="mt-4 max-w-xl text-lg text-[#666]">
          Your cart is empty. Add items before checking out.
        </p>
        <Link
          href="/cart"
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-[#222] px-8 py-4 text-sm font-medium uppercase tracking-[0.05em] text-white transition-colors hover:bg-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 md:px-12 md:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.08em] text-[#666]">Checkout</p>
          <h1 className="mt-2 font-display text-4xl text-[#222] md:text-5xl">
            Secure checkout
          </h1>
          <p className="mt-2 text-[#666]">
            {itemCount} {itemCount === 1 ? "item" : "items"} | INR{" "}
            {subtotal.toLocaleString("en-IN")}
          </p>
        </div>
        <Link
          href="/cart"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#666] transition-colors hover:text-[#222]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to cart
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] md:p-8">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-[#f5f0e8] p-2">
              <ShieldCheck className="h-5 w-5 text-[#1f1f1f]" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-[#222]">
                Delivery details
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#666]">
                Enter your delivery details. Payment is processed securely via Razorpay.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleFieldChange("firstName")}
                autoComplete="given-name"
                className="min-h-11 w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleFieldChange("lastName")}
                autoComplete="family-name"
                className="min-h-11 w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleFieldChange("email")}
              autoComplete="email"
              className="min-h-11 w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={handleFieldChange("phone")}
              autoComplete="tel"
              inputMode="tel"
              className="min-h-11 w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
            />
            <input
              type="text"
              placeholder="Address Line 1"
              value={form.address1}
              onChange={handleFieldChange("address1")}
              autoComplete="address-line1"
              className="min-h-11 w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
            />
            <input
              type="text"
              placeholder="Address Line 2 (Optional)"
              value={form.address2}
              onChange={handleFieldChange("address2")}
              autoComplete="address-line2"
              className="min-h-11 w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="City"
                value={form.city}
                onChange={handleFieldChange("city")}
                autoComplete="address-level2"
                className="min-h-11 w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
              />
              <input
                type="text"
                placeholder="State"
                value={form.state}
                onChange={handleFieldChange("state")}
                autoComplete="address-level1"
                className="min-h-11 w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="PIN / ZIP"
                value={form.postcode}
                onChange={handleFieldChange("postcode")}
                autoComplete="postal-code"
                inputMode="numeric"
                className="min-h-11 w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
              />
              <input
                type="text"
                placeholder="Country Code (IN)"
                value={form.country}
                onChange={(e) => {
                  const next = e.target.value.toUpperCase().slice(0, 2);
                  setForm((current) => ({ ...current, country: next }));
                }}
                autoComplete="country"
                maxLength={2}
                className="min-h-11 w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] text-[#222] uppercase outline-none transition-colors focus:border-[#1f1f1f]/35"
              />
            </div>
            <textarea
              placeholder="Order Note (Optional)"
              value={form.customerNote}
              onChange={handleFieldChange("customerNote")}
              className="min-h-[92px] w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
            />
          </div>

          {checkoutError && (
            <p className="mt-4 rounded-[14px] bg-[#f9ebe8] px-4 py-3 text-sm text-[#b42318]">
              {checkoutError}
            </p>
          )}
        </section>

        <aside className="h-fit rounded-2xl bg-[#FAF9F6] p-6 sm:p-8">
          <div className="rounded-[18px] border border-[#1f1f1f]/8 bg-white px-5 py-5">
            <div className="flex items-center justify-between">
              <span className="text-[#666]">Subtotal</span>
              <span className="font-medium text-[#222]">
                INR {subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#666]">
              Review the final amount in Razorpay before you pay.
            </p>
          </div>

          <div className="mt-5 rounded-[18px] border border-[#1f1f1f]/8 bg-white px-5 py-5">
            <p className="text-sm font-semibold text-[#1f1f1f]">Have a coupon?</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => {
                  const next = e.target.value;
                  setCouponInput(next);
                  if (couponError) setCouponError("");
                  if (appliedCoupon && next.trim().toLowerCase() !== appliedCoupon.code) {
                    setAppliedCoupon(null);
                  }
                }}
                placeholder="Enter coupon code"
                className="min-h-11 w-full flex-1 rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon}
                className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#1f1f1f] transition-colors hover:bg-[#f5f0e8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isApplyingCoupon ? "Applying..." : "Apply"}
              </button>
            </div>

            {appliedCoupon ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#eef7f0] px-3 py-1 text-xs font-semibold text-[#116329]">
                  Applied: {appliedCoupon.code}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponError("");
                    setCouponInput("");
                  }}
                  className="text-xs font-semibold text-[#1f1f1f] underline underline-offset-4"
                >
                  Remove
                </button>
                <span className="text-xs text-[#6d665d]">
                  Discount will be included in the final total.
                </span>
              </div>
            ) : null}

            {couponError ? (
              <p className="mt-3 text-sm leading-6 text-[#b42318]">{couponError}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={
              authStatus !== "authenticated" ||
              checkoutStage !== "idle" ||
              !hasCheckoutReadyItems ||
              !isRazorpayReady
            }
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#1f1f1f] px-5 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {getPayButtonLabel(checkoutStage, isRazorpayReady)}
          </button>

          <p className="mt-4 text-sm leading-6 text-[#666]">
            Your payment details are handled by Razorpay. We do not store card or UPI credentials.
          </p>
        </aside>
      </div>
    </main>
  );
}
