import type { TocItem } from "@/utils/article";

// Lightweight, Samora-themed wrapper for long-form content pages (Care
// Guide, Shipping & Returns). Deliberately not the full ArticleLayout used
// for Artace's blog (product embeds, currency conversion, author bios) —
// that's built for editorial content marketing, not a policy/guide page.
// Reuses the existing `.product-description-content` prose CSS (already
// proven inside Samora on product pages) rather than inventing new styles.
const SamoraArticleLayout = ({
  eyebrow,
  title,
  intro,
  contentHtml,
  toc,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  contentHtml: string;
  toc?: TocItem[];
}) => {
  return (
    <main className="bg-[#fbf6ef]">
      <section className="mx-auto max-w-[820px] px-5 py-14 md:px-10 md:py-20">
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c1683d]">
          {eyebrow}
        </p>
        <h1 className="font-samora-display mt-4 text-[32px] leading-[1.15] text-[#2b2420] sm:text-[38px] md:text-[44px]">
          {title}
        </h1>
        {intro ? (
          <p className="mt-5 text-[16.5px] leading-[1.75] text-[#5c5344] md:text-[18px]">{intro}</p>
        ) : null}

        {toc && toc.length > 1 ? (
          <nav className="mt-8 rounded-[16px] border border-[#2b2420]/10 bg-[#f3ead9] p-5">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-[#8a7c68]">
              On this page
            </p>
            <ul className="mt-3 space-y-1.5">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-[14.5px] text-[#3f382f] hover:text-[#c1683d]"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <div
          className="product-description-content mt-10"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </section>
    </main>
  );
};

export default SamoraArticleLayout;
