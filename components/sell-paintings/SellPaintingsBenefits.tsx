"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Palette, Truck, Wallet, Sparkles, ShieldCheck, Handshake } from "lucide-react";

const BENEFITS = [
  {
    icon: Palette,
    title: "Curated Audience of Real Art Buyers",
    text: "Your work is showcased directly to affluent homeowners, luxury interior architects, and art collectors across India, the USA, the UK, and the UAE.",
  },
  {
    icon: Truck,
    title: "Simple Transit & Tube Packaging",
    text: "No messy framing logistics. Ship rolled in sturdy PVC tubes to our Pune facility via insured courier (courier cost is borne by the artist), and we handle inspection, customer delivery, and everything after.",
  },
  {
    icon: Wallet,
    title: "Transparent, Prompt Payouts",
    text: "No hidden deductions, packaging penalties, or mysterious fees. What you quote is what you receive, transferred directly to your bank account within 7–10 days.",
  },
  {
    icon: Sparkles,
    title: "Featured Artist Branding",
    text: "We celebrate you. Every partner receives a verified profile on Artace Studio highlighting their inspirations, portfolio, and artistic vision.",
  },
  {
    icon: ShieldCheck,
    title: "100% Copyright Protection",
    text: "You retain complete intellectual property and moral rights to your original works. We only act as your authorized gallery partner.",
  },
  {
    icon: Handshake,
    title: "Bespoke Commission Opportunities",
    text: "In addition to ready paintings, gain access to high-ticket custom commission requests matched directly to your signature medium and style.",
  },
];

const SellPaintingsBenefits = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-[#efeeec] px-4 py-14 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-[820px] text-center"
        >
          <h2 className="font-display text-[28px] leading-[1.12] text-[#1f1f1f] sm:text-[36px] md:text-[44px]">
            Designed to Help Fine Artists Thrive
          </h2>
          <p className="mt-4 font-inter text-[15px] leading-7 text-[#595959] md:text-[17px]">
            We believe art is not mass-produced inventory. We treat every canvas
            with white-glove respect.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, text }, index) => (
            <motion.div
              key={title}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 18 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: (index % 3) * 0.1 }}
              className="flex flex-col rounded-[16px] border border-[#1f1f1f]/10 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 font-display text-[19px] leading-[1.25] text-[#313131] md:text-[21px]">
                {title}
              </h3>
              <p className="mt-3 font-inter text-[14px] leading-6 text-[#595959]">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SellPaintingsBenefits;