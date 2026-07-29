"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

type SamoraFAQSectionProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  items: readonly FAQItem[];
  id?: string;
};

const SamoraFAQSection = ({
  eyebrow = "FAQ",
  title,
  intro,
  items,
  id,
}: SamoraFAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <section id={id} className="bg-[#f3ead9] py-16 md:py-24">
      <div className="mx-auto max-w-[1320px] px-5 md:px-10">
        <div className="max-w-[720px]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c1683d]">
            {eyebrow}
          </p>
          <h2 className="font-samora-display mt-4 text-[32px] leading-[1.12] text-[#2b2420] sm:text-[38px] md:text-[46px]">
            {title}
          </h2>
          {intro ? (
            <p className="mt-4 text-[16px] leading-[1.7] text-[#5c5344] md:text-[17px]">{intro}</p>
          ) : null}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-5">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <article
                key={item.question}
                className="rounded-[16px] border border-[#2b2420]/10 bg-[#fbf6ef] p-5 md:p-6"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <h3 className="text-[16.5px] font-semibold leading-[1.3] text-[#2b2420] md:text-[17.5px]">
                    {item.question}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#2b2420]/50 transition-transform duration-300 ${
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
                    <p className="pt-3 text-[14.5px] leading-[1.7] text-[#5c5344] md:text-[15.5px]">
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

export default SamoraFAQSection;
