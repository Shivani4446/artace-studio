"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Star } from "lucide-react";
import { stripHtmlAndDecode } from "@/utils/text";

type Review = {
  id: number;
  date: string;
  review: string;
  reviewer: string;
  rating: number;
  verified: boolean;
};

const SamoraReviewForm = ({
  productId,
  onSubmitted,
}: {
  productId: number;
  onSubmitted: () => void;
}) => {
  const [reviewer, setReviewer] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!reviewer.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!reviewerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewerEmail)) {
      setError("Please enter a valid email.");
      return;
    }
    if (rating < 1) {
      setError("Please select a rating.");
      return;
    }
    if (review.trim().length < 10) {
      setError("Review must be at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          review: review.trim(),
          reviewer: reviewer.trim(),
          reviewer_email: reviewerEmail.trim(),
          rating,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Submission failed.");
      setSuccess(true);
      window.setTimeout(onSubmitted, 1500);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-[16px] border border-[#2b2420]/10 bg-[#eef7f0] p-6 text-center">
        <p className="font-samora-display text-[19px] text-[#2b2420]">Thank you!</p>
        <p className="mt-1.5 text-[14px] text-[#3a5c33]">
          Your review has been submitted and will appear after moderation.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-[16px] border border-[#2b2420]/10 bg-[#fbf6ef] p-5 md:grid-cols-2 md:p-6"
    >
      <div>
        <label className="block text-[13.5px] font-medium text-[#2b2420]">Name</label>
        <input
          type="text"
          value={reviewer}
          onChange={(event) => setReviewer(event.target.value)}
          placeholder="Your name"
          className="mt-1.5 w-full rounded-[10px] border border-[#2b2420]/15 bg-white px-3.5 py-2.5 text-[14.5px] text-[#2b2420] outline-none transition-colors focus:border-[#c1683d]"
        />
      </div>
      <div>
        <label className="block text-[13.5px] font-medium text-[#2b2420]">Email</label>
        <input
          type="email"
          value={reviewerEmail}
          onChange={(event) => setReviewerEmail(event.target.value)}
          placeholder="your@email.com"
          className="mt-1.5 w-full rounded-[10px] border border-[#2b2420]/15 bg-white px-3.5 py-2.5 text-[14.5px] text-[#2b2420] outline-none transition-colors focus:border-[#c1683d]"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-[13.5px] font-medium text-[#2b2420]">Rating</label>
        <div className="mt-1.5 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= (hoverRating || rating)
                    ? "fill-[#c1683d] text-[#c1683d]"
                    : "fill-none text-[#d8cdb8]"
                }`}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="md:col-span-2">
        <label className="block text-[13.5px] font-medium text-[#2b2420]">Your Review</label>
        <textarea
          rows={4}
          value={review}
          onChange={(event) => setReview(event.target.value)}
          placeholder="Share your experience with this product..."
          className="mt-1.5 w-full resize-y rounded-[10px] border border-[#2b2420]/15 bg-white px-3.5 py-2.5 text-[14.5px] text-[#2b2420] outline-none transition-colors focus:border-[#c1683d]"
        />
      </div>
      {error ? <p className="text-[13.5px] text-[#a63b2d] md:col-span-2">{error}</p> : null}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[#c1683d] px-6 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#a8552f] disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
};

const SamoraReviews = ({
  productId,
  averageRating,
  reviewCount,
}: {
  productId: number;
  averageRating: number;
  reviewCount: number;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let isActive = true;

    fetch(`/api/reviews?product_id=${productId}`)
      .then((response) => response.json())
      .then((data: { reviews?: Review[] }) => {
        if (isActive) setReviews(data.reviews || []);
      })
      .catch(() => {})
      .finally(() => {
        if (isActive) setIsLoadingReviews(false);
      });

    return () => {
      isActive = false;
    };
  }, [productId]);

  return (
    <div className="mt-14 border-t border-[#2b2420]/10 pt-10 md:mt-16 md:pt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-samora-display text-[24px] text-[#2b2420] md:text-[28px]">
            Customer Reviews
          </h2>
          {reviewCount > 0 ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-[14px] text-[#5c5344]">
              <Star className="h-4 w-4 fill-[#c1683d] text-[#c1683d]" strokeWidth={0} />
              {averageRating.toFixed(1)} &middot; {reviewCount} review{reviewCount === 1 ? "" : "s"}
            </p>
          ) : (
            <p className="mt-1.5 text-[14px] text-[#5c5344]">Be the first to review this product.</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="rounded-full border border-[#2b2420]/20 px-5 py-2.5 text-[13.5px] font-medium text-[#2b2420] transition-colors hover:border-[#2b2420]/40"
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {showForm ? (
        <div className="mt-6">
          <SamoraReviewForm productId={productId} onSubmitted={() => setShowForm(false)} />
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        {isLoadingReviews ? (
          <p className="text-[14px] text-[#8a7c68]">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-[14px] text-[#8a7c68]">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-[16px] border border-[#2b2420]/10 bg-[#fbf6ef] p-5">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                      star <= review.rating ? "fill-[#c1683d] text-[#c1683d]" : "fill-none text-[#d8cdb8]"
                    }`}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <p className="mt-2.5 text-[14.5px] leading-[1.65] text-[#3f382f]">
                {stripHtmlAndDecode(review.review)}
              </p>
              <p className="mt-2.5 text-[13px] font-medium text-[#8a7c68]">
                {review.reviewer}
                {review.verified ? " · Verified Purchase" : ""}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SamoraReviews;
