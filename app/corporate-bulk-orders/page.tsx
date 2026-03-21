import React from "react";
import Image from "next/image";
import Link from "next/link";
import CorporateLeadForm from "@/components/corporate/CorporateLeadForm";
import BulkOrderingProcess from "@/components/corporate/BulkOrderingProcess";
import {
  BadgePercent,
  Gift,
  Headset,
  Hotel,
  PackageCheck,
  PenTool,
  ReceiptText,
  Truck,
} from "lucide-react";

const highlights = [
  { icon: ReceiptText, label: "100% GST Compliant Invoicing" },
  { icon: BadgePercent, label: "Exclusive Trade Discounts" },
  { icon: Truck, label: "Safe Pan-India Shipping" },
  { icon: Headset, label: "Dedicated B2B Support" },
];

const solutions = [
  {
    icon: Gift,
    title: "Corporate Gifting",
    copy:
      "Offer premium gifts with curated artwork, custom sizes, and branded notes that elevate every appreciation moment.",
  },
  {
    icon: PackageCheck,
    title: "Office & Workspace",
    copy:
      "Refresh lobbies, executive suites, and breakout spaces with cohesive art programs aligned to your identity.",
  },
  {
    icon: Hotel,
    title: "Hotels & Hospitality",
    copy:
      "Deliver immersive guest experiences with signature series, corridor storytelling, and suite focal pieces.",
  },
  {
    icon: PenTool,
    title: "Interiors & Architects",
    copy:
      "Co-create custom canvases that match palettes, textures, and spatial narratives for premium projects.",
  },
];

const reasons = [
  {
    title: "Real Art, Not Prints",
    copy: "We deliver hand-painted oil and acrylic canvases, each finished by artists on canvas.",
  },
  {
    title: "Customized to Your Brand",
    copy:
      "Request bespoke palettes, formats, or themes. We align every canvas with your story and interiors.",
  },
  {
    title: "Volume Pricing & GST",
    copy:
      "Enjoy tiered pricing, GST documentation, and transparent project quotes built for procurement ease.",
  },
  {
    title: "End-to-End Execution",
    copy:
      "From concept to packaging, our team manages proofing, approvals, and installation coordination.",
  },
];


const CorporateBulkOrdersPage = () => {
  return (
    <main className="bg-white text-[#121212]">
      <section className="relative isolate overflow-hidden bg-black text-white">
        <Image
          src="/corporate-bulk-orders-bg.webp"
          alt="Hand-painted canvas artwork backdrop"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 pb-16 pt-24 md:px-12 md:pb-20 md:pt-28 lg:pb-28">
          <div className="max-w-3xl">
            <h1 className="font-display text-[34px] font-semibold leading-[1.1] text-white sm:text-[40px] md:text-[50px] lg:text-[58px]">
              Premium Hand-Painted Canvas Art for Corporate & Bulk Orders
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/85 sm:text-[16px] md:text-[18px]">
              Transform workspaces, hotels, and gifting strategies with authentic,
              handcrafted masterpieces. Enjoy exclusive B2B pricing and a seamless
              end-to-end experience.
            </p>
            <Link
              href="/contact-us"
              className="mt-7 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-[15px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#f2f2f2] md:text-[16px]"
            >
              Request a Bulk Quote
              <Image
                src="/slant-down-arrow-right.svg"
                alt=""
                width={16}
                height={16}
                className="-scale-y-100"
              />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f1ec]">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-10 md:px-12 md:py-12">
          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white">
                  <Icon className="h-6 w-6 text-[#1a1a1a]" strokeWidth={1.6} />
                </span>
                <span className="font-display text-[24px] text-[#1a1a1a] block">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black text-white">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-12 md:py-20">
          <div className="max-w-3xl">
            <h2 className="font-display text-[30px] leading-[1.15] text-white sm:text-[36px] md:text-[44px]">
              Tailored Art Solutions for Every Business Need
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/80 md:text-[17px]">
              From a single boardroom statement piece to 100+ paintings for a new
              hotel property, we scale our craftsmanship to meet your demands.
            </p>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {solutions.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="rounded-2xl bg-white/5 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <Icon className="h-5 w-5 text-white" strokeWidth={1.6} />
                </div>
                <h3 className="mt-4 font-display text-[28px] font-semibold">{title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-white/75">
                  {copy}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="relative h-64 overflow-hidden rounded-3xl sm:h-72 md:h-[420px]">
              <Image
                src="/corporate-gifting-1.webp"
                alt="Canvas artwork for corporate interiors"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-64 overflow-hidden rounded-3xl sm:h-72 md:mt-[120px] md:h-[420px]">
              <Image
                src="/corporate-gifting-2.webp"
                alt="Hand-painted floral canvas detail"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f1ec] text-[#161616]">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-12 md:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
            <div className="lg:sticky lg:top-[120px]">
              <h2 className="font-display text-[52px] leading-[1.1] text-[#313131]">
                Why Top Businesses Choose Artace Studio
              </h2>
              <p className="mt-4 text-[18px] leading-relaxed text-[#595959]">
                We partner with discerning brands that want authentic art, curated
                with care, and delivered with the precision of a production team.
              </p>
            </div>
            <div>
              {reasons.map((reason, index) => (
                <div
                  key={reason.title}
                  className={`px-0 ${index === 0 ? "pt-0 pb-10" : "py-10"} ${
                    index === reasons.length - 1 ? "" : "border-b border-[#B2ABA1]"
                  }`}
                >
                  <h3 className="font-display text-[32px] text-[#1a1a1a]">
                    {reason.title}
                  </h3>
                  <p className="mt-3 text-[18px] leading-relaxed text-[#595959]">
                    {reason.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black text-white">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-12 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div>
              <h2 className="font-display text-[28px] leading-[1.2] sm:text-[34px] md:text-[52px]">
                Secure Your Production Slot
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/80 md:text-[18px]">
                Align your delivery timeline with our studio calendar. We reserve
                production capacity once your scope is finalized so you never miss
                a launch or opening.
              </p>
              <Link
                href="https://cal.com/artace-studio"
                target="_blank"
                className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-md border border-white/70 px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-white/10 md:text-[16px]"
              >
                Check Studio Availability
              </Link>
            </div>
            <div className="relative h-52 sm:h-60 md:h-72">
              <Image
                src="/calender.svg"
                alt="Production schedule illustration"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <BulkOrderingProcess />

      <section className="bg-white text-[#1a1a1a]">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-12 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
            <div>
              <h2 className="font-display text-[32px] leading-[1.2] text-[#313131] sm:text-[38px] md:text-[44px]">
                Let&apos;s Discuss Your Project
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-[#595959] md:text-[18px]">
                Fill out the details below, and our dedicated Corporate Account Manager
                will call you within 24 hours with a customized solution.
              </p>
              <p className="mt-6 text-[15px] text-[#595959] md:text-[16px]">
                Need immediate assistance? Call or WhatsApp our B2B team directly at
                <span className="font-medium text-[#1a1a1a]"> 9657609102</span>.
              </p>
            </div>

            <CorporateLeadForm />
          </div>
        </div>
      </section>
    </main>
  );
};

export default CorporateBulkOrdersPage;
