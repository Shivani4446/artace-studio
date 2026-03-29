import type { Metadata } from "next";
import ArticleLayout from "@/components/article/ArticleLayout";
import { markdownToHtmlWithToc } from "@/utils/article";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Return Policy | Artace Studio",
  description: "Return eligibility and process for artworks purchased from Artace Studio.",
};

const INTRO_HTML = `
  <p>Every artwork at Artace Studio is handcrafted with deep care and intention. We want you to feel confident and delighted with your purchase, and this return policy is designed to keep the process clear and fair.</p>
  <p>If an issue arises, our team will work with you quickly and transparently to resolve it.</p>
`;

const RETURN_MARKDOWN = `
## Eligibility for Returns

Returns are accepted for eligible artworks within **7 calendar days** of delivery. To be approved, the item must be:

- In original condition.
- Unused and free from damage.
- Packed in the original protective packaging.

Custom, made-to-order, or personalized commissions are non-returnable unless there is a confirmed quality issue caused by us.

## Damaged or Incorrect Deliveries

If your order arrives damaged in transit or you receive the wrong artwork:

1. Email us at [info@artacestudio.com](mailto:info@artacestudio.com) within 48 hours of delivery.
2. Include your order number and clear photos of the package and item.
3. Our team will assess the case and share the next steps within one business day.

When validated, we will arrange a replacement, repair, or refund based on availability and the nature of the issue.

## Return Approval Process

All returns require prior approval from our support team. Unauthorized returns may be declined.

Once approved:

- We will share packing and shipping instructions.
- The return shipment must be dispatched within the communicated window.
- Items must be safely packed to prevent transit damage.

## Refund Timeline

After the returned artwork is received and inspected, approved refunds are issued to the original payment method.

- Processing window: **5 to 7 business days** after inspection.
- Bank/payment-provider settlement may add extra time.

If the return does not meet policy conditions, the refund may be partially adjusted or declined.

## Shipping Responsibility

Original shipping charges are non-refundable unless the return is caused by our error.

- For customer-initiated returns, return shipping is the customer's responsibility.
- For damaged/incorrect orders verified by us, return logistics are handled by Artace Studio.

## Contact & Resolution Support

For return-related help, reach us at [info@artacestudio.com](mailto:info@artacestudio.com). We are committed to resolving every valid concern with professionalism, speed, and complete transparency.
`;

const { html: returnHtml, toc: returnToc } = markdownToHtmlWithToc(RETURN_MARKDOWN);

export default function ReturnPolicyPage() {
  return (
    <main>
      <ArticleLayout
        eyebrow="Our Philosophy: A Commitment to Creation"
        title="Return Policy"
        introHtml={INTRO_HTML}
        lastUpdated="15 May 2025"
        readTimeMinutes={4}
        toc={returnToc}
        contentHtml={returnHtml}
      />
    </main>
  );
}
