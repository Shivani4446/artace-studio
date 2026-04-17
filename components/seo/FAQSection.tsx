type FAQItem = {
  question: string;
  answer: string;
};

type FAQSectionProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  items: FAQItem[];
  id?: string;
  className?: string;
};

const FAQSection = ({
  eyebrow = "FAQ",
  title,
  intro,
  items,
  id,
  className = "bg-[#f4f2ee] py-10 md:py-[90px]",
}: FAQSectionProps) => {
  if (items.length === 0) return null;

  return (
    <section id={id} className={className}>
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="max-w-[980px]">
          <p className="text-[16px] leading-[1.5] text-[#767676] md:text-[18px]">
            {eyebrow}
          </p>
          <h2 className="mt-4 font-display text-[30px] leading-[1.08] text-[#1f1f1f] sm:text-[34px] md:mt-5 md:text-[48px]">
            {title}
          </h2>
          {intro ? (
            <p className="mt-4 max-w-[760px] text-[16px] leading-[1.7] text-[#5b5b5b] sm:text-[17px] md:mt-5 md:text-[20px]">
              {intro}
            </p>
          ) : null}
        </div>

        <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-2 md:gap-5">
          {items.map((item) => (
            <article
              key={item.question}
              className="rounded-[14px] border border-[#1f1f1f]/10 bg-white p-5 shadow-[0_10px_24px_rgba(0,0,0,0.04)] md:p-6"
            >
              <h3 className="font-display text-[22px] leading-[1.2] text-[#1f1f1f] md:text-[26px]">
                {item.question}
              </h3>
              <p className="mt-3 text-[15px] leading-7 text-[#4f4b45] md:text-[16px]">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export type { FAQItem };
export default FAQSection;
