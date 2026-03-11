export type CollectionTheme = {
  accent: string;
  accentSoft: string;
  accentStrong: string;
  panel: string;
  vector: [string, string, string];
};

export type CollectionLinkItem = {
  name: string;
  categorySlug: string;
};

const COLLECTION_LINK_ITEMS: CollectionLinkItem[] = [
  { name: "Ganapati Painting", categorySlug: "ganapati-paintings" },
  { name: "Radha Krishna", categorySlug: "radha-krishna-paintings" },
  { name: "Buddha Paintings", categorySlug: "buddha-paintings" },
  {
    name: "Landscape & Cityscape",
    categorySlug: "landscapes-cityscapes-paintings",
  },
];

const COLLECTION_THEME_MAP: Record<string, CollectionTheme> = {
  "ganapati-paintings": {
    accent: "#8C4B2F",
    accentSoft: "#EAD4B4",
    accentStrong: "#4F2313",
    panel: "#F7EEDF",
    vector: ["#8C4B2F", "#E6B97E", "#F7EEDF"],
  },
  "radha-krishna-paintings": {
    accent: "#6F7D4F",
    accentSoft: "#DFE7C8",
    accentStrong: "#2D3A22",
    panel: "#F2F3E8",
    vector: ["#6F7D4F", "#C4D49B", "#EDF2DF"],
  },
  "buddha-paintings": {
    accent: "#76643D",
    accentSoft: "#E6D9B5",
    accentStrong: "#43351C",
    panel: "#F5F0E3",
    vector: ["#76643D", "#C5AF76", "#EEE5CF"],
  },
  "figurative-paintings": {
    accent: "#6F5C75",
    accentSoft: "#DDD1E1",
    accentStrong: "#35253B",
    panel: "#F3EDF5",
    vector: ["#6F5C75", "#BCA6C4", "#ECE2F0"],
  },
  "landscapes-cityscapes-paintings": {
    accent: "#4C6A7F",
    accentSoft: "#D8E4EC",
    accentStrong: "#233949",
    panel: "#EEF4F7",
    vector: ["#4C6A7F", "#9EB7C7", "#EEF4F7"],
  },
};

export const collectionLinkItems = COLLECTION_LINK_ITEMS;

export const getCollectionHref = (categorySlug: string) =>
  `/collections/${encodeURIComponent(categorySlug)}`;

export const getCollectionTheme = (categorySlug: string): CollectionTheme => {
  return (
    COLLECTION_THEME_MAP[categorySlug] ?? {
      accent: "#3A5C74",
      accentSoft: "#D3E1EA",
      accentStrong: "#183142",
      panel: "#EEF3F6",
      vector: ["#3A5C74", "#9CB8C8", "#E6EFF4"],
    }
  );
};

export const getCollectionHeadline = (categoryName: string) => {
  const trimmedName = categoryName.trim();
  if (!trimmedName) return "Curated Collection";

  return /collection/i.test(trimmedName) ? trimmedName : `${trimmedName} Collection`;
};
