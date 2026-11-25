"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  IndianRupee,
  PackageCheck,
  Play,
  Sparkles,
  Wallet,
} from "lucide-react";
import { ARTIST_DASHBOARD_LINKS, withDashboardUtm } from "@/lib/artists/dashboard";

const WHP_LINK =
  "https://wa.me/919657609102?text=Hi%20Artace%20Studio%2C%20I%20am%20an%20artist%20and%20want%20to%20sell%20my%20paintings";

// Real screens of the artist dashboard (dashboard.artacestudio.com), captured
// from the demo account. Source captures: public/dashboard/*.png; these are
// web-sized WebP copies in public/artist-dashboard. (Never serve images from
// /dashboard/* — middleware treats that path as the logged-in customer area
// and redirects to /login.)
const SCREENS = [
  { key: "overview", label: "Overview", src: "/artist-dashboard/overview.webp", path: "overview" },
  { key: "artworks", label: "Artworks", src: "/artist-dashboard/artworks.webp", path: "artworks" },
  { key: "orders", label: "Orders", src: "/artist-dashboard/orders.webp", path: "orders" },
  { key: "earnings", label: "Earnings", src: "/artist-dashboard/earnings.webp", path: "earnings" },
  { key: "artie", label: "Ask Artie", src: "/artist-dashboard/artie.webp", path: "overview" },
] as const;

const SCREEN_DURATION_MS = 4200;

const USPS = [
  { icon: IndianRupee, text: "Keep 70% of every sale" },
  { icon: BadgeCheck, text: "Curated within 24–48 hours" },
  { icon: Wallet, text: "Payouts straight to your bank" },
  { icon: Sparkles, text: "Artie, your AI studio assistant" },
];

const scrollToGuide = () => {
  const target = document.getElementById("dashboard-guide");
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
  // Let the guide section start playback once it is in view.
  window.dispatchEvent(new Event("artace:play-guide"));
};

const DashboardShowcase = () => {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduceMotion || paused) return;
    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % SCREENS.length),
      SCREEN_DURATION_MS
    );
    return () => window.clearTimeout(timer);
  }, [active, paused, reduceMotion]);

  const screen = SCREENS[active];

  return (
    <div
      className="relative mx-auto w-full max-w-[760px] lg:mx-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Soft glow behind the frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 rounded-[40px] bg-[radial-gradient(60%_60%_at_60%_40%,rgba(194,103,61,0.22),transparent_70%)] blur-2xl"
      />

      {/* Browser frame */}
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 24, rotateX: 8 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformPerspective: 1400 }}
        className="relative overflow-hidden rounded-[18px] border border-[#1f1f1f]/10 bg-white shadow-[0_30px_80px_-20px_rgba(60,40,20,0.35)]"
      >
        <div className="flex items-center gap-3 border-b border-[#1f1f1f]/8 bg-[#f6f3ee] px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e8735a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#e6b84f]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#5fb67a]" />
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-center">
            <span className="truncate rounded-md bg-white px-3 py-1 font-inter text-[11px] text-[#6b655c] sm:text-[12px]">
              dashboard.artacestudio.com/{screen.path}
            </span>
          </div>
          <span className="hidden w-[42px] sm:block" aria-hidden="true" />
        </div>

        <div className="relative aspect-[16/9] w-full bg-[#f7f5f0]">
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={screen.key}
              className="absolute inset-0"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <Image
                src={screen.src}
                alt={`Artace artist dashboard — ${screen.label} screen`}
                fill
                priority={active === 0}
                sizes="(max-width: 1024px) 92vw, 760px"
                className="object-cover object-left-top"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Screen tabs with progress */}
      <div
        role="tablist"
        aria-label="Dashboard screens"
        className="relative mt-4 flex flex-wrap justify-center gap-2 lg:justify-start"
      >
        {SCREENS.map((item, index) => {
          const isActive = index === active;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(index)}
              className={`relative overflow-hidden rounded-full border px-3.5 py-1.5 font-inter text-[12.5px] font-medium transition-colors ${
                isActive
                  ? "border-[#c2673d]/40 bg-white text-[#1f1f1f]"
                  : "border-[#1f1f1f]/10 bg-white/50 text-[#6b655c] hover:bg-white"
              }`}
            >
              {isActive && !reduceMotion && !paused ? (
                <motion.span
                  key={`progress-${active}`}
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 bg-[#c2673d]/12"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: SCREEN_DURATION_MS / 1000, ease: "linear" }}
                />
              ) : null}
              <span className="relative">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Floating: new order */}
      <motion.div
        aria-hidden="true"
        initial={reduceMotion ? undefined : { opacity: 0, x: -20 }}
        animate={reduceMotion ? undefined : { opacity: 1, x: 0, y: [0, -8, 0] }}
        transition={{
          opacity: { delay: 0.6, duration: 0.5 },
          x: { delay: 0.6, duration: 0.5 },
          y: { delay: 1.2, duration: 5, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute -left-4 top-[18%] hidden items-center gap-3 rounded-2xl border border-[#1f1f1f]/8 bg-white/95 px-4 py-3 shadow-[0_16px_40px_-12px_rgba(60,40,20,0.3)] backdrop-blur sm:flex md:-left-10"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e3f4ee] text-[#0f8a6a]">
          <PackageCheck className="h-4.5 w-4.5" />
        </span>
        <span className="flex flex-col">
          <span className="font-inter text-[11px] uppercase tracking-[0.12em] text-[#8a8378]">New order</span>
          <span className="font-inter text-[13.5px] font-semibold text-[#1f1f1f]">
            Saffron fields of Pampore
          </span>
        </span>
      </motion.div>

      {/* Floating: payout */}
      <motion.div
        aria-hidden="true"
        initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 0.9, duration: 0.5 },
          y: { delay: 0.9, duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute -left-2 bottom-[22%] hidden items-center gap-3 rounded-2xl border border-[#1f1f1f]/8 bg-white/95 px-4 py-3 shadow-[0_16px_40px_-12px_rgba(60,40,20,0.3)] backdrop-blur sm:flex md:-left-8"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbe9df] text-[#c2673d]">
          <Wallet className="h-4.5 w-4.5" />
        </span>
        <span className="flex flex-col">
          <span className="font-inter text-[11px] uppercase tracking-[0.12em] text-[#8a8378]">Payout sent</span>
          <span className="font-display text-[18px] leading-tight text-[#1f1f1f]">₹18,500</span>
        </span>
      </motion.div>

      {/* Phone */}
      <motion.div
        aria-hidden="true"
        initial={reduceMotion ? undefined : { opacity: 0, y: 40 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -bottom-10 -right-3 hidden w-[22%] min-w-[120px] max-w-[160px] md:block lg:-right-8"
      >
        <div className="overflow-hidden rounded-[22px] border-[5px] border-[#1f1f1f] bg-[#1f1f1f] shadow-[0_24px_50px_-14px_rgba(0,0,0,0.45)]">
          <div className="relative aspect-[585/1266] w-full">
            <Image
              src="/artist-dashboard/phone-overview.webp"
              alt=""
              fill
              sizes="160px"
              className="object-cover object-top"
            />
          </div>
        </div>
      </motion.div>

      {/* Artie */}
      <motion.div
        aria-hidden="true"
        initial={reduceMotion ? undefined : { opacity: 0, scale: 0.6 }}
        animate={reduceMotion ? undefined : { opacity: 1, scale: 1, rotate: [0, -6, 0, 6, 0] }}
        transition={{
          opacity: { delay: 1.1, duration: 0.4 },
          scale: { delay: 1.1, duration: 0.4 },
          rotate: { delay: 2, duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute -right-2 -top-6 hidden items-center gap-2 rounded-full border border-[#1f1f1f]/8 bg-white py-1.5 pl-1.5 pr-4 shadow-[0_12px_30px_-10px_rgba(60,40,20,0.35)] sm:flex lg:-right-6"
      >
        <span className="relative h-8 w-8 overflow-hidden rounded-full bg-[#fbe9df]">
          <Image src="/artist-dashboard/artie.svg" alt="" fill unoptimized className="object-contain p-0.5" />
        </span>
        <span className="font-inter text-[12.5px] font-medium text-[#1f1f1f]">Ask Artie anything</span>
      </motion.div>
    </div>
  );
};

const SellPaintingsHero = () => {
  const reduceMotion = useReducedMotion();
  const fadeUp = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay },
        };

  return (
    <section className="relative w-full overflow-hidden bg-[#f7f4ee]">
      {/* Background texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_85%_20%,rgba(194,103,61,0.10),transparent_70%),radial-gradient(40%_50%_at_10%_90%,rgba(15,138,106,0.08),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(31,31,31,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(31,31,31,0.05)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(70%_60%_at_50%_40%,black,transparent)]"
      />

      <div className="relative mx-auto grid w-full max-w-[1440px] items-center gap-14 px-4 pb-20 pt-12 sm:px-6 md:px-12 md:pt-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 lg:pb-24 lg:pt-20">
        <div className="max-w-[620px]">
          <motion.span
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 rounded-full border border-[#c2673d]/25 bg-white/70 px-3.5 py-1.5 font-inter text-[12px] font-medium uppercase tracking-[0.14em] text-[#a4532f]"
          >
            <span className="relative flex h-2 w-2">
              {!reduceMotion ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c2673d]/60" />
              ) : null}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c2673d]" />
            </span>
            New · Artist dashboard
          </motion.span>

          <motion.h1
            {...fadeUp(0.1)}
            className="mt-5 font-display text-[36px] leading-[1.08] text-[#1f1f1f] sm:text-[44px] md:text-[56px]"
          >
            Sell your originals.{" "}
            <span className="relative whitespace-nowrap text-[#a4532f]">
              Run your studio
              <svg
                aria-hidden="true"
                viewBox="0 0 300 14"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-3 w-full text-[#c2673d]/60"
              >
                <motion.path
                  d="M2 9 C 60 2, 140 2, 298 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={reduceMotion ? undefined : { pathLength: 0 }}
                  animate={reduceMotion ? undefined : { pathLength: 1 }}
                  transition={{ delay: 0.7, duration: 0.9, ease: "easeInOut" }}
                />
              </svg>
            </span>{" "}
            from one dashboard.
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="mt-6 font-inter text-[16px] leading-7 text-[#4f4a43] md:text-[18px] md:leading-8"
          >
            Apply, pick a plan, publish your paintings on artacestudio.com, and track every
            order, payout and view, all in one place. Keep{" "}
            <strong className="font-semibold text-[#1f1f1f]">70% of every sale</strong> with
            plans from ₹999/year.
          </motion.p>

          <motion.ul {...fadeUp(0.3)} className="mt-7 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {USPS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 font-inter text-[14.5px] text-[#2c2a26]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[#c2673d] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </motion.ul>

          <motion.div {...fadeUp(0.4)} className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href={withDashboardUtm(ARTIST_DASHBOARD_LINKS.apply, "hero")}
              className="group inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#1f1f1f] px-7 py-3.5 font-inter text-[15.5px] font-medium text-white transition-colors hover:bg-black"
            >
              Apply as an Artist
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <button
              type="button"
              onClick={scrollToGuide}
              className="inline-flex items-center justify-center gap-2.5 rounded-[12px] border border-[#1f1f1f]/15 bg-white/70 px-5 py-3.5 font-inter text-[15px] font-medium text-[#1f1f1f] transition-colors hover:bg-white"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c2673d] text-white">
                <Play className="ml-0.5 h-3 w-3 fill-current" />
              </span>
              Watch the guide
            </button>
          </motion.div>

          <motion.p {...fadeUp(0.5)} className="mt-5 font-inter text-[14px] text-[#6b655c]">
            Already an Artace artist?{" "}
            <a
              href={withDashboardUtm(ARTIST_DASHBOARD_LINKS.signIn, "hero-sign-in")}
              className="font-medium text-[#1f1f1f] underline underline-offset-4 hover:text-[#a4532f]"
            >
              Sign in
            </a>
            <span className="mx-2 text-[#1f1f1f]/25" aria-hidden="true">
              ·
            </span>
            <a
              href={WHP_LINK}
              target="_blank"
              rel="noopener"
              className="font-medium text-[#1f1f1f] underline underline-offset-4 hover:text-[#a4532f]"
            >
              Talk to a curator on WhatsApp
            </a>
          </motion.p>
        </div>

        <DashboardShowcase />
      </div>
    </section>
  );
};

export default SellPaintingsHero;
