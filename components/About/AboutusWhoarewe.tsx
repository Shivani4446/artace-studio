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
      className={`bg-[#FAF9F6] text-[#2C2C2C] py-20 px-6 md:px-12 lg:px-24 ${playfair.variable} ${lora.variable}`}
    >
      <div className="max-w-[1400px] mx-auto">
        
        {/* Top Text Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 md:gap-20 mb-16 md:mb-24">
          
          {/* Heading */}
          <div className="w-full md:w-1/3">
            <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl tracking-tight text-[#3A3836]">
              Who Are We
            </h2>
          </div>

          {/* Description Paragraph */}
          <div className="w-full md:w-1/2 lg:w-5/12">
            <p className="font-lora text-lg md:text-[1.15rem] leading-[1.8] text-[#4A4846] opacity-90">
              With over a decade of expertise in both oil and acrylic mediums, our master artists bring your vision to life through meticulous attention to detail and unwavering commitment to quality. Each stroke is purposeful, each creation unique, making Artace Studio the preferred choice for discerning art collectors and interior designers.
            </p>
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="relative w-full h-[400px] md:h-[600px] lg:h-[750px] overflow-hidden">
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