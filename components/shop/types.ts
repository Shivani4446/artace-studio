export type SizeBucket = "Small" | "Medium" | "Large" | "XL";

export type ShopProduct = {
  id: number;
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  categories: string[];
  categorySlugs: string[];
  price: number | null;
  regularPrice: number | null;
  currencyCode: string;
  currencySymbol: string;
  reviewCount: number;
  averageRating: number;
  totalSales: number;
  dateCreated: string | null;
  attributes: {
    moods: string[];
    materials: string[];
    colors: string[];
    sizes: string[];
  };
  sizeBuckets: SizeBucket[];
};
