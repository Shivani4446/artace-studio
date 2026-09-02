"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "@/lib/gsap/registerGsap";

const CanvasRollsHero = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { scale: 1 },
        {
          scale: 1.15,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[78vh] min-h-[520px] w-full items-center overflow-hidden bg-[#1f1f1f] md:h-[85vh] md:min-h-[620px]"
    >
      <div ref={imageRef} className="absolute inset-0">
        <Image
          src="/weave-texture-1.webp"
          alt="Extreme close-up of tightly woven cotton canvas unrolling on a wooden surface"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl">
          <p className="font-inter text-[13px] uppercase tracking-[0.14em] text-white/60">
            Canvas Rolls
          </p>
          <h1 className="mt-4 font-display text-[36px] leading-[1.1] text-white md:text-[56px]">
            Fine Art Canvas Rolls, Woven & Primed for the Studio
          </h1>
          <p className="mt-5 max-w-2xl font-inter text-[16px] leading-7 text-white/85 md:text-[19px] md:leading-8">
            Cotton, cotton-poly blend, and linen canvas — double acrylic-gesso primed and
            supplied by the roll, for studios, framers, and print houses.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link
              href="#enquire"
              className="inline-flex items-center justify-center rounded-[12px] bg-white px-7 py-3 text-[16px] font-medium text-[#1f1f1f] transition-colors hover:bg-white/90"
            >
              Request Pricing & Samples
            </Link>
            <Link
              href="#specifications"
              className="font-inter text-[15px] font-medium text-white underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              See Specifications →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CanvasRollsHero;
