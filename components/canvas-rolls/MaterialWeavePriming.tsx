"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap/registerGsap";

const MATERIALS = [
  {
    name: "100% Cotton",
    text: "Our standard fine-art canvas — a balanced tooth and flexibility for oil and acrylic.",
  },
  {
    name: "65/35 Cotton-Polyester Blend",
    text: "Added strength and dimensional stability, resists sagging over time.",
  },
  {
    name: "Linen",
    text: "A finer, tighter weave prized for detailed and archival work.",
  },
  {
    name: "100% Polyester",
    text: "Maximum durability and moisture resistance for demanding environments.",
  },
];

const WEAVES = ["Tight Weave", "Medium Weave", "Uniform Fine Weave"];
const COLORS = ["White", "Off-White", "Black", "Linen Finish", "Custom on Sample"];

const MaterialWeavePriming = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".material-card", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });
      gsap.from(".priming-image", {
        opacity: 0,
        scale: 0.96,
        duration: 0.7,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="specifications"
      ref={sectionRef}
      className="w-full bg-[#efeeec] px-4 py-14 sm:px-6 md:px-12 md:py-20"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="max-w-2xl">
          <p className="font-inter text-[13px] font-medium uppercase tracking-[0.14em] text-[#7b746a]">
            Material, Weave & Priming
          </p>
          <h2 className="mt-4 font-display text-[28px] leading-[1.12] text-[#1f1f1f] sm:text-[36px]">
            Every Roll, Double Primed and Ready to Paint
          </h2>
        </div>

        <div className="priming-image relative mt-10 h-[280px] w-full overflow-hidden rounded-[18px] sm:h-[360px] md:h-[420px]">
          <Image
            src="/double-gesso-coat-1.webp"
            alt="Close-up collage of primed canvas showing the double acrylic-gesso coated front against the raw cotton back"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MATERIALS.map((material) => (
            <div
              key={material.name}
              className="material-card rounded-[16px] border border-[#1f1f1f]/10 bg-white p-5"
            >
              <h3 className="font-display text-[17px] text-[#1f1f1f]">{material.name}</h3>
              <p className="mt-2 text-[13px] leading-6 text-[#595959]">{material.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <p className="font-inter text-[11px] font-medium uppercase tracking-[0.16em] text-[#7b746a]">
              Weave
            </p>
            <p className="mt-2 text-[14px] leading-6 text-[#313131]">{WEAVES.join(" · ")}</p>
          </div>
          <div>
            <p className="font-inter text-[11px] font-medium uppercase tracking-[0.16em] text-[#7b746a]">
              Priming
            </p>
            <p className="mt-2 text-[14px] leading-6 text-[#313131]">
              Double Acrylic Gesso (standard) — Oil-based, Universal, and Triple-primed
              available on request
            </p>
          </div>
          <div>
            <p className="font-inter text-[11px] font-medium uppercase tracking-[0.16em] text-[#7b746a]">
              Surface Finish & Color
            </p>
            <p className="mt-2 text-[14px] leading-6 text-[#313131]">
              Medium Grain standard (Fine, Ultra-Smooth, Rough Grain on request) ·{" "}
              {COLORS.join(" · ")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MaterialWeavePriming;
