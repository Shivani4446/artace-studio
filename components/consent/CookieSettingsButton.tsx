"use client";

import { OPEN_CONSENT_SETTINGS_EVENT } from "@/lib/consent";

// Reopens the cookie preferences dialog (handled by CookieConsent).
export default function CookieSettingsButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_SETTINGS_EVENT))}
      className={className}
    >
      Cookie settings
    </button>
  );
}
