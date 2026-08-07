import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import WhyArtaceStudio from "@/components/shared/WhyArtaceStudio";
import FAQSection, { type FAQItem } from "@/components/seo/FAQSection";
import { buildSiteUrl } from "@/lib/site";
import { decodeHtmlEntities } from "@/utils/text";

export const revalidate = 300;

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const GOOGLE_REVIEW_URL = "https://g.page/r/CREUQjoV-JtBEBM/review";

// Purchase-format categories, not browsing themes — never shown in the
// "top categories" strip regardless of product count.
const EXCLUDED_CATEGORY_SLUGS = new Set([
  "all-products",
  "photography",
  "prints",
  "tote-bags",
  "tea-coaster",
]);

type WooStoreCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

const getApiBaseUrl = () => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || DEFAULT_WOOCOMMERCE_SITE_URL;
  return apiBaseUrl.replace(/\/+$/, "");
};

const fetchTopCategories = async (): Promise<WooStoreCategory[]> => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(
      `${apiBaseUrl}/wp-json/wc/store/v1/products/categories?hide_empty=true&per_page=100`,
      { next: { revalidate } }
    );
    if (!response.ok) return [];
    const payload = (await response.json()) as WooStoreCategory[];
    if (!Array.isArray(payload)) return [];

    return payload
      .filter((category) => !EXCLUDED_CATEGORY_SLUGS.has(category.slug))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  } catch {
    return [];
  }
};

export const metadata: Metadata = {
  title: "Reviews & Trust | Artace Studio",
  description:
    "See why 20,000+ collectors trust Artace Studio — real Trustpilot and Google reviews, our satisfaction guarantee, and answers to common questions.",
  alternates: {
    canonical: buildSiteUrl("/reviews"),
  },
  openGraph: {
    title: "Reviews & Trust | Artace Studio",
    description: "20,000+ collectors trust Artace Studio for handmade art.",
    url: buildSiteUrl("/reviews"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Reviews & Trust | Artace Studio",
    description: "20,000+ collectors trust Artace Studio for handmade art.",
  },
};

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Why should I buy from Artace Studio?",
    answer:
      "Every piece is handmade by our artists, backed by an authenticity guarantee, a 15-day satisfaction window, and personal support from start to finish — we curate exceptional, authentic art so you can buy with confidence.",
  },
  {
    question: "How can I be sure the artwork is authentic?",
    answer:
      "Every original painting ships with an Authenticity Certificate confirming it's handmade by the named artist — not a mass-produced reproduction.",
  },
  {
    question: "What is the difference between original art and prints?",
    answer:
      "An original is a one-of-a-kind handmade painting. A print is a fine-art reproduction of that same painting, priced at 25% of the original's price for that size, with optional framing for an extra ₹350.",
  },
  {
    question: "How long will it take to ship my order?",
    answer:
      "Delivery times are estimated based on our past shipments and may vary depending on the courier partner, customs procedures for international orders, or other factors beyond our control.",
  },
  {
    question: "Do you offer expedited shipping?",
    answer:
      "Not currently — all orders ship via our standard delivery timeline.",
  },
  {
    question: "Where are artworks shipped from?",
    answer: "All orders ship from our studio and warehouse in India.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes. For orders shipped outside India, any applicable import duties or taxes are paid directly to the courier partner on delivery and are not included in our prices.",
  },
  {
    question: "Can I request more images or details about a piece?",
    answer:
      "Absolutely — reach out via Contact Us and we'll share additional photos or details before you order.",
  },
  {
    question: "Do you provide framing services?",
    answer:
      "Yes. Every original comes with a choice of frame styles at no extra cost. Prints can also be framed for a flat ₹350.",
  },
  {
    question: "What is your return or exchange policy?",
    answer:
      "You may return your painting within 15 days of delivery. Returns are accepted for default-size, unframed paintings delivered within India, in their original packaging and condition.",
  },
  {
    question: "What if the artwork arrives damaged?",
    answer:
      "Contact our customer support within 24 hours of delivery and we'll make it right as quickly as possible.",
  },
  {
    question: "What if the artwork looks different in person than online?",
    answer:
      "We do our best to photograph every piece accurately, but screens can render color slightly differently. If something feels off once it arrives, our standard return policy has you covered.",
  },
  {
    question: "Do you offer art advisory services?",
    answer:
      "Yes — our complimentary art advisory service pairs you with a curator who can help you find a piece that fits your space and style, at no cost.",
  },
  {
    question: "Do you have a trade program?",
    answer:
      "Yes — we offer exclusive trade discounts for bulk and corporate orders. Visit our Corporate Bulk Orders page to get started.",
  },
  {
    question: "Do you work with galleries or corporate clients?",
    answer:
      "We regularly work with corporate clients on bulk and gifting orders. If you're a gallery interested in a partnership, we'd love to hear from you via Contact Us.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept credit/debit cards, UPI, net banking, and popular digital wallets.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Yes — once your order ships, you can track it from your account, and we'll share the courier's tracking link as well.",
  },
  {
    question: "Will I be charged customs duties or taxes?",
    answer:
      "For international orders, any customs duties or taxes are charged separately by the courier on delivery and are not included in our prices.",
  },
  {
    question: "Do you have a physical gallery location?",
    answer:
      "We're an online-only studio — all orders ship directly from our studio and warehouse in India.",
  },
];

const ReviewsPage = async () => {
  const topCategories = await fetchTopCategories();

  return (
    <main className="bg-[#f4f2ee] text-[#1f1f1f]">
      <section className="bg-[#1f1f1f] px-4 py-16 text-center text-white sm:px-6 md:px-12 md:py-24">
        <div className="mx-auto max-w-[860px]">
          <p className="font-inter text-[13px] uppercase tracking-[0.12em] text-white/60">
            Reviews & Trust
          </p>
          <h1 className="mt-4 font-display text-[36px] leading-[1.1] md:text-[56px]">
            Loved by Art Collectors Worldwide
          </h1>
          <p className="mt-5 text-[16px] leading-7 text-white/75 md:text-[19px] md:leading-8">
            From the first painting to the thousandth, our collectors keep coming
            back — here&apos;s what that trust looks like in numbers.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 md:px-12 md:py-14">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
          <div className="rounded-[14px] border border-[#1f1f1f]/10 bg-white p-5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
            <p className="font-display text-[28px] text-[#1f1f1f] md:text-[34px]">20,000+</p>
            <p className="mt-1 text-[13px] text-[#6a655d] md:text-[14px]">Global Collectors</p>
          </div>
          <div className="rounded-[14px] border border-[#1f1f1f]/10 bg-white p-5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
            <Image
              src="/google-logo.png"
              alt="Google"
              width={28}
              height={28}
              className="mx-auto h-7 w-7"
            />
            <p className="mt-2 font-display text-[28px] text-[#1f1f1f] md:text-[34px]">5.0</p>
            <p className="mt-1 text-[13px] text-[#6a655d] md:text-[14px]">Google Reviews</p>
          </div>
          <div className="rounded-[14px] border border-[#1f1f1f]/10 bg-white p-5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
            <Image
              src="/trustpilot-logo.svg"
              alt="Trustpilot"
              width={90}
              height={22}
              className="mx-auto h-[18px] w-auto"
            />
            <p className="mt-2 font-display text-[28px] text-[#126849] md:text-[34px]">4.5</p>
            <p className="mt-1 text-[13px] text-[#6a655d] md:text-[14px]">Excellent Rating</p>
          </div>
          <div className="rounded-[14px] border border-[#1f1f1f]/10 bg-white p-5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
            <p className="font-display text-[28px] text-[#1f1f1f] md:text-[34px]">15-Day</p>
            <p className="mt-1 text-[13px] text-[#6a655d] md:text-[14px]">Easy Returns</p>
          </div>
          <div className="rounded-[14px] border border-[#1f1f1f]/10 bg-white p-5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
            <p className="font-display text-[28px] text-[#1f1f1f] md:text-[34px]">100%</p>
            <p className="mt-1 text-[13px] text-[#6a655d] md:text-[14px]">Secure Checkout</p>
          </div>
        </div>
      </section>

      <WhyArtaceStudio />

      <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-6 rounded-[20px] border border-[#1f1f1f]/10 bg-white p-8 text-center shadow-[0_18px_40px_rgba(31,31,31,0.05)] md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="font-display text-[26px] leading-[1.15] text-[#1f1f1f] md:text-[32px]">
              Have You Purchased From Us?
            </h2>
            <p className="mt-3 max-w-[520px] text-[15px] leading-7 text-[#595959] md:text-[16px]">
              We&apos;d love to hear about your experience — a quick review helps
              other collectors find us, and helps us keep improving.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#1f1f1f] px-6 py-3 text-[16px] font-normal text-white transition-colors hover:bg-black"
            >
              <Star className="h-4 w-4 fill-white" />
              Write a Review
            </a>
            <Link
              href="/contact-us"
              className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-[#1f1f1f] px-6 py-3 text-[16px] font-normal text-[#1f1f1f] transition-colors hover:bg-[#1f1f1f] hover:text-white"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      <FAQSection
        title="Frequently Asked Questions"
        intro="Everything collectors usually want to know before their first (or next) order."
        items={FAQ_ITEMS}
      />

      {topCategories.length > 0 && (
        <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16">
          <div className="mx-auto max-w-[1100px] text-center">
            <h2 className="font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-[38px]">
              Shop Top Categories
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {topCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/collections/${category.slug}`}
                  className="rounded-full border border-[#1f1f1f]/15 bg-white px-5 py-2.5 text-[14px] font-medium text-[#313131] transition-colors hover:border-[#1f1f1f] hover:bg-[#1f1f1f] hover:text-white md:text-[15px]"
                >
                  {decodeHtmlEntities(category.name)}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default ReviewsPage;
