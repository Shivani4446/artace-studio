import type { Metadata } from "next";
import { buildSiteUrl } from "@/lib/site";
import { generateServiceSchema } from "@/lib/schema";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Art Rentals for Corporate & Hospitality | Artace Studio",
  description: "Rent handcrafted Indian artwork for offices, restaurants, hotels, and commercial spaces. Flexible rental periods from 1 week to 6+ months. Transform your space with authentic canvas paintings.",
  keywords: ["art rental", "art hire", "painting rental", "corporate art", "office art rental", "hotel artwork", "restaurant artwork", "commercial art", "Indian art rental", "canvas painting hire", "short term art rental", "event art"],
  alternates: {
    canonical: buildSiteUrl("/rentals"),
  },
};

// rentals/page.tsx is a client component ("use client", for the calculator
// state), so its metadata AND this schema both live here instead — a client
// component can't export `metadata`, but this JSON-LD <script> only needs to
// render into <head>/<body>, which a Server Component layout can do fine
// alongside {children}.
const rentalsServiceSchema = generateServiceSchema({
  name: "Art Rentals for Corporate & Hospitality",
  description:
    "Rent handcrafted Indian artwork for offices, restaurants, hotels, and commercial spaces. Flexible rental periods from 1 week to 6+ months.",
  url: buildSiteUrl("/rentals"),
  serviceType: "Art rental service",
});

export default function RentalsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(rentalsServiceSchema) }}
      />
      {children}
    </>
  );
}