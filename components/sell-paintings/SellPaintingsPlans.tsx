"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Crown } from "lucide-react";

type Plan = {
  name: string;
  price: string;
  period: string;
  headline: string;
  features: string[];
  isPremium?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Standard",
    price: "₹999",
    period: "/ year",
    headline: "Everything you need to sell your originals online",
    features: [
      "Verified artist profile & portfolio page",
      "Unlimited original artwork listings",
      "Flat 30% commission (you keep 70%)",
      "Doorstep-to-Pune insured delivery guidance",
      "Payouts within 7–10 business days",
      "Standard curation & listing turnaround",
    ],
  },
  {
    name: "Premium",
    price: "₹1,899",
    period: "/ year",
    headline: "The competitive advantage for serious artists",
    features: [
      "Everything in Standard, plus:",
      "Digital print uploads & sales of your originals",
      "Featured & banner placement across our storefront",
      "Faster curation & listing turnaround",
      "Faster payout timelines",
      "Dedicated artist support",
    ],
    isPremium: true,
  },
];

const SellPaintingsPlans = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-[#f4f2ee] px-4 py-14 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1080px]">
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-[820px] text-center"
        >
          <h2 className="font-display text-[28px] leading-[1.12] text-[#1f1f1f] sm:text-[36px] md:text-[44px]">
            Simple Annual Plans. No Hidden Fees.
          </h2>
          <p className="mt-4 font-inter text-[15px] leading-7 text-[#595959] md:text-[17px]">
            A small annual plan keeps our gallery free of listing paywalls and
            surprise deductions. Upgrade to Premium to fast-track your growth.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 18 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className={`flex flex-col rounded-[18px] border p-7 md:p-8 ${
                plan.isPremium
                  ? "border-[#B8860B]/40 bg-[#1f1f1f] text-white shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
                  : "border-[#1f1f1f]/10 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-display text-[20px] leading-[1.2] ${
                    plan.isPremium ? "text-[#E6C46A]" : "text-[#1f1f1f]"
                  }`}
                >
                  {plan.name}
                </span>
                {plan.isPremium ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B8860B]/50 bg-[#B8860B]/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[#E6C46A]">
                    <Crown className="h-3.5 w-3.5" /> Popular
                  </span>
                ) : null}
              </div>

              <div className="mt-4 flex items-end gap-1">
                <span
                  className={`font-display text-[44px] leading-none ${
                    plan.isPremium ? "text-white" : "text-[#B8860B]"
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`mb-1 font-inter text-[14px] ${
                    plan.isPremium ? "text-white/60" : "text-[#8a8478]"
                  }`}
                >
                  {plan.period}
                </span>
              </div>
              <p
                className={`mt-3 font-inter text-[14px] leading-6 ${
                  plan.isPremium ? "text-white/75" : "text-[#595959]"
                }`}
              >
                {plan.headline}
              </p>

              <ul className="mt-6 flex flex-col gap-3">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={feature}
                    className={`flex gap-2.5 font-inter text-[14px] leading-6 ${
                      featureIndex === 0 && plan.isPremium
                        ? plan.isPremium
                          ? "font-semibold text-[#E6C46A]"
                          : "font-semibold text-[#B8860B]"
                        : plan.isPremium
                          ? "text-white/85"
                          : "text-[#595959]"
                    }`}
                  >
                    <Check
                      className="mt-1 h-4 w-4 shrink-0 text-[#B8860B]"
                      strokeWidth={2.25}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={shouldReduceMotion ? undefined : { opacity: 0 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 text-center font-inter text-[13px] leading-6 text-[#8a8478]"
        >
          Plans are billed annually. Your application and the artwork
          curation review remain free — the plan is activated only for
          approved artist partners.
        </motion.p>
      </div>
    </section>
  );
};

export default SellPaintingsPlans;