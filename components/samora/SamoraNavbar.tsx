"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";

const NAV_LINKS = [
  { label: "Shop", href: "/samora/shop" },
  { label: "Our Craft", href: "/samora#craft" },
  { label: "Our Story", href: "/samora/our-story" },
  { label: "Corporate Gifting", href: "/samora/corporate-gifting" },
  { label: "FAQ", href: "/samora#faq" },
];

const WHATSAPP_HREF =
  "https://wa.me/9657609102?text=" +
  encodeURIComponent("Hi Samora, I'd like to know more about your handcrafted collection.");

const SamoraNavbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileSearchValue, setMobileSearchValue] = useState("");
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const samoraWishlistCount = wishlistItems.filter((item) =>
    item.href?.startsWith("/samora/shop/")
  ).length;
  const { status: authStatus } = useAuthSession();
  const isAuthenticated = authStatus === "authenticated";
  const accountHref = isAuthenticated
    ? "/dashboard"
    : `/login?callbackUrl=${encodeURIComponent("/samora")}`;

  const goToSearch = (value: string) => {
    const query = value.trim();
    if (!query) return;
    router.push(`/samora/shop?q=${encodeURIComponent(query)}`);
    setIsSearchOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-[60] border-b border-[#2b2420]/10 bg-[#fbf6ef]/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between px-5 md:px-10">
        <Link href="/samora" onClick={() => setIsMenuOpen(false)}>
          <Image
            src="/samroa-logo.svg"
            alt="Samora by Artace Studio"
            width={190}
            height={125}
            className="h-11 w-auto md:h-14"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-[14.5px] font-medium text-[#3f382f] transition-colors hover:text-[#c1683d]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="https://artacestudio.com"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#2b2420]/20 px-4 py-2.5 text-[13.5px] font-medium text-[#2b2420] transition-colors hover:border-[#2b2420]/40"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Artace Studio
          </Link>
          <Link
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#c1683d] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#a8552f]"
          >
            Get in Touch
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </Link>
          <button
            type="button"
            onClick={() => setIsSearchOpen((open) => !open)}
            aria-label={isSearchOpen ? "Close search" : "Search"}
            aria-expanded={isSearchOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#2b2420]/20 text-[#2b2420] transition-colors hover:border-[#2b2420]/40"
          >
            <Search className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <Link
            href={accountHref}
            aria-label={isAuthenticated ? "Account" : "Sign in"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#2b2420]/20 text-[#2b2420] transition-colors hover:border-[#2b2420]/40"
          >
            <UserRound className="h-4 w-4" strokeWidth={1.75} />
          </Link>
          <Link
            href="/samora/wishlist"
            aria-label="Wishlist"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#2b2420]/20 text-[#2b2420] transition-colors hover:border-[#2b2420]/40"
          >
            <Heart className="h-4 w-4" strokeWidth={1.75} />
            {samoraWishlistCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c1683d] px-1 text-[10px] font-semibold text-white">
                {samoraWishlistCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/samora/cart"
            aria-label="Cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#2b2420]/20 text-[#2b2420] transition-colors hover:border-[#2b2420]/40"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
            {itemCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c1683d] px-1 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href={accountHref}
            aria-label={isAuthenticated ? "Account" : "Sign in"}
            className="inline-flex h-10 w-10 items-center justify-center text-[#2b2420]"
          >
            <UserRound className="h-5 w-5" strokeWidth={1.75} />
          </Link>
          <Link
            href="/samora/wishlist"
            aria-label="Wishlist"
            className="relative inline-flex h-10 w-10 items-center justify-center text-[#2b2420]"
          >
            <Heart className="h-5 w-5" strokeWidth={1.75} />
            {samoraWishlistCount > 0 ? (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#c1683d] px-1 text-[9px] font-semibold text-white">
                {samoraWishlistCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/samora/cart"
            aria-label="Cart"
            className="relative inline-flex h-10 w-10 items-center justify-center text-[#2b2420]"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
            {itemCount > 0 ? (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#c1683d] px-1 text-[9px] font-semibold text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="inline-flex h-10 w-10 items-center justify-center text-[#2b2420]"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isSearchOpen ? (
        <div className="hidden border-t border-[#2b2420]/10 bg-[#fbf6ef] px-5 py-4 lg:block md:px-10">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              goToSearch(searchValue);
            }}
            className="mx-auto flex max-w-[560px] items-center gap-2 rounded-full border border-[#2b2420]/20 bg-white px-4 py-2.5"
          >
            <Search className="h-4 w-4 shrink-0 text-[#8a7c68]" strokeWidth={1.75} />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search tote bags, coasters, trays, name plates..."
              autoFocus
              className="w-full bg-transparent text-[14.5px] text-[#2b2420] outline-none placeholder:text-[#8a7c68]"
            />
          </form>
        </div>
      ) : null}

      {isMenuOpen ? (
        <div className="border-t border-[#2b2420]/10 bg-[#fbf6ef] px-5 pb-6 pt-2 lg:hidden">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              goToSearch(mobileSearchValue);
            }}
            className="mb-3 flex items-center gap-2 rounded-full border border-[#2b2420]/20 bg-white px-4 py-2.5"
          >
            <Search className="h-4 w-4 shrink-0 text-[#8a7c68]" strokeWidth={1.75} />
            <input
              type="text"
              value={mobileSearchValue}
              onChange={(event) => setMobileSearchValue(event.target.value)}
              placeholder="Search Samora..."
              className="w-full bg-transparent text-[14.5px] text-[#2b2420] outline-none placeholder:text-[#8a7c68]"
            />
          </form>
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="border-b border-[#2b2420]/[0.06] py-3 text-[15px] font-medium text-[#3f382f]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="https://artacestudio.com"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[#2b2420]/20 px-5 py-3 text-[14px] font-medium text-[#2b2420]"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              Back to Artace Studio
            </Link>
            <Link
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#c1683d] px-5 py-3 text-[14px] font-medium text-white"
            >
              Get in Touch
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default SamoraNavbar;
