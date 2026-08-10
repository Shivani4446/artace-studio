export type Artist = {
  slug: string;
  name: string;
  image: string;
  tagline: string;
  bio: string;
  recognition: string;
};

// Which products belong to which artist is driven entirely by WooCommerce's
// own "artist" custom field (set per-product when a painting is uploaded —
// visible as a plain text field on the product edit screen). This array only
// holds each artist's profile content (name, photo, tagline, bio). A
// product's real "artist" field value is matched against `name` below (see
// getArtistByName) — case/whitespace-insensitive — to decide whether, and to
// which artist page, a product links. To add a fourth (or more) artist,
// add another entry here with a name that exactly matches what's entered in
// WooCommerce for their products.
export const ARTISTS: Artist[] = [
  {
    slug: "sahil-mahalley",
    name: "Sahil Mahalley",
    image: "/Sahil-mahalley.webp",
    tagline: "Blending traditional technique with a modern eye for color and composition.",
    bio:
      "Sahil Mahalley is one of the artists behind Artace Studio's handcrafted paintings. His work brings together classical technique and a contemporary sensibility, favouring bold composition and a confident use of color. Each piece is painted entirely by hand, with close attention to detail and finish, so that it feels as considered up close as it does from across a room.",
    recognition: "Featured Artist — Artace Studio",
  },
  {
    slug: "sampadaa-mahalley",
    name: "Sampadaa Mahalley",
    image: "/sampadaa-mahalley-profile.webp",
    tagline: "Rooted in tradition, painting India's stories, deities, and everyday moments of devotion.",
    bio:
      "Sampadaa Mahalley paints with a deep appreciation for India's traditional art forms, drawing on themes of devotion, mythology, and everyday ritual. Her paintings are known for their warmth and careful detail, whether she's working on a large canvas or a more intimate piece. Every artwork is handmade from start to finish, carrying the texture and character that only comes from a brush in hand.",
    recognition: "Featured Artist — Artace Studio",
  },
  {
    slug: "vekkas-m",
    name: "Vekkas M",
    image: "/vekkas-m.png",
    tagline: "Drawn to open landscapes and quiet, atmospheric scenes.",
    bio:
      "Vekkas M's paintings are shaped by a love of landscape and atmosphere — skies, water, and the quiet in-between moments of a scene. The work favours mood and depth over strict detail, built up in layers by hand on canvas. Each piece is made to bring a sense of calm and openness into the space it hangs in.",
    recognition: "Featured Artist — Artace Studio",
  },
];

export const getArtistByName = (name: string): Artist | undefined => {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return undefined;
  return ARTISTS.find((artist) => artist.name.trim().toLowerCase() === normalized);
};

export const getArtistBySlug = (artistSlug: string): Artist | undefined =>
  ARTISTS.find((artist) => artist.slug === artistSlug);
