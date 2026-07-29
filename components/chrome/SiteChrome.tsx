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
      <PromotionModal />
      <ProductImageProtection />
      <div className="sticky top-0 z-[60]">
        <PromotionBar />
        <Navbar />
      </div>
      {children}
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
