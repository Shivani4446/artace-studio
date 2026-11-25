"use client";

import React from "react";
import { OPEN_PROMOTION_EVENT } from "./promotion";

// Evergreen offer shown on every page. Static (no marquee) so it reads at a
// glance. The code itself stays lead-gated: "Get your code" opens the
// PromotionModal, which reveals it after email + phone.
const PromotionBar = () => {
  const openPromotion = () => {
    window.dispatchEvent(new Event(OPEN_PROMOTION_EVENT));
  };

  return (
    <div className="flex min-h-9 w-full items-center justify-center bg-black px-4 py-1.5 text-center text-white">
      <p className="text-[12px] font-medium tracking-[0.06em] sm:text-[13px]">
        <span className="font-semibold text-[#D4AF37]">15% off every order</span>
        <span className="hidden sm:inline">
          <span className="mx-2 text-white/40" aria-hidden="true">
            ·
          </span>
          Free Pan-India Shipping
        </span>
        <span className="mx-2 text-white/40" aria-hidden="true">
          ·
        </span>
        <button
          type="button"
          onClick={openPromotion}
          className="font-semibold underline underline-offset-4 transition-colors hover:text-[#D4AF37]"
        >
          Get your code
        </button>
      </p>
    </div>
  );
};

export default PromotionBar;
