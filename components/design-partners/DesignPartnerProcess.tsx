"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { MessageCircle, PenTool, Palette, Paintbrush, PackageCheck } from "lucide-react";

const PROCESS_STEPS = [
  {
    icon: MessageCircle,
    title: "Vision Consultation",
    description: "We align with you and your client on space, mood, and palette.",
  },
  {
    icon: PenTool,
    title: "Sketch & Concept Approval",
    description: "You and your client see it before it's painted.",
  },
  {
    icon: Palette,
    title: "Palette Confirmation",
    description: "Matched to your interior scheme, not ours.",
  },
  {
    icon: Paintbrush,
    title: "Creation with Updates",
    description: "Milestone check-ins throughout, no surprises.",
  },
  {
    icon: PackageCheck,
    title: "Final Reveal & Delivery",
    description: "White-glove packaging, ready to install.",
  },
] as const;

const DesignPartnerProcess = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.8", "end 0.5"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="process" className="w-full bg-[#efeeec] px-4 py-14 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[720px]">
        <h2 className="text-center font-display text-[28px] leading-[1.12] text-[#1f1f1f] sm:text-[36px] md:text-[44px]">
          A Process Built to Fit Your Project Timeline
        </h2>

        <div ref={timelineRef} className="relative mt-12 md:mt-16">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-black/10 md:left-[23px]" />
          {!shouldReduceMotion && (
            <motion.div
              style={{ height: lineHeight }}
              className="absolute left-[19px] top-2 w-px bg-[#2f2f2f] md:left-[23px]"
            />
          )}

          <ol className="flex flex-col gap-10 md:gap-12">
            {PROCESS_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.title}
                  initial={shouldReduceMotion ? undefined : { opacity: 0, x: -16 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                  className="relative flex items-start gap-5 md:gap-6"
                >
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2f2f2f]/15 bg-[#efeeec] font-display text-[15px] text-[#2f2f2f] md:h-12 md:w-12 md:text-[17px]">
                    {index + 1}
                  </span>
                  <div className="pt-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[#2f2f2f]/70" strokeWidth={1.75} />
                      <h3 className="font-display text-[19px] leading-[1.2] text-[#1f1f1f] md:text-[22px]">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-2 max-w-md font-inter text-[14px] leading-[1.6] text-[#5b5b5b] md:text-[15px]">
                      {step.description}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default DesignPartnerProcess;
