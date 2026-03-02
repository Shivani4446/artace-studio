"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import { ArrowRight } from 'lucide-react';

// Font Configuration
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

// Data for the three stacked sections
const campaigns = [
  {
    id: 1,
    image: "/stack-1.webp",
    alt: "Warm minimalist living room with beige sofa",
    title: "UPTO 40% OFF\nYEAR END SALE NOW ON",
    description: "Hand-picked masterpieces for those who appreciate refinement.\nExperience gallery-grade quality crafted by skilled artists.",
    ctaText: "Shop Now",
    ctaLink: "/sale",
    type: "link",
    overlay: "bg-black/20" // Light overlay
  },
  {
    id: 2,
    image: "/stack-2.webp", // Blue wall / Abstract Art vibes
    alt: "Modern interior with abstract art and blue textured wall",
    title: "WE CONNECT YOU WITH\nAUTHENTIC, HANDMADE ART\nTO GIVE YOUR SPACE A\nSOUL.",
    description: "We invite you to explore. Not just to find a painting, but to discover a connection. Find the piece that speaks to you. Find the soul for your space.",
    ctaText: "More About Us",
    ctaLink: "/about",
    type: "link",
    overlay: "bg-black/30" // Medium overlay
  },
  {
    id: 3,
    image: "/stack-3.webp", // Grey Gallery Wall
    alt: "Grey living room with gallery wall frames",
    title: "BEYOND THE CANVAS\nTHE ART OF HOME &\nPARTNERSHIP",
    description: "At Artace Studio, our curation extends beyond the canvas. We believe that the same principles of authenticity, craftsmanship, and narrative power should apply to every element that makes your space your own.",
    ctaText: "Partner With Us",
    ctaLink: "/partners",
    secondaryCta: "See Collection",
    type: "buttons", // Special type for the last card
    overlay: "bg-black/40" // Darker overlay for text readability
  }
];

const StackedCampaign = () => {
  return (
    <div className={`w-full ${inter.variable} font-inter`}>
      {campaigns.map((campaign, index) => (
        <div 
          key={campaign.id} 
          className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden"
          style={{ zIndex: index + 1 }} // Ensures proper stacking order
        >
          {/* Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={campaign.image}
              alt={campaign.alt}
              fill
              className="object-cover"
              priority={index === 0} // Load first image immediately
              sizes="100vw"
            />
            {/* Gradient Overlay for Text Readability */}
            <div className={`absolute inset-0 ${campaign.overlay} bg-gradient-to-r from-black/50 via-transparent to-transparent`} />
          </div>

          {/* Content Container */}
          <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 h-full flex flex-col justify-center">
            
            <div className="max-w-3xl pt-20">
              {/* Heading */}
              <h2 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold leading-tight md:leading-[1.1] mb-6 whitespace-pre-line uppercase tracking-tight">
                {campaign.title}
              </h2>

              {/* Description */}
              <p className="text-white/90 text-sm md:text-lg font-normal leading-relaxed mb-10 max-w-xl whitespace-pre-line">
                {campaign.description}
              </p>

              {/* CTAs */}
              {campaign.type === 'link' ? (
                /* Text Link Style */
                <Link 
                  href={campaign.ctaLink}
                  className="inline-flex items-center gap-2 text-white text-base font-medium underline underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  {campaign.ctaText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                /* Button Style (For last card) */
                <div className="flex items-center gap-6">
                  <Link 
                    href={campaign.ctaLink}
                    className="bg-white text-black px-8 py-3.5 text-sm font-semibold rounded-[4px] hover:bg-gray-100 transition-colors"
                  >
                    {campaign.ctaText}
                  </Link>
                  <Link 
                    href="/collection"
                    className="inline-flex items-center gap-2 text-white text-sm font-medium hover:underline underline-offset-4 transition-all"
                  >
                    {campaign.secondaryCta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      ))}
    </div>
  );
};

export default StackedCampaign;