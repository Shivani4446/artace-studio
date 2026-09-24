import React from "react";

const FESTIVE_TEXT = "Festive offer";

const AnnouncementItem = () => (
  <span className="mx-4 inline-flex items-center gap-3 whitespace-nowrap">
    <span className="text-[#D4AF37]">✦</span>
    <span className="text-[12px] font-semibold uppercase tracking-[0.18em] sm:text-[13px]">
      {FESTIVE_TEXT}
    </span>
  </span>
);

const PromotionBar = () => {
  return (
    <div className="flex h-9 w-full overflow-hidden bg-black text-white">
      <div className="flex w-max animate-[marquee_14s_linear_infinite] items-center">
        <div className="flex items-center">
          {Array.from({ length: 8 }, (_, index) => (
            <AnnouncementItem key={index} />
          ))}
        </div>
        <div className="flex items-center" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <AnnouncementItem key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionBar;