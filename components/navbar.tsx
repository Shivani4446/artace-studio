"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'Collections', href: '/collections' },
  { name: 'Shop by Artists', href: '/artists' },
  { name: 'Sale', href: '/sale' },
  { name: 'About us', href: '/about-us' },
  { name: 'Contact', href: '/contact-us' },
  { name: 'Blogs', href: '/blogs' },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 md:h-24 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex-shrink-0">
          <Link href="/" className="group">
            <Image
              src="/Artace-logo.svg"
              alt="Artace logo"
              width={47}
              height={32}
              className="h-8 w-auto md:h-10"
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 xl:gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[#333333] font-inter text-[15px] font-medium tracking-wide hover:text-black transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Search Bar & Mobile Toggle */}
        <div className="flex items-center gap-4">
          
          {/* Search Input (Desktop/Tablet) */}
          <div className="hidden md:flex items-center bg-[#F2F2F2] rounded-full px-4 py-2.5 w-[200px] lg:w-[280px] transition-all focus-within:ring-1 focus-within:ring-gray-300">
            <Search className="w-5 h-5 text-[#555555] mr-3" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent border-none outline-none text-sm text-[#333333] placeholder:text-[#555555] w-full font-inter"
            />
          </div>

          <Link
            href="/cart"
            aria-label="Open cart"
            className="hidden md:flex items-center justify-center p-2 text-[#333333] transition-colors hover:text-black"
          >
            <ShoppingCart className="h-5 w-5" strokeWidth={1.8} />
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 text-[#333333]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl py-6 px-6 flex flex-col gap-6">
          {/* Mobile Search */}
          <div className="flex items-center bg-[#F2F2F2] rounded-full px-4 py-3 w-full">
            <Search className="w-5 h-5 text-[#555555] mr-3" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-base text-[#333333] w-full"
            />
          </div>

          {/* Mobile Links */}
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#333333] font-inter text-lg font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
