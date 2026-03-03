import React from 'react';
import { Playfair_Display, Inter } from 'next/font/google';

// Font Configuration
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-playfair'
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter'
});

type SingleBlogHeroProps = {
  slug: string;
};

const SingleBlogHero = (_props: SingleBlogHeroProps) => {
  return (
    <section className={`bg-[#FAF9F6] py-24 px-6 md:px-12 lg:px-24 ${playfair.variable} ${inter.variable}`}>
      <div className="max-w-[1400px] mx-auto flex justify-center md:justify-start lg:justify-center">
        {/* Text Content Wrapper - Constrained width for editorial look */}
        <div className="max-w-3xl w-full flex flex-col items-start">
          {/* Eyebrow Label */}
          <span className="font-inter text-[#666666] text-sm md:text-[15px] font-medium mb-6 tracking-wide">
            Department of Archives
          </span>

          {/* Main Heading */}
          <h2 className="font-playfair text-4xl md:text-5xl lg:text-[4rem] leading-[1.15] text-[#2C2C2C] mb-8">
            Never Done Leaving a Mark
          </h2>

          {/* Body Paragraph */}
          <p className="font-inter text-[#555555] text-lg md:text-[1.125rem] leading-[1.7] mb-10 md:mb-12">
            And so it would be fair to assume that it originally took weeks, maybe months, to dream up such an icon, with teams of heralded designers concepting and iterating through rounds and rounds of detail and debate.
          </p>

          {/* Meta Information (Date & Read Time) */}
          <div className="flex items-center gap-3 font-inter text-[#888888] text-sm md:text-[15px]">
            <span>Last Updated: 15 May 2025</span>
            <span className="text-[10px] opacity-60">|</span>
            <span>4 min read</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SingleBlogHero;
