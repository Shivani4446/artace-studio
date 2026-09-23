import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Home, MessagesSquare, Palette, Ruler } from "lucide-react";

const CAL_LINK = "https://cal.com/artace-studio";

const ADVICE_POINTS: { icon: React.ElementType; label: string }[] = [
  { icon: Home, label: "Right art for your space" },
  { icon: Palette, label: "Style and Theme Guidance" },
  { icon: Ruler, label: "Size and Placement suggestions" },
  { icon: MessagesSquare, label: "Personalized Expert Advice" },
];

const DesignTogetherPanel = () => {
  return (
    <section className="relative flex min-h-[560px] w-full flex-col justify-end overflow-hidden md:min-h-[640px] md:justify-center">
      <div className="absolute inset-0 h-full w-full">
        <Image
          src="/art-advice-bg.webp"
          alt="Curated art advice workspace"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col justify-end px-6 py-10 md:justify-center md:px-12 md:py-0">
        <div className="max-w-2xl">
          <h2 className="mb-4 font-display text-[30px] font-semibold leading-tight tracking-tight text-white sm:text-4xl md:mb-6 md:text-5xl md:leading-[1.1] lg:text-6xl">
            Complimentary Art Advice
          </h2>
          <p className="mb-8 max-w-xl font-inter text-[15px] font-normal leading-relaxed text-white/90 md:mb-10 md:text-lg">
            You already know what speaks to you. Our art advisors help you discover
            it faster. Connect with an expert to find a piece that feels uniquely
            yours, matched to your style, space, and budget.
          </p>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Link
              href={CAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[4px] bg-white px-8 py-3.5 font-inter text-sm font-semibold text-black transition-colors hover:bg-gray-100"
            >
              Connect With A Curator
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-2 gap-2 sm:gap-3 md:mt-10">
            {ADVICE_POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <div
                  key={point.label}
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-[2px] sm:p-3"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white sm:h-10 sm:w-10">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  <p className="text-xs font-medium leading-snug text-white sm:text-sm">
                    {point.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesignTogetherPanel;
