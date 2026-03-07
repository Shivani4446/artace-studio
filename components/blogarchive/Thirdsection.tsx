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

// Mock Data
const stories = [
  {
    tag: "Photo Essay",
    title: "La Strada dellAgricoltore con Pecora in Via del Casino Slots",
    excerpt: "And so it would be fair to assume that it originally took weeks, maybe months, to dream up such an icon",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2600&auto=format&fit=crop",
    alt: "Modern minimalist living room with beige sofa"
  },
  {
    tag: "Photo Essay",
    title: "La Strada dellAgricoltore con Pecora in Via del Casino Slots",
    excerpt: "And so it would be fair to assume that it originally took weeks, maybe months, to dream up such an icon",
    image: "https://images.unsplash.com/photo-1581539250439-c96689b516dd?q=80&w=2565&auto=format&fit=crop",
    alt: "Wall art in a living room setting"
  },
  {
    tag: "Photo Essay",
    title: "La Strada dellAgricoltore con Pecora in Via del Casino Slots",
    excerpt: "And so it would be fair to assume that it originally took weeks, maybe months, to dream up such an icon",
    image: "https://images.unsplash.com/photo-1572291662998-38260298a0c2?q=80&w=2670&auto=format&fit=crop",
    alt: "Classic landscape oil painting with sheep"
  },
  {
    tag: "Photo Essay",
    title: "La Strada dellAgricoltore con Pecora in Via del Casino Slots",
    excerpt: "And so it would be fair to assume that it originally took weeks, maybe months, to dream up such an icon",
    image: "https://images.unsplash.com/photo-1594913785162-e6785e630132?q=80&w=2670&auto=format&fit=crop",
    alt: "Interior with warm lighting and sofa"
  },
  {
    tag: "Photo Essay",
    title: "La Strada dellAgricoltore con Pecora in Via del Casino Slots",
    excerpt: "And so it would be fair to assume that it originally took weeks, maybe months, to dream up such an icon",
    image: "https://images.unsplash.com/photo-1505693416388-b0346ef4143d?q=80&w=2670&auto=format&fit=crop",
    alt: "Grey modern sofa with art prints"
  },
  {
    tag: "Photo Essay",
    title: "La Strada dellAgricoltore con Pecora in Via del Casino Slots",
    excerpt: "And so it would be fair to assume that it originally took weeks, maybe months, to dream up such an icon",
    image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=2600&auto=format&fit=crop",
    alt: "Luxurious beige living room furniture"
  },
  {
    tag: "Photo Essay",
    title: "La Strada dellAgricoltore con Pecora in Via del Casino Slots",
    excerpt: "And so it would be fair to assume that it originally took weeks, maybe months, to dream up such an icon",
    image: "https://images.unsplash.com/photo-1550921026-681a02fb10d3?q=80&w=2670&auto=format&fit=crop",
    alt: "Mid-century modern room with art"
  },
  {
    tag: "Photo Essay",
    title: "La Strada dellAgricoltore con Pecora in Via del Casino Slots",
    excerpt: "And so it would be fair to assume that it originally took weeks, maybe months, to dream up such an icon",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2670&auto=format&fit=crop",
    alt: "Modern grey couch in showroom"
  }
];

const LatestStories = () => {
  return (
    <section className={`bg-[#FAF9F6] py-20 px-6 md:px-12 lg:px-24 ${playfair.variable} ${inter.variable}`}>
      <div className="max-w-[1400px] mx-auto">
        
        {/* Section Heading */}
        <h2 className="font-playfair text-3xl md:text-4xl text-[#2C2C2C] mb-12 md:mb-16 font-medium">
          Latest Stories
        </h2>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
          {stories.map((story, index) => (
            <article key={index} className="flex flex-col group cursor-pointer">
              
              {/* Image Container */}
              <div className="relative w-full aspect-[16/10] overflow-hidden mb-6 bg-gray-200">
                <Image
                  src={story.image}
                  alt={story.alt}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Text Content */}
              <div className="flex flex-col items-start pr-4 md:pr-12">
                <span className="font-inter text-[#666666] text-xs font-medium uppercase tracking-wide mb-3">
                  {story.tag}
                </span>
                
                <h3 className="font-playfair text-xl md:text-2xl text-[#2C2C2C] leading-snug mb-3 group-hover:text-black transition-colors">
                  {story.title}
                </h3>
                
                <p className="font-inter text-[#555555] text-xs md:text-sm leading-[1.6]">
                  {story.excerpt}
                </p>
              </div>

            </article>
          ))}
        </div>

        {/* Pagination Section */}
        <div className="mt-20 md:mt-24 flex items-center justify-center font-inter text-[#333333] select-none">
          <div className="flex items-center gap-6 md:gap-10 text-sm md:text-[15px] font-normal">
            
            {/* Previous Button */}
            <button className="hover:text-black hover:underline underline-offset-4 transition-all opacity-80 hover:opacity-100">
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-4 md:gap-6">
              <button className="w-6 text-center hover:text-black font-medium transition-colors">1</button>
              <button className="w-6 text-center hover:text-black transition-colors opacity-70 hover:opacity-100">2</button>
              <button className="w-6 text-center hover:text-black transition-colors opacity-70 hover:opacity-100">3</button>
              <button className="w-6 text-center hover:text-black transition-colors opacity-70 hover:opacity-100">4</button>
              <button className="w-6 text-center hover:text-black transition-colors opacity-70 hover:opacity-100">5</button>
            </div>

            {/* Next Button */}
            <button className="hover:text-black hover:underline underline-offset-4 transition-all opacity-80 hover:opacity-100">
              Next
            </button>
            
          </div>
        </div>

      </div>
    </section>
  );
};

export default LatestStories;
