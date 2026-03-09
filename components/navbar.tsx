"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Search,
  ShoppingCart,
  Heart,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";

const desktopLinks = [
  { name: "Home", href: "/" },
  { name: "Collections", href: "/shop", hasMegaMenu: true },
  { name: "Shop", href: "/shop", hasMegaMenu: true },
];

const resourceLinks = [
  { name: "About Us", href: "/about-us" },
  { name: "Team", href: "/team" },
  { name: "Blogs", href: "/blogs" },
];

const collectionLinks = [
  { name: "Ganapati Painting", href: "/shop?category=ganapati-paintings" },
  { name: "Radha Krishna", href: "/shop?category=radha-krishna-paintings" },
  { name: "Buddha Paintings", href: "/shop?category=buddha-paintings" },
  { name: "Family Portraits", href: "/shop?category=figurative-paintings" },
];

const paintingLinks = [
  { name: "Religious Painting", href: "/shop?category=religious-paintings" },
  { name: "Landscapes Painting", href: "/shop?category=landscapes-cityscapes-paintings" },
  { name: "Cityscape Paintings", href: "/shop?category=landscapes-cityscapes-paintings" },
  { name: "Vastu Paintings", href: "/shop?category=vastu-paintings" },
  { name: "Table Top Paintings", href: "/shop?category=table-top-paintings" },
  { name: "Buddha Paintings", href: "/shop?category=buddha-paintings" },
];

type MobileMenuSubLink = {
  name: string;
  href: string;
};

type MobileMenuLink = {
  name: string;
  href: string;
  children?: MobileMenuSubLink[];
};

const mobileLinks: MobileMenuLink[] = [
  { name: "Home", href: "/" },
  {
    name: "Collections",
    href: "/shop",
    children: [{ name: "View All Collections", href: "/shop" }, ...collectionLinks],
  },
  {
    name: "Shop",
    href: "/shop",
    children: [...paintingLinks, { name: "Shop All", href: "/shop" }],
  },
  {
    name: "Resources",
    href: "/about-us",
    children: resourceLinks,
  },
  { name: "Contact", href: "/contact-us" },
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
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [expandedMobileMenus, setExpandedMobileMenus] = useState<Record<string, boolean>>(
    {}
  );
  const [desktopSearchValue, setDesktopSearchValue] = useState("");
  const [mobileSearchValue, setMobileSearchValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isPlaceholderSliding, setIsPlaceholderSliding] = useState(false);
  const { itemCount: wishlistCount } = useWishlist();
  const { items, itemCount, subtotal, incrementItem, decrementItem, removeItem } =
    useCart();
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setExpandedMobileMenus({});
  };
  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      setExpandedMobileMenus({});
    }
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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
      <nav
        className="sticky top-0 z-50 border-b border-[#d8d3ca] bg-white"
        onMouseLeave={() => setIsMegaMenuOpen(false)}
      >
        <div className="mx-auto flex h-[88px] max-w-[1440px] items-center justify-between px-6 md:h-[102px] md:px-12">
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

          <div className="hidden lg:flex items-center gap-10">
            {desktopLinks.map((link) =>
              link.hasMegaMenu ? (
                <button
                  key={link.name}
                  type="button"
                  onMouseEnter={() => setIsMegaMenuOpen(true)}
                  onFocus={() => setIsMegaMenuOpen(true)}
                  onClick={() => setIsMegaMenuOpen((current) => !current)}
                  className="inline-flex items-center gap-1 font-inter text-[16px] font-medium text-[#2f2f2f] transition-colors hover:text-black"
                >
                  {link.name}
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      isMegaMenuOpen ? "rotate-180" : ""
                    }`}
                    strokeWidth={1.7}
                  />
                </button>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className="inline-flex items-center gap-1 font-inter text-[16px] font-medium text-[#2f2f2f] transition-colors hover:text-black"
                >
                  {link.name}
                </Link>
              )
            )}

            <div
              className="group relative"
              onMouseEnter={() => setIsMegaMenuOpen(false)}
              onFocus={() => setIsMegaMenuOpen(false)}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 font-inter text-[16px] font-medium text-[#2f2f2f] transition-colors hover:text-black"
              >
                Resources
                <ChevronDown className="h-4 w-4" strokeWidth={1.8} />
              </button>

              <div className="invisible absolute left-0 top-full z-20 pt-3 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="min-w-[190px] rounded-[12px] border border-[#1f1f1f]/10 bg-[#f4f2ee] p-2 shadow-[0_18px_35px_rgba(0,0,0,0.08)]">
                  {resourceLinks.map((resource) => (
                    <Link
                      key={resource.name}
                      href={resource.href}
                      className="block rounded-[6px] px-3 py-2 font-inter text-[14px] font-medium text-[#333333] transition-colors hover:bg-[#ece8df] hover:text-black"
                    >
                      {resource.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <div className="hidden md:flex items-center bg-[#f2f2f2] rounded-full px-4 py-2.5 w-[240px] lg:w-[320px] transition-all focus-within:ring-1 focus-within:ring-[#c6c1b6]">
              <Search className="w-5 h-5 text-[#555555] mr-3" strokeWidth={1.5} />
              <div className="relative w-full">
                <input
                  type="text"
                  aria-label="Search"
                  value={desktopSearchValue}
                  onChange={(event) => setDesktopSearchValue(event.target.value)}
                  className="relative z-10 bg-transparent border-none outline-none text-[16px] text-[#333333] w-full font-inter"
                />
                {desktopSearchValue.length === 0 && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 flex max-w-full items-center text-[16px] text-[#555555] font-inter"
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

            <Link
              href="/wishlist"
              aria-label="Open wishlist"
              className="relative inline-flex h-9 w-9 items-center justify-center text-[#2f2f2f] transition-colors hover:text-black md:h-10 md:w-10"
            >
              <Heart className="h-5 w-5" strokeWidth={1.7} />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#1f1f1f] px-1.5 text-center text-[11px] font-semibold leading-[18px] text-white">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              aria-label="Open cart"
              onClick={() => setIsMiniCartOpen(true)}
              className="relative inline-flex h-9 w-9 items-center justify-center text-[#2f2f2f] transition-colors hover:text-black md:h-10 md:w-10"
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={1.7} />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#1f1f1f] px-1.5 text-center text-[11px] font-semibold leading-[18px] text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            <button
              className="p-2 text-[#2f2f2f] lg:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        <div
          className={`absolute left-0 right-0 top-full hidden h-[450px] overflow-hidden border-t border-[#d8d3ca] bg-[#f4f2ee] transition-all duration-200 lg:block ${
            isMegaMenuOpen
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-2 opacity-0"
          }`}
          onMouseEnter={() => setIsMegaMenuOpen(true)}
        >
          <div className="mx-auto h-full max-w-[1440px] px-6 py-8 md:px-12">
            <div className="grid h-full grid-cols-[1fr_1fr_1.2fr_0.95fr] gap-8">
              <div className="pr-6">
                <h3 className="font-inter text-[18px] font-semibold text-[#2f2f2f]">
                  Collection
                </h3>
                <div className="mt-6 space-y-5">
                  {collectionLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block font-inter text-[18px] text-[#555] transition-colors hover:text-black"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-l border-[#c6c1b6] pl-8 pr-6">
                <h3 className="font-inter text-[18px] font-semibold text-[#2f2f2f]">
                  Shop Categories
                </h3>
                <div className="mt-6 space-y-5">
                  {paintingLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block font-inter text-[18px] text-[#555] transition-colors hover:text-black"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link
                    href="/shop"
                    className="mt-1 block font-inter text-[18px] font-semibold text-[#2f2f2f]"
                  >
                    Shop All
                  </Link>
                </div>
              </div>

              <div className="border-l border-[#c6c1b6] pl-8 pr-6">
                <h3 className="font-inter text-[18px] font-semibold text-[#2f2f2f]">
                  Become A Partner
                </h3>
                <p className="mt-4 max-w-[420px] font-inter text-[18px] leading-[1.7] text-[#5c5c5c]">
                  Join our global network of partners and sell your paintings with us.
                </p>
                <Link
                  href="/contact-us"
                  className="mt-10 inline-flex items-center gap-2 rounded-[8px] bg-[#2d2f34] px-6 py-3 font-inter text-[18px] font-medium text-white transition-colors hover:bg-[#1f2124]"
                >
                  Learn More
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="self-stretch pl-2">
                <div className="relative h-full w-full overflow-hidden bg-[#ddd7cc]">
                  <Image
                    src="/who-are-we.webp"
                    alt="Living room with framed wall art"
                    fill
                    sizes="(max-width: 1400px) 22vw, 320px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute left-0 top-full w-full border-b border-gray-100 bg-white px-6 py-6 shadow-xl lg:hidden">
            <div className="flex flex-col gap-6">
              <div className="flex items-center bg-[#f2f2f2] rounded-full px-4 py-3 w-full">
                <Search className="w-5 h-5 text-[#555555] mr-3" />
                <div className="relative w-full">
                  <input
                    type="text"
                    aria-label="Search"
                    value={mobileSearchValue}
                    onChange={(event) => setMobileSearchValue(event.target.value)}
                    className="relative z-10 bg-transparent border-none outline-none text-[16px] text-[#333333] w-full font-inter"
                  />
                  {mobileSearchValue.length === 0 && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 left-0 flex max-w-full items-center text-[16px] text-[#555555] font-inter"
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

              <div className="flex flex-col gap-3">
                {mobileLinks.map((link) => (
                  link.children && link.children.length > 0 ? (
                    <div key={link.name} className="rounded-[12px] bg-[#f7f7f7] p-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMobileMenus((current) => ({
                            ...current,
                            [link.name]: !current[link.name],
                          }))
                        }
                        className="flex w-full items-center justify-between rounded-[10px] px-1 py-1 font-inter text-lg font-medium text-[#333333]"
                        aria-expanded={Boolean(expandedMobileMenus[link.name])}
                        aria-controls={`mobile-submenu-${link.name}`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            expandedMobileMenus[link.name] ? "rotate-180" : ""
                          }`}
                          strokeWidth={1.8}
                        />
                      </button>

                      <div
                        id={`mobile-submenu-${link.name}`}
                        className={`grid transition-all duration-200 ${
                          expandedMobileMenus[link.name]
                            ? "mt-2 grid-rows-[1fr]"
                            : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="space-y-2">
                            {link.children.map((child) => (
                              <Link
                                key={`${link.name}-${child.name}`}
                                href={child.href}
                                onClick={closeMobileMenu}
                                className="block rounded-[10px] bg-white px-3 py-2.5 font-inter text-[15px] font-medium text-[#4a4a4a] transition-colors hover:bg-[#ececec] hover:text-black"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className="rounded-[12px] bg-[#f7f7f7] px-3 py-3 font-inter text-lg font-medium text-[#333333] transition-colors hover:bg-[#ececec]"
                    >
                      {link.name}
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      <div
        className={`fixed inset-0 z-[70] transition-opacity duration-300 ease-out ${
          isMiniCartOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
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
                <span className="font-semibold text-[#222]">${subtotal.toFixed(2)}</span>
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
