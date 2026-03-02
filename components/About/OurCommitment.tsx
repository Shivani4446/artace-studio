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
    <section className={`bg-[#FAF9F6] py-24 px-6 md:px-12 lg:px-24 ${playfair.variable} ${inter.variable}`}>
      <div className="max-w-[1400px] mx-auto">
        
        {/* Content Container - constrained width to match design */}
        <div className="max-w-3xl">
          
          {/* Label */}
          <span className="block font-inter text-[#666666] text-sm md:text-base font-medium mb-8 tracking-wide">
            Our Commitment
          </span>

          {/* Main Heading */}
          <h2 className="font-playfair text-4xl md:text-5xl lg:text-[4rem] leading-[1.15] text-[#2C2C2C] mb-8 md:mb-10">
            At Artace Studio, every canvas tells a story.
          </h2>

          {/* Body Text */}
          <p className="font-inter text-[#555555] text-lg md:text-[1.125rem] leading-[1.7] max-w-2xl">
            Whether you’re seeking a statement piece for your home or a custom artwork that captures your unique vision, our team of skilled artists ensures that each creation meets our exacting standards of excellence.
          </p>

        </div>

      </div>
    </section>
  );
};

export default OurCommitment;