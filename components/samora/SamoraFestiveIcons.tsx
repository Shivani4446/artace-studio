const BUNTING_COLORS = ["#c1683d", "#e8c07d", "#f3ead9"];
const BUNTING_FLAG_COUNT = 24;
const BUNTING_FLAG_WIDTH = 34;

// A row of small triangular flags strung on a thread — the classic Indian
// festive "toran" bunting used to dress up a doorway or stage for a
// celebration. Used along the top edge of the Festive Special section.
export const SamoraFestiveBunting = ({ className = "" }: { className?: string }) => {
  const width = BUNTING_FLAG_COUNT * BUNTING_FLAG_WIDTH;

  return (
    <svg
      viewBox={`0 0 ${width} 56`}
      preserveAspectRatio="none"
      fill="none"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <line x1="0" y1="3" x2={width} y2="3" stroke="#e8c07d" strokeWidth="1.5" opacity="0.55" />
      {Array.from({ length: BUNTING_FLAG_COUNT }).map((_, index) => {
        const x = index * BUNTING_FLAG_WIDTH + 6;
        const color = BUNTING_COLORS[index % BUNTING_COLORS.length];
        return (
          <path
            key={index}
            d={`M${x} 3 L${x + 22} 3 L${x + 11} 38 Z`}
            fill={color}
            opacity="0.92"
          />
        );
      })}
    </svg>
  );
};

// A simple six-petal rosette evoking the decorative thread-work at the
// centre of a rakhi. Small = eyebrow badge icon, large + faint = background
// watermark texture.
export const SamoraRakhiRosette = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} role="presentation" aria-hidden="true">
    {[0, 60, 120, 180, 240, 300].map((angle) => (
      <ellipse
        key={angle}
        cx="12"
        cy="6.5"
        rx="2.1"
        ry="4.2"
        fill="currentColor"
        opacity="0.85"
        transform={`rotate(${angle} 12 12)`}
      />
    ))}
    <circle cx="12" cy="12" r="2.4" fill="currentColor" />
  </svg>
);
