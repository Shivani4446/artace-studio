import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Percent,
  Clock,
  Wallet,
  Gift,
  Headset,
  Share2,
} from "lucide-react";
import FAQSection, { type FAQItem } from "@/components/seo/FAQSection";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Affiliate Program India | Earn Commission Promoting Handmade Art | Artace Studio",
  description:
    "Join Artace Studio's affiliate program and earn 10% commission on every sale you refer. Free to join, 60-day tracking cookie, get paid via UPI or bank transfer — built for India, open worldwide.",
  alternates: {
    canonical: buildSiteUrl("/affiliates"),
  },
  openGraph: {
    title: "Affiliate Program India | Artace Studio",
    description: "Earn 10% commission promoting handmade Indian art. Free to join.",
    url: buildSiteUrl("/affiliates"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Affiliate Program India | Artace Studio",
    description: "Earn 10% commission promoting handmade Indian art. Free to join.",
  },
};

const BENEFITS = [
  {
    icon: Percent,
    title: "10% Commission",
    text: "Earn 10% on every order your link brings in — no hidden tiers, no minimums.",
  },
  {
    icon: Clock,
    title: "60-Day Cookie Window",
    text: "Get credit for a sale up to 60 days after someone clicks your link, on any page.",
  },
  {
    icon: Wallet,
    title: "Get Paid via UPI or Bank Transfer",
    text: "Choose UPI or NEFT/IMPS bank transfer — set it up once from your dashboard.",
  },
  {
    icon: Gift,
    title: "Free to Join",
    text: "No fees, no minimum audience size — apply from your Artace Studio account.",
  },
  {
    icon: Headset,
    title: "Real Support",
    text: "Track clicks, referrals, and earnings from your own dashboard, anytime.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Apply",
    text: "Sign in to your Artace Studio account and apply from your dashboard.",
  },
  {
    step: "2",
    title: "Get Approved",
    text: "We review every application personally, usually within 24-48 hours.",
  },
  {
    step: "3",
    title: "Share Your Link",
    text: "Add your unique code to any Artace Studio page — a product, a collection, or the homepage.",
  },
  {
    step: "4",
    title: "Earn & Get Paid",
    text: "Earn 10% on every referred sale, tracked in your dashboard and paid out via UPI or bank transfer.",
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How much commission do I earn?",
    answer: "A flat 10% on the total value of every order placed through your referral link.",
  },
  {
    question: "How long does my referral link stay credited to me?",
    answer:
      "60 days from the click. If someone clicks your link and orders anytime within 60 days, you get the commission.",
  },
  {
    question: "Is there a cost to join?",
    answer: "No — the affiliate program is completely free to join.",
  },
  {
    question: "How do I get paid?",
    answer:
      "Via UPI or bank transfer (NEFT/IMPS) — add your payout details from your affiliate dashboard once approved.",
  },
  {
    question: "Do I need to be an Artace Studio customer to apply?",
    answer:
      "You need an Artace Studio account to apply, since your referral link and earnings are tied to it — creating an account is free and takes a minute.",
  },
  {
    question: "How long does approval take?",
    answer: "We review every application personally, typically within 24-48 hours.",
  },
  {
    question: "Can I share my link on any page, or only a specific landing page?",
    answer:
      "Any page on artacestudio.com — a specific painting, a collection, or the homepage all work with your referral code appended.",
  },
  {
    question: "Can I track my clicks and earnings?",
    answer:
      "Yes — your dashboard shows total clicks, orders referred, and earnings broken down by pending and paid.",
  },
];

const AffiliatesPage = () => {
  return (
    <main className="bg-[#f4f2ee] text-[#1f1f1f]">
      <section className="bg-[#1f1f1f] px-4 py-16 text-center text-white sm:px-6 md:px-12 md:py-24">
        <div className="mx-auto max-w-[860px]">
          <p className="font-inter text-[13px] uppercase tracking-[0.12em] text-white/60">
            Affiliate Program
          </p>
          <h1 className="mt-4 font-display text-[36px] leading-[1.1] md:text-[56px]">
            Earn Commission Sharing Handmade Indian Art
          </h1>
          <p className="mt-5 text-[16px] leading-7 text-white/75 md:text-[19px] md:leading-8">
            Free to join. Earn 10% on every sale you refer, with a 60-day
            tracking window and payouts via UPI or bank transfer — built for
            creators and art lovers in India, open to anyone worldwide.
          </p>
          <Link
            href="/dashboard/affiliate"
            className="mt-8 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[6px] bg-white px-6 text-[16px] font-medium text-[#1f1f1f] transition-colors hover:bg-[#f2f2f2]"
          >
            Apply Now
            <Share2 className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 md:px-12 md:py-14">
        <div className="mx-auto grid max-w-[900px] grid-cols-3 gap-4 md:gap-6">
          <div className="rounded-[14px] border border-[#1f1f1f]/10 bg-white p-5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
            <p className="font-display text-[28px] text-[#1f1f1f] md:text-[34px]">20,000+</p>
            <p className="mt-1 text-[13px] text-[#6a655d] md:text-[14px]">Global Collectors</p>
          </div>
          <div className="rounded-[14px] border border-[#1f1f1f]/10 bg-white p-5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
            <Image
              src="/google-logo.png"
              alt="Google"
              width={28}
              height={28}
              className="mx-auto h-7 w-7"
            />
            <p className="mt-2 font-display text-[28px] text-[#1f1f1f] md:text-[34px]">5.0</p>
            <p className="mt-1 text-[13px] text-[#6a655d] md:text-[14px]">Google Reviews</p>
          </div>
          <div className="rounded-[14px] border border-[#1f1f1f]/10 bg-white p-5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
            <Image
              src="/trustpilot-logo.svg"
              alt="Trustpilot"
              width={90}
              height={22}
              className="mx-auto h-[18px] w-auto"
            />
            <p className="mt-2 font-display text-[28px] text-[#126849] md:text-[34px]">4.5</p>
            <p className="mt-1 text-[13px] text-[#6a655d] md:text-[14px]">Excellent Rating</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-center font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[42px]">
            Why Promote Artace Studio
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-[19px] leading-[1.2] text-[#313131]">
                  {title}
                </h3>
                <p className="mt-2 text-[14px] leading-6 text-[#595959]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="text-center font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[42px]">
            Who It&apos;s For
          </h2>
          <p className="mx-auto mt-4 max-w-[720px] text-center text-[15px] leading-7 text-[#595959] md:text-[17px]">
            Content creators, home decor and art bloggers, interior styling
            influencers, and anyone in India (or beyond) with an audience that
            loves authentic, handmade art — no minimum following required.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
        <div className="mx-auto max-w-[1100px] text-center">
          <h2 className="font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[42px]">
            How It Works
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ step, title, text }) => (
              <div key={step} className="flex flex-col items-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1f1f1f] font-display text-[18px] text-white">
                  {step}
                </span>
                <h3 className="mt-4 font-display text-[19px] text-[#313131]">{title}</h3>
                <p className="mt-2 max-w-[260px] text-[14px] leading-6 text-[#595959]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
        <div className="mx-auto max-w-[900px] rounded-[20px] border border-[#1f1f1f]/10 bg-white p-8 text-center shadow-[0_18px_40px_rgba(31,31,31,0.05)] md:p-12">
          <h2 className="font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[36px]">
            Ready to Start Earning?
          </h2>
          <p className="mx-auto mt-3 max-w-[520px] text-[15px] leading-7 text-[#595959] md:text-[16px]">
            Sign in to your Artace Studio account to apply — it takes less than
            a minute.
          </p>
          <Link
            href="/dashboard/affiliate"
            className="mt-6 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[6px] bg-[#1f1f1f] px-6 text-[16px] font-medium text-white transition-colors hover:bg-black"
          >
            Apply Now
            <Share2 className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <FAQSection
        title="Affiliate Program FAQ"
        items={FAQ_ITEMS}
      />
    </main>
  );
};

export default AffiliatesPage;
