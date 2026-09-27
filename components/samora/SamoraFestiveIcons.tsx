// Navratri motifs for the Samora homepage festive section.
//
// Palette: Samora's documented festive accents — deep maroon `#460000`, gold
// `#e8c07d` — shifted toward crimson `#9b2226` and terracotta `#c1683d` (the
// brand's primary accent) for Maa Durga. Cream `#f5e3c8` is the sand family
// lightened, so bunting reads festive without leaving the brand.
//
// Every icon here is stateless and server-renderable (no "use client"), and
// every fill/stroke is `currentColor` so the Tailwind `text-*` class drives it.

const BUNTING_COLORS = ["#e8c07d", "#9b2226", "#c1683d", "#f5e3c8"];
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

// A diya — the small clay oil lamp lit every evening of the nine nights of
// Navratri. This is the section's signature motif, so the flame is factored
// out as its own <g>: callers pass `flameClassName` to opt into the flicker
// animation (see `.samora-flame` in app/globals.css). Watermark-sized copies
// pass nothing, because a 256px-tall flickering flame reads as a glitch.
export const SamoraDiyaIcon = ({
  className = "",
  flameClassName = "",
}: {
  className?: string;
  flameClassName?: string;
}) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} role="presentation" aria-hidden="true">
    {/* flame — `transform-box: fill-box` pins the origin to the flame's own
        box so it flickers in place instead of around the SVG's centre */}
    <g
      className={flameClassName}
      style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
    >
      <path
        d="M12 2.9c1.95 1.8 3.15 3.7 3.15 5.6 0 1.95-1.4 3.3-3.15 3.3s-3.15-1.35-3.15-3.3c0-1.9 1.2-3.8 3.15-5.6z"
        fill="currentColor"
      />
      <path
        d="M12 6.4c.92 1.02 1.45 1.95 1.45 2.72 0 .9-.65 1.52-1.45 1.52s-1.45-.62-1.45-1.52c0-.77.53-1.7 1.45-2.72z"
        fill="#fff6e2"
        opacity="0.82"
      />
    </g>

    {/* wick */}
    <path d="M12 11.6v2.3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />

    {/* lamp bowl */}
    <path d="M3.1 14.1c0 3.95 3.98 6.75 8.9 6.75s8.9-2.8 8.9-6.75z" fill="currentColor" opacity="0.9" />

    {/* rim */}
    <path
      d="M3.1 14.1h17.8"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

// A mandala — concentric rings and petals of the kind drawn around Durga during
// Navratri. Used large, faint, and slowly rotating as the section's background
// texture. Built from primitives rather than a path so it stays crisp at any
// size and costs nothing to render.
export const SamoraMandalaIcon = ({ className = "" }: { className?: string }) => {
  const rings = [96, 86, 52, 44];
  const petals = Array.from({ length: 16 }, (_, index) => {
    const angle = (index * 360) / 16;
    const radians = (angle * Math.PI) / 180;
    const x = 100 + 68 * Math.cos(radians);
    const y = 100 + 68 * Math.sin(radians);
    return { x, y, angle };
  });

  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} role="presentation" aria-hidden="true">
      {rings.map((radius, index) => (
        <circle
          key={radius}
          cx="100"
          cy="100"
          r={radius}
          stroke="currentColor"
          strokeWidth={index % 2 === 0 ? 1 : 0.6}
          opacity={index % 2 === 0 ? 0.45 : 0.28}
        />
      ))}

      {petals.map((petal, index) => (
        <ellipse
          key={index}
          cx={petal.x}
          cy={petal.y}
          rx="5.5"
          ry="11"
          transform={`rotate(${petal.angle} ${petal.x} ${petal.y})`}
          fill="currentColor"
          opacity="0.2"
        />
      ))}

      {/* inner ring of small dots + centre lotus bud */}
      {Array.from({ length: 8 }, (_, index) => {
        const radians = ((index * 360 * Math.PI) / 8 / 180) - Math.PI / 2;
        return (
          <circle
            key={index}
            cx={100 + 30 * Math.cos(radians)}
            cy={100 + 30 * Math.sin(radians)}
            r="2.4"
            fill="currentColor"
            opacity="0.35"
          />
        );
      })}
      <circle cx="100" cy="100" r="11" stroke="currentColor" strokeWidth="0.9" opacity="0.4" />
    </svg>
  );
};
