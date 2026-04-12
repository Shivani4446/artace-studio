"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  Building2, 
  Hotel, 
  Utensils, 
  Palette, 
  Clock, 
  Shield, 
  RefreshCw, 
  Calculator,
  X,
  ChevronRight,
  Check,
  CheckCircle2,
} from "lucide-react";

interface RentalDuration {
  duration: string;
  bestFor: string;
  minMonths: number;
  maxMonths: number;
  pricePerMonth: number;
  minPieces: number;
}

const rentalDurations: RentalDuration[] = [
  {
    duration: "1 Week",
    bestFor: "Events, exhibitions, product launches",
    minMonths: 0,
    maxMonths: 0.25,
    pricePerMonth: 8000,
    minPieces: 2,
  },
  {
    duration: "1-3 Months",
    bestFor: "Office renovations, seasonal decor",
    minMonths: 1,
    maxMonths: 3,
    pricePerMonth: 6000,
    minPieces: 2,
  },
  {
    duration: "3-6 Months",
    bestFor: "Hotel lobbies, restaurant campaigns",
    minMonths: 3,
    maxMonths: 6,
    pricePerMonth: 4500,
    minPieces: 2,
  },
  {
    duration: "6+ Months",
    bestFor: "Long-term corporate spaces, permanent installations",
    minMonths: 6,
    maxMonths: 0,
    pricePerMonth: 3000,
    minPieces: 1,
  },
];

const targetSegments = [
  {
    icon: Building2,
    name: "Corporate Offices",
    description: "Enhance your workspace with inspiring artwork. Perfect for reception areas, conference rooms, and executive offices.",
    examples: ["Reception lobbies", "Board rooms", "Open workspaces", "Executive suites"],
  },
  {
    icon: Hotel,
    name: "Hotels & Hospitality",
    description: "Create memorable guest experiences with curated artwork for lobbies, suites, corridors, and dining areas.",
    examples: ["Hotel lobbies", "Guest rooms", "Conference halls", "Restaurant dining"],
  },
  {
    icon: Utensils,
    name: "Restaurants & Cafes",
    description: "Set the perfect ambiance for dining. Art that complements your cuisine and elevates the guest experience.",
    examples: ["Main dining", "Private booths", "Bar areas", "Outdoor seating"],
  },
  {
    icon: Palette,
    name: "Other Commercial Spaces",
    description: "Spaces that need artistic transformation. From retail stores to event venues.",
    examples: ["Retail showrooms", "Event venues", "Spa & wellness", "Co-working spaces"],
  },
];

const benefits = [
  {
    title: "Flexible Rental Periods",
    description: "Rent from 1 week to 6+ months. Choose the duration that fits your project timeline.",
    icon: Clock,
  },
  {
    title: "Curated Collection",
    description: "Access our exclusive range of handcrafted Indian artwork. Traditional and contemporary pieces.",
    icon: Palette,
  },
  {
    title: "Curator Support",
    description: "Get expert guidance on artwork selection, placement, and styling for your space.",
    icon: Shield,
  },
  {
    title: "Easy Installation",
    description: "Professional handling and installation included. Hassle-free setup and removal.",
    icon: RefreshCw,
  },
  {
    title: "Rotate Your Collection",
    description: "Keep your space fresh by rotating artwork throughout your rental period.",
    icon: RefreshCw,
  },
  {
    title: "Volume Discounts",
    description: "Special pricing for multiple pieces. Perfect for large commercial projects.",
    icon: Calculator,
  },
];

const processSteps = [
  { step: 1, title: "Browse Collection", description: "Explore our curated artwork or share your preferences with our curators." },
  { step: 2, title: "Consultation", description: "Speak with our art advisors to select pieces that match your space and vision." },
  { step: 3, title: "Rental Agreement", description: "Confirm duration, pricing, and logistics. We handle delivery and installation." },
  { step: 4, title: "Enjoy & Rotate", description: "Transform your space. Rotate artwork as desired or extend your rental." },
];

type FormData = {
  name: string;
  email: string;
  phone: string;
  company: string;
  spaceType: string;
  numPieces: number;
  message: string;
};

type RentalModalProps = {
  duration: RentalDuration;
  isOpen: boolean;
  onClose: () => void;
};

function RentalModal({ duration, isOpen, onClose }: RentalModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    spaceType: "",
    numPieces: duration.minPieces,
    message: "",
  });

  const minCost = formData.numPieces * duration.pricePerMonth * (duration.maxMonths || 6);
  const maxCost = Math.round(minCost * 1.3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [inquiryId, setInquiryId] = useState("");

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          spaceType: formData.spaceType,
          duration: duration.duration,
          pieces: formData.numPieces,
          message: formData.message,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setInquiryId(result.inquiryId);
        setIsSuccess(true);
      } else {
        alert("Failed to submit. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-[24px] bg-white p-6 shadow-2xl md:p-8" style={{ marginTop: "10vh" }}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f4efe7] transition-colors hover:bg-[#e8e4dc]"
        >
          <X className="h-5 w-5 text-[#5a5a5a]" />
        </button>

        <div className="mb-6 pr-8">
          <p className="font-display text-[12px] font-medium uppercase tracking-[0.2em] text-[#7f776d]">
            {duration.duration} Rental Plan
          </p>
          <h3 className="mt-1 font-display text-[22px] font-semibold text-[#2a2a2a]">
            Get Your Quote
          </h3>
          <p className="mt-1 text-[13px] text-[#6b6b6b]">
            {duration.bestFor}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block font-inter text-[14px] font-medium text-[#2c2c2c]">
                Number of Artworks *
              </label>
              <input
                type="range"
                min={duration.minPieces}
                max={20}
                value={formData.numPieces}
                onChange={(e) => setFormData({ ...formData, numPieces: parseInt(e.target.value) })}
                className="mt-2 w-full accent-[#2c2c2c]"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="font-inter text-[24px] font-semibold text-[#2a2a2a]">
                  {formData.numPieces}
                </span>
                <span className="font-inter text-[13px] text-[#7f776d]">
                  Min: {duration.minPieces} / Max: 20
                </span>
              </div>
            </div>

            <div className="rounded-[16px] bg-[#f4efe7] p-4">
              <p className="font-inter text-[13px] font-medium text-[#7f776d]">
                Estimated Monthly Range
              </p>
              <p className="mt-1 font-display text-[26px] font-semibold text-[#2a2a2a]">
                ₹{(formData.numPieces * duration.pricePerMonth).toLocaleString("en-IN")} - ₹{(formData.numPieces * duration.pricePerMonth * 1.3).toLocaleString("en-IN")}
                <span className="text-[14px] font-normal text-[#7f776d]">/mo</span>
              </p>
              <p className="mt-1 text-[12px] text-[#7f776d]">
                Total ({duration.duration}): ₹{minCost.toLocaleString("en-IN")} - ₹{maxCost.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block font-inter text-[14px] font-medium text-[#2c2c2c]">
                Your Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-[12px] border border-[#e0dcd2] bg-[#faf8f4] px-4 py-3 font-inter text-[15px] text-[#2c2c2c] placeholder-[#a0a0a0] focus:border-[#c0beb2] focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-inter text-[14px] font-medium text-[#2c2c2c]">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-[12px] border border-[#e0dcd2] bg-[#faf8f4] px-4 py-3 font-inter text-[15px] text-[#2c2c2c] placeholder-[#a0a0a0] focus:border-[#c0beb2] focus:outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-inter text-[14px] font-medium text-[#2c2c2c]">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-[12px] border border-[#e0dcd2] bg-[#faf8f4] px-4 py-3 font-inter text-[15px] text-[#2c2c2c] placeholder-[#a0a0a0] focus:border-[#c0beb2] focus:outline-none"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="mt-6 font-display text-[24px] font-semibold text-[#2a2a2a]">
                  Request Submitted!
                </h3>
                <p className="mt-2 text-[15px] text-[#6b6b6b]">
                  Thank you for your interest in art rentals.
                </p>
                <p className="mt-1 text-[14px] text-[#7f776d]">
                  Inquiry ID: <span className="font-medium text-[#2a2a2a]">{inquiryId}</span>
                </p>
                <p className="mt-4 text-[13px] text-[#6b6b6b]">
                  Our team will contact you within 24 hours with the final quote.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 w-full rounded-[12px] bg-[#2c2c2c] py-3.5 font-inter text-[15px] font-medium text-white transition-all hover:bg-[#1a1a1a]"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.name || !formData.email || !formData.phone || isSubmitting}
                  className="mt-2 w-full rounded-[12px] bg-[#2c2c2c] py-3.5 font-inter text-[15px] font-medium text-white transition-all hover:bg-[#1a1a1a] disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Request Quote"}
                  {!isSubmitting && <ArrowRight className="ml-2 inline h-4 w-4" />}
                </button>
                
                <p className="text-center text-[11px] text-[#9a9a9a]">
                  Our team will contact you within 24 hours with the final quote
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RentalsPage() {
  const [selectedDuration, setSelectedDuration] = useState<RentalDuration | null>(null);

  return (
    <main className="min-h-screen bg-[#faf8f4]">
      {/* Hero Section */}
      <section className="relative isolate min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.webp"
            alt="Art rental hero background"
            fill
            priority
            quality={90}
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/50" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 py-24 md:px-12 md:py-32 lg:py-40">
          <div className="max-w-2xl">
            <p className="font-display text-[13px] font-medium uppercase tracking-[0.2em] text-white/70 md:text-[14px]">
              Artace Studio Rentals
            </p>
            <h1 className="mt-4 font-display text-[40px] font-semibold leading-[1.1] text-white md:text-[48px] lg:text-[56px]">
              Rent Handcrafted Art for Your Business Space
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/85 md:text-[19px]">
              Transform your corporate office, hotel, restaurant, or commercial space with authentic 
              Indian artwork. Flexible rental periods from 1 week to 6+ months.
            </p>
            
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link
                href="#duration"
                className="inline-flex items-center justify-center gap-3 rounded-md bg-white px-8 py-3.5 text-[16px] font-medium text-[#1a1a1a] transition-all hover:bg-[#f0f0f0] hover:shadow-lg"
              >
                Get a Quote
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#target-spaces"
                className="inline-flex items-center justify-center gap-3 rounded-md border border-white/40 px-8 py-3.5 text-[16px] font-medium text-white transition-all hover:bg-white/10"
              >
                Who Can Rent
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#faf8f4]" />
      </section>

      {/* Duration Cards with Modal */}
      <section id="duration" className="w-full px-6 py-16 md:px-12 md:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="text-center">
            <p className="font-display text-[13px] font-medium uppercase tracking-[0.2em] text-[#7f776d]">
              Rental Plans
            </p>
            <h2 className="mt-3 font-display text-[34px] font-semibold leading-[1.1] text-[#2a2a2a] md:text-[42px]">
              Choose Your Rental Period
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-[#6b6b6b] md:text-[17px]">
              Click any plan to get an instant quote estimate. Minimum {rentalDurations[0].minPieces} artworks per rental.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {rentalDurations.map((item) => (
              <button
                key={item.duration}
                onClick={() => setSelectedDuration(item)}
                className="group flex flex-col items-start rounded-[20px] border border-[#e8e4dc] bg-white p-6 text-left transition-all hover:border-[#d4cfc2] hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#f4efe7]">
                  <Clock className="h-6 w-6 text-[#7f776d]" />
                </div>
                <h3 className="mt-5 font-display text-[22px] font-semibold text-[#2a2a2a]">
                  {item.duration}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#6b6b6b]">
                  {item.bestFor}
                </p>
                <p className="mt-3 font-inter text-[13px] font-medium text-[#2a2a2a]">
                  Starting at ₹{item.pricePerMonth.toLocaleString("en-IN")}/month per piece
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-[14px] font-medium text-[#2a2a2a]">
                  Get Quote
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Target Segments */}
      <section id="target-spaces" className="w-full bg-white px-6 py-16 md:px-12 md:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="font-display text-[13px] font-medium uppercase tracking-[0.2em] text-[#7f776d]">
                Who Can Rent
              </p>
              <h2 className="mt-3 font-display text-[34px] font-semibold leading-[1.1] text-[#2a2a2a] md:text-[42px]">
                Perfect for Commercial Spaces
              </h2>
              <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-[#6b6b6b] md:text-[17px]">
                From boutique hotels to corporate headquarters, restaurants to retail showrooms. 
                Our artwork transforms any commercial space into an inspiring environment.
              </p>

              <div className="mt-10 space-y-4">
                {targetSegments.map((segment) => (
                  <div
                    key={segment.name}
                    className="flex gap-5 rounded-[16px] border border-[#e8e4dc] p-5 transition-all hover:border-[#d4cfc2] hover:bg-[#faf8f4]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-[#f4efe7]">
                      <segment.icon className="h-6 w-6 text-[#7f776d]" />
                    </div>
                    <div>
                      <h3 className="font-display text-[18px] font-semibold text-[#2a2a2a]">
                        {segment.name}
                      </h3>
                      <p className="mt-1 text-[14px] leading-relaxed text-[#6b6b6b]">
                        {segment.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {segment.examples.map((example) => (
                          <span
                            key={example}
                            className="rounded-full border border-[#e0dcd2] bg-[#faf8f4] px-3 py-1 text-[12px] font-medium text-[#7f776d]"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="sticky top-24">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px]">
                  <Image
                    src="/why-us-img-1.webp"
                    alt="Hotel lobby with art rental"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <p className="font-display text-[20px] font-semibold text-white">
                      "The artwork transformed our hotel lobby completely."
                    </p>
                    <p className="mt-2 text-[14px] text-white/80">
                      — Luxury Hotel, Mumbai
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="w-full px-6 py-16 md:px-12 md:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="text-center">
            <p className="font-display text-[13px] font-medium uppercase tracking-[0.2em] text-[#7f776d]">
              Why Artace
            </p>
            <h2 className="mt-3 font-display text-[34px] font-semibold leading-[1.1] text-[#2a2a2a] md:text-[42px]">
              The Artace Rental Advantage
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-[20px] border border-[#e8e4dc] bg-white p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#f4efe7]">
                  <benefit.icon className="h-6 w-6 text-[#7f776d]" />
                </div>
                <h3 className="mt-5 font-display text-[18px] font-semibold text-[#2a2a2a]">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#6b6b6b]">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full bg-[#2a2a2a] px-6 py-16 md:px-12 md:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="text-center">
            <p className="font-display text-[13px] font-medium uppercase tracking-[0.2em] text-white/60">
              How It Works
            </p>
            <h2 className="mt-3 font-display text-[34px] font-semibold leading-[1.1] text-white md:text-[42px]">
              Start Renting in 4 Steps
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((item, index) => (
              <div key={item.step} className="relative">
                <div className="flex flex-col">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-white/10">
                    <span className="font-display text-[28px] font-bold text-white">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-[20px] font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/70">
                    {item.description}
                  </p>
                </div>
                {index < processSteps.length - 1 && (
                  <ChevronRight className="absolute -right-4 top-10 hidden h-8 w-8 -translate-y-1/2 text-white/20 lg:block" style={{ right: "-2rem" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="w-full px-6 py-16 md:px-12 md:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[900px]">
          <div className="rounded-[24px] bg-[#f4efe7] p-8 md:p-12">
            <h2 className="font-display text-[28px] font-semibold text-[#2a2a2a] md:text-[32px]">
              Art Rental for Commercial Spaces in India
            </h2>
            <div className="mt-6 space-y-5 text-[16px] leading-relaxed text-[#5a5a5a] md:text-[17px]">
              <p>
                Looking to rent artwork for your commercial space? Artace Studio offers a comprehensive 
                art rental service tailored for businesses across India. Whether you need paintings for 
                hotel lobbies, office boardrooms, restaurant dining areas, or retail spaces, we provide 
                authentic handcrafted Indian artwork on flexible rental terms.
              </p>
              <p>
                Our rental collection includes traditional Indian art forms featuring Lord Ganesha, 
                Radha Krishna, Buddha, landscapes, and contemporary pieces. Each artwork is 
                professionally preserved and maintained, ensuring it arrives in perfect condition 
                for your space.
              </p>
              <p>
                We offer art rental packages for various needs: corporate events, hotel seasonal 
                decorations, restaurant theme changes, and long-term commercial installations. 
                Our art advisors help you select the perfect pieces based on your space dimensions, 
                existing decor, and budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="start-rental" className="w-full px-6 py-16 md:px-12 md:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="relative overflow-hidden rounded-[24px] bg-[#1a1a1a] px-8 py-12 md:px-16 md:py-20">
            <Image
              src="/landscape-collection-bg.webp"
              alt="Art rental for commercial spaces"
              fill
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
            
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h2 className="font-display text-[28px] font-semibold text-white md:text-[38px]">
                Ready to Transform Your Space?
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-white/80 md:text-[17px]">
                Start your art rental journey today. Our art advisors are ready to help 
                you find the perfect artwork for your commercial space.
              </p>
              
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/contact-us"
                  className="inline-flex items-center justify-center gap-3 rounded-md bg-white px-8 py-3.5 text-[16px] font-medium text-[#1a1a1a] transition-all hover:bg-[#f0f0f0]"
                >
                  Request Rental Quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-3 rounded-md border border-white/40 px-8 py-3.5 text-[16px] font-medium text-white transition-all hover:bg-white/10"
                >
                  Browse Collection
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rental Modal */}
      {selectedDuration && (
        <RentalModal
          duration={selectedDuration}
          isOpen={!!selectedDuration}
          onClose={() => setSelectedDuration(null)}
        />
      )}
    </main>
  );
}