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
    <section className={`bg-[#FAF9F6] py-20 px-6 md:px-12 lg:px-24 ${playfair.variable} ${inter.variable}`}>
      <div className="max-w-[1400px] mx-auto">
        
        {/* Full Width Hero Image */}
        <div className="relative w-full h-[350px] md:h-[550px] lg:h-[700px] mb-16 md:mb-24 overflow-hidden">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          
          {/* Empty Left Column for Desktop Spacing */}
          <div className="hidden md:block"></div>

          {/* Content Column */}
          <div className="flex flex-col items-start max-w-xl">
            
            {/* Label */}
            <span className="font-inter text-[#666666] text-sm md:text-base font-medium mb-6 tracking-wide">
              Legacy Of Quality
            </span>

            {/* Heading */}
            <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-[#2C2C2C] mb-8 leading-tight">
              Never compromise on quality
            </h2>

            {/* Paragraph */}
            <p className="font-inter text-[#555555] text-sm md:text-base leading-[1.7] md:leading-[1.8]">
              For over 13 years, we’ve maintained our position as a premier art studio by adhering to this one simple principle. This dedication has earned us the trust of art enthusiasts and collectors across the country, making us a respected name in premium canvas artistry.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default LegacyOfQuality;