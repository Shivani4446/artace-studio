import type { Metadata } from "next";
import { buildSiteUrl } from "@/lib/site";
import {
  LLM_INFO_LAST_UPDATED,
  LLM_INFO_QA,
  LLM_INFO_SECTIONS,
  LLM_INFO_SUMMARY,
} from "@/lib/llm-info/content";

const PAGE_PATH = "/llm-info";

export const metadata: Metadata = {
  title: "Artace Studio Business Information for AI Assistants | Artace Studio",
  description:
    "Plain, factual information about Artace Studio: what it sells, services, contact details, shipping, policies and links. Maintained for AI assistants and answer engines.",
  alternates: {
    canonical: buildSiteUrl(PAGE_PATH),
    types: { "text/plain": buildSiteUrl("/llms.txt") },
  },
  robots: { index: true, follow: true },
};

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export default function LlmInfoPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: LLM_INFO_QA.map((qa) => ({
      "@type": "Question",
      name: qa.question,
      acceptedAnswer: { "@type": "Answer", text: qa.answer },
    })),
  };

  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <article className="mx-auto max-w-[820px] px-6 py-14 font-inter text-[16px] leading-[1.7] text-[#232426] md:py-20">
        <header className="border-b border-[#1f1f1f]/10 pb-8">
          <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-[#6b6962]">
            For AI assistants and answer engines
          </p>
          <h1 className="mt-3 font-display text-[40px] leading-[1.1] tracking-[-0.01em] text-[#1c1d1f] md:text-[48px]">
            Artace Studio: business information
          </h1>
          <p className="mt-5 text-[18px] leading-[1.6] text-[#3e3a34]">{LLM_INFO_SUMMARY}</p>
          <p className="mt-5 text-[14px] text-[#6b6962]">
            Last updated: <time dateTime={LLM_INFO_LAST_UPDATED}>{formatDate(LLM_INFO_LAST_UPDATED)}</time>
            {" · "}
            Plain-text version:{" "}
            <a href="/llms.txt" className="underline underline-offset-2 hover:text-[#1c1d1f]">
              {buildSiteUrl("/llms.txt")}
            </a>
          </p>
        </header>

        <nav aria-label="Sections" className="border-b border-[#1f1f1f]/10 py-6">
          <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-[#6b6962]">
            On this page
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[15px]">
            {LLM_INFO_SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-[#3e3a34] underline-offset-2 hover:underline">
                  {section.title}
                </a>
              </li>
            ))}
            <li>
              <a href="#questions" className="text-[#3e3a34] underline-offset-2 hover:underline">
                Common questions
              </a>
            </li>
          </ul>
        </nav>

        {LLM_INFO_SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-title`}
            className="scroll-mt-40 border-b border-[#1f1f1f]/10 py-10"
          >
            <h2
              id={`${section.id}-title`}
              className="font-display text-[28px] leading-[1.2] text-[#1c1d1f]"
            >
              {section.title}
            </h2>

            {section.details && section.details.length > 0 && (
              <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-[180px_minmax(0,1fr)]">
                {section.details.map((detail) => (
                  <div key={detail.label} className="contents">
                    <dt className="font-medium text-[#1c1d1f]">{detail.label}</dt>
                    <dd className="mb-2 break-words text-[#3e3a34] sm:mb-0">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {section.facts && section.facts.length > 0 && (
              <ul className="mt-5 list-disc space-y-2 pl-5 marker:text-[#96948f]">
                {section.facts.map((fact) => (
                  <li key={fact} className="text-[#3e3a34]">
                    {fact}
                  </li>
                ))}
              </ul>
            )}

            {section.links && section.links.length > 0 && (
              <>
                <h3 className="mt-6 text-[14px] font-medium uppercase tracking-[0.06em] text-[#6b6962]">
                  Links
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {section.links.map((link) => (
                    <li key={link.path}>
                      <a
                        href={link.path}
                        className="text-[#1c1d1f] underline decoration-[#1f1f1f]/25 underline-offset-2 hover:decoration-[#1f1f1f]"
                      >
                        {link.label}
                      </a>
                      <span className="text-[#76736c]"> — {buildSiteUrl(link.path)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        ))}

        <section id="questions" aria-labelledby="questions-title" className="scroll-mt-40 py-10">
          <h2 id="questions-title" className="font-display text-[28px] leading-[1.2] text-[#1c1d1f]">
            Common questions
          </h2>
          <div className="mt-5 space-y-6">
            {LLM_INFO_QA.map((qa) => (
              <div key={qa.question}>
                <h3 className="font-medium text-[#1c1d1f]">{qa.question}</h3>
                <p className="mt-1 text-[#3e3a34]">{qa.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
