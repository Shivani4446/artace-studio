"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Copy, Check, Sparkles } from "lucide-react";

const PromotionModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const COUPON_CODE = "BAPPA";

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
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 sm:p-6 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-4xl overflow-hidden rounded-[24px] bg-white shadow-2xl transition-all duration-500 ease-out ${
          isClosing ? "scale-95 translate-y-4" : "scale-100 translate-y-0"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-white backdrop-blur-md transition-all hover:bg-black/20 sm:bg-white/10 sm:text-white"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Scrollable content — capped to the viewport height (minus the
            outer wrapper's padding) with internal scroll, so on short mobile
            viewports the popup never overflows above/below the screen with
            no way to reach the close button or the CTA. */}
        <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:flex sm:max-h-[calc(100dvh-3rem)]">
          {/* Image Side */}
          <div className="relative h-36 w-full shrink-0 sm:h-auto sm:w-[45%]">
            <Image
              src="/images/bappa-1.webp"
              alt="Hand-painted Ganesha canvas artwork for Ganesh Chaturthi"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/5" />
          </div>

          {/* Content Side */}
          <div className="flex w-full flex-col justify-center p-6 text-[#1a1a1a] sm:p-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/10 px-3 py-1 text-[12px] font-bold uppercase tracking-widest text-[#D4AF37]">
              <Sparkles className="h-3.5 w-3.5" />
              Ganesh Chaturthi Special
            </div>

            <h2 className="mt-4 font-display text-[26px] leading-[1.1] text-[#1A1A1A] sm:mt-6 sm:text-[42px]">
              Bring Home <br />
              <span className="text-[#D4AF37]">Bappa&apos;s Blessings.</span>
            </h2>

            <p className="mt-4 text-[15px] leading-relaxed text-[#555555] sm:mt-6 sm:text-[18px]">
              This Ganesh Chaturthi, celebrate with a flat
              <span className="font-semibold text-[#1a1a1a]"> 20% off every order </span>
              — plus a complimentary gift with your purchase, on us.
            </p>

            <div className="mt-5 sm:mt-8">
              <p className="text-[13px] font-bold uppercase tracking-wider text-[#999999]">
                Use Coupon Code
              </p>
              <div className="mt-3 flex items-stretch gap-2">
                <div className="flex flex-1 items-center justify-between rounded-xl border border-dashed border-[#D4AF37] bg-[#FAF9F6] px-5 py-3 font-mono text-[18px] font-semibold tracking-wider text-[#1a1a1a]">
                  {COUPON_CODE}
                  <button
                    onClick={copyToClipboard}
                    className="ml-3 flex items-center gap-2 text-[14px] font-medium text-[#D4AF37] transition-colors hover:text-[#B8962E]"
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
              className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#1a1a1a] px-8 text-[16px] font-semibold text-white transition-all hover:bg-black hover:shadow-lg active:scale-[0.98] sm:mt-8"
            >
              Claim My 20% Off & Shop Now
            </button>

            <p className="mt-4 text-center text-[12px] text-[#999999]">
              Ganesh Chaturthi sale, live now through 14th September. Free Pan-India Shipping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
