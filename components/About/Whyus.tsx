import React from 'react';
import Image from 'next/image';
import { Playfair_Display, Inter } from 'next/font/google';
import { Component, User, Box, Cuboid } from 'lucide-react';

// Font Configuration
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-playfair'
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400'], 
  variable: '--font-inter'
});

const features = [
  {
    icon: <Component className="w-5 h-5 text-[#2C2C2C]" />,
    title: "Premium Materials",
    description: "We source only the finest quality canvases and paints, ensuring artwork that stands the test of time"
  },
  {
    icon: <User className="w-5 h-5 text-[#2C2C2C]" />,
    title: "Dual Expertise",
    description: "Mastery in both oil and acrylic techniques, offering versatility in artistic expression"
  },
  {
    icon: <Box className="w-5 h-5 text-[#2C2C2C]" />,
    title: "Custom Creation",
    description: "Your vision, our expertise – creating personalized masterpieces that tell your story"
  },
  {
    icon: <Cuboid className="w-5 h-5 text-[#2C2C2C]" />,
    title: "Time-Honored Techniques",
    description: "Blending traditional craftsmanship with contemporary aesthetics"
  }
];

const DedicationToExcellence = () => {
  return (
    <section className={`bg-[#FAF9F6] py-24 px-6 md:px-12 lg:px-24 ${playfair.variable} ${inter.variable}`}>
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="mb-20 md:mb-28 max-w-3xl">
          <h2 className="font-playfair text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.2] text-[#2C2C2C]">
            What sets us apart is our uncompromising dedication to <span className="italic">excellence</span>
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 mb-24 md:mb-32">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-start">
              {/* Icon Container */}
              <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                {feature.icon}
              </div>
              
              {/* Title */}
              <h3 className="font-playfair text-xl md:text-2xl text-[#2C2C2C] mb-3">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="font-inter text-[#666666] text-sm md:text-[0.925rem] leading-relaxed font-light">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Art Gallery Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Left Image - Seascape */}
          <div className="relative w-full aspect-[4/3] md:aspect-[5/4] overflow-hidden">
            <Image
              src="/why-us-img-1.webp"
              alt="Oil painting of a blue seascape with crashing waves"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Right Image - Floral - Slight offset top styling could be added if desired, but grid is clean */}
          <div className="relative w-full aspect-[4/3] md:aspect-[5/4] overflow-hidden mt-0 md:mt-12">
             <Image
              src="/why-us-img-2.webp"
              alt="Classic oil painting of pink roses"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default DedicationToExcellence;