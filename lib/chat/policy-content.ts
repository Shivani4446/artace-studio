// lib/chat/policy-content.ts
// Condensed plain-text versions of the store's policy pages, for the
// get_policy chat tool. Kept independent of app/*/page.tsx (which render the
// full formatted pages) so this file can be read/edited without touching
// those pages — update both places if a policy changes.

export type PolicyKey = "returns" | "cancellation" | "privacy" | "terms";

const POLICY_CONTENT: Record<PolicyKey, string> = {
  returns: `Return Policy — Artace Studio

Returns are accepted for eligible artworks within 7 calendar days of delivery. To be approved, the item must be in original condition, unused and free from damage, and packed in the original protective packaging. Custom, made-to-order, or personalized commissions are non-returnable unless there is a confirmed quality issue caused by us.

If an order arrives damaged or the wrong artwork is received, email info@artacestudio.com within 48 hours of delivery with the order number and photos; the team responds within one business day.

All returns require prior approval from support before shipping back. Approved refunds are issued to the original payment method within 5 to 7 business days after the returned item is received and inspected. Original shipping charges are non-refundable unless the return was caused by our error.`,
  cancellation: `Cancellation Policy — Artace Studio

Cancellation eligibility depends on how far the order has progressed:
- Within 24 hours of placing the order: full 100% refund, no reason needed.
- After 24 hours but before approving the first creative concept/sketch: 90% refund (a 10% fee covers payment processing and admin costs).
- After approving the first creative concept/sketch ("Commencement of Creative Work"): the order is no longer eligible for cancellation or refund, since materials and artist time are already committed.

To cancel, email info@artacestudio.com with subject "Order Cancellation Request - [Order Number]", including name, order number, and reason. The team acknowledges within one business day.`,
  privacy: `Privacy Policy — Artace Studio

Artace Studio collects information provided directly (name, email, phone, shipping/billing details, customization preferences) plus automatic technical data (device, browser, IP, pages visited). This is used to process orders, communicate updates, personalize recommendations, prevent fraud, and meet legal obligations. Personal information is never sold to third parties; it may be shared with trusted service providers (payment processors, delivery partners, analytics) under confidentiality obligations.

Cookies are used to keep the site working, remember preferences, and measure performance. Users can request access, correction, or deletion of their data, or withdraw marketing consent, by emailing info@artacestudio.com.`,
  terms: `Terms of Use — Artace Studio

By using the website, you agree to these terms. All content (artwork, images, text, branding) is owned by or licensed to Artace Studio and may not be reproduced or commercially used without permission. Users are responsible for their account's security and activity. Product listings, pricing, and availability may change without notice, and Artace Studio may decline or cancel orders for pricing errors, stock issues, or suspected fraud — refunds for cancelled paid orders go to the original payment method. Misuse of the site (unauthorized access, scraping, abuse) is prohibited. Artace Studio is not liable for indirect or consequential damages from site use. These terms are governed by the laws of India.`,
};

export function getPolicyContent(policy: string): string | null {
  if (
    policy !== "returns" &&
    policy !== "cancellation" &&
    policy !== "privacy" &&
    policy !== "terms"
  ) {
    return null;
  }
  return POLICY_CONTENT[policy];
}
