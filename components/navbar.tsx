"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Collections", href: "/collections" },
  { name: "Shop by Artists", href: "/artists" },
  { name: "Sale", href: "/sale" },
  { name: "Contact", href: "/contact-us" },
];

const resourceLinks = [
  { name: "About us", href: "/about-us" },
  { name: "Blogs", href: "/blogs" },
];

const searchStaticPrefix = "Search For";
const searchPlaceholderTerms = [
  "Paintings",
  "Acrylic Paintings",
  "Oil Paintings",
  "Radha Krishna",
  "Landscapes",
  "Abstract",
  "Buddha Paintings",
  "Modern Art",
  "Portraits",
  "Gifts",
  "Art",
  "Table Top Paintings",
  "Custom Order",
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [desktopSearchValue, setDesktopSearchValue] = useState("");
  const [mobileSearchValue, setMobileSearchValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isPlaceholderSliding, setIsPlaceholderSliding] = useState(false);
  const { items, itemCount, subtotal, incrementItem, decrementItem, removeItem } =
    useCart();

  useEffect(() => {
    if (!isMiniCartOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMiniCartOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMiniCartOpen]);

  useEffect(() => {
    const holdDurationMs = 2200;
    const slideDurationMs = 320;
    let holdTimeoutId: number | null = null;
    let slideTimeoutId: number | null = null;

    const startCycle = () => {
      holdTimeoutId = window.setTimeout(() => {
        setIsPlaceholderSliding(true);
        slideTimeoutId = window.setTimeout(() => {
          setPlaceholderIndex(
            (currentIndex) => (currentIndex + 1) % searchPlaceholderTerms.length
          );
          setIsPlaceholderSliding(false);
          startCycle();
        }, slideDurationMs);
      }, holdDurationMs);
    };

    startCycle();

    return () => {
      if (holdTimeoutId !== null) {
        window.clearTimeout(holdTimeoutId);
      }
      if (slideTimeoutId !== null) {
        window.clearTimeout(slideTimeoutId);
      }
    };
  }, []);

  return (
    <>
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

            <div className="relative group">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[#333333] font-inter text-[15px] font-medium tracking-wide transition-colors hover:text-black"
              >
                Resources
                <ChevronDown className="h-4 w-4" strokeWidth={1.8} />
              </button>

              <div className="invisible absolute left-0 top-full z-20 pt-3 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="min-w-[180px] rounded-[12px] border border-[#1f1f1f]/10 bg-white p-2 shadow-[0_18px_35px_rgba(0,0,0,0.08)]">
                  {resourceLinks.map((resource) => (
                    <Link
                      key={resource.name}
                      href={resource.href}
                      className="block rounded-[6px] px-3 py-2 text-[#333333] font-inter text-[14px] font-medium transition-colors hover:bg-[#f4f4f4] hover:text-black"
                    >
                      {resource.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar & Mobile Toggle */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Search Input (Desktop/Tablet) */}
            <div className="hidden md:flex items-center bg-[#F2F2F2] rounded-full px-4 py-2.5 w-[200px] lg:w-[280px] transition-all focus-within:ring-1 focus-within:ring-gray-300">
              <Search className="w-5 h-5 text-[#555555] mr-3" strokeWidth={1.5} />
              <div className="relative w-full">
                <input
                  type="text"
                  aria-label="Search"
                  value={desktopSearchValue}
                  onChange={(event) => setDesktopSearchValue(event.target.value)}
                  className="relative z-10 bg-transparent border-none outline-none text-sm text-[#333333] w-full font-inter"
                />
                {desktopSearchValue.length === 0 && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 flex max-w-full items-center text-sm text-[#555555] font-inter"
                  >
                    <span className="mr-1 shrink-0">{searchStaticPrefix}</span>
                    <span className="relative h-[1.25em] overflow-hidden whitespace-nowrap">
                      <span
                        className={`flex flex-col ${
                          isPlaceholderSliding
                            ? "transition-transform duration-300 ease-out -translate-y-[1.25em]"
                            : "translate-y-0"
                        }`}
                      >
                        <span className="h-[1.25em] leading-[1.25em]">
                          {searchPlaceholderTerms[placeholderIndex]}
                        </span>
                        <span className="h-[1.25em] leading-[1.25em]">
                          {
                            searchPlaceholderTerms[
                              (placeholderIndex + 1) % searchPlaceholderTerms.length
                            ]
                          }
                        </span>
                      </span>
                    </span>
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              aria-label="Open cart"
              onClick={() => setIsMiniCartOpen(true)}
              className="relative flex items-center justify-center p-2 text-[#333333] transition-colors hover:text-black"
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={1.8} />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#1f1f1f] px-1.5 text-center text-[11px] font-semibold leading-[18px] text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

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
              <div className="relative w-full">
                <input
                  type="text"
                  aria-label="Search"
                  value={mobileSearchValue}
                  onChange={(event) => setMobileSearchValue(event.target.value)}
                  className="relative z-10 bg-transparent border-none outline-none text-base text-[#333333] w-full font-inter"
                />
                {mobileSearchValue.length === 0 && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 flex max-w-full items-center text-base text-[#555555] font-inter"
                  >
                    <span className="mr-1 shrink-0">{searchStaticPrefix}</span>
                    <span className="relative h-[1.25em] overflow-hidden whitespace-nowrap">
                      <span
                        className={`flex flex-col ${
                          isPlaceholderSliding
                            ? "transition-transform duration-300 ease-out -translate-y-[1.25em]"
                            : "translate-y-0"
                        }`}
                      >
                        <span className="h-[1.25em] leading-[1.25em]">
                          {searchPlaceholderTerms[placeholderIndex]}
                        </span>
                        <span className="h-[1.25em] leading-[1.25em]">
                          {
                            searchPlaceholderTerms[
                              (placeholderIndex + 1) % searchPlaceholderTerms.length
                            ]
                          }
                        </span>
                      </span>
                    </span>
                  </span>
                )}
              </div>
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

              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#666666]">
                  Resources
                </p>
                <div className="mt-3 flex flex-col gap-3">
                  {resourceLinks.map((resource) => (
                    <Link
                      key={resource.name}
                      href={resource.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-[#333333] font-inter text-lg font-medium"
                    >
                      {resource.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div
        className={`fixed inset-0 z-[70] transition-opacity duration-300 ease-out ${
          isMiniCartOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Close mini cart"
          onClick={() => setIsMiniCartOpen(false)}
          className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
            isMiniCartOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          className={`absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
            isMiniCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <h3 className="font-display text-2xl text-[#222]">Your Cart</h3>
              <button
                type="button"
                onClick={() => setIsMiniCartOpen(false)}
                className="rounded-full p-2 text-[#444] transition-colors hover:bg-gray-100"
                aria-label="Close cart panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="font-display text-2xl text-[#222]">Cart is empty</p>
                  <p className="mt-2 text-sm text-[#666]">
                    Add products to see them here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsMiniCartOpen(false)}
                    className="mt-6 border border-[#222] px-5 py-2 text-sm font-medium text-[#222] transition-colors hover:bg-[#222] hover:text-white"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-4 border-b border-[#1f1f1f]/10 pb-5"
                    >
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-[#f4f4f4]">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-display text-[18px] leading-snug text-[#222]">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="mt-1 text-xs uppercase tracking-[0.05em] text-[#777]">
                            {item.subtitle}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center border border-[#222]/20">
                            <button
                              type="button"
                              onClick={() => decrementItem(item.id)}
                              className="px-2.5 py-1.5 text-[#222] hover:bg-[#f3f3f3]"
                              aria-label={`Decrease quantity of ${item.title}`}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => incrementItem(item.id)}
                              className="px-2.5 py-1.5 text-[#222] hover:bg-[#f3f3f3]"
                              aria-label={`Increase quantity of ${item.title}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.05em] text-[#666] hover:text-[#111]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-gray-100 px-6 py-5">
              {subtotal > 0 && (
                <div className="mb-4 flex items-center justify-between text-sm text-[#444]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#222]">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsMiniCartOpen(false)}
                  className="border border-[#222] px-4 py-3 text-sm font-medium text-[#222] transition-colors hover:bg-[#222] hover:text-white"
                >
                  Continue
                </button>
                <Link
                  href="/cart"
                  onClick={() => setIsMiniCartOpen(false)}
                  className="bg-[#222] px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-black"
                >
                  Go to Cart
                </Link>
              </div>
            </div>
        </aside>
      </div>
    </>
  );
};

export default Navbar;
