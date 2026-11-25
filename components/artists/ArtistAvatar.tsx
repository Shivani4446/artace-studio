import Image from "next/image";

// Artist photo, or a monogram when the artist's portal profile hasn't been
// approved yet (new artists show up as soon as they publish a painting, which
// can be before their photo is reviewed). Fills its positioned parent.
export default function ArtistAvatar({
  name,
  image,
  sizes,
  className = "",
}: {
  name: string;
  image: string | null;
  sizes: string;
  className?: string;
}) {
  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        fill
        sizes={sizes}
        className={`object-cover ${className}`}
      />
    );
  }

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      role="img"
      aria-label={name}
      className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#e9e2d6] to-[#cbbfa9] ${className}`}
    >
      <span className="font-display text-[clamp(1.5rem,6vw,3.5rem)] tracking-wide text-[#5a4e3c]">
        {initials}
      </span>
    </div>
  );
}
