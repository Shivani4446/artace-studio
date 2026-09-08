import type { Metadata } from "next";
import Link from "next/link";
import FAQSection, { type FAQItem } from "@/components/seo/FAQSection";
import { buildSiteUrl } from "@/lib/site";
import { PROGRAM_NAME, MIN_REDEMPTION_POINTS, POINT_VALUE_INR } from "@/lib/rewards/constants";

export const metadata: Metadata = {
  title: `${PROGRAM_NAME} | Earn Points on Every Order | Artace Studio`,
  description: `Earn 1 point per ₹100 you spend at Artace Studio, and redeem points for real discounts on future orders — ${PROGRAM_NAME} explained.`,
  alternates: {
    canonical: buildSiteUrl("/rewards"),
  },
};

const faqs: FAQItem[] = [
  {
    question: "How do I earn points?",
    answer: `You earn 1 point for every ₹100 you spend on a completed order — no exclusions, every order qualifies.`,
  },
  {
    question: "How much is a point worth?",
    answer: `Each point is worth ₹1 when redeemed, once you have at least ${MIN_REDEMPTION_POINTS} points.`,
  },
  {
    question: "Do points expire?",
    answer: "No — your points don't expire.",
  },
  {
    question: "Can I use points and a coupon on the same order?",
    answer: "Yes — Artace Rewards points and a coupon code can both be applied to the same order.",
  },
  {
    question: "What happens to my points if I return an order?",
    answer: "If an order is refunded or cancelled, the points it earned (or that were redeemed on it) are automatically reversed.",
  },
];

export default function RewardsPage() {
  return (
    <main className="bg-[#f4f2ee] text-[#1f1f1f]">
      <section className="bg-[#1f1f1f] px-4 py-16 text-center text-white sm:px-6 md:px-12 md:py-24">
        <div className="mx-auto max-w-[860px]">
          <p className="font-inter text-[13px] uppercase tracking-[0.12em] text-white/60">
            {PROGRAM_NAME}
          </p>
          <h1 className="mt-4 font-display text-[36px] leading-[1.1] md:text-[56px]">
            Earn Rewards on Every Order
          </h1>
          <p className="mt-5 text-white/80">
            Every purchase earns you real points, worth real discounts on your next one.
          </p>
          <Link
            href="/dashboard/rewards"
            className="mt-8 inline-flex items-center justify-center rounded-[12px] bg-white px-7 py-3 text-[16px] font-medium text-[#1a1a1a] transition-colors hover:bg-white/90"
          >
            View Your Rewards
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1000px] px-4 py-14 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="rounded-[18px] bg-white p-6">
            <p className="font-inter text-[13px] font-medium uppercase tracking-[0.14em] text-[#7b746a]">
              Earning
            </p>
            <p className="mt-3 font-display text-[22px]">1 point per ₹100 spent</p>
            <p className="mt-2 text-[15px] text-[#595959]">
              Every completed order earns points on its full amount.
            </p>
          </div>
          <div className="rounded-[18px] bg-white p-6">
            <p className="font-inter text-[13px] font-medium uppercase tracking-[0.14em] text-[#7b746a]">
              Redeeming
            </p>
            <p className="mt-3 font-display text-[22px]">1 point = ₹{POINT_VALUE_INR} off</p>
            <p className="mt-2 text-[15px] text-[#595959]">
              Redeem any time once you have {MIN_REDEMPTION_POINTS}+ points, right at checkout.
            </p>
          </div>
        </div>
      </section>

      <FAQSection
        title="Artace Rewards — Frequently Asked Questions"
        items={faqs}
        id="rewards-faq"
        className="mx-auto max-w-[1000px] px-4 pb-16 sm:px-6 md:px-12"
      />
    </main>
  );
}
