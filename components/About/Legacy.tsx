import React from 'react';
import Image from 'next/image';
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

const LegacyOfQuality = () => {
  return (
    <section className={`bg-[#FAF9F6] px-4 py-12 sm:px-6 sm:py-16 md:px-12 md:py-20 lg:px-24 ${playfair.variable} ${inter.variable}`}>
      <div className="max-w-[1400px] mx-auto">
        
        {/* Full Width Hero Image */}
        <div className="relative mb-10 h-[240px] w-full overflow-hidden sm:h-[300px] md:mb-24 md:h-[550px] lg:h-[700px]">
          <Image
            src="/legacy-img.webp"
            alt="Modern minimalist living room with beige sofa and sculptural furniture"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 1400px"
          />
        </div>

        {/* Text Content Grid - Aligned to the right half */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16">
          
          {/* Empty Left Column for Desktop Spacing */}
          <div className="hidden md:block"></div>

          {/* Content Column */}
          <div className="flex flex-col items-start max-w-xl">
            
            {/* Label */}
            <span className="mb-4 font-inter text-sm font-medium tracking-wide text-[#666666] md:mb-6 md:text-base">
              Legacy Of Quality
            </span>

            {/* Heading */}
            <h2 className="mb-5 font-playfair text-2xl leading-tight text-[#2C2C2C] sm:text-3xl md:mb-8 md:text-4xl lg:text-5xl">
              Never compromise on quality
            </h2>

            {/* Paragraph */}
            <p className="font-inter text-[15px] leading-7 text-[#555555] md:text-base md:leading-[1.8]">
              For over 13 years, we&apos;ve maintained our position as a premier art studio by adhering to this one simple principle. This dedication has earned us the trust of art enthusiasts and collectors across the country, making us a respected name in premium canvas artistry.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default LegacyOfQuality;

