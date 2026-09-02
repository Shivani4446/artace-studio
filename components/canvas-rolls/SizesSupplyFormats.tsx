"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap/registerGsap";

const SPECS = [
  { label: "Width", value: "12″ – 144″" },
  { label: "Roll Length", value: "5m – 1000m (jumbo rolls to 1000m)" },
  { label: "Pre-Cut Yardage", value: "6 – 100 yards" },
  { label: "GSM", value: "90 – 600 GSM (4oz – 14oz)" },
  { label: "Packing", value: "Tube, poly-wrap, or carbonated sheet" },
  { label: "Protection", value: "Acid-free, moisture-resistant, or standard" },
  { label: "Labeling", value: "Custom or standard" },
  { label: "Pricing", value: "From ₹120/meter — quoted per material, size & quantity" },
];

const SizesSupplyFormats = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".supply-spec", {
        opacity: 0,
        y: 16,
        duration: 0.45,
        stagger: 0.06,
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
      <div className="mx-auto max-w-[1440px]">
        <div className="max-w-2xl">
          <p className="font-inter text-[13px] font-medium uppercase tracking-[0.14em] text-[#7b746a]">
            Sizes & Supply Formats
          </p>
          <h2 className="mt-4 font-display text-[28px] leading-[1.12] text-[#1f1f1f] sm:text-[36px]">
            Supplied By the Roll, Built Around Your Order
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SPECS.map((spec) => (
            <div key={spec.label} className="supply-spec rounded-[16px] bg-white p-5">
              <p className="font-inter text-[11px] font-medium uppercase tracking-[0.16em] text-[#7b746a]">
                {spec.label}
              </p>
              <p className="mt-2 font-display text-[18px] leading-[1.25] text-[#1f1f1f]">
                {spec.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SizesSupplyFormats;
