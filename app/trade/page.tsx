import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Percent,
  Users,
  Ruler,
  Palette,
  Headset,
  ClipboardCheck,
} from "lucide-react";
import TradeApplicationForm from "@/components/trade/TradeApplicationForm";
import FAQSection, { type FAQItem } from "@/components/seo/FAQSection";
import { buildSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Trade Program for Designers & Architects | Artace Studio",
  description:
    "Interior designers, architects, and hospitality firms get a flat 15% trade discount, complimentary art advisory, and custom sizing/framing on every Artace Studio order.",
  alternates: {
    canonical: buildSiteUrl("/trade"),
  },
  openGraph: {
    title: "Trade Program for Designers & Architects | Artace Studio",
    description: "Flat 15% trade discount for design professionals.",
    url: buildSiteUrl("/trade"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Trade Program for Designers & Architects | Artace Studio",
    description: "Flat 15% trade discount for design professionals.",
  },
};

const BENEFITS = [
  {
    icon: Percent,
    title: "Flat 15% Trade Discount",
    text: "Every order, every time — no tiers, no minimums to unlock your rate.",
  },
  {
    icon: Palette,
    title: "Complimentary Art Advisory",
    text: "A dedicated curator helps you find the right piece for every project, at no cost.",
  },
  {
    icon: Ruler,
    title: "Custom Sizing & Framing",
    text: "Request the exact dimensions and frame style your project calls for.",
  },
  {
    icon: Users,
    title: "Handmade by Named Artists",
    text: "Every piece is painted by a real, credited artist — not a print-on-demand catalog.",
  },
  {
    icon: Headset,
    title: "Dedicated Trade Support",
    text: "A direct line for order status, sourcing requests, and project timelines.",
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What's the trade discount?",
    answer: "A flat 15% off every order, applied once your application is approved.",
  },
  {
    question: "Who qualifies for the trade program?",
    answer:
      "Interior designers, architects, and hospitality or commercial procurement professionals working on client projects.",
  },
  {
    question: "How long does approval take?",
    answer: "We review applications within 24-48 hours and follow up by email or phone.",
  },
  {
    question: "Is there a minimum order to join?",
    answer: "No minimum order is required to apply for trade access.",
  },
  {
    question: "Can I combine trade pricing with custom sizing or framing?",
    answer:
      "Yes — your 15% trade discount applies alongside custom sizing and any of our frame styles.",
  },
  {
    question: "What if I need bulk or corporate gifting instead?",
    answer:
      "For one-off bulk orders or corporate gifting rather than an ongoing trade account, visit our Corporate Bulk Orders page instead.",
  },
];

const TradePage = () => {
  return (
    <main className="bg-[#f4f2ee] text-[#1f1f1f]">
      <section className="bg-[#1f1f1f] px-4 py-16 text-center text-white sm:px-6 md:px-12 md:py-24">
        <div className="mx-auto max-w-[860px]">
          <p className="font-inter text-[13px] uppercase tracking-[0.12em] text-white/60">
            Trade Program
          </p>
          <h1 className="mt-4 font-display text-[36px] leading-[1.1] md:text-[56px]">
            Artace Studio for Designers & Architects
          </h1>
          <p className="mt-5 text-[16px] leading-7 text-white/75 md:text-[19px] md:leading-8">
            A flat 15% trade discount, complimentary art advisory, and custom
            sizing/framing — built for interior designers, architects, and
            hospitality projects.
          </p>
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
            Why Designers Work With Us
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
        <div className="mx-auto grid max-w-[1100px] gap-8 md:grid-cols-2">
          <div className="rounded-[16px] border border-[#1f1f1f]/10 bg-white p-8">
            <h3 className="font-display text-[22px] text-[#1f1f1f]">
              Interior Designers & Architects
            </h3>
            <p className="mt-3 text-[15px] leading-7 text-[#595959]">
              Sourcing original art and custom-sized pieces for residential and
              commercial client projects, with a dedicated point of contact for
              every order.
            </p>
          </div>
          <div className="rounded-[16px] border border-[#1f1f1f]/10 bg-white p-8">
            <h3 className="font-display text-[22px] text-[#1f1f1f]">
              Hospitality & Commercial Firms
            </h3>
            <p className="mt-3 text-[15px] leading-7 text-[#595959]">
              Procuring art at scale for hotels, offices, and commercial spaces,
              with trade pricing and custom framing built in.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
        <div className="mx-auto max-w-[1100px] text-center">
          <h2 className="font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[42px]">
            How It Works
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { step: "1", title: "Apply", text: "Tell us about your practice and typical projects." },
              { step: "2", title: "We Review", text: "Our team reviews applications within 24-48 hours." },
              { step: "3", title: "Shop With Your Discount", text: "Your flat 15% trade rate applies to every order." },
            ].map(({ step, title, text }) => (
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

      <section id="apply" className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
        <div className="mx-auto max-w-[900px]">
          <div className="text-center">
            <ClipboardCheck className="mx-auto h-8 w-8 text-[#1f1f1f]" />
            <h2 className="mt-4 font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[38px]">
              Apply for Trade Access
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-[#595959] md:text-[16px]">
              We review every application personally — expect to hear from us
              within 24-48 hours.
            </p>
          </div>
          <div className="mt-8">
            <TradeApplicationForm />
          </div>
        </div>
      </section>

      <FAQSection
        title="Trade Program FAQ"
        items={FAQ_ITEMS}
      />

      <section className="px-4 py-12 text-center sm:px-6 md:px-12 md:py-16">
        <p className="text-[15px] text-[#595959]">
          Looking for bulk or corporate gifting instead?{" "}
          <Link href="/corporate-bulk-orders" className="font-medium text-[#1f1f1f] underline underline-offset-2">
            Visit Corporate Bulk Orders
          </Link>
        </p>
      </section>
    </main>
  );
};

export default TradePage;
