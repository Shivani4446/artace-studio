"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink, Star } from "lucide-react";

const GOOGLE_REVIEW_URL =
  "https://www.google.com/maps/search/?api=1&query=Artace+Studio";
const GOOGLE_REVIEWS_LOGO_SRC = "/google-reviews.webp";

type TestimonialCard = {
  id: string;
  authorName: string;
  location: string;
  rating: number;
  text: string;
  avatarUrl?: string;
};

const TESTIMONIALS: TestimonialCard[] = [
  {
    id: "review-1",
    authorName: "24Bites",
    location: "Pune, India",
    rating: 5,
    text: "Purchased 2 canvas paintings of Radha Krishna and Mahadev. The quality they offer is so good and all the packaging is very neatly done with goodies also. Definitely suggesting if want canvas painting in Pune.",
    avatarUrl: "/24bites-review.webp",
  },
  {
    id: "review-2",
    authorName: "Anuj Kathed",
    location: "Mumbai, India",
    rating: 5,
    text: "Artace helped us choose the right piece and size for our living room. The final result changed the entire atmosphere of the space.",
    avatarUrl: "/anuj-kathed-review.webp",
  },
  {
    id: "review-3",
    authorName: "Shruti Prabhune",
    location: "Thane, India",
    rating: 5,
    text: "Excellent communication, secure packaging, and authentic handmade art. We are already planning our next purchase.",
    avatarUrl: "/shruti_prabhune_review.webp",
  },
  {
    id: "review-4",
    authorName: "Vaibhav Laturkar",
    location: "Pune, India",
    rating: 4.8,
    text: "Best Customizable painting store in Pune. I loved to purchase my own customized painting from Artace Studio.",
    avatarUrl: "/anonymous.webp",
  },
    {
    id: "review-5",
    authorName: "Akshay Chaudhari",
    location: "Parbhani, India",
    rating: 4.5,
    text: "Purchased an ancient canvas painting of Madhavrao Peshwe Darbar and loved the details and accuracy of each character",
    avatarUrl: "/anonymous.webp",
  },
      {
    id: "review-6",
    authorName: "Shreyas Bangale",
    location: "Texas, USA",
    rating: 4.9,
    text: "Purchased 2 paintings one form the gallery and second I customized on my own preference. Thank You Artace Studio.",
    avatarUrl: "/anonymous.webp",
  },
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const getStarCount = (rating: number) => {
  const rounded = Math.round(rating);
  if (rounded < 1) return 1;
  if (rounded > 5) return 5;
  return rounded;
};

const renderStars = (rating: number, keyPrefix: string) => {
  const stars = getStarCount(rating);
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={`${keyPrefix}-star-${index}`}
      className={`h-4 w-4 ${
        index < stars ? "fill-[#FFDB4D] text-[#FFDB4D]" : "text-[#d7d2c8]"
      }`}
    />
  ));
};

const Testimonials = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [cardsPerSlide, setCardsPerSlide] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);
  const trustpilotWidgetRef = useRef<HTMLDivElement>(null);

  const overallRating =
    TESTIMONIALS.reduce((sum, item) => sum + item.rating, 0) / TESTIMONIALS.length;
  const totalRatings = TESTIMONIALS.length;
  const slides = useMemo(() => {
    const chunkedSlides: TestimonialCard[][] = [];

    for (let index = 0; index < TESTIMONIALS.length; index += cardsPerSlide) {
      chunkedSlides.push(TESTIMONIALS.slice(index, index + cardsPerSlide));
    }

    return chunkedSlides;
  }, [cardsPerSlide]);
  const totalSlides = Math.max(slides.length, 1);
  const isSliderActive = totalSlides > 1;
  const safeActiveSlide = Math.min(activeSlide, totalSlides - 1);

  useEffect(() => {
    const updateCardsPerSlide = () => {
      setCardsPerSlide(window.innerWidth >= 768 ? 3 : 1);
    };

    updateCardsPerSlide();
    window.addEventListener("resize", updateCardsPerSlide);
    return () => window.removeEventListener("resize", updateCardsPerSlide);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsMounted(true);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const trustpilotApi = (
      window as Window & {
        Trustpilot?: { loadFromElement?: (element: HTMLElement, forceReload: boolean) => void };
      }
    ).Trustpilot;

    if (trustpilotApi?.loadFromElement && trustpilotWidgetRef.current) {
      trustpilotApi.loadFromElement(trustpilotWidgetRef.current, true);
    }
  }, [isMounted]);

  const goToPrevious = () => {
    if (!isSliderActive) return;
    setActiveSlide((previous) => {
      const normalized = Math.min(previous, totalSlides - 1);
      return normalized === 0 ? totalSlides - 1 : normalized - 1;
    });
  };

  const goToNext = () => {
    if (!isSliderActive) return;
    setActiveSlide((previous) => {
      const normalized = Math.min(previous, totalSlides - 1);
      return normalized === totalSlides - 1 ? 0 : normalized + 1;
    });
  };

  return (
    <section className="bg-[#f4f2ee] px-6 py-14 md:px-12 md:py-18 lg:px-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <h2 className="font-display text-[38px] leading-[1.08] text-[#1f1f1f] md:text-[54px]">
              What Collectors Say
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            <div className="min-w-[250px] max-w-[300px]">
              {isMounted ? (
                <div
                  ref={trustpilotWidgetRef}
                  className="trustpilot-widget"
                  data-locale="en-US"
                  data-template-id="56278e9abfbbba0bdcd568bc"
                  data-businessunit-id="66093cb3c75da0cae6905fa5"
                  data-style-height="52px"
                  data-style-width="100%"
                  data-token="0d8c04ab-19b4-4e81-95aa-52df61a5dc6f"
                >
                  <a
                    href="https://www.trustpilot.com/review/artacestudio.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Trustpilot
                  </a>
                </div>
              ) : (
                <div className="h-[52px] w-full" aria-hidden="true" />
              )}
            </div>

            <Link
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Image
                src={GOOGLE_REVIEWS_LOGO_SRC}
                alt="Google Reviews"
                width={1118}
                height={768}
                className="h-auto w-[115px] md:w-[145px]"
              />
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#1f1f1f]" />
            </Link>
          </div>
        </div>

        <div className="mt-6 inline-flex flex-wrap items-center gap-3 rounded-full border border-[#1f1f1f]/12 bg-white px-4 py-2.5">
          <div className="flex items-center gap-1">
            {renderStars(overallRating, "overall-rating")}
          </div>
          <p className="text-sm font-semibold text-[#1f1f1f]">
            {overallRating.toFixed(1)} / 5
          </p>
          <span className="text-[#8a8378]">|</span>
          <p className="text-sm text-[#6f685f]">
            {totalRatings.toLocaleString("en-IN")} Google Reviews
          </p>
        </div>

        <div className="mt-9">
          <div className="overflow-hidden rounded-[12px]">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translate3d(-${safeActiveSlide * 100}%, 0, 0)` }}
            >
              {slides.map((slide, slideIndex) => (
                <div key={`slide-${slideIndex}`} className="w-full shrink-0">
                  <div
                    className="grid gap-5"
                    style={{
                      gridTemplateColumns: `repeat(${cardsPerSlide}, minmax(0, 1fr))`,
                    }}
                  >
                    {slide.map((testimonial) => (
                      <article
                        key={testimonial.id}
                        className="flex h-full flex-col rounded-[12px] border border-[#1f1f1f]/10 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
                      >
                        <div className="flex items-center gap-1">
                          {renderStars(testimonial.rating, testimonial.id)}
                        </div>

                        <p className="mt-5 text-[15px] leading-7 text-[#3f3a32]">
                          &ldquo;{testimonial.text}&rdquo;
                        </p>

                        <div className="mt-auto pt-5">
                          <div className="border-t border-[#1f1f1f]/10 pt-5">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#ece4d6]">
                                {testimonial.avatarUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={testimonial.avatarUrl}
                                    alt={`${testimonial.authorName} avatar`}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[13px] font-semibold uppercase text-[#52493d]">
                                    {getInitials(testimonial.authorName)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-[#1f1f1f]">
                                  {testimonial.authorName}
                                </p>
                                <p className="mt-1 text-sm text-[#7a7368]">
                                  {testimonial.location}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={`dot-${slide[0]?.id || index}`}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    safeActiveSlide === index
                      ? "w-6 bg-[#1f1f1f]"
                      : "w-2.5 bg-[#1f1f1f]/25 hover:bg-[#1f1f1f]/45"
                  }`}
                  aria-label={`Go to testimonial slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPrevious}
                disabled={!isSliderActive}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#1f1f1f]/20 text-[#1f1f1f] transition-colors hover:bg-[#1f1f1f]/5 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                disabled={!isSliderActive}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#1f1f1f]/20 text-[#1f1f1f] transition-colors hover:bg-[#1f1f1f]/5 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
