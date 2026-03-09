import React from 'react';
import Image from 'next/image';
import { Playfair_Display, Lora } from 'next/font/google';

// Font Configuration
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-playfair'
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400'], 
  variable: '--font-lora'
});

const AboutusWhoAreWe = () => {
  return (
    <section 
      className={`bg-[#FAF9F6] px-4 py-12 text-[#2C2C2C] sm:px-6 sm:py-16 md:px-12 md:py-20 lg:px-24 ${playfair.variable} ${lora.variable}`}
    >
      <div className="mx-auto max-w-[1400px]">
        
        {/* Top Text Section */}
        <div className="mb-10 flex flex-col items-start justify-between gap-8 md:mb-24 md:flex-row md:gap-20">
          
          {/* Heading */}
          <div className="w-full md:w-1/3">
            <h2 className="font-playfair text-3xl tracking-tight text-[#3A3836] sm:text-4xl md:text-5xl lg:text-6xl">
              Who Are We
            </h2>
          </div>

          {/* Description Paragraph */}
          <div className="w-full md:w-1/2 lg:w-5/12">
            <p className="font-lora text-[16px] leading-7 text-[#4A4846] opacity-90 md:text-[1.15rem] md:leading-[1.8]">
              With over a decade of expertise in both oil and acrylic mediums, our master artists bring your vision to life through meticulous attention to detail and unwavering commitment to quality. Each stroke is purposeful, each creation unique, making Artace Studio the preferred choice for discerning art collectors and interior designers.
            </p>
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="relative h-[280px] w-full overflow-hidden sm:h-[360px] md:h-[600px] lg:h-[750px]">
          <Image
            src="/who-are-we.webp"
            alt="Modern living room interior with art gallery wall and mid-century sofa"
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 95vw, 1400px"
          />
        </div>

      </div>
    </section>
  );
};

export default AboutusWhoAreWe;
