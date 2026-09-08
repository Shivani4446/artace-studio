// Excludes visually ambiguous characters (0/O, 1/I) since a purchaser may
// read this aloud or retype it from a screenshot.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const randomSegment = (): string =>
  Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

export const generateGiftCardCode = (): string => `ARTACE-${randomSegment()}-${randomSegment()}-${randomSegment()}`;
