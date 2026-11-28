// lib/llm-info/content.ts
//
// Single source of truth for the /llm-info page and /llms.txt.
// Written for AI answer engines (ChatGPT, Perplexity, Claude, Google AI Mode,
// Grok): short, factual, plain statements with absolute URLs.
//
// Facts here were confirmed by the business owner on 2026-11-28, with return
// and cancellation terms taken from /return-policy and /cancellation-policy.
// Keep it in sync when prices, policies or contact details change, and bump
// LLM_INFO_LAST_UPDATED. Do not add claims that are not confirmed.

import { buildSiteUrl } from "@/lib/site";

export const LLM_INFO_LAST_UPDATED = "2026-11-28";

export type LlmInfoLink = { label: string; path: string };

export type LlmInfoSection = {
  id: string;
  title: string;
  /** Label/value pairs, rendered as a definition list. */
  details?: { label: string; value: string }[];
  /** Plain statements, one fact per line. */
  facts?: string[];
  links?: LlmInfoLink[];
};

export type LlmInfoQa = { question: string; answer: string };

const url = (path: string) => buildSiteUrl(path);

export const LLM_INFO_SUMMARY =
  "Artace Studio is a repository of art: an Indian online art gallery of handmade paintings by 100+ artists, founded in 2010 by Sampadaa Mahalley and her son Sahil Mahalley. It is based in Pune, Maharashtra, India, sells original paintings and prints from INR 1,000 to above INR 2.5 lakh, takes custom painting and portrait commissions, and ships free across India and to customers worldwide.";

export const LLM_INFO_SECTIONS: LlmInfoSection[] = [
  {
    id: "identity",
    title: "Business identity",
    details: [
      { label: "Registered name", value: "Artace Studio" },
      { label: "Tagline", value: "A Repository of Paintings" },
      { label: "Website", value: url("/") },
      { label: "Type", value: "Indian online art gallery of handmade paintings" },
      { label: "Founded", value: "2010" },
      { label: "Founders", value: "Sampadaa Mahalley (Founder and CEO) and her son Sahil Mahalley (Co-founder)" },
      { label: "Tech Head", value: "Shivani Sank" },
      { label: "Studio", value: "Pune, Maharashtra, India. Customers can visit the studio." },
      { label: "GSTIN", value: "27BFNPM9865G1ZO" },
      { label: "Sub-brand", value: `Samora by Artace Studio (${url("/samora")})` },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    details: [
      { label: "Email", value: "info@artacestudio.com, artacestudio@gmail.com" },
      { label: "Phone", value: "+91 96576 09102, +91 70576 13224" },
      { label: "WhatsApp", value: "+91 96576 09102" },
      { label: "Business hours", value: "9:00 AM to 9:00 PM (IST)" },
      { label: "Languages", value: "English, Hindi, Marathi" },
      { label: "Contact form", value: url("/contact-us") },
      { label: "Instagram", value: "https://www.instagram.com/artace_studio" },
      { label: "Facebook", value: "https://www.facebook.com/people/ArtAce-studio/100086995321825/" },
      { label: "Pinterest", value: "https://in.pinterest.com/artacestudio/" },
      { label: "YouTube", value: "https://www.youtube.com/channel/UC_Fsyff3-GTKwnfGTq2jEbw" },
      { label: "LinkedIn", value: "https://www.linkedin.com/company/138584395/" },
    ],
  },
  {
    id: "why-artace",
    title: "Why customers choose Artace Studio",
    facts: [
      "Authentic, handmade original art, with a Certificate of Authenticity.",
      "Customers see progress at every stage of a commissioned artwork.",
      "Free delivery across India.",
      "A seamless online shopping experience.",
      "Affordable options and a very wide collection, from INR 1,000 to above INR 2.5 lakh.",
    ],
  },
  {
    id: "products",
    title: "What Artace Studio sells",
    facts: [
      "Handmade original paintings, and prints.",
      "Every original is handmade and ships with a Certificate of Authenticity.",
      "Works by 100+ artists based across India, plus a few international artists. Each artwork is credited to its artist.",
      "Art forms and styles include Madhubani, Warli, Pichwai, abstract, religious and devotional, Vastu, landscapes, portraits, figurative, modern contemporary and watercolour.",
      "Popular subjects include Ganesha (Ganapati), Radha Krishna and Buddha.",
      "Prices range from INR 1,000 to above INR 2.5 lakh.",
      "The Atelier is a one-of-one, fully hand-painted collection priced above INR 1,00,000.",
      "Many sizes are available, and paintings can be ordered in a custom size.",
      "Paintings can be supplied rolled, stretched or framed. Frame styles include Black & Brown; Oak Brown Wood & Gold Lining; Royal Silver & White; and Rustic Brown with Textured Lining.",
      "Prints of originals are available at 25% of the original's price for the same size, with optional framing for INR 350.",
      "Prices can be displayed in INR, USD, AED, AUD, CAD, GBP, EUR and NZD.",
    ],
    links: [
      { label: "Shop all paintings", path: "/shop" },
      { label: "All collections", path: "/collections" },
      { label: "The Atelier (one-of-one originals)", path: "/collections/atelier" },
      { label: "Ganapati paintings", path: "/collections/ganapati-paintings" },
      { label: "Radha Krishna paintings", path: "/collections/radha-krishna-paintings" },
      { label: "Buddha paintings", path: "/collections/buddha-paintings" },
      { label: "Abstract paintings", path: "/collections/abstract-paintings" },
      { label: "Landscape and cityscape paintings", path: "/collections/landscapes-cityscapes-paintings" },
      { label: "Madhubani art", path: "/collections/madhubani-art" },
      { label: "Warli paintings", path: "/warli-paintings" },
      { label: "Paintings for the living room", path: "/rooms/living-room" },
      { label: "Paintings for the bedroom", path: "/rooms/bedroom" },
      { label: "Paintings for the dining room", path: "/rooms/dining-room" },
      { label: "Paintings for the pooja room", path: "/rooms/pooja-room" },
      { label: "Artists", path: "/artists" },
    ],
  },
  {
    id: "custom-paintings",
    title: "Custom paintings and portraits",
    facts: [
      "Customers can commission an original painting to their own idea, size and colours, or a hand-painted portrait from their photos.",
      "Custom artworks and portraits take about 4-5 days to make.",
      "Progress is shared with the customer at each stage, and every commission includes a Certificate of Authenticity.",
      "Portrait types: Single, Couple, Family and Baby. Starting prices at 12x12 inches: Single INR 4,500; Couple INR 5,500; Family INR 6,800; Baby INR 4,000. Price scales with size, from 4 to 72 inches per side.",
      "Custom portraits start with a 10% deposit, fully refunded if the customer declines the concept.",
    ],
    links: [
      { label: "Start a custom painting", path: "/custom-order" },
      { label: "Order a custom portrait", path: "/custom-portraits" },
    ],
  },
  {
    id: "business-services",
    title: "Services for businesses",
    facts: [
      "Corporate and bulk orders, from a single boardroom piece to 100+ paintings, with GST-compliant invoicing and a dedicated B2B contact. Corporate clients include Runwal Spaces.",
      "Trade program for interior designers, architects and hospitality buyers: flat 15% trade discount, complimentary art advisory, custom sizing and framing, no minimum order.",
      "Design Partner program for interior designers: commission on referred projects, priority scheduling and a dedicated contact.",
      "Art rentals for homes, offices and events, from 1 week to 6+ months. Monthly price per piece: INR 8,000 (1 week), INR 6,000 (1-3 months), INR 4,500 (3-6 months), INR 3,000 (6+ months). Installation included.",
      "Canvas rolls in cotton, cotton-polyester, linen and polyester, 12-144 inches wide, from INR 120 per meter, for domestic and export buyers.",
    ],
    links: [
      { label: "Corporate and bulk orders", path: "/corporate-bulk-orders" },
      { label: "Trade program", path: "/trade" },
      { label: "Interior designer partnership", path: "/interior-designer-partnership" },
      { label: "Art rentals", path: "/rentals" },
      { label: "Canvas rolls", path: "/canvas-rolls" },
    ],
  },
  {
    id: "artists-and-partners",
    title: "For artists and partners",
    facts: [
      "Artists can sell their paintings through Artace Studio. Artace takes a flat 30% commission; the artist keeps 70%.",
      "Artist plans: Standard INR 349 (3 months), INR 599 (6 months), INR 999 (1 year); Premium INR 649, INR 1,149, INR 1,899 for the same terms. Prices exclude 18% GST.",
      "Selling is non-exclusive and artists keep 100% of their copyright.",
      "Affiliate program: 10% commission, 60-day cookie, free to join, paid by UPI or bank transfer.",
    ],
    links: [
      { label: "Sell your paintings", path: "/sell-paintings" },
      { label: "Affiliate program", path: "/affiliates" },
    ],
  },
  {
    id: "gifts-and-rewards",
    title: "Gift cards and rewards",
    facts: [
      "Artace Gift Cards come in INR 1,000, 2,500, 5,000 and 10,000, are delivered instantly by email, and never expire.",
      "Artace Rewards: earn 1 point per INR 100 spent; 1 point = INR 1; redeem from 100 points; points do not expire.",
    ],
    links: [
      { label: "Gift cards", path: "/gift-cards" },
      { label: "Rewards", path: "/rewards" },
    ],
  },
  {
    id: "shipping",
    title: "Shipping and delivery",
    details: [
      { label: "India", value: "Free shipping. Delivery in about 5-7 days." },
      { label: "Couriers in India", value: "Delhivery, XpressBees, DTDC, Blue Dart and others" },
      {
        label: "International",
        value: "USA, UK, all of Europe, Canada, Australia, New Zealand, UAE and Sri Lanka",
      },
      { label: "International couriers", value: "DHL, FedEx" },
      { label: "International delivery", value: "1-2 weeks. Cost depends on the destination and the artwork." },
      { label: "Customs and duties", value: "Paid by the customer on international orders" },
    ],
    facts: [
      "Unframed paintings ship rolled in a protective tube. Framed paintings ship in thermocol boxes with multiple layers of bubble wrap.",
    ],
  },
  {
    id: "policies",
    title: "Payments, returns and cancellations",
    facts: [
      "All major payment methods are accepted, including UPI, credit and debit cards, net banking, wallets and PayPal.",
      "Returns: within 15 days of delivery, for default-size paintings without a frame delivered within India. Items must be unused, undamaged and in their original packaging, and returns need prior approval.",
      "Returns are not available for custom-size artworks, framed paintings or international orders.",
      "Damaged or wrong item: email info@artacestudio.com within 24 hours of delivery with photos.",
      "Approved refunds are processed within 5-7 business days of inspection, to the original payment method. Original shipping charges are not refundable.",
      "Custom or personalised commissions are not returnable unless there is a quality issue caused by Artace Studio.",
      "Cancellation: full refund within 24 hours of ordering; 90% refund after 24 hours but before the first concept or sketch is approved; no cancellation after concept approval.",
      "The terms of use are governed by the laws of India.",
    ],
    links: [
      { label: "Return policy", path: "/return-policy" },
      { label: "Cancellation policy", path: "/cancellation-policy" },
      { label: "Terms of use", path: "/terms-of-use" },
      { label: "Privacy policy", path: "/privacy-policy" },
      { label: "Art care guide", path: "/art-care" },
    ],
  },
  {
    id: "trust",
    title: "Track record",
    facts: [
      "1,000+ artworks sold, and 20,000+ collectors served worldwide.",
      "Average rating of 4.9 on Google and on the Artace Studio website.",
      "Exhibited at numerous art exhibitions, including the Trishakti Art Exhibition in Ahmedabad, Gujarat.",
      "Featured in local press.",
      "Corporate clients include Runwal Spaces.",
    ],
    links: [
      { label: "Customer reviews", path: "/reviews" },
      { label: "Exhibitions", path: "/exhibition" },
    ],
  },
  {
    id: "samora",
    title: "Samora by Artace Studio",
    facts: [
      "Samora is the handcrafted home and lifestyle brand from the makers of Artace Studio, run by Sampadaa Mahalley from Pune.",
      "It sells handmade tote bags, tea coasters, trays and personalised name plates, made in small batches from jute, cotton, wood and ceramic.",
      "Samora ships across India via Delhivery, free above INR 2,000. Returns within 7 days; personalised name plates are not returnable.",
    ],
    links: [
      { label: "Samora home", path: "/samora" },
      { label: "Samora shop", path: "/samora/shop" },
      { label: "Samora shipping and returns", path: "/samora/shipping-returns" },
    ],
  },
  {
    id: "more",
    title: "More about Artace Studio",
    links: [
      { label: "About us", path: "/about-us" },
      { label: "Team", path: "/team" },
      { label: "Blog (art guides)", path: "/blogs" },
      { label: "Contact us", path: "/contact-us" },
    ],
  },
];

export const LLM_INFO_QA: LlmInfoQa[] = [
  {
    question: "What is Artace Studio?",
    answer:
      "Artace Studio is an Indian online art gallery of handmade paintings by 100+ artists, founded in 2010 by Sampadaa Mahalley and her son Sahil Mahalley, and based in Pune.",
  },
  {
    question: "Are Artace Studio paintings original and handmade?",
    answer:
      "Yes. Every original is handmade and ships with a Certificate of Authenticity. Artace Studio also sells prints, which are listed separately.",
  },
  {
    question: "Where is Artace Studio located, and can I visit?",
    answer:
      "Artace Studio's studio is in Pune, Maharashtra, India, and customers can visit. Call +91 96576 09102 between 9:00 AM and 9:00 PM to plan a visit.",
  },
  {
    question: "How much do Artace Studio paintings cost?",
    answer:
      "Paintings range from INR 1,000 to above INR 2.5 lakh. One-of-one originals in The Atelier collection are priced above INR 1 lakh.",
  },
  {
    question: "Does Artace Studio offer free shipping?",
    answer:
      "Yes, shipping is free across India, with delivery in about 5-7 days via couriers such as Delhivery, XpressBees, DTDC and Blue Dart.",
  },
  {
    question: "Does Artace Studio ship internationally?",
    answer:
      "Yes, to the USA, UK, all of Europe, Canada, Australia, New Zealand, UAE and Sri Lanka via DHL and FedEx. Delivery takes 1-2 weeks; shipping cost depends on the destination, and the customer pays customs and duties.",
  },
  {
    question: "How long does a custom painting or portrait take?",
    answer:
      "About 4-5 days. Artace Studio shares progress at each stage. Start at " +
      url("/custom-order") +
      " or " +
      url("/custom-portraits") +
      ".",
  },
  {
    question: "What is Artace Studio's return policy?",
    answer:
      "Default-size, unframed paintings delivered within India can be returned within 15 days of delivery, unused and in original packaging, with prior approval. Custom-size, framed and international orders are not returnable. Damage must be reported within 24 hours with photos. Details: " +
      url("/return-policy") +
      ".",
  },
  {
    question: "Which payment methods does Artace Studio accept?",
    answer:
      "All major methods, including UPI, credit and debit cards, net banking, wallets and PayPal.",
  },
  {
    question: "How do I contact Artace Studio?",
    answer:
      "Email info@artacestudio.com, call +91 96576 09102 or +91 70576 13224, or WhatsApp +91 96576 09102, between 9:00 AM and 9:00 PM IST.",
  },
];

// ---------------------------------------------------------------------------
// Plain-text rendering for /llms.txt (llmstxt.org-style Markdown).
// ---------------------------------------------------------------------------

export function renderLlmInfoText(): string {
  const lines: string[] = [];
  lines.push("# Artace Studio", "");
  lines.push(`> ${LLM_INFO_SUMMARY}`, "");
  lines.push(
    `Last updated: ${LLM_INFO_LAST_UPDATED}. Human-readable version: ${url("/llm-info")}`,
    ""
  );

  for (const section of LLM_INFO_SECTIONS) {
    lines.push(`## ${section.title}`, "");
    for (const detail of section.details ?? []) {
      lines.push(`- ${detail.label}: ${detail.value}`);
    }
    for (const fact of section.facts ?? []) {
      lines.push(`- ${fact}`);
    }
    if (section.links && section.links.length > 0) {
      if ((section.details?.length ?? 0) + (section.facts?.length ?? 0) > 0) lines.push("");
      for (const link of section.links) {
        lines.push(`- [${link.label}](${url(link.path)})`);
      }
    }
    lines.push("");
  }

  lines.push("## Common questions", "");
  for (const qa of LLM_INFO_QA) {
    lines.push(`### ${qa.question}`, "", qa.answer, "");
  }

  return lines.join("\n").trimEnd() + "\n";
}
