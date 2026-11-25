import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import AuthSessionProvider from "@/components/auth/AuthSessionProvider";
import SiteChrome from "@/components/chrome/SiteChrome";
import { buildSiteUrl, getSiteOrigin } from "@/lib/site";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";
import { DEFAULT_CURRENCY } from "@/lib/currency/cookie";
import AffiliateClickTracker from "@/components/affiliates/AffiliateClickTracker";
import WebVitalsReporter from "@/components/analytics/WebVitalsReporter";
import { inter } from "@/lib/fonts";
import CookieConsent from "@/components/consent/CookieConsent";
import { CONSENT_DEFAULT_SCRIPT } from "@/lib/consent";

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
  return (
    <html lang="en">
      <head>
        {/* Google Consent Mode v2 defaults — every non-essential signal is
            "denied" until the visitor chooses in the cookie bar
            (components/consent). Must run before any Google tag, hence
            beforeInteractive. GA4, Google Ads, GTM, Ahrefs and the Meta
            Pixel are loaded by components/consent/ConsentScripts only for
            the categories the visitor allowed. */}
        <Script
          id="consent-default"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }}
        />
        {/* Trustpilot / Merchant widget are functional embeds (a reviews
            badge and the Google store badge), not trackers, so they don't
            wait for cookie consent. Neither needs to be ready
            immediately, so they load via strategy="lazyOnload" (Next's
            recommended strategy for this exact category: "chat support
            plugins or social media widgets") instead of blocking on the
            main thread during initial load. */}
        <Script
          type="text/javascript"
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          strategy="lazyOnload"
        />
        <Script
          id="merchantWidgetScript"
          src="https://www.gstatic.com/shopping/merchant/merchantwidget.js"
          strategy="lazyOnload"
        />
        <Script
          id="merchantWidgetStarter"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                function startMerchantWidget() {
                  if (
                    typeof window.merchantwidget === 'undefined' ||
                    typeof window.merchantwidget.start !== 'function'
                  ) {
                    return;
                  }
                  window.merchantwidget.start({
                    merchant_id: 689111711,
                    position: 'BOTTOM_LEFT',
                    region: 'ALL',
                  });
                }
                function attachMerchantWidget() {
                  var script = document.getElementById('merchantWidgetScript');
                  if (!script) {
                    return false;
                  }
                  if (script.readyState === 'complete' || script.readyState === 'loaded') {
                    startMerchantWidget();
                  } else {
                    script.addEventListener('load', startMerchantWidget);
                  }
                  return true;
                }
                if (!attachMerchantWidget()) {
                  document.addEventListener('DOMContentLoaded', attachMerchantWidget);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${sentient.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <AffiliateClickTracker />
        </Suspense>
        <WebVitalsReporter />
        <CookieConsent />
        <AuthSessionProvider>
          <CurrencyProvider initialCurrency={DEFAULT_CURRENCY} initialRates={null}>
          <CartProvider>
            <WishlistProvider>
              <SiteChrome>{children}</SiteChrome>
            </WishlistProvider>
          </CartProvider>
          </CurrencyProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
