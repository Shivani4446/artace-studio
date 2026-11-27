"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import ConsentScripts from "./ConsentScripts";
import {
  ALL_GRANTED,
  CONSENT_CHANGED_EVENT,
  NECESSARY_ONLY,
  OPEN_CONSENT_SETTINGS_EVENT,
  readConsent,
  toGoogleConsent,
  writeConsent,
  type ConsentState,
} from "@/lib/consent";

type Choice = { analytics: boolean; marketing: boolean };

const CATEGORIES: {
  key: "necessary" | keyof Choice;
  title: string;
  body: string;
  locked?: boolean;
}[] = [
  {
    key: "necessary",
    title: "Necessary",
    body: "Keep the site working: your cart, sign-in, currency, wishlist, checkout and security. Always on.",
    locked: true,
  },
  {
    key: "analytics",
    title: "Analytics",
    body: "Let Google Analytics use cookies so we can understand return visits and improve the site.",
  },
  {
    key: "marketing",
    title: "Marketing",
    body: "Measure our ads and show you relevant ones on other sites (Google Ads, Meta).",
  },
];

const Toggle = ({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
  label: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange?.(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f1f1f] ${
      checked ? "bg-[#1f1f1f]" : "bg-[#d6d1c7]"
    } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
  >
    <span
      className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
        checked ? "translate-x-[22px]" : "translate-x-0.5"
      }`}
    />
  </button>
);

export default function CookieConsent() {
  // undefined = not read yet (SSR / first paint) — render nothing until we
  // know, so the bar never flashes for visitors who already chose.
  const [consent, setConsent] = useState<ConsentState | null | undefined>(undefined);
  const [showSettings, setShowSettings] = useState(false);
  const [draft, setDraft] = useState<Choice>({ ...NECESSARY_ONLY });

  useEffect(() => {
    setConsent(readConsent());

    const onOpen = () => {
      const current = readConsent();
      setDraft(current ? { analytics: current.analytics, marketing: current.marketing } : { ...NECESSARY_ONLY });
      setShowSettings(true);
    };
    window.addEventListener(OPEN_CONSENT_SETTINGS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CONSENT_SETTINGS_EVENT, onOpen);
  }, []);

  const save = useCallback(
    (choice: Choice) => {
      const previous = consent;
      const next = writeConsent(choice);
      setConsent(next);
      setShowSettings(false);

      window.gtag?.("consent", "update", toGoogleConsent(choice));
      if (typeof window.fbq === "function") {
        window.fbq("consent", choice.marketing ? "grant" : "revoke");
      }

      // Withdrawing a category: scripts that already loaded can't be
      // unloaded, so reload to start clean with only what's allowed now.
      const withdrew =
        (previous?.analytics && !choice.analytics) || (previous?.marketing && !choice.marketing);
      if (withdrew) window.location.reload();
    },
    [consent]
  );

  // Keep other tabs/components in sync.
  useEffect(() => {
    const onChange = (event: Event) => setConsent((event as CustomEvent<ConsentState>).detail);
    window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
  }, []);

  const openSettings = () => {
    setDraft(consent ? { analytics: consent.analytics, marketing: consent.marketing } : { ...NECESSARY_ONLY });
    setShowSettings(true);
  };

  const showBar = consent === null && !showSettings;

  return (
    <>
      {consent !== undefined ? <ConsentScripts consent={consent} /> : null}

      {showBar ? (
        <div
          role="region"
          aria-label="Cookie consent"
          className="fixed inset-x-3 bottom-3 z-[95] sm:inset-x-auto sm:left-5 sm:bottom-5 sm:max-w-[460px]"
        >
          <div className="rounded-2xl border border-[#1f1f1f]/10 bg-white p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4efe6] text-[#a4532f]">
                <Cookie className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-inter text-[15px] font-semibold text-[#1f1f1f]">We value your privacy</p>
                <p className="mt-1 font-inter text-[13.5px] leading-6 text-[#5f5a52]">
                  We use necessary cookies to run the site, and anonymous, cookie-free statistics to
                  see how it&apos;s used. With your permission we&apos;d also use analytics and
                  marketing cookies to improve the site and measure our ads.{" "}
                  <Link href="/privacy-policy" className="font-medium text-[#1f1f1f] underline underline-offset-2">
                    Privacy policy
                  </Link>
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={() => save(ALL_GRANTED)}
                className="col-span-2 rounded-xl bg-[#1f1f1f] px-4 py-2.5 font-inter text-[14px] font-semibold text-white transition-colors hover:bg-black sm:col-span-1"
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={() => save(NECESSARY_ONLY)}
                className="rounded-xl border border-[#1f1f1f]/15 px-4 py-2.5 font-inter text-[14px] font-semibold text-[#1f1f1f] transition-colors hover:bg-[#f6f3ee]"
              >
                Necessary only
              </button>
              <button
                type="button"
                onClick={openSettings}
                className="rounded-xl px-3 py-2.5 font-inter text-[14px] font-medium text-[#5f5a52] underline underline-offset-4 hover:text-[#1f1f1f]"
              >
                Manage
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showSettings ? (
        <div className="fixed inset-0 z-[110] flex items-end justify-center p-3 sm:items-center sm:p-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => (consent ? setShowSettings(false) : undefined)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
            className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-[520px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="cookie-settings-title" className="font-display text-[24px] leading-tight text-[#1f1f1f]">
                Cookie preferences
              </h2>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                aria-label="Close cookie preferences"
                className="-mr-2 -mt-1 flex h-9 w-9 items-center justify-center rounded-full text-[#5f5a52] hover:bg-[#f6f3ee]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 font-inter text-[13.5px] leading-6 text-[#5f5a52]">
              Choose which cookies we can use. You can change this any time from &ldquo;Cookie
              settings&rdquo; in the footer.
            </p>
            <p className="mt-3 rounded-xl bg-[#f6f3ee] px-4 py-3 font-inter text-[12.5px] leading-5 text-[#5f5a52]">
              Whatever you choose, we collect anonymous, cookie-free usage statistics (page views
              and visit counts through Ahrefs and Google Analytics&apos; cookieless mode). They
              don&apos;t store anything on your device or identify you.
            </p>

            <ul className="mt-5 divide-y divide-[#1f1f1f]/8 rounded-xl border border-[#1f1f1f]/10">
              {CATEGORIES.map((category) => {
                const checked = category.locked ? true : draft[category.key as keyof Choice];
                return (
                  <li key={category.key} className="flex items-start justify-between gap-4 p-4">
                    <div>
                      <p className="font-inter text-[14.5px] font-semibold text-[#1f1f1f]">
                        {category.title}
                        {category.locked ? (
                          <span className="ml-2 rounded-full bg-[#f4efe6] px-2 py-0.5 text-[11px] font-medium text-[#8a6410]">
                            Always on
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 font-inter text-[13px] leading-5 text-[#6b655c]">{category.body}</p>
                    </div>
                    <Toggle
                      label={`${category.title} cookies`}
                      checked={checked}
                      disabled={category.locked}
                      onChange={(next) =>
                        setDraft((current) => ({ ...current, [category.key]: next }))
                      }
                    />
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => save(NECESSARY_ONLY)}
                className="rounded-xl border border-[#1f1f1f]/15 px-4 py-2.5 font-inter text-[14px] font-semibold text-[#1f1f1f] hover:bg-[#f6f3ee]"
              >
                Necessary only
              </button>
              <button
                type="button"
                onClick={() => save(draft)}
                className="rounded-xl border border-[#1f1f1f]/15 px-4 py-2.5 font-inter text-[14px] font-semibold text-[#1f1f1f] hover:bg-[#f6f3ee]"
              >
                Save choices
              </button>
              <button
                type="button"
                onClick={() => save(ALL_GRANTED)}
                className="rounded-xl bg-[#1f1f1f] px-4 py-2.5 font-inter text-[14px] font-semibold text-white hover:bg-black"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
