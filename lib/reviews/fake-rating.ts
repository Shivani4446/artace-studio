const MIN_RATING = 3.9;
const MAX_RATING = 5.0;
const MIN_REVIEW_COUNT = 12;
const MAX_REVIEW_COUNT = 89;
// Offsets the seed for the review-count draw so it doesn't move in lockstep
// with the rating draw for the same product ID.
const REVIEW_COUNT_SEED_OFFSET = 104729;

// Small, fast, deterministic PRNG (mulberry32). Not Math.random() — same
// seed must always produce the same output, for every visitor forever.
const mulberry32 = (seed: number) => {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export type FakeRating = {
  rating: number;
  reviewCount: number;
};

export const getFakeRating = (productId: number): FakeRating => {
  const ratingRandom = mulberry32(productId)();
  const rating =
    Math.round((MIN_RATING + ratingRandom * (MAX_RATING - MIN_RATING)) * 10) / 10;

  const reviewCountRandom = mulberry32(productId + REVIEW_COUNT_SEED_OFFSET)();
  const reviewCount =
    Math.floor(reviewCountRandom * (MAX_REVIEW_COUNT - MIN_REVIEW_COUNT + 1)) + MIN_REVIEW_COUNT;

  return { rating, reviewCount };
};
