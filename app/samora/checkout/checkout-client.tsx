"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Gift, Lock, ShieldCheck } from "lucide-react";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { useCart } from "@/components/cart/CartProvider";
import { writePendingCheckout } from "@/utils/checkout-client";
import { trackBeginCheckout } from "@/utils/gtm";
import {
  calculateGiftFee,
  SAMORA_DEFAULT_ITEM_WEIGHT_GRAMS,
  SAMORA_FREE_SHIPPING_THRESHOLD_INR,
} from "@/lib/samora/pricing";

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
    prefill?: { name?: string; email?: string; contact?: string };
    notes?: Record<string, string>;
  };
};

type PincodeShippingPayload = {
  serviceable?: boolean;
  message?: string;
  locality?: string;
  estimatedDays?: { min: number; max: number };
  freeShippingEligible?: boolean | null;
  shippingFee?: number | null;
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

type RazorpayInstance = { open: () => void };

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
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

const getCheckoutProductId = (id: number | string, woocommerceProductId?: number) => {
  if (typeof woocommerceProductId === "number" && woocommerceProductId > 0) {
    return woocommerceProductId;
  }
  if (typeof id === "number" && id > 0) return id;
  const parsedFromPrefix = Number(String(id).split("-")[0]);
  return Number.isFinite(parsedFromPrefix) && parsedFromPrefix > 0 ? parsedFromPrefix : null;
};

const getPayButtonLabel = (stage: CheckoutStage, isReady: boolean) => {
  if (!isReady) return "Loading Payment...";
  if (stage === "creating") return "Preparing Payment...";
  if (stage === "paying") return "Complete Payment in Razorpay";
  if (stage === "verifying") return "Verifying Payment...";
  return "Pay with Razorpay";
};

const INPUT_CLASS =
  "min-h-11 w-full rounded-[10px] border border-[#2b2420]/15 bg-[#fbf6ef] px-4 py-3 text-[15px] text-[#2b2420] outline-none transition-colors focus:border-[#c1683d]";

export default function SamoraCheckoutPageClient() {
  const router = useRouter();
  const { status: authStatus, session } = useAuthSession();
  const { items, itemCount, subtotal, isGiftOrder, giftMessage } = useCart();
  const [form, setForm] = useState<CheckoutFormState>(INITIAL_FORM);
  const [checkoutStage, setCheckoutStage] = useState<CheckoutStage>("idle");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationPayload["coupon"] | null>(null);
  const [shippingQuote, setShippingQuote] = useState<PincodeShippingPayload | null>(null);
  const [isCheckingShipping, setIsCheckingShipping] = useState(false);

  const totalWeightGrams = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (item.weightKg ? item.weightKg * 1000 : SAMORA_DEFAULT_ITEM_WEIGHT_GRAMS) * item.quantity,
        0
      ),
    [items]
  );

  const giftFee = useMemo(() => calculateGiftFee(itemCount, isGiftOrder), [itemCount, isGiftOrder]);

  // Real-time Delhivery-quoted shipping — refetched whenever the PIN code
  // (or the gift-fee-affected total) changes, debounced so we're not hitting
  // the API on every keystroke.
  useEffect(() => {
    if (!/^[1-9][0-9]{5}$/.test(form.postcode)) {
      setShippingQuote(null);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsCheckingShipping(true);
      try {
        const params = new URLSearchParams({
          pincode: form.postcode,
          amount: String(subtotal + giftFee),
          weight: String(Math.round(totalWeightGrams)),
        });
        const response = await fetch(`/api/checkout/pincode?${params.toString()}`, {
          cache: "no-store",
        });
        const data = (await response.json()) as PincodeShippingPayload;
        setShippingQuote(data);
      } catch {
        setShippingQuote({ serviceable: false, message: "Could not calculate shipping right now." });
      } finally {
        setIsCheckingShipping(false);
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [form.postcode, subtotal, giftFee, totalWeightGrams]);

  const shippingFee = shippingQuote?.serviceable ? shippingQuote.shippingFee ?? null : null;
  const orderTotal = subtotal + giftFee + (shippingFee ?? 0);

  const hasCheckoutReadyItems = useMemo(
    () => items.some((item) => getCheckoutProductId(item.id, item.woocommerceProductId)),
    [items]
  );
  const beginCheckoutTrackingKey = useMemo(
    () =>
      items
        .map((item) =>
          [item.id, item.woocommerceProductId ?? "", item.woocommerceVariationId ?? "", item.quantity].join(":")
        )
        .join("|"),
    [items]
  );

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent("/samora/checkout")}`);
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

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout="true"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsRazorpayReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => setIsRazorpayReady(true);
    script.onerror = () => setCheckoutError("Razorpay checkout failed to load. Refresh and try again.");
    document.body.appendChild(script);
  }, []);

  const handleFieldChange =
    (field: keyof CheckoutFormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleCheckout = async () => {
    if (checkoutStage !== "idle") return;

    setCheckoutError(null);
    setCheckoutStage("creating");

    try {
      if (authStatus !== "authenticated") {
        router.push(`/login?callbackUrl=${encodeURIComponent("/samora/checkout")}`);
        return;
      }

      if (!isRazorpayReady || !window.Razorpay) {
        throw new Error("Razorpay checkout is still loading. Please try again.");
      }

      if (shippingQuote?.serviceable === false) {
        throw new Error(
          shippingQuote.message || "This PIN code isn't serviceable by our courier partner."
        );
      }

      const lineItems = items
        .map((item) => {
          const productId = getCheckoutProductId(item.id, item.woocommerceProductId);
          if (!productId) return null;

          const checkoutLineItem: { productId: number; variationId?: number; quantity: number } = {
            productId,
            quantity: item.quantity,
          };
          if (typeof item.woocommerceVariationId === "number") {
            checkoutLineItem.variationId = item.woocommerceVariationId;
          }
          return checkoutLineItem;
        })
        .filter(
          (lineItem): lineItem is { productId: number; variationId?: number; quantity: number } =>
            lineItem !== null
        );

      if (lineItems.length === 0) {
        throw new Error("No valid WooCommerce products found in your cart.");
      }

      const giftNote = isGiftOrder
        ? `Gift order. Message: ${giftMessage.trim() || "(no message provided)"}`
        : "";
      const customerNote = [giftNote, form.customerNote].filter(Boolean).join("\n\n");

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
          customerNote,
          couponCode: appliedCoupon?.code || undefined,
          storeName: "Samora",
          isGift: isGiftOrder,
        }),
      });

      const payload = (await response.json()) as RazorpayCheckoutPayload;

      if (response.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent("/samora/checkout")}`);
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
        theme: { color: "#c1683d" },
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

            const verifyPayload = (await verifyResponse.json()) as { success?: boolean; error?: string };

            if (!verifyResponse.ok || !verifyPayload.success) {
              setCheckoutStage("idle");
              setCheckoutError(
                verifyPayload.error ||
                  "Payment was completed, but we could not verify it yet. Please contact support if the status does not update."
              );
              return;
            }

            router.push(`/samora/checkout/success?orderId=${orderId}&orderKey=${encodeURIComponent(orderKey)}`);
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
      setCheckoutError(error instanceof Error ? error.message : "Checkout failed. Please try again.");
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
      const response = await fetch(`/api/checkout/coupon?code=${encodeURIComponent(code)}`, {
        method: "GET",
        cache: "no-store",
      });
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
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[1200px] flex-col items-center justify-center px-5 py-16 text-center md:px-10">
        <h1 className="font-samora-display text-[34px] text-[#2b2420] md:text-[42px]">Checkout</h1>
        <p className="mt-4 max-w-xl text-[16px] leading-[1.7] text-[#5c5344]">
          Your cart is empty. Add items before checking out.
        </p>
        <Link
          href="/samora/cart"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#c1683d] px-7 py-3.5 text-[14.5px] font-medium text-white transition-colors hover:bg-[#a8552f]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to Cart
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-10 md:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#c1683d]">
            Checkout
          </p>
          <h1 className="font-samora-display mt-2 text-[32px] text-[#2b2420] md:text-[40px]">
            Secure Checkout
          </h1>
          <p className="mt-2 text-[14.5px] text-[#5c5344]">
            {itemCount} {itemCount === 1 ? "item" : "items"} &middot; INR {subtotal.toLocaleString("en-IN")}
          </p>
        </div>
        <Link
          href="/samora/cart"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#5c5344] transition-colors hover:text-[#2b2420]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to cart
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <section className="rounded-[20px] border border-[#2b2420]/10 bg-[#fbf6ef] p-6 md:p-8">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-[#f3ead9] p-2">
              <ShieldCheck className="h-5 w-5 text-[#2b2420]" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-samora-display text-[21px] text-[#2b2420]">Delivery Details</h2>
              <p className="mt-2 text-[13.5px] leading-[1.6] text-[#5c5344]">
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
                className={INPUT_CLASS}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleFieldChange("lastName")}
                autoComplete="family-name"
                className={INPUT_CLASS}
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleFieldChange("email")}
              autoComplete="email"
              className={INPUT_CLASS}
            />
            <input
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={handleFieldChange("phone")}
              autoComplete="tel"
              inputMode="tel"
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Address Line 1"
              value={form.address1}
              onChange={handleFieldChange("address1")}
              autoComplete="address-line1"
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Address Line 2 (Optional)"
              value={form.address2}
              onChange={handleFieldChange("address2")}
              autoComplete="address-line2"
              className={INPUT_CLASS}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="City"
                value={form.city}
                onChange={handleFieldChange("city")}
                autoComplete="address-level2"
                className={INPUT_CLASS}
              />
              <input
                type="text"
                placeholder="State"
                value={form.state}
                onChange={handleFieldChange("state")}
                autoComplete="address-level1"
                className={INPUT_CLASS}
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
                className={INPUT_CLASS}
              />
              <input
                type="text"
                placeholder="Country Code (IN)"
                value={form.country}
                onChange={(event) => {
                  const next = event.target.value.toUpperCase().slice(0, 2);
                  setForm((current) => ({ ...current, country: next }));
                }}
                autoComplete="country"
                maxLength={2}
                className={`${INPUT_CLASS} uppercase`}
              />
            </div>
            <textarea
              placeholder="Order Note (Optional)"
              value={form.customerNote}
              onChange={handleFieldChange("customerNote")}
              className={`${INPUT_CLASS} min-h-[92px]`}
            />
          </div>

          {isGiftOrder ? (
            <div className="mt-5 flex items-start gap-2.5 rounded-[14px] bg-[#f3ead9] px-4 py-3.5">
              <Gift className="mt-0.5 h-4 w-4 shrink-0 text-[#c1683d]" strokeWidth={1.75} />
              <p className="text-[13.5px] leading-[1.6] text-[#2b2420]">
                This order is marked as a gift
                {giftMessage.trim() ? " with a personalised message" : ""}. It&apos;ll be
                included with checkout.
              </p>
            </div>
          ) : null}

          {checkoutError && (
            <p className="mt-4 rounded-[14px] bg-[#f8ece8] px-4 py-3 text-[13.5px] text-[#a63b2d]">
              {checkoutError}
            </p>
          )}
        </section>

        <aside className="h-fit rounded-[20px] bg-[#f3ead9] p-6 sm:p-7">
          <div className="rounded-[16px] border border-[#2b2420]/10 bg-[#fbf6ef] px-5 py-5">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-[#5c5344]">Subtotal</span>
                <span className="text-[15px] font-medium text-[#2b2420]">
                  INR {subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {giftFee > 0 ? (
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[#5c5344]">Gift Wrapping</span>
                  <span className="text-[15px] font-medium text-[#2b2420]">
                    INR {giftFee.toLocaleString("en-IN")}
                  </span>
                </div>
              ) : null}

              <div className="flex items-center justify-between">
                <span className="text-[14px] text-[#5c5344]">Shipping (Delhivery)</span>
                <span className="text-[15px] font-medium text-[#2b2420]">
                  {isCheckingShipping
                    ? "Checking..."
                    : !shippingQuote
                      ? "Enter PIN below"
                      : !shippingQuote.serviceable
                        ? "Not serviceable"
                        : shippingFee
                          ? `INR ${shippingFee.toLocaleString("en-IN")}`
                          : "FREE"}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-[#2b2420]/10 pt-2.5">
                <span className="text-[14.5px] font-semibold text-[#2b2420]">Total</span>
                <span className="text-[17px] font-semibold text-[#2b2420]">
                  INR {orderTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {shippingQuote?.serviceable && shippingQuote.locality ? (
              <p className="mt-3 text-[13px] leading-[1.6] text-[#8a7c68]">
                Delivering to {shippingQuote.locality}
                {shippingQuote.estimatedDays
                  ? ` · ${shippingQuote.estimatedDays.min}-${shippingQuote.estimatedDays.max} days`
                  : ""}
                {!shippingFee ? ` · free above INR ${SAMORA_FREE_SHIPPING_THRESHOLD_INR.toLocaleString("en-IN")}` : ""}
              </p>
            ) : shippingQuote && !shippingQuote.serviceable ? (
              <p className="mt-3 text-[13px] leading-[1.6] text-[#a63b2d]">
                {shippingQuote.message || "This PIN code isn't serviceable right now."}
              </p>
            ) : (
              <p className="mt-3 text-[13.5px] leading-[1.6] text-[#8a7c68]">
                Enter your PIN code in the form to see accurate shipping.
              </p>
            )}
          </div>

          <div className="mt-5 rounded-[16px] border border-[#2b2420]/10 bg-[#fbf6ef] px-5 py-5">
            <p className="text-[14px] font-semibold text-[#2b2420]">Have a coupon?</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={couponInput}
                onChange={(event) => {
                  const next = event.target.value;
                  setCouponInput(next);
                  if (couponError) setCouponError("");
                  if (appliedCoupon && next.trim().toLowerCase() !== appliedCoupon.code) {
                    setAppliedCoupon(null);
                  }
                }}
                placeholder="Enter coupon code"
                className={`${INPUT_CLASS} flex-1`}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon}
                className="inline-flex items-center justify-center rounded-[10px] border border-[#2b2420]/15 bg-white px-5 py-3 text-[13.5px] font-semibold text-[#2b2420] transition-colors hover:bg-[#f3ead9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isApplyingCoupon ? "Applying..." : "Apply"}
              </button>
            </div>

            {appliedCoupon ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#eef7f0] px-3 py-1 text-[12px] font-semibold text-[#116329]">
                  Applied: {appliedCoupon.code}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponError("");
                    setCouponInput("");
                  }}
                  className="text-[12px] font-semibold text-[#2b2420] underline underline-offset-4"
                >
                  Remove
                </button>
              </div>
            ) : null}

            {couponError ? <p className="mt-3 text-[13.5px] text-[#a63b2d]">{couponError}</p> : null}
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={
              authStatus !== "authenticated" ||
              checkoutStage !== "idle" ||
              !hasCheckoutReadyItems ||
              !isRazorpayReady ||
              shippingQuote?.serviceable === false
            }
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#c1683d] px-5 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#a8552f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Lock className="h-4 w-4" strokeWidth={2} />
            {getPayButtonLabel(checkoutStage, isRazorpayReady)}
          </button>

          <p className="mt-4 text-[13px] leading-[1.6] text-[#8a7c68]">
            Your payment details are handled by Razorpay. We do not store card or UPI credentials.
          </p>
        </aside>
      </div>
    </main>
  );
}
