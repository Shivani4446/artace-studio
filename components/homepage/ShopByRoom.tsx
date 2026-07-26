import React from "react";
import Image from "next/image";
import Link from "next/link";

const ROOM_TILES = [
  {
    title: "For the Living Room",
    description: "A statement that greets every guest",
    image: "/images/living-room.jpeg",
    alt: "Living room styled with a statement canvas painting",
    href: "/rooms/living-room",
  },
  {
    title: "For the Pooja Room",
    description: "Devotional art with quiet reverence",
    image: "/images/pooja-room.jpeg",
    alt: "Pooja room altar with devotional wall art",
    href: "/rooms/pooja-room",
  },
  {
    title: "For the Bedroom",
    description: "A quiet retreat, styled around you",
    image: "/images/bedroom.jpeg",
    alt: "Bedroom styled with a calming wall painting",
    href: "/rooms/bedroom",
  },
  {
    title: "For the Dining Room",
    description: "Where every gathering finds its backdrop",
    image: "/images/dining-room.jpeg",
    alt: "Dining room styled with warm wall art",
    href: "/rooms/dining-room",
  },
] as const;

const ShopByRoom = () => {
  return (
    <section className="w-full bg-[#f4f2ee] py-14 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12">
        <h2 className="font-display text-[32px] leading-[1.08] text-[#1f1f1f] sm:text-[40px] md:text-[52px]">
          Find the Piece Your Space Is Waiting For
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
          {ROOM_TILES.map((room) => (
            <Link
              key={room.title}
              href={room.href}
              className="group relative block min-h-[280px] overflow-hidden rounded-[12px] bg-[#d6d2ca] md:min-h-[360px]"
            >
              <Image
                src={room.image}
                alt={room.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <h3 className="font-display text-[19px] leading-[1.15] text-white md:text-[22px]">
                  {room.title}
                </h3>
                <p className="mt-1 font-inter text-[13px] text-white/80 md:text-[14px]">
                  {room.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByRoom;
