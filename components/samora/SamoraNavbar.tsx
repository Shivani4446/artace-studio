"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Shop", href: "/samora/shop" },
  { label: "Our Craft", href: "/samora#craft" },
  { label: "Our Story", href: "/samora#story" },
  { label: "FAQ", href: "/samora#faq" },
];

const WHATSAPP_HREF =
  "https://wa.me/9657609102?text=" +
  encodeURIComponent("Hi Samora, I'd like to know more about your handcrafted collection.");

const SamoraNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14.5px] font-medium text-[#3f382f] transition-colors hover:text-[#c1683d]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center md:flex">
          <Link
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#c1683d] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#a8552f]"
          >
            Get in Touch
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          className="inline-flex h-10 w-10 items-center justify-center text-[#2b2420] md:hidden"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-[#2b2420]/10 bg-[#fbf6ef] px-5 pb-6 pt-2 md:hidden">
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
          <Link
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#c1683d] px-5 py-3 text-[14px] font-medium text-white"
          >
            Get in Touch
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      ) : null}
    </header>
  );
};

export default SamoraNavbar;
