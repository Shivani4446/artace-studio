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

        <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-2 md:gap-5">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <article
                key={item.question}
                className="rounded-[14px] border border-[#1f1f1f]/10 bg-white p-5 shadow-[0_10px_24px_rgba(0,0,0,0.04)] md:p-6"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 text-left md:cursor-default"
                >
                  <h3 className="font-display text-[22px] leading-[1.2] text-[#1f1f1f] md:text-[26px]">
                    {item.question}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#1f1f1f]/50 transition-transform duration-300 md:hidden ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    strokeWidth={1.75}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out md:grid-rows-[1fr] ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pt-3 text-[15px] leading-7 text-[#4f4b45] md:text-[16px]">
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
