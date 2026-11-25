// Artist plan pricing — the single source of truth for the Sell Your Art page.
// The artist dashboard (dashboard.artacestudio.com, /api/public/plans) must
// charge exactly these base amounts; GST (18%) is added on top at checkout.
//
// Pricing ladder: yearly is the anchor price. Shorter terms cost more per
// month so the yearly plan is always the obvious best value:
//   6 months ≈ yearly/2 + 20%,  3 months ≈ yearly/4 + 40%,
// rounded to a ₹…49 / ₹…99 price point.

export type BillingPeriod = "quarterly" | "half_yearly" | "yearly";
export type PlanCode = "standard" | "premium";

export const BILLING_PERIODS: { id: BillingPeriod; label: string; months: number }[] = [
  { id: "quarterly", label: "3 months", months: 3 },
  { id: "half_yearly", label: "6 months", months: 6 },
  { id: "yearly", label: "Yearly", months: 12 },
];

/** Base prices in rupees, excluding GST. */
export const PLAN_PRICES_INR: Record<PlanCode, Record<BillingPeriod, number>> = {
  standard: { quarterly: 349, half_yearly: 599, yearly: 999 },
  premium: { quarterly: 649, half_yearly: 1149, yearly: 1899 },
};

export const GST_RATE = 0.18;

export const getMonths = (period: BillingPeriod) =>
  BILLING_PERIODS.find((p) => p.id === period)!.months;

export const pricePerMonth = (plan: PlanCode, period: BillingPeriod) =>
  PLAN_PRICES_INR[plan][period] / getMonths(period);

/** What a year costs if bought as repeated shorter terms. */
export const annualCostOf = (plan: PlanCode, period: BillingPeriod) =>
  PLAN_PRICES_INR[plan][period] * (12 / getMonths(period));

/** Rupees saved per year by choosing yearly over `period`. */
export const yearlySavingsVs = (plan: PlanCode, period: BillingPeriod) =>
  Math.round(annualCostOf(plan, period) - PLAN_PRICES_INR[plan].yearly);

/** Percentage saved by choosing yearly over `period` (whole number). */
export const yearlySavingsPercentVs = (plan: PlanCode, period: BillingPeriod) =>
  Math.floor((yearlySavingsVs(plan, period) / annualCostOf(plan, period)) * 100);

/** Best headline saving across plans (yearly vs 3 months). */
export const MAX_YEARLY_SAVINGS_PERCENT = Math.max(
  yearlySavingsPercentVs("standard", "quarterly"),
  yearlySavingsPercentVs("premium", "quarterly")
);

export const formatInr = (value: number) =>
  `₹${Math.round(value).toLocaleString("en-IN")}`;
