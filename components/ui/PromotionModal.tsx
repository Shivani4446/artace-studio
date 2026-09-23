"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Copy, Check, Sparkles } from "lucide-react";

const PromotionModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  // Separate from isVisible: isVisible mounts the modal, isEntered controls
  // its visual (opacity/scale) state. Without this split, the modal would
  // mount already at its "shown" styles in the same paint — CSS transitions
  // only animate between two distinct painted frames, so there'd be nothing
  // to transition *from* and it would just flash in instantly.
  const [isEntered, setIsEntered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const COUPON_CODE = "BAPPA";

  // The code stays hidden until the visitor submits their email + phone —
  // this is what turns the popup into a lead capture, not just a discount.
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadStatus, setLeadStatus] = useState<"form" | "submitting" | "revealed" | "error">(
    "form"
  );
  const [leadError, setLeadError] = useState("");

  const handleLeadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLeadStatus("submitting");
    setLeadError("");

    try {
      const response = await fetch("/api/promotion-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: leadEmail.trim(),
          phone: leadPhone.trim(),
          couponCode: COUPON_CODE,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "We couldn't unlock your code. Please try again.");
      }

      setLeadStatus("revealed");
    } catch (error) {
      setLeadStatus("error");
      setLeadError(
        error instanceof Error ? error.message : "We couldn't unlock your code. Please try again."
      );
    }
  };

  useEffect(() => {
    // Check if the user has already seen or closed the modal in this session
    const hasSeenModal = sessionStorage.getItem("hasSeenPromotionModal");

    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 15000); // 15 seconds delay

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setIsEntered(false);
      return;
    }

    // Double rAF: guarantees the browser has painted the initial (hidden)
    // frame before we flip to the "entered" styles, so the opacity/scale
    // transition below actually has a starting point to animate from.
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        setIsEntered(true);
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [isVisible]);

  const isShown = isEntered && !isClosing;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("hasSeenPromotionModal", "true");
    }, 300); // Animation duration
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(COUPON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-3 transition-opacity duration-500 sm:p-6 ${
        isShown ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-[58rem] overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-500 ease-out sm:rounded-[24px] ${
          isShown ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition-all hover:bg-black/45 md:right-4 md:top-4 md:bg-white/10 md:hover:bg-black/20"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Scrollable content — capped to the viewport height (minus the
            outer wrapper's padding) with internal scroll, so on short mobile
            viewports the popup never overflows above/below the screen with
            no way to reach the close button or the CTA. */}
        <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto md:flex md:max-h-[calc(100dvh-3rem)]">
          {/* Image Side */}
          <div className="relative hidden h-32 w-full shrink-0 md:block md:h-auto md:min-h-[34rem] md:w-[43%]">
            <Image
              src="/images/bappa-1.webp"
              alt="Hand-painted Ganesha canvas artwork for Ganesh Chaturthi"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 25rem"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/5" />
          </div>

          {/* Content Side */}
          <div className="flex min-w-0 flex-1 flex-col justify-center p-5 text-[#1a1a1a] sm:p-7 md:p-9 lg:p-12">
            <div className="inline-flex max-w-full items-center self-start rounded-full bg-[#D4AF37]/10 px-3 py-1 text-[11px] font-bold uppercase text-[#D4AF37] sm:gap-2 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="min-w-0 truncate">Ganesh Chaturthi Special</span>
            </div>

            <h2 className="mt-3 text-wrap font-display text-3xl leading-[1.08] text-[#1A1A1A] sm:mt-5 sm:text-4xl lg:text-[42px]">
              Bring Home <br />
              <span className="text-[#D4AF37]">Bappa&apos;s Blessings.</span>
            </h2>

            <p className="mt-3 max-w-[34rem] text-base leading-relaxed text-[#555555] sm:mt-5 sm:text-[17px] lg:text-lg">
              This Ganesh Chaturthi, celebrate with a flat
              <span className="font-semibold text-[#1a1a1a]"> 20% off every order </span>
              — plus a complimentary gift with your purchase, on us.
            </p>

            {leadStatus === "revealed" ? (
              <>
                <div className="mt-4 sm:mt-7">
                  <p className="text-[13px] font-bold uppercase tracking-wider text-[#999999]">
                    Use Coupon Code
                  </p>
                  <div className="mt-2 flex items-stretch gap-2">
                    <div className="flex min-w-0 flex-1 items-center justify-between rounded-xl border border-dashed border-[#D4AF37] bg-[#FAF9F6] px-4 py-3 font-mono text-lg font-semibold tracking-wider text-[#1a1a1a] sm:px-5">
                      {COUPON_CODE}
                      <button
                        onClick={copyToClipboard}
                        className="ml-3 flex min-h-11 shrink-0 items-center gap-2 text-sm font-medium text-[#D4AF37] transition-colors hover:text-[#B8962E]"
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#1a1a1a] px-5 text-center text-base font-semibold text-white transition-all hover:bg-black hover:shadow-lg active:scale-[0.98] sm:mt-7 sm:min-h-[52px]"
                >
                  Claim My 20% Off & Shop Now
                </button>
              </>
            ) : (
              <form onSubmit={handleLeadSubmit} className="mt-4 w-full sm:mt-7">
                <div className="flex flex-col gap-2 lg:flex-row">
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(event) => setLeadEmail(event.target.value)}
                    placeholder="Email address"
                    aria-label="Email address"
                    className="min-h-12 min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-4 text-base text-[#1a1a1a] outline-none transition-all focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
                  />
                  <input
                    type="tel"
                    required
                    value={leadPhone}
                    onChange={(event) => setLeadPhone(event.target.value)}
                    placeholder="Phone number"
                    aria-label="Phone number"
                    className="min-h-12 min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-4 text-base text-[#1a1a1a] outline-none transition-all focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={leadStatus === "submitting"}
                  className="mt-2 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#1a1a1a] px-5 text-center text-base font-semibold text-white transition-all hover:bg-black hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[52px]"
                >
                  {leadStatus === "submitting" ? "Unlocking..." : "Reveal My 20% Off Code"}
                </button>

                {leadStatus === "error" && (
                  <p className="mt-2 text-[13px] text-red-600">{leadError}</p>
                )}
                <p className="mt-2 text-[11px] text-[#999999] sm:text-[12px]">
                  We&apos;ll only use this to send your code and occasional offers.
                </p>
              </form>
            )}

            <p className="mt-3 text-center text-[11px] text-[#999999] sm:mt-4 sm:text-[12px]">
              Ganesh Chaturthi sale, live now through 14th September. Free Pan-India Shipping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
