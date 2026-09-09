export const parseSizeDimensions = (value: string): { width: number; height: number } | null => {
  const numericValues = value.match(/\d+(?:\.\d+)?/g);
  if (!numericValues || numericValues.length < 2) return null;

  const width = Number(numericValues[0]);
  const height = Number(numericValues[1]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || height <= 0) {
    return null;
  }

  return { width, height };
};

export const inferSizeUnit = (value: string): "in" | "cm" => {
  if (/cm|centimeter|centimetre/i.test(value)) return "cm";
  return "in";
};
