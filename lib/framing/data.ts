export type FrameOption = {
  id: string;
  label: string;
  image: string;
};

// Every painting now ships framed by default — framing is included in the
// displayed price, not an add-on. This is the single list of frame styles
// offered on every product page; adding, renaming, or reordering styles is
// just editing this array, no other code changes needed.
export const FRAME_OPTIONS: FrameOption[] = [
  {
    id: "black-brown",
    label: "Black & Brown",
    image: "/frame-black-brown.png",
  },
  {
    id: "oak-brown-wood-gold-lining",
    label: "Oak Brown Wood & Gold Lining",
    image: "/frame-oak-brown-wood-gold-lining.png",
  },
  {
    id: "royal-silver-white",
    label: "Royal Silver & White",
    image: "/frame-royal-silver-white.png",
  },
  {
    id: "rustic-brown-textured-lining",
    label: "Rustic Brown with Textured Lining",
    image: "/frame-rustic-brown-textured-lining.png",
  },
  {
    id: "no-frame",
    label: "No Frame / Rolled Canvas",
    image: "/images/product-ship.png",
  },
];
