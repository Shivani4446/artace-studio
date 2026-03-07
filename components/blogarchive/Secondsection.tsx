import React from 'react';
import Image from 'next/image';
import { Playfair_Display, Inter } from 'next/font/google';

// Font Configuration
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-playfair'
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'], 
  variable: '--font-inter'
});

// Mock Data to replicate the exact content structure
const rightGridItems = [
  {
    tag: "The Moment",
    title: "La Strada dellAgricoltore con Pecora in Via del Casino Slots",
    excerpt: "And so it would be fair to assume that it originally took weeks, maybe months, to dream up such an icon",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2600&auto=format&fit=crop", // Interior
    alt: "Minimalist living room"
  },
  {
    tag: "Photo Essay",
    title: "La Strada dellAgricoltore con Pecora in Via del Casino Slots",
    excerpt: "And so it would be fair to assume that it originally took weeks, maybe months, to dream up such an icon",
    image: "https://images.unsplash.com/photo-1578301978693-85ea400056e4?q=80&w=2670&auto=format&fit=crop", // Floral
    alt: "Oil painting of roses"
  },
  {
    tag: "Photo Essay",
    title: "La Strada dellAgricoltore con Pecora in Via del Casino Slots",
    excerpt: "And so it would be fair to assume that it originally took weeks, maybe months, to dream up such an icon",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2600&auto=format&fit=crop", // Interior (Repeated as per design)
    alt: "Minimalist living room"
  },
  {
    tag: "The Moment",
    title: "La Strada dellAgricoltore con Pecora in Via del Casino Slots",
    excerpt: "And so it would be fair to assume that it originally took weeks, maybe months, to dream up such an icon",
    image: "https://images.unsplash.com/photo-1578301978693-85ea400056e4?q=80&w=2670&auto=format&fit=crop", // Floral (Repeated as per design)
    alt: "Oil painting of roses"
  }
];

const Favorites2026 = () => {
  return (
    <section className={`bg-[#FAF9F6] py-20 px-6 md:px-12 lg:px-24 ${playfair.variable} ${inter.variable}`}>
      <div className="max-w-[1400px] mx-auto">
        
        {/* Section Heading */}
        <h2 className="font-playfair text-4xl md:text-5xl text-[#2C2C2C] mb-12 md:mb-16">
          Our Favorite from 2026
        </h2>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Featured Large Item */}
          <div className="flex flex-col gap-6">
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-200">
              <Image 
                src="https://images.unsplash.com/photo-1448375240586-dfd8f3793371?q=80&w=2670&auto=format&fit=crop"
                alt="Sunlit forest in autumn"
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            
            <div className="flex flex-col gap-3 max-w-xl">
              <span className="font-inter text-[#888888] text-xs font-medium uppercase tracking-wide">
                General
              </span>
              <h3 className="font-playfair text-2xl md:text-3xl text-[#2C2C2C] leading-snug">
                La Strada dellAgricoltore con Pecora in Via del Casino Slots
              </h3>
              <p className="font-inter text-[#555555] text-sm md:text-[0.95rem] leading-[1.6]">
                And so it would be fair to assume that it originally took weeks, maybe months, to dream up such an icon
              </p>
            </div>
          </div>

          {/* Right Column: 2x2 Grid of Smaller Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
            {rightGridItems.map((item, index) => (
              <div key={index} className="flex flex-col gap-4">
                {/* Image */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-200">
                  <Image 
                    src={item.image}
                    alt={item.alt}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                {/* Text Content */}
                <div className="flex flex-col gap-2">
                  <span className="font-inter text-[#888888] text-xs font-medium tracking-wide">
                    {item.tag}
                  </span>
                  <h3 className="font-playfair text-xl text-[#2C2C2C] leading-tight">
                    {item.title}
                  </h3>
                  <p className="font-inter text-[#555555] text-xs md:text-sm leading-[1.6]">
                    {item.excerpt}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Favorites2026;
