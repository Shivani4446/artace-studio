"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

const GOOGLE_REVIEW_URL =
  "https://www.google.com/maps/search/?api=1&query=Artace+Studio";
const GOOGLE_REVIEWS_LOGO_SRC = "/google-reviews.webp";

type TestimonialCard = {
  id: string;
  authorName: string;
  location: string;
  rating: number;
  text: string;
  hook: string;
  date: string;
  avatarUrl?: string;
};

const TESTIMONIALS: TestimonialCard[] = [
  {
    id: "review-1",
    authorName: "24Bites",
    location: "Pune, India",
    rating: 5,
    text: "Purchased 2 canvas paintings of Radha Krishna and Mahadev. The quality they offer is so good and all the packaging is very neatly done with goodies also. Definitely suggesting if want canvas painting in Pune.",
    hook: "Quality that surprises, packaging that delights",
    date: "2026-09-23",
    avatarUrl: "/24bites-review.webp",
  },
  {
    id: "review-2",
    authorName: "Anuj Kathed",
    location: "Mumbai, India",
    rating: 5,
    text: "Artace helped us choose the right piece and size for our living room. The final result changed the entire atmosphere of the space.",
    hook: "Changed the entire atmosphere of our living room",
    date: "2026-09-22",
    avatarUrl: "/anuj-kathed-review.webp",
  },
  {
    id: "review-3",
    authorName: "Shruti Prabhune",
    location: "Thane, India",
    rating: 5,
    text: "Excellent communication, secure packaging, and authentic handmade art. We are already planning our next purchase.",
    hook: "Authentic handmade art, handled with care",
    date: "2026-09-18",
    avatarUrl: "/shruti_prabhune_review.webp",
  },
  {
    id: "review-4",
    authorName: "Vaibhav Laturkar",
    location: "Pune, India",
    rating: 4.8,
    text: "Best Customizable painting store in Pune. I loved to purchase my own customized painting from Artace Studio.",
    hook: "The best customizable painting store in Pune",
    date: "2026-09-14",
    avatarUrl: "/anonymous.webp",
  },
  {
    id: "review-5",
    authorName: "Akshay Chaudhari",
    location: "Parbhani, India",
    rating: 4.5,
    text: "Purchased an ancient canvas painting of Madhavrao Peshwe Darbar and loved the details and accuracy of each character.",
    hook: "Details that bring history to life",
    date: "2026-09-10",
    avatarUrl: "/anonymous.webp",
  },
  {
    id: "review-6",
    authorName: "Shreyas Bangale",
    location: "Texas, USA",
    rating: 4.9,
    text: "Purchased 2 paintings one from the gallery and second I customized on my own preference. Thank You Artace Studio.",
    hook: "From gallery to custom, done just right",
    date: "2026-09-05",
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

const getDateLabel = (isoDate: string) => {
  const date = new Date(isoDate);
  const today = new Date();
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(today) - startOfDay(date)) / 86400000);

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

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

    const container = trustpilotWidgetRef.current;
    if (!container) return;

    let cancelled = false;
    let attempts = 0;

    const tryLoad = () => {
      if (cancelled) return;

      const trustpilotApi = (
        window as Window & {
          Trustpilot?: { loadFromElement?: (element: HTMLElement, forceReload: boolean) => void };
        }
      ).Trustpilot;

      if (trustpilotApi?.loadFromElement) {
        trustpilotApi.loadFromElement(container, true);
        return;
      }

      // The Trustpilot bootstrap loads with strategy="lazyOnload", which can
      // run after this effect fires. Poll until the API is available so the
      // badge is never left as plain anchor text.
      attempts += 1;
      if (attempts < 50) {
        window.setTimeout(tryLoad, 200);
      }
    };

    tryLoad();

    return () => {
      cancelled = true;
    };
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
    <section className="bg-[#f4f2ee] py-14 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 flex-1 basis-64">
            <h2 className="font-display text-[32px] leading-[1.08] text-[#1f1f1f] sm:text-[38px] md:text-[54px]">
              What Artace Studio Collectors Are Saying
            </h2>
          </div>

          <div className="flex w-full flex-col items-start gap-2 sm:gap-3 md:w-auto md:shrink-0">
            <Link
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center"
            >
              <Image
                src={GOOGLE_REVIEWS_LOGO_SRC}
                alt="Google Reviews"
                width={1118}
                height={768}
                className="h-auto w-[78px] sm:w-[92px] md:w-[145px]"
              />
            </Link>

            <div className="hidden md:block md:w-[145px]">
              {isMounted ? (
                <div className="origin-left md:scale-100">
                  <div
                    ref={trustpilotWidgetRef}
                    className="trustpilot-widget"
                    data-locale="en-US"
                    data-template-id="5406e65db0d04a09e042d5fc"
                    data-businessunit-id="66093cb3c75da0cae6905fa5"
                    data-style-height="28px"
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
                </div>
              ) : (
                <div className="h-[28px] w-full" aria-hidden="true" />
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 inline-flex rounded-2xl border border-[#1f1f1f]/12 bg-white px-5 py-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              {renderStars(overallRating, "overall-rating")}
            </div>
            <p className="text-sm font-semibold text-[#1f1f1f]">
              {overallRating.toFixed(1)} / 5
            </p>
            <span className="text-[#8a8378]">|</span>
            <p className="text-sm font-semibold text-[#1f1f1f]">
              {overallRating.toFixed(1)} Average Customer Rating
            </p>
            <span className="text-[#8a8378]">|</span>
            <p className="text-sm text-[#6f685f]">
              {totalRatings.toLocaleString("en-IN")} Google Reviews
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 shrink-0 text-green-600" />
          <p className="text-[15px] text-[#6f685f] md:text-base">
            100% verified Google and Trustpilot reviews.
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
                        <Quote className="h-6 w-6 text-[#1f1f1f]/25" />

                        <h3 className="mt-4 text-[17px] font-semibold leading-snug text-[#1f1f1f]">
                          {testimonial.hook}
                        </h3>

                        <p className="mt-3 text-[15px] leading-relaxed text-[#3f3a32]">
                          {testimonial.text}
                        </p>

                        <div className="mt-5 flex items-center justify-between gap-3">
                          <div className="flex shrink-0 items-center gap-1">
                            {renderStars(testimonial.rating, testimonial.id)}
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#ece4d6]">
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
                                <div className="flex h-full w-full items-center justify-center text-[12px] font-semibold uppercase text-[#52493d]">
                                  {getInitials(testimonial.authorName)}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold leading-tight text-[#1f1f1f]">
                                {testimonial.authorName}
                              </p>
                              <p className="text-xs text-[#7a7368]">
                                {testimonial.location}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto pt-5">
                          <div className="border-t border-[#1f1f1f]/10 pt-4">
                            <div className="flex items-center gap-1.5">
                              <BadgeCheck className="h-4 w-4 shrink-0 text-green-600" />
                              <p className="text-sm text-[#7a7368]">
                                Verified · {getDateLabel(testimonial.date)}
                              </p>
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

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
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
