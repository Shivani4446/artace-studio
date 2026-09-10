import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins the project root explicitly. Without this, Turbopack's automatic
  // root inference can pick up the stray, unrelated package-lock.json that
  // sits one directory above this project and misresolve the Next.js
  // package entirely, crashing every route with a Turbopack panic.
  turbopack: {
    root: __dirname,
  },
  typescript: {
    // Re-enabled once the tracked type-error backlog was fixed (see
    // suggestion.md, section 2.1) — a real type error now fails the build
    // instead of shipping silently.
    ignoreBuildErrors: false,
  },
  eslint: {
    // Re-enabled once the error-level lint backlog was fixed (warnings
    // don't fail a build either way, only errors do — see suggestion.md,
    // section 2.1).
    ignoreDuringBuilds: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Stops the browser from guessing a response's MIME type from its
          // content — a script/HTML file served with the wrong Content-Type
          // (e.g. a user-uploaded image) can't get executed as something else.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Blocks this site from being framed by another origin — the
          // standard clickjacking defense. Nothing here needs to be embedded
          // in a third-party iframe.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Sends the full referrer only on same-origin navigation, and just
          // the origin (no path/query) cross-origin — keeps analytics useful
          // without leaking full URLs (which can contain order/checkout
          // details) to every third-party link clicked from the site.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Explicitly restricts only the browser features confirmed unused
          // anywhere in the codebase (camera, geolocation). Microphone is
          // deliberately left unrestricted — components/chat/ChatInputBar.tsx
          // uses getUserMedia({ audio: true }) for voice input.
          { key: "Permissions-Policy", value: "camera=(self), geolocation=()" },
          // HSTS without includeSubDomains/preload for now — this codebase
          // can't fully verify every subdomain (api.artacestudio.com, any
          // others) is HTTPS-ready, and both of those flags are hard to
          // safely undo once a browser (or the HSTS preload list) picks them
          // up. Safe to broaden later once that's confirmed.
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
        ],
      },
    ];
  },
  // A Content-Security-Policy is deliberately NOT included here yet: this
  // site loads a wide set of third-party scripts (GTM/gtag, Meta Pixel,
  // Trustpilot, Google Merchant widget, Ahrefs, Razorpay checkout, a chat
  // widget, Google Fonts) plus Supabase/WooCommerce API calls, and a CSP
  // needs every one of those origins enumerated correctly across
  // script-src/connect-src/frame-src/img-src or it silently breaks checkout,
  // analytics, or the chat widget in production. That's real, separate work
  // (build + test the full allow-list) rather than a header to guess at
  // alongside the others above — see suggestion.md, section 2.4.
  async redirects() {
    return [
      {
        source: "/product/:slug",
        destination: "/shop/:slug",
        permanent: false,
      },
      {
        source: "/collections/mahadev-nandi-canvas-painting-shiva-devotional-wall-art",
        destination: "/collections/mahadev-nandi-canvas-painting",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "artacestudio.com",
      },
      {
        protocol: "https",
        hostname: "api.artacestudio.com",
      },
      {
        protocol: "https",
        hostname: "artacestudio.com",
      },
      {
        protocol: "https",
        hostname: "i0.wp.com",
      },
      {
        protocol: "https",
        hostname: "i1.wp.com",
      },
      {
        protocol: "https",
        hostname: "i2.wp.com",
      },
    ],
  },
};

export default nextConfig;
