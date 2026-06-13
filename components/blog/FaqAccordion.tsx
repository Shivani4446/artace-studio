"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/utils/article";

type Props = {
  items: FaqItem[];
};

export default function FaqAccordion({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items || items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[760px] mt-12 md:mt-16">
      <h2 className="font-display text-[32px] leading-[1.08] tracking-[-0.01em] text-[#232426] mb-8">
        Frequently Asked Questions
      </h2>
      <div className="divide-y divide-[#1f1f1f]/10 border-t border-b border-[#1f1f1f]/10">
        {items.map((item, index) => (
          <FaqItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </section>
  );
}

function FaqItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [item]);

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-[#1c1d1f]"
        aria-expanded={isOpen}
      >
        <span className="font-display text-[18px] leading-[1.4] text-[#1c1d1f] pr-4">
          {item.question}
        </span>
        <ChevronDown
          className={`shrink-0 w-5 h-5 text-[#6b6962] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? contentHeight : 0,
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="pb-5">
          <p className="text-[15px] leading-[1.7] text-[#65635d]">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}
