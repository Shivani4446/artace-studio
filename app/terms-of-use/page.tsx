import type { Metadata } from "next";
import ArticleLayout from "@/components/article/ArticleLayout";
import { markdownToHtmlWithToc } from "@/utils/article";

export const metadata: Metadata = {
  title: "Terms of Use | Artace Studio",
  description: "Terms and conditions governing the use of the Artace Studio website and services.",
};

const INTRO_HTML = `
  <p>These Terms of Use govern your access to and use of the Artace Studio website, services, and content.</p>
  <p>By using our platform, you agree to comply with these terms and all applicable laws.</p>
`;

const TERMS_MARKDOWN = `
## Acceptance of Terms

By accessing or using this website, you confirm that you have read, understood, and agree to be bound by these Terms of Use. If you do not agree, please discontinue use of the website.

## Website Content and Intellectual Property

All website content, including artwork, product images, design assets, text, branding, and source materials, is owned by Artace Studio or licensed to us.

- Content is protected under applicable copyright, trademark, and intellectual property laws.
- You may not reproduce, republish, distribute, or commercially exploit any content without prior written permission.

## Account and User Responsibilities

When creating an account or placing an order, you agree to provide accurate information and keep your credentials secure.

You are responsible for activity carried out through your account. Any unauthorized use should be reported immediately.

## Orders, Pricing, and Availability

Product listings, pricing, and availability may change without notice.

- Submission of an order does not guarantee acceptance.
- We reserve the right to decline or cancel orders for pricing errors, stock issues, policy violations, or suspected fraud.
- In case of cancellation after payment, any eligible refund will be processed to the original payment method.

## Prohibited Use

You agree not to misuse the website or attempt to interfere with platform operation, security, or other users. Prohibited activity includes unauthorized access attempts, abuse, scraping, malware distribution, or any unlawful conduct.

## Third-Party Links and Services

This website may include links to third-party tools or websites for convenience. Artace Studio does not control and is not responsible for the content, policies, or practices of external services.

## Limitation of Liability

To the maximum extent permitted by law, Artace Studio is not liable for indirect, incidental, special, or consequential damages resulting from use of the website, inability to use the website, or purchases made through it.

## Governing Law

These terms are governed by the laws of India. Any dispute arising from these terms or use of the website will be subject to the competent courts of India.

## Updates to Terms

We may revise these Terms of Use at any time. Updated terms become effective upon publication on this page. Continued use of the website after updates constitutes acceptance of the revised terms.

## Contact

For questions regarding these terms, contact us at [info@artacestudio.com](mailto:info@artacestudio.com).
`;

const { html: termsHtml, toc: termsToc } = markdownToHtmlWithToc(TERMS_MARKDOWN);

export default function TermsOfUsePage() {
  return (
    <main>
      <ArticleLayout
        eyebrow="Our Philosophy: A Commitment to Creation"
        title="Terms of Use"
        introHtml={INTRO_HTML}
        lastUpdated="15 May 2025"
        readTimeMinutes={5}
        toc={termsToc}
        contentHtml={termsHtml}
      />
    </main>
  );
}
