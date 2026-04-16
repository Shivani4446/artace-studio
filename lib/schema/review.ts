import type { WooCommerceReview } from "./types";

export function generateReviewSchema(review: WooCommerceReview) {
  return {
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating.toString(),
      "bestRating": "5",
    },
    "author": {
      "@type": "Person",
      "name": review.reviewer,
    },
    "reviewBody": review.review,
    "datePublished": review.date_created,
    "name": review.review.substring(0, 100) + (review.review.length > 100 ? "..." : ""),
  };
}

export function generateReviewsSchema(reviews: WooCommerceReview[]) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return reviews
    .filter((review) => review.rating && review.review)
    .map(generateReviewSchema);
}