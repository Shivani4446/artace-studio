import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import AuthSessionProvider from "@/components/auth/AuthSessionProvider";
import ProductImageProtection from "./product-image-protection";
import PromotionModal from "@/components/ui/PromotionModal";
import { buildSiteUrl, getSiteOrigin } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sentient = localFont({
  src: [
    {
      path: "./fonts/Sentient-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "./fonts/Sentient-VariableItalic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-sentient",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: "Handcrafted Canvas Paintings in India | Artace Studio",
  description:
    "Buy handcrafted canvas paintings online in India. Discover original wall art, spiritual paintings, abstract artworks, and custom-made commissions from Artace Studio.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "handcrafted canvas paintings",
    "buy paintings online india",
    "custom canvas paintings",
    "wall art india",
    "artace studio",
  ],
  openGraph: {
    title: "Handcrafted Canvas Paintings in India | Artace Studio",
    description:
      "Buy handcrafted canvas paintings online in India, from spiritual and abstract wall art to bespoke commissions for your home or office.",
    url: "/",
    siteName: "Artace Studio",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: buildSiteUrl("/artace-studio-home-page-og-image.webp"),
        width: 1200,
        height: 630,
        alt: "Handcrafted canvas paintings by Artace Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Handcrafted Canvas Paintings in India | Artace Studio",
    description:
      "Shop original handcrafted canvas paintings, spiritual wall art, and custom commissions from Artace Studio.",
    images: [buildSiteUrl("/artace-studio-home-page-og-image.webp")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/Artace-logo.svg",
    shortcut: "/Artace-logo.svg",
    apple: "/Artace-logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="en">
      <head>
        <script
          type="text/javascript"
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          async
        />
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="AHn7dT8Dlwwm42L41CA4Xg"
          async
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2637055520014152');
fbq('track', 'PageView');`
          }}
        />
        <noscript>
          <img
            height={1}
            width={1}
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2637055520014152&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${sentient.variable} antialiased`}
      >
        {process.env.NODE_ENV === "production" && gtmId ? (
          <GoogleTagManager gtmId={gtmId} />
        ) : null}
        <AuthSessionProvider>
          <CartProvider>
            <WishlistProvider>
              <PromotionModal />
              <ProductImageProtection />
              <Navbar />
              {children}
              <Footer />
              <Link
                href="https://wa.me/9657609102"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="fixed bottom-5 right-5 z-40 inline-flex transition-transform hover:scale-[1.03] md:bottom-6 md:right-6"
              >
                <Image
                  src="/whatsapp-icon.svg"
                  alt=""
                  aria-hidden="true"
                  width={62}
                  height={62}
                  className="h-[62px] w-[62px] object-contain"
                />
              </Link>
            </WishlistProvider>
          </CartProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
