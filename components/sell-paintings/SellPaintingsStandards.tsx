"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

const ACCEPTED = [
  {
    text: "Oil on canvas/linen, acrylic on canvas, mixed media, and high-grade watercolor on 300+ GSM archival paper.",
    strong: "Mediums:",
  },
  {
    text: "Abstract, modern, contemporary, traditional Indian (Radha Krishna, Buddha, Ganesha, Warli, Pichwai), landscapes, figurative, and cityscapes.",
    strong: "Genres:",
  },
  {
    text: "100% original, handcrafted, signed by the artist, and shipped in rolled canvas format (unframed) in protective tubes.",
    strong: "Condition:",
  },
  {
    text: "Comes with your signed Certificate of Authenticity (Artace provides the template).",
    strong: "Authenticity:",
  },
];

const NOT_ACCEPTED = [
  {
    text: "Stock photo prints, machine-made digital art printed on canvas, or AI-generated artwork.",
  },
  {
    text: "Artworks with fragile glass or unsealed charcoal/chalk pastels prone to transit smudge.",
  },
  {
    text: "Plagiarized copies or reproductions of other living artists' intellectual property.",
  },
  {
    text: "Incomplete works or pieces with wet paint requiring curing time.",
  },
];

const SellPaintingsStandards = () => {
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
            What Artwork Do We Curate?
          </h2>
          <p className="mt-4 font-inter text-[15px] leading-7 text-[#595959] md:text-[17px]">
            We cater to connoisseurs of authentic, handcrafted visual art.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 18 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="rounded-[18px] border border-[#1f1f1f]/10 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.04)] md:p-8"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-[#B8860B]" strokeWidth={1.75} />
              <h3 className="font-display text-[20px] leading-[1.2] text-[#1f1f1f] md:text-[22px]">
                Accepted Mediums & Formats
              </h3>
            </div>
            <ul className="mt-5 space-y-4">
              {ACCEPTED.map((item) => (
                <li key={item.strong} className="flex gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7D32]"
                    strokeWidth={2}
                  />
                  <p className="font-inter text-[14px] leading-6 text-[#595959]">
                    <strong className="font-semibold text-[#313131]">{item.strong}</strong>{" "}
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 18 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="rounded-[18px] border border-[#1f1f1f]/10 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.04)] md:p-8"
          >
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-[#99938a]" strokeWidth={1.75} />
              <h3 className="font-display text-[20px] leading-[1.2] text-[#1f1f1f] md:text-[22px]">
                Not Accepted on Artace Studio
              </h3>
            </div>
            <ul className="mt-5 space-y-4">
              {NOT_ACCEPTED.map((item) => (
                <li key={item.text} className="flex gap-2">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#99938a]" strokeWidth={2} />
                  <p className="font-inter text-[14px] leading-6 text-[#595959]">{item.text}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SellPaintingsStandards;