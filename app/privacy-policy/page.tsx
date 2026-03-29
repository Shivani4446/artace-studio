import type { Metadata } from "next";
import ArticleLayout from "@/components/article/ArticleLayout";
import { markdownToHtmlWithToc } from "@/utils/article";

export const metadata: Metadata = {
  title: "Privacy Policy | Artace Studio",
  description: "How Artace Studio collects, uses, stores, and protects your personal information.",
};

const INTRO_HTML = `
  <p>Artace Studio respects your privacy and is committed to protecting your personal information with strong operational and technical safeguards.</p>
  <p>This policy explains what we collect, how we use it, and the choices you have regarding your data.</p>
`;

const PRIVACY_MARKDOWN = `
## Information We Collect

We collect information you provide directly when interacting with us, such as:

- Name, email, phone number, and shipping details.
- Billing details required to complete a transaction.
- Artwork preferences, customization instructions, and communication history.

We may also collect technical information automatically, including device type, browser, IP address, pages visited, and on-site interaction data.

## How We Use Your Information

Your information is used to operate and improve our services, including to:

- Process orders and coordinate deliveries.
- Communicate updates, invoices, and support responses.
- Personalize recommendations and improve user experience.
- Detect fraudulent activity and maintain platform security.
- Comply with legal and financial obligations.

We do not sell your personal information to third parties.

## Data Sharing and Service Providers

To run our operations, we may share relevant data with trusted service partners such as payment processors, delivery providers, analytics platforms, and support tools.

These partners are required to process your data only for authorized business purposes and with appropriate confidentiality protections.

## Cookies and Tracking Technologies

Our website uses cookies and similar technologies to:

- Keep the site functioning properly.
- Remember your preferences.
- Measure performance and traffic behavior.

You can manage or disable cookies through your browser settings, though some features may not function optimally if cookies are turned off.

## Data Retention and Security

We retain information only for as long as necessary to fulfill legitimate business, contractual, and legal requirements.

Security measures include controlled access, encrypted data transmission, and ongoing monitoring to reduce unauthorized access risks.

## Your Rights and Choices

Depending on your jurisdiction, you may have rights to:

- Access the personal data we hold about you.
- Request correction of inaccurate information.
- Request deletion of data where legally permitted.
- Withdraw consent for marketing communications.

To exercise these rights, contact us at [info@artacestudio.com](mailto:info@artacestudio.com).

## Policy Updates and Contact

We may update this Privacy Policy periodically to reflect legal, operational, or product changes. Any updates will be posted on this page with a revised "Last Updated" date.

If you have questions about this policy or your data, write to us at [info@artacestudio.com](mailto:info@artacestudio.com).
`;

const { html: privacyHtml, toc: privacyToc } =
  markdownToHtmlWithToc(PRIVACY_MARKDOWN);

export default function PrivacyPolicyPage() {
  return (
    <main>
      <ArticleLayout
        eyebrow="Our Philosophy: A Commitment to Creation"
        title="Privacy Policy"
        introHtml={INTRO_HTML}
        lastUpdated="15 May 2025"
        readTimeMinutes={5}
        toc={privacyToc}
        contentHtml={privacyHtml}
      />
    </main>
  );
}
