import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Playfair_Display, Inter } from 'next/font/google';
import { Heart, ArrowRight } from 'lucide-react';
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
    alt: "Classic oil painting of sheep in a pastoral landscape"
  },
  {
    id: 2,
    title: "Land, Light & Life",
    sizes: "5 Sizes",
    image: "/product-2.webp",
    alt: "Watercolor painting of a classic English cottage"
  },
  {
    id: 3,
    title: "Energies of Color & Space",
    sizes: "2 Sizes",
    image: "/product-3.webp",
    alt: "Impressionist coastal painting with flowers"
  },
  {
    id: 4,
    title: "Sacred Art of Ganesh",
    sizes: "1 Sizes",
    image: "/product-4.webp",
    alt: "Sunlit autumn forest painting"
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
            <div key={product.id} className="group flex flex-col">
              
              {/* Image Container */}
              <div className="relative w-full aspect-square overflow-hidden mb-4 bg-gray-200">
                <Image
                  src={product.image}
                  alt={product.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>

              {/* Product Info */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h3 className="font-playfair text-lg text-[#2C2C2C] leading-snug">
                    {product.title}
                  </h3>
                  <span className="font-inter text-[#666666] text-sm">
                    {product.sizes}
                  </span>
                </div>
                
                {/* Wishlist Heart Icon */}
                <button className="text-[#666666] hover:text-black transition-colors mt-1">
                  <Heart className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              <AddToCartButton
                id={product.id}
                title={product.title}
                image={product.image}
                subtitle={product.sizes}
                className="mt-4 self-start"
              />

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ShopBestsellers;
