"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import SamoraGiftModal from "@/components/samora/SamoraGiftModal";

type SamoraGiftOptionProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
};

const SamoraGiftOption = ({ checked, onChange }: SamoraGiftOptionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3 rounded-[14px] border border-[#2b2420]/10 bg-[#f3ead9] px-4 py-3.5">
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 accent-[#c1683d]"
        />
        <span className="inline-flex items-center gap-2 text-[14.5px] font-medium text-[#2b2420]">
          <Gift className="h-4 w-4 text-[#c1683d]" strokeWidth={1.75} />
          Make it a gift
        </span>
      </label>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="shrink-0 text-[13px] font-medium text-[#c1683d] underline underline-offset-4 hover:text-[#a8552f]"
      >
        Learn more
      </button>
      {isModalOpen ? <SamoraGiftModal onClose={() => setIsModalOpen(false)} /> : null}
    </div>
  );
};

export default SamoraGiftOption;
