"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Eye, Ruler, Heart, Truck } from "lucide-react";

const WHY_US = [
  {
    icon: Eye,
    title: "No guesswork",
    text: "Client approves the concept and palette before we paint.",
  },
  {
    icon: Ruler,
    title: "No mismatch risk",
    text: "Every piece is built around your interior scheme, not picked off a shelf.",
  },
  {
    icon: Heart,
    title: "No client hesitation",
    text: "Handcrafted, original work justifies itself.",
  },
  {
    icon: Truck,
    title: "No delivery stress",
    text: "We handle packaging and white-glove delivery end to end.",
  },
];

const DesignPartnerWhyUs = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-[#f4f2ee] px-4 py-14 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="text-center font-display text-[28px] leading-[1.12] text-[#1f1f1f] sm:text-[36px] md:text-[44px]">
          Why Designers Partner With Us
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_US.map(({ icon: Icon, title, text }, index) => (
            <motion.div
              key={title}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-[19px] leading-[1.2] text-[#313131]">
                {title}
              </h3>
              <p className="mt-2 text-[14px] leading-6 text-[#595959]">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DesignPartnerWhyUs;
