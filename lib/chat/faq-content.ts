// lib/chat/faq-content.ts
// Starter FAQ — review and edit this content freely. It's shown to every
// chat conversation via the system prompt (see system-prompt.ts), not fetched
// per-message, since it's short and static.

export type FaqEntry = { question: string; answer: string };

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    question: "Are the paintings handmade or printed?",
    answer:
      "Every painting at Artace Studio is handcrafted using acrylic colors on canvas — nothing is a print or mass-produced reproduction.",
  },
  {
    question: "Can I customize a painting?",
    answer:
      "Yes, many paintings support customization (size, colors, or a fully custom commission). Look for the 'Customizable' tag on a product, or ask and we can check for you.",
  },
  {
    question: "What sizes are available?",
    answer:
      "Sizes vary by painting — check the size selector on the product page. Custom sizes may be available on request for select pieces.",
  },
  {
    question: "How can I pay?",
    answer:
      "We accept card and UPI payments via Razorpay at checkout, and Cash on Delivery is available for logged-in customers.",
  },
  {
    question: "What is the return window?",
    answer:
      "Eligible artworks can be returned within 7 calendar days of delivery if unused and in original packaging. Custom commissions are non-returnable except for confirmed quality issues.",
  },
  {
    question: "How do I track or ask about an order?",
    answer:
      "Message us directly on WhatsApp using the button on the site, or email info@artacestudio.com with your order number.",
  },
];

export function formatFaqForPrompt(): string {
  return FAQ_ENTRIES.map((entry) => `Q: ${entry.question}\nA: ${entry.answer}`).join(
    "\n\n"
  );
}
