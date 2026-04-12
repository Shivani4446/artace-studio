import type { Metadata } from "next";
import type { ReactNode } from "react";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Art Rentals for Corporate & Hospitality | Artace Studio",
  description: "Rent handcrafted Indian artwork for offices, restaurants, hotels, and commercial spaces. Flexible rental periods from 1 week to 6+ months. Transform your space with authentic canvas paintings.",
  keywords: ["art rental", "art hire", "painting rental", "corporate art", "office art rental", "hotel artwork", "restaurant artwork", "commercial art", "Indian art rental", "canvas painting hire", "short term art rental", "event art"],
};

export default function RentalsLayout({ children }: { children: React.ReactNode }) {
  return children;
}