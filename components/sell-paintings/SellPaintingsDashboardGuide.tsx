"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  ClipboardCheck,
  Images,
  LineChart,
  MessagesSquare,
  Play,
  Sparkles,
  Truck,
} from "lucide-react";
import { ARTIST_DASHBOARD_LINKS, withDashboardUtm } from "@/lib/artists/dashboard";

// The artist guide is a ~1.5 min walkthrough rendered from the real dashboard
// (Artist Dashboard repo, /video). It's ~59 MB, so it streams from WordPress
// media and is never preloaded: nothing downloads until the visitor presses
// play.
const GUIDE_VIDEO_URL =
  "https://api.artacestudio.com/wp-content/uploads/2026/11/artace-artist-guide.mp4";
const GUIDE_POSTER = "/artist-dashboard/video-poster.webp";

const FEATURES = [
  {
    icon: ClipboardCheck,
    title: "Apply & get curated",
    body: "Send three works, choose a plan and hear back from our curators within 24–48 hours.",
  },
  {
    icon: Images,
    title: "Publish your artworks",
    body: "Upload photos, sizes and prices. Approved pieces go live on artacestudio.com.",
  },
  {
    icon: Truck,
    title: "Track every order",
    body: "See each sale from payment to dispatch to delivery, with clear next steps.",
  },
  {
    icon: LineChart,
    title: "Earnings & payouts",
    body: "Pending, payable and paid at a glance, with GST-ready statements.",
  },
  {
    icon: MessagesSquare,
    title: "Talk to the team",
    body: "Message the Artace team from inside your dashboard, no email threads.",
  },
  {
    icon: Sparkles,
    title: "Artie, your assistant",
    body: "Ask about sales or payouts, or have Artie draft a new artwork for you.",
  },
];

export const PLAY_GUIDE_EVENT = "artace:play-guide";

export default function SellPaintingsDashboardGuide() {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [started, setStarted] = useState(false);

  const play = useCallback(() => {
    setStarted(true);
    const video = videoRef.current;
    if (!video) return;
    // Called synchronously from a click (directly or via the hero button's
    // event), so browsers allow playback with sound.
    void video.play().catch(() => {
      // Autoplay refused — the native controls are visible, so the visitor
      // can start it themselves.
    });
  }, []);

  useEffect(() => {
    window.addEventListener(PLAY_GUIDE_EVENT, play);
    return () => window.removeEventListener(PLAY_GUIDE_EVENT, play);
  }, [play]);

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.3 },
          transition: { duration: 0.5, delay },
        };

  return (
    <section
      id="dashboard-guide"
      className="scroll-mt-24 w-full bg-[#1f1f1f] px-4 py-16 text-white sm:px-6 md:px-12 md:py-24"
    >
      <div className="mx-auto max-w-[1280px]">
        <motion.div {...reveal()} className="mx-auto max-w-[760px] text-center">
          <span className="font-inter text-[12px] font-semibold uppercase tracking-[0.18em] text-[#e6a27f]">
            See it in action
          </span>
          <h2 className="mt-3 font-display text-[30px] leading-[1.12] sm:text-[38px] md:text-[46px]">
            Your whole art business, in a 90‑second tour
          </h2>
          <p className="mt-4 font-inter text-[15px] leading-7 text-white/70 md:text-[17px]">
            Watch how artists apply, publish paintings, follow orders and get paid from the
            Artace artist dashboard.
          </p>
        </motion.div>

        <motion.div
          {...reveal(0.1)}
          className="relative mx-auto mt-10 max-w-[1080px] overflow-hidden rounded-[20px] border border-white/10 bg-black shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] md:mt-14"
        >
          <div className="relative aspect-video w-full">
            <video
              ref={videoRef}
              src={GUIDE_VIDEO_URL}
              poster={GUIDE_POSTER}
              preload="none"
              controls={started}
              playsInline
              className="absolute inset-0 h-full w-full bg-black object-contain"
              aria-label="Artace artist dashboard guide video"
            />

            {!started ? (
              <button
                type="button"
                onClick={play}
                className="group absolute inset-0 flex items-center justify-center"
                aria-label="Play the artist dashboard guide"
              >
                <Image
                  src={GUIDE_POSTER}
                  alt=""
                  fill
                  sizes="(max-width: 1080px) 100vw, 1080px"
                  className="object-cover"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
                <span className="relative flex flex-col items-center gap-4">
                  <span className="relative flex h-20 w-20 items-center justify-center md:h-24 md:w-24">
                    {!reduceMotion ? (
                      <span className="absolute inset-0 animate-ping rounded-full bg-[#c2673d]/40" />
                    ) : null}
                    <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[#c2673d] shadow-[0_10px_40px_rgba(194,103,61,0.6)] transition-transform group-hover:scale-105">
                      <Play className="ml-1 h-8 w-8 fill-white text-white md:h-9 md:w-9" />
                    </span>
                  </span>
                  <span className="rounded-full bg-black/50 px-4 py-1.5 font-inter text-[13px] font-medium text-white backdrop-blur">
                    Watch the artist guide · 1:37
                  </span>
                </span>
              </button>
            ) : null}
          </div>
        </motion.div>

        <div className="mx-auto mt-14 grid max-w-[1080px] grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }, index) => (
            <motion.div key={title} {...reveal(0.05 * index)} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-[#e6a27f]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-[19px] leading-snug">{title}</h3>
                <p className="mt-1.5 font-inter text-[14.5px] leading-6 text-white/65">{body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div {...reveal(0.2)} className="mt-14 flex flex-wrap items-center justify-center gap-3">
          <a
            href={withDashboardUtm(ARTIST_DASHBOARD_LINKS.apply, "guide-apply")}
            className="inline-flex items-center gap-2 rounded-[12px] bg-white px-7 py-3.5 font-inter text-[15.5px] font-medium text-[#1f1f1f] transition-colors hover:bg-white/90"
          >
            Start your application
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href="#artist-plans"
            className="inline-flex items-center rounded-[12px] border border-white/25 px-6 py-3.5 font-inter text-[15px] font-medium text-white transition-colors hover:bg-white/10"
          >
            Compare plans
          </a>
        </motion.div>
      </div>
    </section>
  );
}
