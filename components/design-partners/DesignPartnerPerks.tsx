"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Percent, Zap, UserRound, Sparkles, FileText } from "lucide-react";

const PERKS = [
  {
    icon: Percent,
    title: "Trade Commission",
    text: "Earn commission on every referred project.",
  },
  {
    icon: Zap,
    title: "Priority Turnaround",
    text: "Priority scheduling on client commissions.",
  },
  {
    icon: UserRound,
    title: "Dedicated Contact",
    text: "A dedicated point of contact — no general inbox back-and-forth.",
  },
  {
    icon: Sparkles,
    title: "Early Access",
    text: "Early access to new collections for your mood boards.",
  },
  {
    icon: FileText,
    title: "Co-Branded Material",
    text: "Presentation material you can show clients directly.",
  },
];

const DesignPartnerPerks = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-[#efeeec] px-4 py-14 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="text-center font-display text-[28px] leading-[1.12] text-[#1f1f1f] sm:text-[36px] md:text-[44px]">
          What You Get as a Design Partner
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {PERKS.map(({ icon: Icon, title, text }, index) => (
            <motion.div
              key={title}
              initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.08 }}
              className="flex flex-col items-center text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#5b4f3f] shadow-[0_6px_16px_rgba(0,0,0,0.06)]">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-[17px] leading-[1.2] text-[#313131]">
                {title}
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-[#595959]">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DesignPartnerPerks;
