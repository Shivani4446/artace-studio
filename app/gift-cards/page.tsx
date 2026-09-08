import type { Metadata } from "next";
import FAQSection, { type FAQItem } from "@/components/seo/FAQSection";
import GiftCardPurchaseForm from "@/components/gift-cards/GiftCardPurchaseForm";
import GiftCardBalanceChecker from "@/components/gift-cards/GiftCardBalanceChecker";
import { buildSiteUrl } from "@/lib/site";
import { PROGRAM_NAME } from "@/lib/gift-cards/constants";

export const metadata: Metadata = {
  title: `${PROGRAM_NAME} | Give the Gift of Original Art | Artace Studio`,
  description:
    "Buy an Artace Gift Card in ₹1,000, ₹2,500, ₹5,000, or ₹10,000 — delivered instantly by email, redeemable on any order, no expiry.",
  alternates: { canonical: buildSiteUrl("/gift-cards") },
};

const faqs: FAQItem[] = [
  { question: "How is my gift card delivered?", answer: "Instantly by email after purchase, and shown on the confirmation screen." },
  { question: "Does it expire?", answer: "No — an Artace Gift Card never expires." },
  { question: "Can I use it across multiple orders?", answer: "Yes — any unused balance carries forward for later use." },
  {
    question: "Can I combine it with Artace Rewards points or a coupon?",
    answer: "Yes — a gift card, Artace Rewards points, and a coupon code can all be applied to the same order.",
  },
  { question: "Can I get a refund on an unused gift card?", answer: "Gift card purchases are final and not refundable, used or not." },
];

export default function GiftCardsPage() {
  return (
    <main className="bg-[#f4f2ee] text-[#1f1f1f]">
      <section className="bg-[#1f1f1f] px-4 py-16 text-center text-white sm:px-6 md:px-12 md:py-24">
        <div className="mx-auto max-w-[860px]">
          <p className="font-inter text-[13px] uppercase tracking-[0.12em] text-white/60">{PROGRAM_NAME}</p>
          <h1 className="mt-4 font-display text-[36px] leading-[1.1] md:text-[56px]">Give the Gift of Original Art</h1>
          <p className="mt-5 text-white/80">Delivered instantly by email. No expiry. Redeemable on any order.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[700px] px-4 py-14 sm:px-6 md:px-12">
        <GiftCardPurchaseForm />
      </section>

      <section className="mx-auto max-w-[700px] px-4 pb-8 sm:px-6 md:px-12">
        <GiftCardBalanceChecker />
      </section>

      <FAQSection
        title="Gift Cards — Frequently Asked Questions"
        items={faqs}
        id="gift-cards-faq"
        className="mx-auto max-w-[1000px] px-4 pb-16 sm:px-6 md:px-12"
      />
    </main>
  );
}
