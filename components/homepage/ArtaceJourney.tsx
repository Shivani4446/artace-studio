"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { MessageCircle, PenTool, Palette, Paintbrush, PackageCheck } from "lucide-react";

const JOURNEY_STEPS = [
  {
    icon: MessageCircle,
    title: "The Vision Consultation",
    description: "We listen first. Your space, your story, your feelings.",
  },
  {
    icon: PenTool,
    title: "The Idea & Sketch",
    description: "Your concept, sketched and approved before a single brushstroke.",
  },
  {
    icon: Palette,
    title: "The Palette Confirmation",
    description: "Every color chosen to belong in your home.",
  },
  {
    icon: Paintbrush,
    title: "Creation with Milestone Updates",
    description: "Watch your masterpiece take shape, step by step.",
  },
  {
    icon: PackageCheck,
    title: "The Final Reveal & White-Glove Delivery",
    description: "Approved by you, delivered with care.",
  },
] as const;

const CAL_LINK = "https://cal.com/artace-studio";

const ArtaceJourney = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.8", "end 0.5"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="w-full bg-[#efeeec]">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-10 px-6 md:px-12 lg:grid-cols-2 lg:gap-14">
        <div className="py-14 md:py-24">
          <div className="max-w-2xl">
            <h2 className="font-display text-[32px] leading-[1.08] text-[#1f1f1f] sm:text-[40px] md:text-[52px]">
              A Masterpiece Made With You, Not Just For You
            </h2>
            <p className="mt-5 font-inter text-[16px] leading-[1.7] text-[#4f4b45] md:mt-6 md:text-[18px]">
              Most galleries hand you a catalogue and leave you to choose alone. At
              Artace Studio, every bespoke piece is a collaboration, five phases, one
              shared vision.
            </p>
          </div>

          <div ref={timelineRef} className="relative mt-12 md:mt-16">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-black/10 md:left-[23px]" />
            {!shouldReduceMotion && (
              <motion.div
                style={{ height: lineHeight }}
                className="absolute left-[19px] top-2 w-px bg-[#2f2f2f] md:left-[23px]"
              />
            )}

            <ol className="flex flex-col gap-10 md:gap-12">
              {JOURNEY_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.li
                    key={step.title}
                    initial={shouldReduceMotion ? undefined : { opacity: 0, x: -16 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.45, delay: index * 0.1 }}
                    className="relative flex items-start gap-5 md:gap-6"
                  >
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2f2f2f]/15 bg-[#efeeec] font-display text-[15px] text-[#2f2f2f] md:h-12 md:w-12 md:text-[17px]">
                      {index + 1}
                    </span>
                    <div className="pt-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-[#2f2f2f]/70" strokeWidth={1.75} />
                        <h3 className="font-display text-[19px] leading-[1.2] text-[#1f1f1f] md:text-[22px]">
                          {step.title}
                        </h3>
                      </div>
                      <p className="mt-2 max-w-md font-inter text-[14px] leading-[1.6] text-[#5b5b5b] md:text-[15px]">
                        {step.description}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </div>

          <Link
            href={CAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-12 inline-flex items-center justify-center rounded-md bg-[#2f2f2f] px-8 py-3 text-[16px] font-medium text-white transition-colors hover:bg-[#1f1f1f] md:mt-14"
          >
            Book a Free Consultation
          </Link>
        </div>

        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="relative h-[320px] w-full sm:h-[420px] lg:h-auto"
        >
          <Image
            src="/masteripiece-image-v-1.webp"
            alt="A large framed painting of a golden-hour ocean wave displayed in a gallery-style room"
            fill
            className="object-contain"
            sizes="(max-width: 1023px) 100vw, 45vw"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default ArtaceJourney;
