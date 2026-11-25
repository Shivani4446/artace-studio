interface Window {
  fbq?: (...args: unknown[]) => void;
  /** Defined by the consent-default script in app/layout.tsx. */
  gtag?: (...args: unknown[]) => void;
}
