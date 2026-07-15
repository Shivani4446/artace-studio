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
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/product/:slug",
        destination: "/shop/:slug",
        permanent: false,
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
