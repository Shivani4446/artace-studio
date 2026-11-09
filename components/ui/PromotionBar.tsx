import React from "react";

const FESTIVE_TEXT = "Festive offer";
const DIWALI_TEXT = "Diwali 2026";

// A diya (oil lamp) reads as "Diwali" at a glance, even at the marquee's
// 12–13px type size. Flat gold fills with no <defs>/gradient ids, so repeating
// it across the marquee can never duplicate DOM ids.
const DiyaIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4 shrink-0"
    aria-hidden="true"
    focusable="false"
  >
    {/* flame */}
    <path
      d="M12 1.6c1.7 2.3 2.8 4 2.8 5.6a2.8 2.8 0 1 1-5.6 0c0-1.6 1.1-3.3 2.8-5.6Z"
      fill="#FFD36B"
    />
    <path
      d="M12 4.1c.8 1.1.9 2.4 0 3.5-.9-1.1-.8-2.4 0-3.5Z"
      fill="#FFF6D8"
    />
    {/* lamp */}
    <path
      d="M3.6 14.1h16.8c.8 0 1.3.9.9 1.6-2.1 3.3-5.2 5-9.3 5s-7.2-1.7-9.3-5c-.4-.7.1-1.6.9-1.6Z"
      fill="#D4AF37"
    />
    <path
      d="M7.4 18.3c2.9 1 6.3 1 9.2 0"
      stroke="#8a6d1f"
      strokeWidth="1.1"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// The marquee animates with `translateX(-50%)`, so the strip is seamless only
// while both halves render an identical sequence. The second half is a
// screen-reader-hidden duplicate for that reason — never edit one in isolation.
const SEQUENCE = Array.from({ length: 4 }, () => [
  { text: FESTIVE_TEXT, accent: false },
  { text: DIWALI_TEXT, accent: true },
]).flat();

const AnnouncementItem = ({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) => (
  <span className="mx-4 inline-flex items-center gap-2.5 whitespace-nowrap">
    <DiyaIcon />
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
