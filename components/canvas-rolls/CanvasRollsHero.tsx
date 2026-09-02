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
      gsap.from(".hero-image", {
        opacity: 0,
        scale: 0.97,
        duration: 0.8,
        delay: 0.15,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#f4efe6] px-4 py-14 sm:px-6 md:px-12 md:py-20"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="hero-text">
          <p className="font-inter text-[13px] uppercase tracking-[0.14em] text-[#7b746a]">
            Canvas Rolls
          </p>
          <h1 className="mt-4 font-display text-[36px] leading-[1.1] text-[#1f1f1f] md:text-[56px]">
            Fine Art Canvas Rolls, Woven & Primed for the Studio
          </h1>
          <p className="mt-5 font-inter text-[16px] leading-7 text-[#4f4b45] md:text-[19px] md:leading-8">
            Cotton, cotton-poly blend, and linen canvas — double acrylic-gesso primed and
            supplied by the roll, for studios, framers, and print houses.
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

        <div className="hero-image relative aspect-[2508/1412] w-full overflow-hidden rounded-[20px]">
          <Image
            src="/canvas-page-bg.webp"
            alt="Rolled Artace Studio premium canvas rolls, labeled and tied with twine, arranged in a basket with dried flowers"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default CanvasRollsHero;
