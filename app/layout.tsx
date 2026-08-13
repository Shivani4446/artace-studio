import type { Metadata } from "next";
import { Suspense } from "react";
import { GoogleTagManager } from "@next/third-parties/google";
import { Inter } from "next/font/google";
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
        {/* Google tag (gtag.js) — base tag, must stay first in <head> per
            Google's install instructions. Configures both the GA4 property
            and the Google Ads account on the same loaded script/dataLayer,
            per Google's guidance for sites with multiple tag IDs (only one
            gtag/js loader is needed; each ID gets its own 'config' call).
            Separate from the GTM container below; other Ads/GA4 events (see
            utils/gtm.ts) are pushed to the same window.dataLayer this
            initializes. */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-27V3DFEVET"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-27V3DFEVET');
              gtag('config', 'AW-11024941492');
            `,
          }}
        />
        <script
          type="text/javascript"
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          async
        />
        <script
          id="merchantWidgetScript"
          src="https://www.gstatic.com/shopping/merchant/merchantwidget.js"
          defer
        />
        <script
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
        <Suspense fallback={null}>
          <AffiliateClickTracker />
        </Suspense>
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
