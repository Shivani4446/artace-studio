import type { Metadata } from "next";
import ArticleLayout from "@/components/article/ArticleLayout";
import { markdownToHtmlWithToc } from "@/utils/article";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Cancellation Policy | Artace Studio",
  description: "Cancellation policy and refund eligibility for commissioned artworks.",
};

const INTRO_HTML = `
  <p>At Artace Studio, commissioning an artwork is a collaborative partnership. When you place an order, you are reserving a master artist's dedicated time and initiating a creative process that involves sourcing premium materials specifically for your vision.</p>
  <p>Our cancellation policy is designed to be fair to our clients while respecting the professional commitment and resources allocated at each stage of this journey.</p>
`;

const CANCELLATION_MARKDOWN = `
## The "Point of No Return": Commencement of Creative Work

This policy is structured around a critical milestone: the **Commencement of Creative Work**. This point is officially reached the moment you, the client, provide your formal approval of the first creative concept, sketch, or digital proof sent to you by our team.

Your approval triggers the allocation of materials and the artist's dedicated work on your masterpiece.

## The Tiered Cancellation Timeline & Refund Eligibility

To provide flexibility, we offer a tiered cancellation window. The eligibility for a refund is directly tied to the order's status within our production timeline.

- **Stage 1: The 24-Hour Cooling-Off Period**
  - **Eligibility:** Within 24 hours of placing your order and making the payment.
  - **Action:** You may cancel your order for any reason.
  - **Refund:** 100% Full Refund.
- **Stage 2: Pre-Production Window**
  - **Eligibility:** After 24 hours have passed, but before you have approved the first creative concept/sketch.
  - **Action:** You may still request a cancellation during this phase.
  - **Refund:** 90% Refund. A 10% cancellation fee is retained to cover payment processing charges and the administrative costs of initiating your project.
- **Stage 3: After Commencement of Creative Work**
  - **Eligibility:** This stage begins the moment you approve the first creative concept/sketch.
  - **Action:** At this point, the artwork is officially in production. Materials have been allocated, and the artist's time is fully committed.
  - **Refund:** The order is no longer eligible for cancellation or a refund.

## How to Request a Cancellation

All cancellation requests must be made in writing to ensure clarity and proper documentation.

1. **Send an email** to our official support address: [info@artacestudio.com](mailto:info@artacestudio.com)
2. **Use the subject line:** "Order Cancellation Request - [Your Order Number]"
3. In the body of the email, please state your **name, order number, and reason for cancellation**.

Our team will acknowledge your request within one business day and process it according to the timeline outlined above. The eligibility for a refund will be determined by the timestamp of your cancellation email.

## Studio's Right to Cancel

Artace Studio reserves the right to cancel an order under specific circumstances, including but not limited to:

- The client is non-responsive to communications (e.g., requests for approval) for an extended period (e.g., over 15 days).
- The client's request is technically unfeasible or violates our studio's ethical standards.
- Non-payment of a pre-agreed installment.

In the event that Artace Studio cancels an order due to such reasons, a refund will be issued to the client based on the production stage the order was in at the time of cancellation, in accordance with Section 2 of this policy.

For any questions regarding this policy, please contact us before placing your order. We believe in complete transparency and are happy to clarify any points.
`;

const { html: cancellationHtml, toc: cancellationToc } =
  markdownToHtmlWithToc(CANCELLATION_MARKDOWN);

export default function CancellationPolicyPage() {
  return (
    <main>
      <ArticleLayout
        eyebrow="Our Philosophy: A Commitment to Creation"
        title="Cancellation Policy"
        introHtml={INTRO_HTML}
        lastUpdated="15 May 2025"
        readTimeMinutes={4}
        toc={cancellationToc}
        contentHtml={cancellationHtml}
      />
    </main>
  );
}
