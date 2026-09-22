"use client";

import { motion, useReducedMotion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Apply & Submit 3 Works",
    text: "Fill out our simple application form below with images of 3 original, completed paintings that reflect your artistic style.",
  },
  {
    number: "02",
    title: "Curation Review (24–48 Hrs)",
    text: "Our curatorial panel reviews your artwork for craft, original composition, and surface quality. Once approved, your seller portal is activated.",
  },
  {
    number: "03",
    title: "Artwork Listed & Promoted",
    text: "You set your reserve price. We list your portfolio across curated collections and market your work through search, social, and designer networks.",
  },
{
    number: "04",
    title: "Insured Delivery & Payment",
    text: "When an artwork sells, roll and pack it into a secure tube and send it via insured courier to our Pune facility (courier charges are the artist's responsibility). Once inspected and delivered, your earnings are transferred within 7–10 days.",
  },
];

const SellPaintingsProcess = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-[#f4f2ee] px-4 py-14 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-[820px] text-center"
        >
          <h2 className="font-display text-[28px] leading-[1.12] text-[#1f1f1f] sm:text-[36px] md:text-[44px]">
            How Selling on Artace Studio Works
          </h2>
          <p className="mt-4 font-inter text-[15px] leading-7 text-[#595959] md:text-[17px]">
            From submission to your first sale in four clear steps.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 18 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="relative rounded-[16px] border border-[#1f1f1f]/10 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
            >
              <span className="font-display text-[40px] leading-none text-[#B8860B]/80">
                {step.number}
              </span>
              <h3 className="mt-4 font-display text-[18px] leading-[1.25] text-[#1f1f1f] md:text-[20px]">
                {step.title}
              </h3>
              <p className="mt-3 font-inter text-[14px] leading-6 text-[#595959]">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SellPaintingsProcess;