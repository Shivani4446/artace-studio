"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import SamoraGiftBoxIllustration from "@/components/samora/SamoraGiftBoxIllustration";

const STEPS = [
  { step: "Step 1", text: "Add your favorite products to cart" },
  { step: "Step 2", text: "Check final eligibility & price on cart page" },
  { step: "Step 3", text: "Write a personalised message (optional)" },
  { step: "Step 4", text: "Complete payment, checkout & voila!" },
];

const GIFT_BOX_DETAILS = [
  "The presents will be carefully wrapped in our signature butter paper.",
  "A printed card with your personalised message will also be enclosed in the packaging.",
  "In case of any returns or refunds, the cost of the gifting service will not be refunded.",
];

const SamoraGiftModal = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2b2420]/50 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-[24px] bg-[#fbf6ef] p-6 md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <SamoraGiftBoxIllustration className="h-[110px] w-[135px] shrink-0" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#2b2420]/15 text-[#2b2420] transition-colors hover:border-[#2b2420]/35"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#c1683d]">
          Make It a Gift
        </p>
        <h2 className="font-samora-display mt-2 text-[24px] leading-[1.15] text-[#2b2420] md:text-[28px]">
          In 4 simple steps
        </h2>

        <ol className="mt-6 space-y-4">
          {STEPS.map(({ step, text }, index) => (
            <li key={step} className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c1683d] text-[13px] font-semibold text-white">
                {index + 1}
              </span>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8a7c68]">
                  {step}
                </p>
                <p className="mt-0.5 text-[15px] leading-[1.5] text-[#2b2420]">{text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 border-t border-[#2b2420]/10 pt-6">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#c1683d]">
            Gift Box Details
          </p>
          <ol className="mt-3 space-y-2.5">
            {GIFT_BOX_DETAILS.map((detail, index) => (
              <li key={detail} className="flex gap-2.5 text-[14px] leading-[1.6] text-[#5c5344]">
                <span className="font-medium text-[#2b2420]">{index + 1}.</span>
                {detail}
              </li>
            ))}
          </ol>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#2b2420] px-6 py-3 text-[14.5px] font-medium text-white transition-colors hover:bg-[#1c1712]"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default SamoraGiftModal;
