"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProductImageProtection from "@/app/product-image-protection";
import ChatWidget from "@/components/chat/ChatWidget";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import PromotionBar from "@/components/ui/PromotionBar";
import PromotionModal from "@/components/ui/PromotionModal";

/**
 * Samora is a distinct sub-brand living under /samora with its own nav/footer
 * (app/samora/layout.tsx). Artace's chrome — nav, footer, promo bar/modal,
 * chat widget, WhatsApp bubble — is irrelevant there (different products,
 * different WhatsApp line), so it's skipped for that path instead of stacking
 * on top of Samora's own chrome.
 */
const SiteChrome = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const isSamora = pathname === "/samora" || pathname?.startsWith("/samora/");

  if (isSamora) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Keyboard/screen-reader users can jump straight past the nav to the
          page content — visually hidden until it receives focus (always the
          first focusable element on the page, which is the point of a skip
          link). Targets the plain wrapper div below rather than each page's
          own <main> so this doesn't require touching every page file. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-[14px] focus:font-medium focus:text-black focus:shadow-lg"
      >
        Skip to content
      </a>
      <PromotionModal />
      <ProductImageProtection />
      <div className="sticky top-0 z-[60]">
        <PromotionBar />
        <Navbar />
      </div>
      <div id="main-content">{children}</div>
      <Footer />
      <ChatWidget />
      <Link
        href="https://wa.me/9657609102"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on WhatsApp"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 transition-transform hover:scale-[1.03] md:bottom-6 md:right-6"
      >
        <span className="hidden rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-black shadow-[0_8px_24px_rgba(0,0,0,0.12)] sm:inline-block">
          Order on WhatsApp
        </span>
        <Image
          src="/whatsapp-icon.svg"
          alt=""
          aria-hidden="true"
          width={62}
          height={62}
          className="h-[52px] w-[52px] object-contain sm:h-[62px] sm:w-[62px]"
        />
      </Link>
    </>
  );
};

export default SiteChrome;
