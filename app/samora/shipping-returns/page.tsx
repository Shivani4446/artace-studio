import type { Metadata } from "next";
import SamoraArticleLayout from "@/components/samora/SamoraArticleLayout";
import { markdownToHtmlWithToc } from "@/utils/article";

export const runtime = "edge";

const TITLE = "Shipping & Returns | Samora by Artace Studio";
const DESCRIPTION =
  "Samora's shipping and returns policy — pan-India delivery via Delhivery, free shipping above ₹2000, and a 7-day return window on eligible handcrafted pieces.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/samora/shipping-returns",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/samora/shipping-returns",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Samora is a sub-brand of Artace Studio, run under the same business and
// support team — the return-window and refund-timeline numbers here match
// Artace Studio's own published /return-policy exactly (7-day window, 5-7
// business day refund processing) rather than inventing different ones.
// The rest (shipping carrier, free-shipping threshold, personalization
// clause) reflects what's actually built for Samora specifically.
const SHIPPING_RETURNS_MARKDOWN = `
## Shipping

Samora ships pan-India via **Delhivery**, with real-time rates calculated at checkout based on your delivery pincode and order weight.

- **Free shipping** on orders above **₹2,000**.
- Below that, shipping is charged at the live rate quoted at checkout for your exact location — not a flat fee.
- Enter your pincode on any product page before ordering to see estimated delivery serviceability for your area.
- Orders are packed and dispatched from our Pune workshop; typical transit time depends on your location and Delhivery's delivery timelines for that pincode.

## Order Tracking

Once your order is placed, you can check its status anytime from [your order history](/dashboard/orders). See our [Track My Order](/samora/track-order) page for details.

## Returns & Exchanges

Returns are accepted for eligible Samora pieces within **7 calendar days** of delivery. To be approved, the item must be:

- In original condition, unused.
- Free from damage, with no signs of wear.
- In its original packaging where possible.

**Personalized name plates are non-returnable** unless there is a confirmed quality issue or manufacturing defect — since these are made to order with your specific name or design, they can't be resold or reused once personalized.

## Damaged or Incorrect Deliveries

If your order arrives damaged in transit, or you receive the wrong item:

1. Email us at [info@artacestudio.com](mailto:info@artacestudio.com) or message us on WhatsApp within 48 hours of delivery.
2. Include your order number and clear photos of the packaging and the item.
3. We'll assess the case and get back to you within one business day with next steps — a replacement, repair, or refund depending on availability and the issue.

## Refund Timeline

Once a return is received and inspected, approved refunds are processed to your original payment method within **5 to 7 business days**. Your bank or payment provider may take a little longer to actually settle the amount into your account.

## Return Shipping

- For customer-initiated returns (change of mind, wrong size, etc.), return shipping is the customer's responsibility.
- For damaged or incorrect orders verified by our team, we arrange and cover the return logistics.

## Gift Wrapping

Orders marked "Make it a gift" at checkout (₹50 per item) are wrapped before dispatch. Gift wrapping fees are non-refundable if the underlying item is later returned, since the wrapping itself can't be resold.

## Questions?

Reach out to us on WhatsApp or at [info@artacestudio.com](mailto:info@artacestudio.com) — we're happy to help with anything shipping- or return-related.
`;

const { html: shippingHtml, toc: shippingToc } = markdownToHtmlWithToc(SHIPPING_RETURNS_MARKDOWN);

const SamoraShippingReturnsPage = () => {
  return (
    <SamoraArticleLayout
      eyebrow="Shipping & Returns"
      title="Shipping & Returns"
      intro="Everything you need to know about how your Samora order gets to you, and what happens if something needs to go back."
      contentHtml={shippingHtml}
      toc={shippingToc}
    />
  );
};

export default SamoraShippingReturnsPage;
