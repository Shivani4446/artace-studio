import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Playfair_Display, Inter } from 'next/font/google';
import { ArrowRight } from 'lucide-react';

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

const JournalSection = () => {
  return (
    <section className={`bg-[#FAF9F6] w-full py-[100px] ${playfair.variable} ${inter.variable}`}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex flex-col lg:flex-row items-stretch lg:gap-[50px]">
          
          {/* Left Column: Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between">
            
            {/* Top Heading */}
            <div>
              <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-[#2C2C2C] text-center lg:text-right leading-tight">
                Artace Studio Journal
              </h2>
            </div>

            {/* Bottom Description & Link (Right Aligned) */}
            <div className="flex flex-col items-center lg:items-end text-center lg:text-right">
              <p className="font-inter text-[#555555] text-base md:text-lg leading-[1.7] max-w-lg mb-8 md:mb-10">
                Get inspired with our latest stories, design tips, and expert advice. From styling your space to learning about the latest trends, our blog has everything you need to elevate your home. Dive in and explore our curated ideas for every space!
              </p>

              <Link 
                href="/journal" 
                className="group flex items-center gap-2 text-[#2C2C2C] font-inter text-base md:text-lg border-b border-[#2C2C2C] pb-1 hover:opacity-70 transition-opacity"
              >
                Read Our Journal
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

          </div>

          {/* Right Column: Image */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-[500px] aspect-[4/5]">
              <Image
                src="/journal-img.webp"
                alt="Modern living room with beige sofa and round wooden coffee table"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 500px"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default JournalSection;