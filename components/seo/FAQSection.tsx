"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQSectionProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  items: FAQItem[];
  id?: string;
  className?: string;
};

const FAQSection = ({
  eyebrow = "FAQ",
  title,
  intro,
  items,
  id,
  className = "bg-[#f4f2ee] py-10 md:py-[90px]",
}: FAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <section id={id} className={className}>
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="max-w-[980px]">
          <p className="text-[16px] leading-[1.5] text-[#767676] md:text-[18px]">
            {eyebrow}
          </p>
          <h2 className="mt-4 font-display text-[30px] leading-[1.08] text-[#1f1f1f] sm:text-[34px] md:mt-5 md:text-[48px]">
            {title}
          </h2>
          {intro ? (
            <p className="mt-4 max-w-[760px] text-[16px] leading-[1.7] text-[#5b5b5b] sm:text-[17px] md:mt-5 md:text-[20px]">
              {intro}
            </p>
          ) : null}
        </div>

        <div className="mt-8 grid gap-x-14 md:mt-10 md:grid-cols-2">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <article
                key={item.question}
                className="border-b border-[#1f1f1f]/10 py-4 md:py-5"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 py-1 text-left"
                >
                  <h3 className="font-inter text-[15px] font-medium leading-snug text-[#1f1f1f] md:text-[16px]">
                    {item.question}
                  </h3>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#1f1f1f]/40 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    strokeWidth={1.75}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pt-1 pb-2 text-[14px] leading-relaxed text-[#6f685f] md:text-[15px]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export type { FAQItem };
export default FAQSection;
