import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Playfair_Display, Inter } from 'next/font/google';
import { ArrowRight } from 'lucide-react';
import AddToCartButton from '@/components/cart/AddToCartButton';

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

// Product Data
const products = [
  {
    id: 1,
    title: "Moments of Inner Peace",
    sizes: "4 Sizes",
    image: "/product-1.webp",
    alt: "Classic oil painting of sheep in a pastoral landscape",
    href: "/shop"
  },
  {
    id: 2,
    title: "Land, Light & Life",
    sizes: "5 Sizes",
    image: "/product-2.webp",
    alt: "Watercolor painting of a classic English cottage",
    href: "/shop"
  },
  {
    id: 3,
    title: "Energies of Color & Space",
    sizes: "2 Sizes",
    image: "/product-3.webp",
    alt: "Impressionist coastal painting with flowers",
    href: "/shop"
  },
  {
    id: 4,
    title: "Sacred Art of Ganesh",
    sizes: "1 Sizes",
    image: "/product-4.webp",
    alt: "Sunlit autumn forest painting",
    href: "/shop"
  }
];

const ShopBestsellers = () => {
  return (
    <section className={`bg-[#FAF9F6] py-20 px-6 md:px-12 lg:px-24 ${playfair.variable} ${inter.variable}`}>
      <div className="max-w-[1440px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 md:mb-14 gap-4">
          <h2 className="font-playfair text-3xl md:text-5xl text-[#2C2C2C] uppercase tracking-wide">
            Shop Bestsellers
          </h2>
          
          <Link 
            href="/shop" 
            className="group flex items-center gap-2 font-inter text-[#4A4846] text-sm font-medium border-b border-[#4A4846] pb-0.5 hover:text-black hover:border-black transition-colors"
          >
            SHOP ALL
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {products.map((product) => (
            <article key={product.id} className="group relative flex flex-col">
              <Link
                href={product.href}
                aria-label={`Open ${product.title}`}
                className="absolute inset-0 z-10"
              />

              <div className="relative z-0">
                {/* Image Container */}
                <div className="relative mb-4 w-full aspect-square overflow-hidden rounded-[12px] bg-gray-200">
                  <Image
                    src={product.image}
                    alt={product.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                {/* Product Info */}
                <div className="flex flex-col gap-1">
                  <p className="font-inter text-[14px] text-[#666666]">
                    Handmade Painting
                  </p>
                  <h3 className="font-playfair text-[18px] text-[#2C2C2C] leading-snug">
                    {product.title}
                  </h3>
                  <p className="font-inter text-[14px] text-[#666666]">
                    Handmade Painting | {product.sizes} | Acrylic Colors on Canvas
                  </p>
                </div>
              </div>

              <div className="relative z-20 mt-4 translate-y-1 opacity-0 transition-all duration-300 pointer-events-none group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto">
                <AddToCartButton
                  id={product.id}
                  title={product.title}
                  image={product.image}
                  subtitle={`Handmade Painting | ${product.sizes} | Acrylic Colors on Canvas`}
                  className="self-start"
                />
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ShopBestsellers;
