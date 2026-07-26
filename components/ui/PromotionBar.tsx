import React from "react";

const PromotionBar = () => {
  return (
    <div className="flex h-9 w-full items-center justify-center bg-[#1a1a1a] px-4 text-white">
      <p className="truncate text-[12px] sm:text-[14px]">
        <span className="font-semibold text-[#D4AF37]">Ganesh Chaturthi Special</span>
        {" — "}Flat 20% Off + A Free Gift on Every Order. Use Code{" "}
        <span className="font-semibold tracking-wide">BAPPA</span>
      </p>
    </div>
  );
};

export default PromotionBar;
