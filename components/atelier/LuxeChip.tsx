type LuxeChipProps = {
  className?: string;
  textClassName?: string;
};

/**
 * The Atelier "Luxe" chip — black pill, gold gradient border, and an italic
 * gold wordmark with a slow light sweep (see `.luxe-sheen` in globals.css).
 *
 * Shared by the product page and the shop listing card so the badge stays
 * identical in both places. No hooks and no client-only APIs, so it renders
 * fine from Server or Client Components.
 */
export default function LuxeChip({
  className = "",
  textClassName = "text-[15px]",
}: LuxeChipProps) {
  return (
    <span
      className={`relative inline-flex items-center overflow-hidden rounded-full border border-[#D9B45B] bg-gradient-to-b from-[#1c1813] via-black to-[#0b0a08] px-3 py-1 shadow-[0_1px_8px_rgba(212,175,55,0.35)] ${className}`}
    >
      <span
        aria-hidden="true"
        className="luxe-sheen pointer-events-none absolute inset-0"
      />
      <span
        className={`relative bg-gradient-to-r from-[#f9edb8] via-[#d4af37] to-[#b8860b] bg-clip-text font-display italic leading-none text-transparent ${textClassName}`}
      >
        Luxe
      </span>
    </span>
  );
}
