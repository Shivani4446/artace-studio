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

const OurCommitment = () => {
  return (
    <section className={`bg-[#FAF9F6] px-4 py-12 sm:px-6 sm:py-16 md:px-12 md:py-24 lg:px-24 ${playfair.variable} ${inter.variable}`}>
      <div className="max-w-[1400px] mx-auto">
        
        {/* Content Container - constrained width to match design */}
        <div className="max-w-3xl">
          
          {/* Label */}
          <span className="mb-6 block font-inter text-sm font-medium tracking-wide text-[#666666] md:mb-8 md:text-base">
            Our Commitment
          </span>

          {/* Main Heading */}
          <h2 className="mb-6 font-playfair text-3xl leading-[1.2] text-[#2C2C2C] sm:text-4xl md:mb-10 md:text-5xl md:leading-[1.15] lg:text-[4rem]">
            At Artace Studio, every canvas tells a story.
          </h2>

          {/* Body Text */}
          <p className="max-w-2xl font-inter text-[16px] leading-7 text-[#555555] md:text-[1.125rem] md:leading-[1.7]">
            Whether you&apos;re seeking a statement piece for your home or a custom artwork that captures your unique vision, our team of skilled artists ensures that each creation meets our exacting standards of excellence.
          </p>

        </div>

      </div>
    </section>
  );
};

export default OurCommitment;

