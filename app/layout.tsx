import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";

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
  title: "Artace Studio",
  description: "Premium Canvas Paintings",
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
  return (
    <html lang="en">
      <head>
        <script
          type="text/javascript"
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          async
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${sentient.variable} antialiased`}
      >
        <CartProvider>
          <WishlistProvider>
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
      </body>
    </html>
  );
}
