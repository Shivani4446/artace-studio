import type { MetadataRoute } from "next";

const BASE_URL = "https://www.artacestudio.com";

const shopSlugs = [
  "canvas-paintings",
  "wall-art",
  "spiritual-paintings",
  "abstract-paintings",
  "portrait-paintings",
  "landscape-paintings",
  "modern-art",
  "traditional-paintings",
  "custom-paintings",
];

const collectionSlugs = [
  "mahadev-nandi-canvas-painting",
  "ganesh-paintings",
  "krishna-paintings",
  "durga-paintings",
  "shiva-paintings",
  "hanuman-paintings",
  "buddha-paintings",
  "radha-krishna-paintings",
];

const roomSlugs = ["pooja-room", "living-room", "bedroom", "dining-room"];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/collections`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/artists`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/about-us`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact-us`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms-of-use`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/return-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/cancellation-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/custom-order`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/corporate-bulk-orders`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/exhibition`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/blogs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/team`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/warli-paintings`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/original-paintings-for-sale-ireland`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/original-abstract-art-for-sale-uk`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/original-abstract-art-for-sale-nz`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/rentals`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const shopPages: MetadataRoute.Sitemap = shopSlugs.map((slug) => ({
    url: `${BASE_URL}/shop/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const collectionPages: MetadataRoute.Sitemap = collectionSlugs.map((slug) => ({
    url: `${BASE_URL}/collections/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const roomPages: MetadataRoute.Sitemap = roomSlugs.map((slug) => ({
    url: `${BASE_URL}/rooms/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...shopPages, ...collectionPages, ...roomPages];
}
