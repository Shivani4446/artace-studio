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
    title: "Flat 10% Off On Your First Art Purchase",
    description: "Hand-picked masterpieces for those who appreciate refinement.\nExperience gallery-grade quality crafted by skilled artists.",
    ctaText: "Shop Now",
    ctaLink: "/shop",
    type: "link",
    overlay: "bg-black/20" // Light overlay
  },
  {
    id: 2,
    image: "/stack-2.webp", // Blue wall / Abstract Art vibes
    alt: "Modern interior with abstract art and blue textured wall",
    title: "We Connect You With\nAuthentic, Handmade Art\nTo Give Your Space A\nSoul.",
    description: "We invite you to explore. Not just to find a painting, but to discover a connection. Find the piece that speaks to you. Find the soul for your space.",
    ctaText: "More About Us",
    ctaLink: "/about-us",
    type: "link",
    overlay: "bg-black/30" // Medium overlay
  },
  {
    id: 3,
    image: "/stack-3.webp", // Grey Gallery Wall
    alt: "Grey living room with gallery wall frames",
    title: "Contact Us For Custom Order For Your Space",
    description: "At Artace Studio, our curation extends beyond the canvas. We believe that the same principles of authenticity, craftsmanship, and narrative power should apply to every element that makes your space your own.",
    ctaText: "Book a Call Now",
    ctaLink: "https://cal.com/artace-studio",
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
          className="relative flex min-h-[560px] w-full flex-col justify-end overflow-hidden md:sticky md:top-0 md:h-screen md:justify-center"
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
          <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col justify-end px-6 py-10 md:justify-center md:px-12 md:py-0">
            
            <div className="max-w-3xl">
              {/* Heading */}
              <h2 className="mb-4 whitespace-pre-line text-[30px] font-bold leading-tight tracking-tight text-white sm:text-4xl md:mb-6 md:text-5xl md:leading-[1.1] lg:text-6xl">
                {campaign.title}
              </h2>

              {/* Description */}
              <p className="mb-8 max-w-xl whitespace-pre-line text-[15px] font-normal leading-relaxed text-white/90 md:mb-10 md:text-lg">
                {campaign.description}
              </p>

              {/* CTAs */}
              {campaign.type === 'link' ? (
                /* Text Link Style */
                <Link 
                  href={campaign.ctaLink}
                  target={campaign.ctaLink.startsWith("http") ? "_blank" : undefined}
                  rel={campaign.ctaLink.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-2 text-white text-base font-medium underline underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  {campaign.ctaText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                /* Button Style (For last card) */
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                  <Link 
                    href={campaign.ctaLink}
                    target={campaign.ctaLink.startsWith("http") ? "_blank" : undefined}
                    rel={campaign.ctaLink.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="rounded-[4px] bg-white px-8 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
                  >
                    {campaign.ctaText}
                  </Link>
                  <Link 
                    href="/shop"
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
