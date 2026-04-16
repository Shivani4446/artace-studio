import type { WooStoreProduct } from "./types";

export function generateAggregateRatingSchema(product: WooStoreProduct) {
  const ratingValue = parseFloat(product.average_rating);
  const reviewCount = product.review_count;

  if (!ratingValue || !reviewCount) {
    return null;
  }

  return {
    "@type": "AggregateRating",
    "ratingValue": ratingValue.toString(),
    "bestRating": "5",
    "ratingCount": reviewCount.toString(),
  };
}