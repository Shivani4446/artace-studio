"use client";

import { useEffect, useState } from "react";
import { DENOMINATIONS } from "@/lib/gift-cards/constants";

// Razorpay type definitions and script-loading pattern copied verbatim from
// components/custom-portraits/CustomPortraitForm.tsx — the proven, working
// original — rather than retyped, so this doesn't drift from it.
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

type GiftCardCheckoutPayload = {
  success?: boolean;
  error?: string;
  orderId?: number;
  orderKey?: string;
  orderNumber?: string;
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

type VerifyPayload = {
  success?: boolean;
  error?: string;
  giftCardCode?: string;
};

type Stage = "idle" | "submitting" | "verifying" | "confirmed";

const GiftCardPurchaseForm = () => {
  const [amount, setAmount] = useState<number>(DENOMINATIONS[0]);
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState("");
  const [confirmedCode, setConfirmedCode] = useState("");
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);

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
    script.onerror = () => setError("Payment could not load. Refresh and try again.");
    document.body.appendChild(script);
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (!purchaserName.trim() || !purchaserEmail.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    if (!isRazorpayReady || !window.Razorpay) {
      setError("Payment is still loading. Please try again in a moment.");
      return;
    }

    setStage("submitting");

    try {
      const response = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, purchaserName, purchaserEmail }),
      });
      const payload = (await response.json()) as GiftCardCheckoutPayload;

      if (!response.ok || !payload.success || !payload.orderId || !payload.orderKey || !payload.razorpay) {
        throw new Error(payload.error || "Unable to start your gift card purchase.");
      }

      const orderId = payload.orderId;
      const orderKey = payload.orderKey;

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
            setStage("idle");
            setError("Payment window closed before completion.");
          },
        },
        handler: async (razorpayResponse) => {
          try {
            setStage("verifying");
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
            const verifyPayload = (await verifyResponse.json()) as VerifyPayload;

            if (!verifyResponse.ok || !verifyPayload.success) {
              setStage("idle");
              setError(verifyPayload.error || "Payment completed, but verification failed. Please contact support.");
              return;
            }

            setConfirmedCode(verifyPayload.giftCardCode || "");
            setStage("confirmed");
          } catch {
            setStage("idle");
            setError("Payment completed, but verification failed. Please contact support.");
          }
        },
      });
      razorpay.open();
    } catch (err) {
      setStage("idle");
      setError(err instanceof Error ? err.message : "Unable to start your gift card purchase.");
    }
  };

  if (stage === "confirmed") {
    return (
      <div className="rounded-[18px] bg-white p-8 text-center">
        <p className="font-display text-[22px] text-[#1f1f1f]">Your gift card is ready!</p>
        <p className="mt-3 font-mono text-[20px] tracking-wide text-[#1f1f1f]">{confirmedCode}</p>
        <p className="mt-2 text-sm text-[#666]">We&apos;ve also emailed this code to {purchaserEmail}.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[18px] bg-white p-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {DENOMINATIONS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setAmount(value)}
            className={`rounded-[12px] border px-4 py-3 text-sm font-semibold transition-colors ${
              amount === value ? "border-[#1f1f1f] bg-[#1f1f1f] text-white" : "border-black/10 text-[#1f1f1f] hover:bg-[#f5f0e8]"
            }`}
          >
            ₹{value.toLocaleString("en-IN")}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={purchaserName}
        onChange={(e) => setPurchaserName(e.target.value)}
        placeholder="Your name"
        className="mt-4 min-h-11 w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] outline-none focus:border-[#1f1f1f]/35"
      />
      <input
        type="email"
        value={purchaserEmail}
        onChange={(e) => setPurchaserEmail(e.target.value)}
        placeholder="Your email"
        className="mt-3 min-h-11 w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] outline-none focus:border-[#1f1f1f]/35"
      />

      {error ? <p className="mt-3 text-sm text-[#b42318]">{error}</p> : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={stage === "submitting" || stage === "verifying"}
        className="mt-5 inline-flex w-full items-center justify-center rounded-[12px] bg-[#1a1a1a] px-7 py-3 text-[16px] font-medium text-white transition-colors hover:bg-black disabled:opacity-60"
      >
        {stage === "idle" ? `Buy Gift Card — ₹${amount.toLocaleString("en-IN")}` : "Processing..."}
      </button>
    </div>
  );
};

export default GiftCardPurchaseForm;
