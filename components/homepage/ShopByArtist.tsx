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

const artists = [
  {
    name: "Aarav Mehta",
    style: "Minimalism",
    image: "/Artist-1.webp",
    aspect: "aspect-square"
  },
  {
    name: "Isha Reddy",
    style: "Watercolor Art",
    image: "/Artist-2.webp",
    aspect: "aspect-[3/4]"
  },
  {
    name: "Kabir Sharma",
    style: "Surrealism",
    image: "/Artist-3.webp",
    aspect: "aspect-square"
  },
  {
    name: "Tanvi Deshmukh",
    style: "Expressionism",
    image: "/Artist-4.webp",
    aspect: "aspect-[3/4]"
  }
];

const ShopByArtist = () => {
  return (
    <section className={`bg-[#FAF9F6] py-20 px-6 md:px-12 lg:px-24 ${playfair.variable} ${inter.variable}`}>
      <div className="max-w-[1440px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-12 md:mb-16 gap-4">
          <h2 className="font-playfair text-3xl md:text-5xl text-[#2C2C2C] uppercase tracking-wide">
            Shop By Artist
          </h2>
          
          <Link 
            href="/artists" 
            className="group flex items-center gap-2 font-inter text-[#4A4846] text-sm font-medium border-b border-[#4A4846] pb-0.5 hover:text-black hover:border-black transition-colors"
          >
            SEE ALL
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Artists Grid - Staggered Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 align-top">
          {artists.map((artist, index) => (
            <div key={index} className="flex flex-col group cursor-pointer">
              
              {/* Image Container with Dynamic Aspect Ratio */}
              <div className={`relative w-full ${artist.aspect} overflow-hidden mb-5 bg-gray-200`}>
                <Image
                  src={artist.image}
                  alt={`Artwork by ${artist.name}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>

              {/* Artist Info */}
              <div className="flex flex-col gap-1">
                <h3 className="font-playfair text-xl text-[#2C2C2C] leading-snug">
                  {artist.name}
                </h3>
                <span className="font-inter text-[#666666] text-sm md:text-[15px] font-normal">
                  {artist.style}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ShopByArtist;