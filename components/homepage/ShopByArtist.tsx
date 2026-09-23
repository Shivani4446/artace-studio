import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ARTISTS } from '@/lib/artists/data';
import { inter } from '@/lib/fonts';

const ShopByArtist = () => {
  return (
    <section className={`bg-[#FAF9F6] py-20 ${inter.variable}`}>
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12">
        
        {/* Header */}
        <div className="mb-12 flex flex-col items-start gap-4 md:mb-16 md:flex-row md:items-center md:justify-between">
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
        <div className="grid grid-cols-2 gap-8 align-top lg:grid-cols-4">
          {ARTISTS.map((artist) => (
            <Link
              key={artist.slug}
              href={`/artists/${artist.slug}`}
              className="flex flex-col items-center text-center group"
            >

              {/* Image Container */}
              <div className="relative mb-4 h-28 w-28 shrink-0 overflow-hidden rounded-full bg-gray-200 md:mb-5 md:h-40 md:w-40">
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
                <span className="hidden line-clamp-2 min-h-[2.5rem] font-inter text-sm leading-snug font-normal text-[#666666] md:block md:min-h-[2.75rem] md:text-[15px]">
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
