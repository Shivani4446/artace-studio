import Image from "next/image";

const WHY_ARTACE_POINTS = [
  {
    title: "Authenticity",
    text: "We stand behind the authenticity and quality of our artwork, ensuring lasting beauty and value.",
    iconSrc: "/Authenticity.svg",
  },
  {
    title: "Satisfaction Guarantee",
    text: "Enjoy peace of mind with our 15-day satisfaction guarantee and shop with confidence.",
    iconSrc: "/Satisfaction Guarantee.svg",
  },
  {
    title: "Personal Support",
    text: "We offer dedicated support to ensure a smooth and exceptional experience from start to finish.",
    iconSrc: "/Personal Support.svg",
  },
  {
    title: "Curated with Confidence",
    text: "We curate exceptional, authentic art so you can create with confidence.",
    iconSrc: "/Curated with Confidence.svg",
  },
];

const WhyArtaceStudio = () => {
  return (
    <section className="px-4 py-12 sm:px-6 md:px-12 md:py-16 lg:px-24">
      <div className="mx-auto max-w-[1440px]">
        <h2 className="font-display text-[26px] leading-[1.12] text-[#1f1f1f] md:text-center md:text-[52px] md:leading-none">
          Why Artace Studio
        </h2>
        <p className="mt-4 max-w-[980px] text-[15px] leading-7 text-[#595959] md:mx-auto md:text-center md:text-[18px] md:leading-8">
          Bringing a new piece of art into your life is a significant moment, one filled with excitement and personal expression. We believe the experience of acquiring it should be just as inspiring and effortless.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:mt-12 md:gap-x-10 md:gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          {WHY_ARTACE_POINTS.map(({ title, text, iconSrc }) => (
            <div
              key={title}
              className="flex h-full w-full flex-col items-start text-left md:mx-auto md:max-w-[320px] md:items-center md:text-center lg:max-w-none"
            >
              <Image
                src={iconSrc}
                alt={title}
                width={64}
                height={64}
                className="h-11 w-auto object-contain md:mx-auto md:h-14"
              />
              <h3 className="mt-5 font-display text-[22px] leading-[1.2] text-[#313131] md:text-[25px]">
                {title}
              </h3>
              <p className="mt-2 text-[15px] leading-7 text-[#595959] md:text-[18px] md:leading-8">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyArtaceStudio;
