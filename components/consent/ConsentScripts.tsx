"use client";

import Script from "next/script";
import { GoogleTagManager } from "@next/third-parties/google";
import type { ConsentState } from "@/lib/consent";

const GA4_ID = "G-27V3DFEVET";
const GOOGLE_ADS_ID = "AW-11024941492";
const META_PIXEL_ID = "2637055520014152";
const AHREFS_KEY = "AHn7dT8Dlwwm42L41CA4Xg";

// What loads for whom:
// - GA4 + Google Ads (gtag.js): every visitor, under Google Consent Mode v2
//   "advanced". Without consent the Consent Mode signals stay "denied", so
//   Google sets no cookies and receives only anonymous, cookieless pings it
//   uses for modelling. Defaults are set in app/layout.tsx before this runs.
// - Ahrefs analytics: every visitor. The script uses no cookies or browser
//   storage (checked: no document.cookie / localStorage / sessionStorage /
//   indexedDB), so it needs no consent.
// - Google Tag Manager: only with analytics or marketing consent, because a
//   container can hold tags that ignore Consent Mode.
// - Meta Pixel: only with marketing consent (cross-site ad cookies; Meta has
//   no cookieless mode).
export default function ConsentScripts({ consent }: { consent: ConsentState | null }) {
  const analytics = Boolean(consent?.analytics);
  const marketing = Boolean(consent?.marketing);
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <>
      {/* GA4 + Google Ads share one gtag.js loader; Consent Mode decides what
          each may store. window.gtag is defined by the consent default
          script in <head>. */}
      <Script
        id="gtag-js"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
      />
      <Script
        id="gtag-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.gtag('js', new Date());
            window.gtag('config', '${GA4_ID}');
            window.gtag('config', '${GOOGLE_ADS_ID}');
          `,
        }}
      />

      <Script
        id="ahrefs-analytics"
        src="https://analytics.ahrefs.com/analytics.js"
        data-key={AHREFS_KEY}
        strategy="lazyOnload"
      />

      {(analytics || marketing) && process.env.NODE_ENV === "production" && gtmId ? (
        <GoogleTagManager gtmId={gtmId} />
      ) : null}

      {marketing ? (
        <Script
          id="meta-pixel"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('consent', 'grant');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`,
          }}
        />
      ) : null}
    </>
  );
}
