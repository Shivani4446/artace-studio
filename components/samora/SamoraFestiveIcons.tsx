const BUNTING_COLORS = ["#d4841a", "#f3c98b", "#7a2e0e"];
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
      <line x1="0" y1="3" x2={width} y2="3" stroke="#f3c98b" strokeWidth="1.5" opacity="0.55" />
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

// A modak — the sweet dumpling offered during Ganesh Chaturthi — drawn as a
// simple pleated dome with a curled tip. Small = eyebrow badge icon,
// large + faint = background watermark texture.
export const SamoraModakIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} role="presentation" aria-hidden="true">
    {/* base plate */}
    <ellipse cx="12" cy="20.5" rx="7" ry="1.1" fill="currentColor" opacity="0.25" />
    {/* dome body */}
    <path
      d="M12 3.6c4 1.1 7 4.9 7 9.3 0 4.4-3.3 7.9-7 7.9s-7-3.5-7-7.9c0-4.4 3-8.2 7-9.3z"
      fill="currentColor"
    />
    {/* pleat lines */}
    <path
      d="M12 6.4v14.2M9 7.6c-1.2 3.6-1.2 9.4 0 13M15 7.6c1.2 3.6 1.2 9.4 0 13"
      stroke="currentColor"
      strokeOpacity="0.3"
      strokeWidth="0.9"
      strokeLinecap="round"
    />
    {/* top curl */}
    <path
      d="M12 3.6c-.7-1.5-.3-2.5.7-3.1"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
