import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Playfair_Display, Inter } from 'next/font/google';
import { ArrowRight } from 'lucide-react';
import { ARTISTS } from '@/lib/artists/data';

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


const ShopByArtist = () => {
  return (
    <section className={`bg-[#FAF9F6] py-20 ${playfair.variable} ${inter.variable}`}>
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-12 md:mb-16 gap-4">
          <h2 className="font-playfair text-3xl md:text-5xl text-[#2C2C2C] tracking-wide">
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

        {/* Artists Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 align-top">
          {ARTISTS.map((artist) => (
            <Link
              key={artist.slug}
              href={`/artists/${artist.slug}`}
              className="flex flex-col items-center text-center group"
            >

              {/* Image Container */}
              <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 overflow-hidden rounded-full mb-5 bg-gray-200">
                <Image
                  src={artist.image}
                  alt={`Artwork by ${artist.name}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 128px, 160px"
                />
              </div>

              {/* Artist Info */}
              <div className="flex w-full flex-col items-center gap-1">
                <h3 className="font-playfair text-xl text-[#2C2C2C] leading-snug">
                  {artist.name}
                </h3>
                <span className="line-clamp-2 min-h-[2.5rem] font-inter text-[#666666] text-sm leading-snug md:text-[15px] md:min-h-[2.75rem] font-normal">
                  {artist.tagline}
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ShopByArtist;
