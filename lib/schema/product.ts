import type { WooStoreProduct, WooCommerceReview } from "./types";
import { generateAllOffersSchema } from "./offer";
import { generateAggregateRatingSchema } from "./aggregate-rating";
import { generateReviewsSchema } from "./review";
import { generateBreadcrumbSchema } from "./breadcrumb";
import { decodeHtmlEntities } from "@/utils/text";

const DEFAULT_BRAND = "Artace Studio";
const DEFAULT_BASE_URL = "https://artacestudio.com";

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractAttributeValues(attributes: WooStoreProduct["attributes"], targetNames: string[]): string[] {
  const values: string[] = [];
  
  for (const attr of attributes) {
    const normalizedName = attr.name.toLowerCase();
    for (const targetName of targetNames) {
      if (normalizedName.includes(targetName)) {
        const options = attr.options || attr.terms?.map(t => t.name) || [];
        values.push(...options.map(opt => decodeHtmlEntities(opt)));
      }
    }
  }
  
  return Array.from(new Set(values));
}

export function generateProductSchema(
  product: WooStoreProduct,
  reviews?: WooCommerceReview[],
  baseUrl: string = DEFAULT_BASE_URL
) {
  const description = [
    stripHtml(decodeHtmlEntities(product.short_description || "")),
    stripHtml(decodeHtmlEntities(product.description || "")),
  ]
    .filter(Boolean)
    .join(" ")
    .substring(0, 5000);

  const images = product.images
    .filter((img) => img.src)
    .map((img) => decodeHtmlEntities(img.src));

  const colors = extractAttributeValues(product.attributes, ["color"]);
  const materials = extractAttributeValues(product.attributes, ["material"]);

  const gtin = product.meta_data?.find(
    (meta) => meta.key === "gtin" || meta.key === "ean" || meta.key === "upc"
  )?.value as string | undefined;

  const productSchema: Record<string, unknown> = {
    "@type": "Product",
    "name": decodeHtmlEntities(product.name),
    "description": description,
    "image": images,
    "sku": decodeHtmlEntities(product.sku || ""),
    "brand": {
      "@type": "Brand",
      "name": DEFAULT_BRAND,
    },
    "offers": generateAllOffersSchema(product),
  };

  if (gtin) {
    productSchema["gtin"] = gtin;
  }

  if (colors.length > 0) {
    productSchema["color"] = colors[0];
  }

  if (materials.length > 0) {
    productSchema["material"] = materials[0];
  }

  const aggregateRating = generateAggregateRatingSchema(product);
  if (aggregateRating) {
    productSchema["aggregateRating"] = aggregateRating;
  }

  if (reviews && reviews.length > 0) {
    const reviewSchemas = generateReviewsSchema(reviews);
    if (reviewSchemas) {
      productSchema["review"] = reviewSchemas;
    }
  }

  const breadcrumb = generateBreadcrumbSchema(
    product.categories || [],
    decodeHtmlEntities(product.name),
    product.permalink,
    baseUrl
  );

  return {
    "@context": "https://schema.org",
    "@graph": [productSchema, breadcrumb],
  };
}