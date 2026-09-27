import React from "react";

const FESTIVE_TEXT = "Festive offer";
const NAVRATRI_TEXT = "Navratri 2026";

// The marquee animates with `translateX(-50%)`, so the strip is seamless only
// while both halves render an identical sequence. The second half is a
// screen-reader-hidden duplicate for that reason — never edit one in isolation.
const SEQUENCE = Array.from({ length: 4 }, () => [
  { text: FESTIVE_TEXT, accent: false },
  { text: NAVRATRI_TEXT, accent: true },
]).flat();

const AnnouncementItem = ({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) => (
  <span className="mx-4 inline-flex items-center gap-3 whitespace-nowrap">
    <span className="text-[#D4AF37]">✦</span>
    <span
      className={`text-[12px] font-semibold uppercase tracking-[0.18em] sm:text-[13px] ${
        accent ? "text-[#D4AF37]" : ""
      }`}
    >
      {children}
    </span>
  </span>
);

const AnnouncementRun = ({ duplicated = false }: { duplicated?: boolean }) => (
  <div className="flex items-center" aria-hidden={duplicated ? "true" : undefined}>
    {SEQUENCE.map((item, index) => (
      <AnnouncementItem key={index} accent={item.accent}>
        {item.text}
      </AnnouncementItem>
    ))}
  </div>
);

const PromotionBar = () => {
  return (
    <div className="flex h-9 w-full overflow-hidden bg-black text-white">
      <div className="flex w-max animate-[marquee_14s_linear_infinite] items-center">
        <AnnouncementRun />
        <AnnouncementRun duplicated />
      </div>
    </div>
  );
};

export default PromotionBar;
