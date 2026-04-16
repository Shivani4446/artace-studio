import type { WooStoreCategory } from "./types";

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(
  categories: WooStoreCategory[],
  productName: string,
  productUrl: string,
  baseUrl: string
) {
  const items: BreadcrumbItem[] = [
    { name: "Home", url: baseUrl },
  ];

  if (categories && categories.length > 0) {
    const sortedCategories = [...categories].sort((a, b) => a.id - b.id);
    
    for (const category of sortedCategories) {
      const categoryUrl = `${baseUrl}/collections/${category.slug}`;
      items.push({ name: category.name, url: categoryUrl });
    }
  }

  items.push({ name: productName, url: productUrl });

  const itemListElement = items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url,
  }));

  return {
    "@type": "BreadcrumbList",
    "itemListElement": itemListElement,
  };
}