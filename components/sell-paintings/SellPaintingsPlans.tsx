"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, Crown, Sparkles, TrendingDown } from "lucide-react";
import { ARTIST_DASHBOARD_LINKS, withDashboardUtm } from "@/lib/artists/dashboard";
import {
  BILLING_PERIODS,
  MAX_YEARLY_SAVINGS_PERCENT,
  PLAN_PRICES_INR,
  formatInr,
  getMonths,
  pricePerMonth,
  yearlySavingsPercentVs,
  yearlySavingsVs,
  type BillingPeriod,
  type PlanCode,
} from "@/lib/artists/plans";

type Plan = {
  code: PlanCode;
  name: string;
  headline: string;
  features: string[];
  isPremium?: boolean;
};

// Feature lists mirror the plans in the artist dashboard
// (dashboard.artacestudio.com/api/public/plans).
const PLANS: Plan[] = [
  {
    code: "standard",
    name: "Standard",
    headline: "Everything you need to sell your originals online",
    features: [
      "Verified artist profile & portfolio page",
      "Unlimited original artwork listings",
      "Flat 30% commission (you keep 70%)",
      "Curation within 48 hours",
      "Monthly payouts after delivery & inspection",
      "Full artist dashboard with Artie, your AI assistant",
    ],
  },
  {
    code: "premium",
    name: "Premium",
    headline: "The competitive advantage for serious artists",
    features: [
      "Everything in Standard, plus:",
      "Digital print uploads & sales of your originals",
      "Featured & banner placement across our storefront",
      "Faster curation, within 24 hours",
      "Request payouts any time",
      "Dedicated artist support",
    ],
    isPremium: true,
  },
];

const periodSuffix: Record<BillingPeriod, string> = {
  quarterly: "/ 3 months",
  half_yearly: "/ 6 months",
  yearly: "/ year",
};

// Hand-drawn arrow: starts under the "Save" tag (top right) and curves down
// and left into the Yearly option of the toggle.
const CurlyArrow = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 48" fill="none" aria-hidden="true" className={className}>
    <path
      d="M58 4 C 44 4, 22 10, 12 40"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeDasharray="3 4"
    />
    <path
      d="M20 35 L 12 41 L 9.5 31.5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BillingToggle = ({
  value,
  onChange,
}: {
  value: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
}) => (
  <div className="relative mx-auto mt-10 flex w-fit flex-col items-center">
    {/* Savings tag + arrow, anchored over the Yearly option */}
    <div className="pointer-events-none absolute -right-[150px] -top-9 hidden w-[190px] sm:block">
      <span className="absolute right-0 top-0 rotate-[4deg] whitespace-nowrap rounded-full bg-[#1f1f1f] px-3 py-1 font-inter text-[12px] font-semibold text-[#E6C46A] shadow-md">
        Save up to {MAX_YEARLY_SAVINGS_PERCENT}%
      </span>
      <CurlyArrow className="absolute -left-3 top-4 h-14 w-20 text-[#B8860B]" />
    </div>

    <div
      role="radiogroup"
      aria-label="Billing period"
      className="relative flex rounded-full border border-[#1f1f1f]/10 bg-white p-1 shadow-[0_6px_20px_rgba(0,0,0,0.05)]"
    >
      {BILLING_PERIODS.map((period) => {
        const isActive = value === period.id;
        return (
          <button
            key={period.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(period.id)}
            className={`relative z-10 rounded-full px-4 py-2.5 font-inter text-[14px] font-medium transition-colors sm:px-6 ${
              isActive ? "text-white" : "text-[#595959] hover:text-[#1f1f1f]"
            }`}
          >
            {isActive ? (
              <motion.span
                layoutId="billing-pill"
                className="absolute inset-0 -z-10 rounded-full bg-[#1f1f1f]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="flex items-center gap-1.5">
              {period.label}
              {period.id === "yearly" ? (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10.5px] font-bold ${
                    isActive ? "bg-[#E6C46A] text-[#1f1f1f]" : "bg-[#B8860B]/15 text-[#8a6410]"
                  }`}
                >
                  Best value
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>

    {/* Mobile: savings tag under the toggle */}
    <span className="mt-3 rounded-full bg-[#1f1f1f] px-3 py-1 font-inter text-[12px] font-semibold text-[#E6C46A] sm:hidden">
      Save up to {MAX_YEARLY_SAVINGS_PERCENT}% with yearly
    </span>
  </div>
);

const SellPaintingsPlans = () => {
  const shouldReduceMotion = useReducedMotion();
  const [period, setPeriod] = useState<BillingPeriod>("yearly");

  return (
    <section id="artist-plans" className="w-full scroll-mt-24 bg-[#f4f2ee] px-4 py-14 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1080px]">
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-[820px] text-center"
        >
          <h2 className="font-display text-[28px] leading-[1.12] text-[#1f1f1f] sm:text-[36px] md:text-[44px]">
            Simple Plans. No Hidden Fees.
          </h2>
          <p className="mt-4 font-inter text-[15px] leading-7 text-[#595959] md:text-[17px]">
            Start with 3 or 6 months, or go yearly and save the most. No listing paywalls,
            no surprise deductions: the only cut on a sale is our flat 30% commission.
          </p>
        </motion.div>

        <BillingToggle value={period} onChange={setPeriod} />

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {PLANS.map((plan, index) => {
            const price = PLAN_PRICES_INR[plan.code][period];
            const perMonth = pricePerMonth(plan.code, period);
            const isYearly = period === "yearly";
            const savingPctVsQuarterly = yearlySavingsPercentVs(plan.code, "quarterly");
            const savingVsCurrent = isYearly ? 0 : yearlySavingsVs(plan.code, period);
            const savingPctVsCurrent = isYearly ? 0 : yearlySavingsPercentVs(plan.code, period);

            return (
              <motion.div
                key={plan.code}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 18 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className={`relative flex flex-col rounded-[18px] border p-7 md:p-8 ${
                  plan.isPremium
                    ? "border-[#B8860B]/40 bg-[#1f1f1f] text-white shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
                    : "border-[#1f1f1f]/10 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
                }`}
              >
                {/* Yearly ribbon */}
                <AnimatePresence>
                  {isYearly ? (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 380, damping: 22 }}
                      className="absolute -top-3.5 right-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#B8860B] to-[#E6C46A] px-3 py-1 font-inter text-[12px] font-bold text-[#1f1f1f] shadow-[0_6px_16px_rgba(184,134,11,0.35)]"
                    >
                      <TrendingDown className="h-3.5 w-3.5" />
                      Save {savingPctVsQuarterly}% vs 3-month billing
                    </motion.span>
                  ) : null}
                </AnimatePresence>

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

                <div className="mt-4 flex items-end gap-2">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={`${plan.code}-${period}`}
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
                      transition={{ duration: 0.25 }}
                      className={`font-display text-[44px] leading-none ${
                        plan.isPremium ? "text-white" : "text-[#B8860B]"
                      }`}
                    >
                      {formatInr(price)}
                    </motion.span>
                  </AnimatePresence>
                  <span
                    className={`mb-1 font-inter text-[14px] ${
                      plan.isPremium ? "text-white/60" : "text-[#8a8478]"
                    }`}
                  >
                    {periodSuffix[period]} + GST
                  </span>
                </div>

                <p
                  className={`mt-2 font-inter text-[13.5px] ${
                    plan.isPremium ? "text-white/60" : "text-[#8a8478]"
                  }`}
                >
                  {isYearly ? (
                    <>
                      Just <span className={plan.isPremium ? "text-white" : "text-[#1f1f1f]"}>{formatInr(perMonth)}/month</span>, billed once a year
                    </>
                  ) : (
                    <>
                      {formatInr(perMonth)}/month for {getMonths(period)} months
                    </>
                  )}
                </p>

                {/* Nudge towards yearly on shorter terms */}
                {!isYearly ? (
                  <button
                    type="button"
                    onClick={() => setPeriod("yearly")}
                    className={`mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-left font-inter text-[13px] font-medium transition-colors ${
                      plan.isPremium
                        ? "bg-[#E6C46A]/15 text-[#E6C46A] hover:bg-[#E6C46A]/25"
                        : "bg-[#B8860B]/10 text-[#8a6410] hover:bg-[#B8860B]/20"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    Go yearly and save {formatInr(savingVsCurrent)} ({savingPctVsCurrent}%)
                  </button>
                ) : null}

                <p
                  className={`mt-4 font-inter text-[14px] leading-6 ${
                    plan.isPremium ? "text-white/75" : "text-[#595959]"
                  }`}
                >
                  {plan.headline}
                </p>

                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={feature}
                      className={`flex gap-2.5 font-inter text-[14px] leading-6 ${
                        featureIndex === 0 && plan.isPremium
                          ? "font-semibold text-[#E6C46A]"
                          : plan.isPremium
                            ? "text-white/85"
                            : "text-[#595959]"
                      }`}
                    >
                      <Check className="mt-1 h-4 w-4 shrink-0 text-[#B8860B]" strokeWidth={2.25} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Plans are chosen and paid for in the artist dashboard after
                    the application is submitted and the email verified. */}
                <a
                  href={withDashboardUtm(ARTIST_DASHBOARD_LINKS.apply, `plan-${plan.code}-${period}`)}
                  className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[12px] px-6 py-3 font-inter text-[15px] font-medium transition-colors ${
                    plan.isPremium
                      ? "bg-[#E6C46A] text-[#1f1f1f] hover:bg-[#f0d48a]"
                      : "bg-[#1f1f1f] text-white hover:bg-black"
                  }`}
                >
                  Apply for {plan.name}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={shouldReduceMotion ? undefined : { opacity: 0 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 text-center font-inter text-[13px] leading-6 text-[#8a8478]"
        >
          Prices exclude 18% GST. You choose your plan and pay securely in the Artace artist
          dashboard after applying; your application and the curation review are free.
        </motion.p>
      </div>
    </section>
  );
};

export default SellPaintingsPlans;
