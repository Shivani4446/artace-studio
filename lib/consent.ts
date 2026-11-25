// Cookie consent — shared between the consent bar, the script loader and the
// inline Consent Mode default in app/layout.tsx.
//
// Categories:
//   necessary  always on: cart, sign-in, currency, wishlist, checkout,
//              security, and this consent choice itself.
//   analytics  Google Analytics 4, Ahrefs analytics.
//   marketing  Google Ads, Meta (Facebook) Pixel, Google Tag Manager tags
//              that use ad storage.
//
// The choice is stored in a first-party cookie so the inline <head> script
// can apply it before any Google tag runs (Google Consent Mode v2).

export const CONSENT_COOKIE = "artace_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

/** Fired on window when the visitor saves a choice (detail: ConsentState). */
export const CONSENT_CHANGED_EVENT = "artace:consent-changed";
/** Fire on window to reopen the preferences dialog (footer "Cookie settings"). */
export const OPEN_CONSENT_SETTINGS_EVENT = "artace:open-cookie-settings";

export type ConsentState = {
  v: number;
  analytics: boolean;
  marketing: boolean;
  /** When the choice was made (ms since epoch). */
  ts: number;
};

export const ALL_GRANTED = { analytics: true, marketing: true } as const;
export const NECESSARY_ONLY = { analytics: false, marketing: false } as const;

export const readConsent = (): ConsentState | null => {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]+)`));
    if (!match) return null;
    const parsed = JSON.parse(decodeURIComponent(match[1])) as Partial<ConsentState>;
    // An older consent version means the categories changed — ask again.
    if (parsed.v !== CONSENT_VERSION) return null;
    return {
      v: CONSENT_VERSION,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      ts: Number(parsed.ts) || Date.now(),
    };
  } catch {
    return null;
  }
};

export const writeConsent = (choice: { analytics: boolean; marketing: boolean }): ConsentState => {
  const state: ConsentState = {
    v: CONSENT_VERSION,
    analytics: choice.analytics,
    marketing: choice.marketing,
    ts: Date.now(),
  };
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(state))}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_CHANGED_EVENT, { detail: state }));
  return state;
};

/** Google Consent Mode v2 signals for a choice. */
export const toGoogleConsent = (choice: { analytics: boolean; marketing: boolean }) => ({
  analytics_storage: choice.analytics ? "granted" : "denied",
  ad_storage: choice.marketing ? "granted" : "denied",
  ad_user_data: choice.marketing ? "granted" : "denied",
  ad_personalization: choice.marketing ? "granted" : "denied",
});

/**
 * Inline <head> script, run before any Google tag: defines gtag, sets every
 * non-essential signal to "denied" by default, then applies a saved choice
 * if there is one. Kept as a string so it can run before React hydrates.
 */
export const CONSENT_DEFAULT_SCRIPT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
var c = null;
try {
  var m = document.cookie.match(/(?:^|; )${CONSENT_COOKIE}=([^;]+)/);
  if (m) { c = JSON.parse(decodeURIComponent(m[1])); if (c.v !== ${CONSENT_VERSION}) c = null; }
} catch (e) { c = null; }
var a = c && c.analytics ? 'granted' : 'denied';
var k = c && c.marketing ? 'granted' : 'denied';
gtag('consent', 'default', {
  analytics_storage: a,
  ad_storage: k,
  ad_user_data: k,
  ad_personalization: k,
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
gtag('set', 'ads_data_redaction', k === 'denied');
`;
