export type PortraitType = "single" | "couple" | "family" | "baby";

export const PORTRAIT_TYPES: { value: PortraitType; label: string; basePrice: number }[] = [
  { value: "single", label: "Single Portrait", basePrice: 4500 },
  { value: "couple", label: "Couple Portrait", basePrice: 5500 },
  { value: "family", label: "Family Portrait", basePrice: 6800 },
  { value: "baby", label: "Baby Portrait", basePrice: 4000 },
];

const BASE_PRICE_BY_TYPE: Record<PortraitType, number> = {
  single: 4500,
  couple: 5500,
  family: 6800,
  baby: 4000,
};

// The 12" x 12" reference size the base prices above are quoted at.
export const BASE_AREA_SQIN = 12 * 12;

export const MIN_DIMENSION_INCHES = 4;
export const MAX_DIMENSION_INCHES = 72;
export const DEPOSIT_RATE = 0.1;

export const isPortraitType = (value: unknown): value is PortraitType =>
  value === "single" || value === "couple" || value === "family" || value === "baby";

export type PortraitEstimate = {
  estimatedPrice: number;
  depositAmount: number;
};

export const calculatePortraitEstimate = (input: {
  portraitType: unknown;
  widthInches: unknown;
  heightInches: unknown;
}): PortraitEstimate | null => {
  if (!isPortraitType(input.portraitType)) return null;

  const width = Number(input.widthInches);
  const height = Number(input.heightInches);

  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  if (width < MIN_DIMENSION_INCHES || width > MAX_DIMENSION_INCHES) return null;
  if (height < MIN_DIMENSION_INCHES || height > MAX_DIMENSION_INCHES) return null;

  const basePrice = BASE_PRICE_BY_TYPE[input.portraitType];
  const area = width * height;
  const estimatedPrice = Math.round((basePrice * area) / BASE_AREA_SQIN);
  const depositAmount = Math.round(estimatedPrice * DEPOSIT_RATE);

  return { estimatedPrice, depositAmount };
};
