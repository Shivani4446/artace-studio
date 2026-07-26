// lib/chat/types.ts
export type ChatProductCardData = {
  id: number;
  slug: string;
  name: string;
  image: string;
  price: number | null;
  currencySymbol?: string;
  inStock?: boolean; // only present for get_product_details results
};
