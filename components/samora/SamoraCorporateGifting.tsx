"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Gift,
  HeartHandshake,
  MessageSquareText,
  PartyPopper,
  ReceiptText,
  Stamp,
  Truck,
  Users,
} from "lucide-react";
import SamoraProductCard, { type SamoraProduct } from "@/components/samora/SamoraProductCard";
import SamoraCorporateLeadForm from "@/components/samora/SamoraCorporateLeadForm";

const WHATSAPP_HREF =
  "https://wa.me/9657609102?text=" +
  encodeURIComponent("Hi Samora, I'd like to talk about corporate gifting.");

const TRUST_HIGHLIGHTS = [
  { icon: Gift, label: "Bulk & Custom Quantities" },
  { icon: Stamp, label: "Logo & Name Personalization" },
  { icon: Truck, label: "Pan-India Delivery via Delhivery" },
  { icon: ReceiptText, label: "GST-Compliant Invoicing" },
];

const USE_CASES = [
  {
    icon: Users,
    title: "Employee Gifting",
    description:
      "Onboarding kits, work anniversaries, and appreciation gifts that feel personal, not procured.",
  },
  {
    icon: Gift,
    title: "Festive Client Hampers",
    description:
      "Curated hampers of totes, coasters, and trays for Diwali, Rakhi, and year-end client thank-yous.",
  },
  {
    icon: PartyPopper,
    title: "Event & Conference Kits",
    description:
      "Handcrafted favors and welcome kits that outlast the event, sized for launches and offsites.",
  },
  {
    icon: HeartHandshake,
    title: "Client Appreciation",
    description:
      "A thoughtful, handmade gesture for renewals, milestones, and relationships worth investing in.",
  },
];

const PROCESS_STEPS = [
  {
    icon: MessageSquareText,
    title: "Share Your Requirement",
    description: "Fill out the form or WhatsApp our team with your quantity, budget, and timeline.",
  },
  {
    icon: FileText,
    title: "Custom Quote & Sample",
    description: "We put together tiered pricing and, for larger orders, a physical sample to approve.",
  },
  {
    icon: CheckCircle2,
    title: "Approve & Personalize",
    description: "Confirm quantities and add logos, names, or branded notes to each piece.",
  },
  {
    icon: Truck,
    title: "Handcrafted & Delivered",
    description: "Your order is made by hand in Pune, packed with care, and shipped pan-India.",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const SamoraCorporateGifting = ({ products }: { products: SamoraProduct[] }) => {
  const shouldReduceMotion = useReducedMotion();
  const revealProps = shouldReduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, amount: 0.3 },
      };

  return (
    <main className="bg-[#fbf6ef]">
      {/* Hero */}
      <section className="relative flex h-[72vh] min-h-[480px] w-full items-center overflow-hidden bg-[#2b2420] md:h-[80vh] md:min-h-[580px]">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1 }}
          animate={shouldReduceMotion ? undefined : { scale: 1.08 }}
          transition={{ duration: 20, ease: "linear" }}
        >
          <Image
            src="/samora-section-image.webp"
            alt="Handcrafted Samora tote bags, coasters, and trays arranged for corporate gifting"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#2b2420] via-[#2b2420]/55 to-[#2b2420]/15" />

        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 md:px-10">
          <div className="max-w-[620px]">
            <motion.p
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#f3c98b]"
            >
              Corporate Gifting
            </motion.p>
            <motion.h1
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 18 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-samora-display mt-4 text-[36px] leading-[1.1] text-white sm:text-[44px] md:text-[54px]"
            >
              Handmade Gifts Your Team and Clients Will Actually Keep
            </motion.h1>
            <motion.p
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 18 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-[500px] text-[16.5px] leading-[1.7] text-white/80 md:text-[18px]"
            >
              Tote bags, tea coasters, trays, and name plates &mdash; handcrafted in small batches,
              personalized with your branding, and delivered pan-India for every occasion worth
              marking.
            </motion.p>
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 18 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link
                href="#enquire"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#c1683d] px-6 py-3 text-[14.5px] font-medium text-white transition-colors hover:bg-[#a8552f]"
              >
                Get a Custom Quote
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-6 py-3 text-[14.5px] font-medium text-white transition-colors hover:border-white"
              >
                WhatsApp Us
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-[#2b2420]/10 bg-[#f3ead9] py-10 md:py-12">
        <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-8 px-5 md:grid-cols-4 md:px-10">
          {TRUST_HIGHLIGHTS.map(({ icon: Icon, label }, index) => (
            <motion.div
              key={label}
              {...revealProps}
              variants={fadeUp}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2b2420]/10 bg-[#fbf6ef]">
                <Icon className="h-5 w-5 text-[#c1683d]" strokeWidth={1.75} />
              </span>
              <span className="text-[13.5px] font-medium text-[#3f382f] md:text-[14.5px]">
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Perfect for */}
      <section className="mx-auto max-w-[1320px] px-5 py-16 md:px-10 md:py-24">
        <motion.div {...revealProps} variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-[640px]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c1683d]">
            Perfect For
          </p>
          <h2 className="font-samora-display mt-4 text-[30px] leading-[1.15] text-[#2b2420] sm:text-[34px] md:text-[40px]">
            One collection, every occasion worth gifting for
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              {...revealProps}
              variants={fadeUp}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="flex flex-col rounded-[20px] border border-[#2b2420]/10 bg-[#f3ead9] p-6"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#c1683d]">
                <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
              </span>
              <h3 className="font-samora-display mt-5 text-[19px] text-[#2b2420]">{title}</h3>
              <p className="mt-2.5 text-[14px] leading-[1.65] text-[#5c5344]">{description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular for gifting */}
      {products.length > 0 ? (
        <section className="bg-[#f3ead9] py-16 md:py-24">
          <div className="mx-auto max-w-[1320px] px-5 md:px-10">
            <motion.div {...revealProps} variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-[640px]">
              <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c1683d]">
                Popular for Gifting
              </p>
              <h2 className="font-samora-display mt-4 text-[30px] leading-[1.15] text-[#2b2420] sm:text-[34px] md:text-[40px]">
                A preview of what your team could be unwrapping
              </h2>
            </motion.div>

            <motion.div
              {...revealProps}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
            >
              {products.map((product) => (
                <SamoraProductCard key={product.id} product={product} />
              ))}
            </motion.div>

            <motion.div {...revealProps} variants={fadeUp} transition={{ duration: 0.45, delay: 0.25 }} className="mt-8">
              <Link
                href="/samora/shop"
                className="inline-flex items-center gap-1.5 text-[14.5px] font-medium text-[#c1683d] transition-colors hover:text-[#a8552f]"
              >
                Browse the Full Collection
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </motion.div>
          </div>
        </section>
      ) : null}

      {/* Why Samora */}
      <section className="bg-[#2b2420] py-16 text-[#f3ead9] md:py-24">
        <div className="mx-auto max-w-[1320px] px-5 md:px-10">
          <motion.div {...revealProps} variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-[640px]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c1683d]">
              Why Samora
            </p>
            <h2 className="font-samora-display mt-4 text-[30px] leading-[1.15] text-white sm:text-[34px] md:text-[40px]">
              Not mass-produced swag &mdash; gifts someone will actually use
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Handmade, Not Factory-Made",
                copy: "Every piece is shaped by hand in small batches, so it reads as a gift, not a giveaway.",
              },
              {
                title: "Natural Materials",
                copy: "Jute, cotton, wood, and clay — a sourcing story that fits a brand's sustainability goals too.",
              },
              {
                title: "Personally Overseen",
                copy: "Sampadaa runs Samora herself, from sourcing to shipping, so a corporate order gets the same care as a single one.",
              },
            ].map(({ title, copy }, index) => (
              <motion.div
                key={title}
                {...revealProps}
                variants={fadeUp}
                transition={{ duration: 0.45, delay: index * 0.1 }}
              >
                <h3 className="font-samora-display text-[21px] text-white">{title}</h3>
                <p className="mt-3 text-[14.5px] leading-[1.7] text-[#e4d4b8]">{copy}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...revealProps} variants={fadeUp} transition={{ duration: 0.45, delay: 0.3 }} className="mt-10">
            <Link
              href="/samora/our-story"
              className="inline-flex items-center gap-1.5 text-[14.5px] font-medium text-[#f3c98b] transition-colors hover:text-white"
            >
              Meet Sampadaa, the maker behind Samora
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-[1320px] px-5 py-16 md:px-10 md:py-24">
        <motion.div {...revealProps} variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-[640px]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c1683d]">
            How It Works
          </p>
          <h2 className="font-samora-display mt-4 text-[30px] leading-[1.15] text-[#2b2420] sm:text-[34px] md:text-[40px]">
            From first message to delivered gift
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              {...revealProps}
              variants={fadeUp}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="relative"
            >
              <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#c1683d]/60">
                Step 0{index + 1}
              </span>
              <span className="mt-3 flex h-14 w-14 items-center justify-center rounded-full border border-[#2b2420]/10 bg-[#f3ead9]">
                <Icon className="h-6 w-6 text-[#c1683d]" strokeWidth={1.6} />
              </span>
              <h3 className="font-samora-display mt-5 text-[19px] text-[#2b2420]">{title}</h3>
              <p className="mt-2.5 text-[14px] leading-[1.65] text-[#5c5344]">{description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lead form */}
      <section id="enquire" className="bg-[#f3ead9] py-16 md:py-24">
        <div className="mx-auto max-w-[1320px] px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
            <motion.div {...revealProps} variants={fadeUp} transition={{ duration: 0.5 }}>
              <h2 className="font-samora-display text-[30px] leading-[1.15] text-[#2b2420] sm:text-[34px] md:text-[40px]">
                Let&apos;s Plan Your Gifting
              </h2>
              <p className="mt-4 text-[16px] leading-[1.7] text-[#5c5344] md:text-[17px]">
                Share a few details and we&apos;ll get back to you within 24 hours with a
                customized quote and sample options.
              </p>
              <p className="mt-6 text-[15px] text-[#5c5344]">
                Need to talk it through first? Call or WhatsApp us at{" "}
                <span className="font-medium text-[#2b2420]">9657609102</span>.
              </p>
            </motion.div>

            <motion.div {...revealProps} variants={fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
              <SamoraCorporateLeadForm />
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SamoraCorporateGifting;
