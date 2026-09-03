"use client";

import React from "react";
import ArtieMascot from "./ArtieMascot";

const SUGGESTION_CHIPS = [
  "Check what's New",
  "Order Landscape Paintings",
  "Order Custom Portraits",
  "Ganapati Painting",
  "Radha Krishna",
  "Abstract Paintings",
];

type Props = {
  onChipSelect: (text: string) => void;
};

const ChatHomeTab = ({ onChipSelect }: Props) => (
  <div className="flex-1 overflow-y-auto px-4 py-5">
    <div className="flex items-center gap-3">
      <ArtieMascot variant="greeting" size={44} className="h-11 w-11 shrink-0" />
      <div>
        <p className="font-display text-[20px] leading-snug text-[#1f1f1f]">Hi, I&apos;m Artie 👋</p>
        <p className="mt-1 text-[14px] text-[#65635d]">What would you like help with?</p>
      </div>
    </div>

    <div className="mt-5 flex flex-wrap gap-2">
      {SUGGESTION_CHIPS.map((chip) => (
        <button
          key={chip}
          type="button"
          onClick={() => onChipSelect(chip)}
          className="rounded-full border border-[#1f1f1f]/15 bg-white px-3 py-1.5 text-[12px] font-medium text-[#1f1f1f] transition-colors hover:border-[#1f1f1f]/35 hover:bg-[#ece8df]"
        >
          {chip}
        </button>
      ))}
    </div>
  </div>
);

export default ChatHomeTab;
