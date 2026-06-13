import type { FaqItem } from "@/utils/article";

export function generateFaqSchema(faqItems: FaqItem[]) {
  if (!faqItems || faqItems.length === 0) return null;

  const mainEntity = faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  }));

  return {
    "@type": "FAQPage",
    mainEntity,
  };
}
