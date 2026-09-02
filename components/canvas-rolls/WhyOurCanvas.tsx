"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Layers, Grid3x3, Scale, Ruler } from "lucide-react";
import { gsap } from "@/lib/gsap/registerGsap";

const DIFFERENTIATORS = [
  {
    icon: Layers,
    title: "Double Acrylic Gesso Priming",
    text: "Every roll is primed with two coats, ready to paint straight off the roll.",
  },
  {
    icon: Grid3x3,
    title: "Tight, Medium & Uniform-Fine Weave",
    text: "Choose the weave that suits your technique, from fine detail work to bold texture.",
  },
  {
    icon: Scale,
    title: "90–600 GSM Range",
    text: "From lightweight practice canvas to heavy-duty gallery and exhibition weight.",
  },
  {
    icon: Ruler,
    title: "Custom Widths to 144″",
    text: "Supplied by the roll in the exact width your studio or print house needs.",
  },
];

const WhyOurCanvas = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".why-canvas-item", {
        opacity: 0,
        y: 16,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#f4f2ee] px-4 py-14 sm:px-6 md:px-12 md:py-20"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative h-[320px] w-full overflow-hidden rounded-[18px] sm:h-[420px] lg:h-[480px]">
          <Image
            src="/open-canvas.webp"
            alt="A roll of primed canvas unrolled across a wooden studio table beside a painter's palette and brushes"
            fill
            className="object-cover"
            sizes="(max-width: 1023px) 100vw, 45vw"
          />
        </div>

        <div>
          <p className="font-inter text-[13px] font-medium uppercase tracking-[0.14em] text-[#7b746a]">
            Why Our Canvas
          </p>
          <h2 className="mt-4 font-display text-[28px] leading-[1.12] text-[#1f1f1f] sm:text-[36px]">
            Made for the Studio, Manufactured for Scale
          </h2>
          <p className="mt-4 max-w-xl font-inter text-[15px] leading-7 text-[#5b5b5b] md:text-[16px]">
            Made in India, supplied to studios and print houses worldwide — every roll is
            eco-friendly, PVC-free, biodegradable, and recyclable.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {DIFFERENTIATORS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="why-canvas-item">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-display text-[17px] leading-[1.2] text-[#313131]">
                  {title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-6 text-[#595959]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyOurCanvas;
