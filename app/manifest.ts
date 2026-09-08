import type { MetadataRoute } from "next";

// The icon here reuses /Artace-logo.svg — the same file already used
// sitewide for the favicon/apple-touch-icon (see the `icons` block in
// app/layout.tsx's metadata) — for consistency, not because it's an ideal
// app icon: it's a wide wordmark (47x32), not a square mark, so a real
// install prompt/home-screen icon will show it letterboxed rather than
// filling the icon slot. A dedicated square icon (192x192 and 512x512 PNG,
// plus a maskable variant with safe-zone padding) would need to be designed
// separately — that's a design asset this pass can't fabricate.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Artace Studio",
    short_name: "Artace Studio",
    description:
      "Handcrafted canvas paintings, spiritual wall art, and custom commissions from Artace Studio.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f2ee",
    theme_color: "#1f1f1f",
    icons: [
      {
        src: "/Artace-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
