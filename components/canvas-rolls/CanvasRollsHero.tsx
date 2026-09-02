"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "@/lib/gsap/registerGsap";

const CanvasRollsHero = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".hero-text > *", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[78vh] min-h-[520px] w-full items-center overflow-hidden bg-[#1f1f1f] md:h-[85vh] md:min-h-[620px]"
    >
      <div className="absolute inset-0">
        <Image
          src="/canvas-page-bg.webp"
          alt="Rolled Artace Studio premium canvas rolls, labeled and tied with twine, arranged in a basket with dried flowers"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[30%_center]"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-12">
        <div className="hero-text sm:max-w-md lg:max-w-xl xl:max-w-2xl">
          <p className="font-inter text-[13px] uppercase tracking-[0.14em] text-[#7b746a]">
            Canvas Rolls
          </p>
          <h1 className="mt-4 font-display text-[36px] leading-[1.1] text-[#1f1f1f] md:text-[56px]">
            Fine Art Canvas Rolls, Woven & Primed for the Studio
          </h1>
          <p className="mt-5 font-inter text-[16px] leading-7 text-[#4f4b45] md:text-[19px] md:leading-8">
            <span className="lg:hidden">
              Cotton, cotton-poly blend, and linen canvas — double acrylic-gesso primed and
              supplied by the roll, for studios, framers, and print houses.
            </span>
            <span className="hidden lg:inline xl:hidden">
              Cotton, cotton-poly blend, and linen — double gesso-primed, supplied by the roll.
            </span>
            <span className="hidden xl:inline">
              Cotton, cotton-poly blend, and linen canvas — double acrylic-gesso primed and
              supplied by the roll, for studios, framers, and print houses.
            </span>
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link
              href="#enquire"
              className="inline-flex items-center justify-center rounded-[12px] bg-[#1a1a1a] px-7 py-3 text-[16px] font-medium text-white transition-colors hover:bg-black"
            >
              Request Pricing & Samples
            </Link>
            <Link
              href="#specifications"
              className="font-inter text-[15px] font-medium text-[#1f1f1f] underline underline-offset-4 transition-opacity hover:opacity-70"
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
