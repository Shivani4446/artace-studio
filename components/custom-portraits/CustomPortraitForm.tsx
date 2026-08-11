"use client";

import React, { useEffect, useMemo, useState } from "react";
import ImageUpload from "@/components/custom-order/ImageUpload";
import {
  PORTRAIT_TYPES,
  calculatePortraitEstimate,
  isPortraitType,
  MIN_DIMENSION_INCHES,
  MAX_DIMENSION_INCHES,
  type PortraitType,
} from "@/lib/custom-portraits/pricing";

type Stage = "idle" | "submitting" | "paying" | "verifying" | "confirmed";

type SizePreset = { label: string; width: number; height: number };

const SIZE_PRESETS: SizePreset[] = [
  { label: '12" x 12"', width: 12, height: 12 },
  { label: '16" x 20"', width: 16, height: 20 },
  { label: '24" x 36"', width: 24, height: 36 },
];

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

type CustomPortraitCheckoutPayload = {
  success?: boolean;
  error?: string;
  orderId?: number;
  orderKey?: string;
  orderNumber?: string;
  estimatedPrice?: number;
  depositAmount?: number;
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

const inputClass =
  "min-h-[48px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5";

const CustomPortraitForm = () => {
  const [portraitType, setPortraitType] = useState<PortraitType>("single");
  const [sizeMode, setSizeMode] = useState<"preset" | "custom">("preset");
  const [selectedPreset, setSelectedPreset] = useState<SizePreset>(SIZE_PRESETS[0]);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");

  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState("");
  const [confirmedDeposit, setConfirmedDeposit] = useState(0);

  // Preselect from ?type=single|couple|family|baby (the type-showcase cards on the page link here)
  // client-side only, so this never needs a Suspense boundary around useSearchParams.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("type");
    if (isPortraitType(fromQuery)) setPortraitType(fromQuery);
  }, []);

  const width = sizeMode === "preset" ? selectedPreset.width : Number(customWidth);
  const height = sizeMode === "preset" ? selectedPreset.height : Number(customHeight);

  const estimate = useMemo(
    () => calculatePortraitEstimate({ portraitType, widthInches: width, heightInches: height }),
    [portraitType, width, height]
  );

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (stage !== "idle") return;

    setError(null);

    if (!estimate) {
      setError(
        `Please enter a size between ${MIN_DIMENSION_INCHES}" and ${MAX_DIMENSION_INCHES}" on each side.`
      );
      return;
    }
    if (referenceImages.length === 0) {
      setError("Please upload at least one reference photo.");
      return;
    }
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in your name, email, and phone number.");
      return;
    }
    if (!isRazorpayReady || !window.Razorpay) {
      setError("Payment is still loading. Please try again in a moment.");
      return;
    }

    setStage("submitting");

    try {
      const response = await fetch("/api/custom-portraits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portraitType,
          widthInches: width,
          heightInches: height,
          name,
          email,
          phone,
          notes,
          referenceImages,
        }),
      });

      const payload = (await response.json()) as CustomPortraitCheckoutPayload;

      if (
        !response.ok ||
        !payload.success ||
        !payload.orderId ||
        !payload.orderKey ||
        !payload.orderNumber ||
        !payload.razorpay
      ) {
        throw new Error(payload.error || "Unable to start your portrait request.");
      }

      const orderId = payload.orderId;
      const orderKey = payload.orderKey;
      const orderNumber = payload.orderNumber;
      const depositAmount = payload.depositAmount ?? estimate.depositAmount;

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

            const verifyPayload = (await verifyResponse.json()) as {
              success?: boolean;
              error?: string;
            };

            if (!verifyResponse.ok || !verifyPayload.success) {
              setStage("idle");
              setError(
                verifyPayload.error ||
                  "Payment was completed, but we could not verify it yet. Please contact support if the status does not update."
              );
              return;
            }

            setConfirmedOrderNumber(orderNumber);
            setConfirmedDeposit(depositAmount);
            setStage("confirmed");
          } catch {
            setStage("idle");
            setError(
              "Payment was completed, but we could not verify it yet. Please contact support if the status does not update."
            );
          }
        },
      });

      setStage("paying");
      razorpay.open();
    } catch (err) {
      setStage("idle");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (stage === "confirmed") {
    return (
      <div className="rounded-[24px] border border-black/10 bg-[#faf8f4] p-8 text-center md:p-12">
        <h3 className="font-display text-[26px] text-[#1f1f1f] md:text-[32px]">
          Your Portrait Request Is Confirmed!
        </h3>
        <p className="mt-4 text-[15px] leading-7 text-[#595959] md:text-[16px]">
          Order #{confirmedOrderNumber} · Deposit paid: ₹{confirmedDeposit.toLocaleString("en-IN")}
        </p>
        <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-7 text-[#595959] md:text-[16px]">
          Our team will review your reference photo and reach out within 24-48 hours with your
          final price and timeline. If you review it and decide not to go ahead, we&apos;ll
          refund your deposit in full.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[24px] border border-black/10 bg-[#faf8f4] p-6 md:p-8"
    >
      <div>
        <p className="text-[14px] font-medium text-[#313131]">Portrait Type</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PORTRAIT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setPortraitType(type.value)}
              className={`rounded-[12px] border px-4 py-3 text-left text-[14px] font-medium transition-colors ${
                portraitType === type.value
                  ? "border-[#1f1f1f] bg-[#1f1f1f] text-white"
                  : "border-black/10 bg-white text-[#313131] hover:border-[#1f1f1f]/40"
              }`}
            >
              {type.label}
              <span
                className={`mt-1 block text-[12px] font-normal ${
                  portraitType === type.value ? "text-white/70" : "text-[#8a8478]"
                }`}
              >
                From ₹{type.basePrice.toLocaleString("en-IN")}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[14px] font-medium text-[#313131]">Size</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {SIZE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setSizeMode("preset");
                setSelectedPreset(preset);
              }}
              className={`rounded-[12px] border px-4 py-2 text-[14px] font-medium transition-colors ${
                sizeMode === "preset" && selectedPreset.label === preset.label
                  ? "border-[#1f1f1f] bg-[#1f1f1f] text-white"
                  : "border-black/10 bg-white text-[#313131] hover:border-[#1f1f1f]/40"
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSizeMode("custom")}
            className={`rounded-[12px] border px-4 py-2 text-[14px] font-medium transition-colors ${
              sizeMode === "custom"
                ? "border-[#1f1f1f] bg-[#1f1f1f] text-white"
                : "border-black/10 bg-white text-[#313131] hover:border-[#1f1f1f]/40"
            }`}
          >
            Custom Size
          </button>
        </div>

        {sizeMode === "custom" && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-2 text-[13px] font-medium text-[#313131]">
              Width (inches)
              <input
                type="number"
                min={MIN_DIMENSION_INCHES}
                max={MAX_DIMENSION_INCHES}
                value={customWidth}
                onChange={(event) => setCustomWidth(event.target.value)}
                placeholder="e.g. 20"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-2 text-[13px] font-medium text-[#313131]">
              Height (inches)
              <input
                type="number"
                min={MIN_DIMENSION_INCHES}
                max={MAX_DIMENSION_INCHES}
                value={customHeight}
                onChange={(event) => setCustomHeight(event.target.value)}
                placeholder="e.g. 24"
                className={inputClass}
              />
            </label>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-[16px] border border-[#1f1f1f]/10 bg-white p-5">
        {estimate ? (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] text-[#595959]">Estimated Price</span>
              <span className="font-display text-[24px] text-[#1f1f1f]">
                ₹{estimate.estimatedPrice.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[14px] text-[#595959]">Deposit to pay now (10%)</span>
              <span className="font-display text-[20px] text-[#126849]">
                ₹{estimate.depositAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </>
        ) : (
          <p className="text-[14px] text-[#8a8478]">
            Enter a size to see your instant price estimate.
          </p>
        )}
      </div>

      <div className="mt-6">
        <p className="mb-2 text-[14px] font-medium text-[#313131]">Upload Your Reference Photo</p>
        <ImageUpload
          maxFiles={3}
          onUpload={(urls) => setReferenceImages((prev) => [...prev, ...urls])}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
          Full Name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
            required
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
          Email Address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@email.com"
            required
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131] sm:col-span-2">
          Phone / WhatsApp Number
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+91 00000 00000"
            required
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131] sm:col-span-2">
          Notes (Optional)
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Pose, background, framing preference — anything our artists should know."
            className="w-full rounded-[12px] border border-black/10 bg-white px-4 py-3 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5"
          />
        </label>
      </div>

      <p className="mt-6 text-[13px] leading-6 text-[#595959]">
        Your deposit confirms your spot in our artists&apos; queue. If you review the final
        concept and decide not to go ahead, we&apos;ll refund your deposit in full.
      </p>

      <button
        type="submit"
        disabled={stage !== "idle"}
        className="mt-4 min-h-[52px] w-full rounded-[12px] bg-[#1a1a1a] px-6 text-[16px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {stage === "submitting"
          ? "Preparing Payment..."
          : stage === "paying"
            ? "Complete Payment in Razorpay"
            : stage === "verifying"
              ? "Verifying Payment..."
              : estimate
                ? `Pay ₹${estimate.depositAmount.toLocaleString("en-IN")} & Confirm My Portrait`
                : "Pay & Confirm My Portrait"}
      </button>

      {error && <p className="mt-4 text-[14px] text-red-600">{error}</p>}
    </form>
  );
};

export default CustomPortraitForm;
