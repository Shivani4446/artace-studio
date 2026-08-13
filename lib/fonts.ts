import localFont from "next/font/local";

// Centralized, self-hosted font loading.
//
// Previously ~15 files each independently called next/font/google for
// Playfair Display, Inter, Lora, and/or Fraunces. next/font/google fetches
// the actual font files from Google's CDN (fonts.gstatic.com) *during*
// `next build` — Cloudflare Pages' build environment cannot reliably reach
// that CDN, so every one of those calls was a potential build-time failure
// point (confirmed: this broke several consecutive deploys).
//
// Fixed by self-hosting instead, sourced from the @fontsource npm packages
// (regular npm dependencies, downloaded during the normal `npm install`
// step — no live font-CDN fetch at build time at all) via next/font/local,
// and centralizing here so every consumer shares one definition instead of
// each crafting its own relative path into node_modules.
//
// The `variable` names below (--font-playfair, --font-inter, --font-lora,
// --font-fraunces) match exactly what every existing call site already
// expects, so consumers only need to change their import source.

export const playfairDisplay = localFont({
  src: [
    { path: "../node_modules/@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@fontsource/playfair-display/files/playfair-display-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../node_modules/@fontsource/playfair-display/files/playfair-display-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../node_modules/@fontsource/playfair-display/files/playfair-display-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "../node_modules/@fontsource/playfair-display/files/playfair-display-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../node_modules/@fontsource/playfair-display/files/playfair-display-latin-600-italic.woff2", weight: "600", style: "italic" },
    { path: "../node_modules/@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../node_modules/@fontsource/playfair-display/files/playfair-display-latin-700-italic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-playfair",
  display: "swap",
});

export const inter = localFont({
  src: [
    { path: "../node_modules/@fontsource/inter/files/inter-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const lora = localFont({
  src: [
    { path: "../node_modules/@fontsource/lora/files/lora-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@fontsource/lora/files/lora-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../node_modules/@fontsource/lora/files/lora-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../node_modules/@fontsource/lora/files/lora-latin-500-italic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-lora",
  display: "swap",
});

// Fraunces is a variable font on Google Fonts (weight axis), which is what
// plain `Fraunces({ style: [...] })` (no explicit weight) loads by default —
// the "-wght-" file below is the matching self-hosted variable-weight file.
export const fraunces = localFont({
  src: [
    { path: "../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-ext-wght-normal.woff2", weight: "100 900", style: "normal" },
    { path: "../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-ext-wght-italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});
