import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Globe2,
  Palette,
  Star,
} from "lucide-react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import CollectionEditorialLoop from "@/components/collections/CollectionEditorialLoop";
import {
  getCollectionHeadline,
  getCollectionHref,
  getCollectionTheme,
} from "@/utils/collections";

type CollectionProductCard = {
  id: number;
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  price: number | null;
  regularPrice: number | null;
  currencyCode: string;
  currencySymbol: string;
  sizeLabel: string;
  mediumLabel: string;
};

type CollectionSuggestionCard = {
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  productCount: number;
};

type CollectionTestimonial = {
  quote: string;
  name: string;
  location: string;
};

type CollectionLandingPageProps = {
  categoryName: string;
  categorySlug: string;
  description: string;
  heroImage: string;
  heroImageAlt: string;
  topProducts: CollectionProductCard[];
  products: CollectionProductCard[];
  suggestions: CollectionSuggestionCard[];
  stats: Array<{ label: string; value: string }>;
};

type CollectionCopy = {
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  heroCta: string;
  heroSecondaryCta?: string;
  overviewTitle: string;
  overviewBody: string;
  featuredHeading: string;
  featuredBody: string;
  galleryTitle: string;
  galleryBody: string;
  editorialTitle: string;
  editorialIntro?: string;
  editorialItems: Array<{ title: string; body: string }>;
  testimonialTitle: string;
  testimonialItems: CollectionTestimonial[];
  urgencyTitle: string;
  urgencyBody: string;
  urgencyCta: string;
  advisoryTitle: string;
  advisoryBody: string;
  advisoryCta: string;
  advisoryHref?: string;
  heroVectorSrc?: string;
  heroBannerImage?: string;
  heroVectorOnly?: boolean;
  staticEditorialImage?: { src: string; alt: string };
};

const CAL_LINK = "https://cal.com/artace-studio";
const FALLBACK_PRODUCT_IMAGE = "/images/product-ship.png";

const formatPrice = (
  value: number | null,
  currencyCode: string,
  currencySymbol: string
) => {
  if (value === null) return "Price on Request";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currencySymbol}${Math.round(value).toLocaleString("en-IN")}`;
  }
};

const toBaseCollectionName = (value: string) => {
  return value
    .replace(/\bcollection\b/gi, "")
    .replace(/\bpaintings?\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const capitalizePhrase = (value: string) =>
  value.replace(/\b\w/g, (character) => character.toUpperCase());

const buildProductSubtitle = (product: CollectionProductCard) => {
  const parts = ["Handmade Painting"];
  if (product.sizeLabel) parts.push(product.sizeLabel);
  if (product.mediumLabel) parts.push(product.mediumLabel);
  return parts.join(" | ");
};

const buildCollectionCopy = (
  categorySlug: string,
  baseCollectionName: string,
  description: string
): CollectionCopy => {
  const readableName = capitalizePhrase(baseCollectionName || "Collection");
  const lowerName = readableName.toLowerCase();
  const artworkLabel = /painting/i.test(readableName)
    ? readableName
    : `${readableName} painting`;

  const fallback: CollectionCopy = {
    heroEyebrow: `Bring ${readableName} Home`,
    heroTitle: `The Handcrafted ${readableName} Collection`,
    heroBody:
      description ||
      `Discover museum-quality ${lowerName} works handcrafted to bring more presence, character, and emotion into your space.`,
    heroCta: `Custom Order your ${artworkLabel}`,
    overviewTitle: `Art That Gives ${readableName} a Stronger Presence.`,
    overviewBody: `Finding the right focal piece should feel intentional. This collection brings together handcrafted ${lowerName} works designed to offer depth, texture, and a more personal connection than mass-produced wall decor. Every piece is created to feel premium, collectible, and deeply considered in the context of your room.`,
    featuredHeading: `Shop Best ${readableName} Paintings`,
    featuredBody: "Fully customizable sizes to fit your space",
    galleryTitle: `The ${readableName} Gallery: Discover the Collection`,
    galleryBody: `Browse handcrafted ${lowerName} canvases curated to give you a clearer sense of mood, finish, scale, and placement before you choose.`,
    editorialTitle: "Beyond the Canvas: The Making of a Handmade Artwork",
    editorialItems: [
      {
        title: "The Vision Behind",
        body: `Every ${lowerName} piece begins with a sharper curatorial brief: mood, palette, scale, and the emotional role the artwork should play in the room.`,
      },
      {
        title: "The Craftsmanship",
        body: `Our artists build each work by hand, layering texture, color, and detail so the final canvas feels substantial, original, and impossible to mistake for a print.`,
      },
      {
        title: "The Artace Guarantee",
        body: "You get collaborative guidance, premium canvas quality, and secure delivery support from first shortlist to final placement.",
      },
    ],
    testimonialTitle: "Sanctuaries We've Helped Create",
    testimonialItems: [
      {
        quote:
          "I wanted something peaceful for our new living room but was terrified of buying fake art online. Artace guided me through the colors, and the final textured painting completely anchors the house.",
        name: "Aisha M",
        location: "Mumbai",
      },
      {
        quote:
          "The level of detail in the brushwork is extraordinary. You can feel the human touch in every layer of paint. It is not just a painting; it is a true family heirloom.",
        name: "Rohan D",
        location: "Bangalore",
      },
    ],
    urgencyTitle: "See an artwork that speaks to you?",
    urgencyBody: `Secure an original handmade canvas today, or let it inspire a bespoke ${lowerName} commission tailored to your wall.`,
    urgencyCta: `Order your ${artworkLabel} Today`,
    advisoryTitle: `Find Your Perfect ${readableName}`,
    advisoryBody: `Unsure which size fits your wall, or want to discuss a palette that better suits your interior? Our complimentary art advisory service helps you refine the shortlist before you commit.`,
    advisoryCta: "Book Your Free Design Consultation",
  };

  if (categorySlug === "ganapati-paintings") {
    return {
      ...fallback,
      heroEyebrow: "Bring Bappa Home",
      heroTitle: "Welcome Good Luck: Hand-Painted Ganesha Canvas Art",
      heroBody:
        "Bring home the Remover of Obstacles. Decorate your home or office with a beautiful, 100% original Ganesha painting made by expert artists. No cheap prints, only real art.",
      heroCta: "Order Your Ganesha Painting",
      heroSecondaryCta: "View the Collection",
      overviewTitle: "Real Art for a Blessed Home.",
      overviewBody:
        "Lord Ganesha represents new beginnings, success, and wisdom. When you invite Bappa into your living room, pooja room, or new office, it shouldn't be through a normal, factory-printed poster. At Artace Studio, our artists lovingly hand-paint every Ganesha artwork using rich oil and acrylic colors on high-quality canvas. You can actually see and feel the brushstrokes. Give your walls the beautiful, positive energy they deserve.",
      featuredHeading: "Shop Best Ganesha Paintings",
      galleryTitle: "Our Ganpati Collection: Find Your Favorite",
      galleryBody:
        "Browse our hand-painted canvases below. Whether you want a modern abstract Ganesha, a traditional look, or a specific size for your wall, we can make it for you.",
      editorialTitle: "Why Choose Artace Studio?",
      editorialIntro: "Here is what makes our Ganesha paintings special:",
      editorialItems: [
        {
          title: "Good for Vastu",
          body: "Placing a Ganesha painting in the right direction (like the West, North, or Northeast wall) brings peace and prosperity. Many of our clients prefer the trunk turning to the left for home use, which represents calm and happiness. We can customize the painting exactly to your Vastu needs.",
        },
        {
          title: "100% Real Canvas & Colors",
          body: "We don't use printers. Our artists use real artist-grade oil and acrylic paints on thick, premium canvas. This means your painting will look bright, rich, and beautiful for years to come without fading.",
        },
        {
          title: "You See It Before We Ship It",
          body: "Worried about buying art online? Don't be. When you order a custom painting, we show you photos of the progress. We only pack and ship the painting after you look at the final photo and say, \"I love it!\"",
        },
        {
          title: "The Perfect Gift (Griha Pravesh & Weddings)",
          body: "A hand-painted Ganesha is the best gift you can give for a housewarming (Griha Pravesh), a new office opening, or a wedding. It is a thoughtful blessing that the family will keep forever.",
        },
      ],
      testimonialTitle: "Happy Homes, Happy Clients",
      testimonialItems: [
        {
          quote:
            "We just bought a new flat in Pune and wanted a big Ganesha painting for the entrance. Artace Studio did a fantastic job. The colors are so bright, and everyone who visits asks about it. Great quality!",
          name: "Suresh & Anita K.",
          location: "Pune",
        },
        {
          quote:
            "I ordered a modern Ganesha canvas for my husband's new office. The team asked me about the office colors and matched the painting perfectly. Highly recommend them if you want real art, not cheap prints.",
          name: "Pooja M.",
          location: "Delhi",
        },
      ],
      advisoryTitle: "Need Help Choosing the Right Size or Style?",
      advisoryBody:
        "Confused about what size will look best on your wall? Or want to change the background color of a painting you liked? Don't worry. Talk to our friendly team. We will help you pick or design the perfect Ganesha painting for your space, absolutely free of charge.",
      advisoryCta: "Chat With Us on WhatsApp",
      advisoryHref: "https://wa.me/9657609102",
      heroVectorSrc: "/ganesha-collection-vector.svg",
      heroBannerImage: "/ganesha-collection-bg.webp",
      heroVectorOnly: true,
    };
  }

  if (categorySlug === "radha-krishna-paintings") {
    return {
      ...fallback,
      heroEyebrow: "Invite Eternal Devotion Home",
      heroTitle: "Divine Love on Canvas: Handcrafted Radha Krishna Paintings",
      heroBody:
        "Invite eternal romance, peace, and positive Vastu energy into your home. Co-create a museum-quality, hand-painted masterpiece with India's master artists.",
      heroCta: "Commission Your Masterpiece",
      heroSecondaryCta: "Explore the Divine Collection",
      overviewTitle: "Bring Home the Essence of Eternal Devotion.",
      overviewBody:
        "A Radha Krishna painting is more than just decor; it is the ultimate symbol of unconditional love and spiritual harmony. In an era of flat, mass-produced digital prints, Artace Studio brings back the soul of true Indian artistry. Handcrafted in rich oils and vibrant acrylics, our master artists capture the divine expressions, the intricate jewelry, and the serene aura of Radha and Krishna. Perfect for living rooms, bedrooms, or as an unforgettable wedding gift, these are bespoke heirlooms designed to last generations.",
      galleryTitle: "The Divine Gallery: Discover Your Radha Krishna Masterpiece",
      galleryBody:
        "Browse our exclusive portfolio of hand-painted canvases. From traditional Raas Leela scenes to contemporary and modern abstract interpretations, find the piece that speaks to your soul. Select an original below, or let it inspire a custom-sized commission for your specific wall.",
      editorialTitle: "Beyond the Canvas: Crafting the Divine",
      editorialIntro:
        "Here is the dedication and expertise poured into every Artace Studio masterpiece:",
      editorialItems: [
        {
          title: "The Spiritual & Vastu Significance",
          body: "According to Vastu Shastra, placing a Radha Krishna painting in the bedroom or living room attracts harmonious relationships, deepens love, and eliminates discord. Our artists are mindful of these traditions, creating pieces that radiate positive, calming energy.",
        },
        {
          title: "Master Craftsmanship & Details",
          body: "We reject prints. Every piece is 100% hand-painted on premium, heavy-weight canvas using artist-grade oils and acrylics. From the divine glow of their faces to the intricate texturing of Krishna's flute and Radha's attire, you can feel the physical brushstrokes and the artist's devotion.",
        },
        {
          title: "The Artace Custom Guarantee",
          body: "Commissioning divine art should be stress-free. Through our collaborative process, you review the initial sketches and color palettes. We do not ship your masterpiece until you are absolutely in love with the final digital proof.",
        },
      ],
      testimonialTitle: "Blessings We've Brought to Homes",
      testimonialItems: [
        {
          quote:
            "We wanted a modern Radha Krishna painting for our new home in Bangalore that complied with Vastu but still looked contemporary. The team at Artace guided us perfectly. The oil textures are stunning, and the living room feels completely transformed.",
          name: "Priya & Rohit S.",
          location: "Bangalore",
        },
        {
          quote:
            "I commissioned a large canvas as a wedding gift for my daughter. The step-by-step updates from the studio were wonderful. When we saw the final painting, it brought tears to our eyes. True master craftsmanship.",
          name: "Meera N.",
          location: "Delhi",
        },
      ],
      advisoryTitle: "Need Guidance for Your Home or a Gift?",
      advisoryBody:
        "Unsure which style aligns with your interior decor, or need advice on Vastu placement and sizing? Our complimentary art advisory service pairs you with an expert curator to guide your vision effortlessly, from concept to a framed masterpiece.",
      advisoryCta: "Book Your Free Art Consultation",
      heroVectorSrc: "/radha-krishna-collection-vector.svg",
      heroBannerImage: "/radha-krishna-collection-bg.webp",
      heroVectorOnly: true,
    };
  }

  if (categorySlug === "buddha-paintings") {
    return {
      ...fallback,
      heroEyebrow: "Bring Serenity Home",
      heroTitle: "The Handcrafted Buddha Collection",
      heroBody:
        "Transform your space into a sanctuary of peace. Co-create a bespoke, museum-quality masterpiece that radiates mindfulness and timeless elegance.",
      heroCta: "Custom Order your Buddha Painting",
      overviewTitle: "Art That Breathes Peace Into Your Space.",
      overviewBody:
        "Finding the perfect focal point for your home shouldn't be a compromise. In a market flooded with lifeless digital prints, our master artists dedicate hours of deliberate brushwork to capture the profound tranquility of the awakened mind. Whether you seek the deep, rich textures of oil or the vibrant flow of acrylic, each Buddha painting is a bespoke collaboration hand-crafted to bring positive Vastu energy, calm, and unparalleled sophistication to your walls.",
      featuredHeading: "Shop Best Buddha Paintings",
      featuredBody: "Fully Customizable Sizes to Fit Your Space",
      galleryTitle: "The Buddha Gallery: Claim Your Piece of Peace",
      galleryBody:
        "Browse our exclusive portfolio of handcrafted Buddha canvases. Every brushstroke is an original expression of tranquility, designed to anchor your space.",
      editorialTitle: "Beyond the Canvas: The Making of a Handmade Artwork",
      editorialItems: [
        {
          title: "The Vision Behind",
          body: "More than just decor, a Buddha painting from Artace Studio is an anchor for your daily life. It is designed to evoke stillness, balance, and a profound sense of calm the moment you walk into the room.",
        },
        {
          title: "The Craftsmanship",
          body: "We never compromise on materials. From the heavy-weight premium canvas to the finest artist-grade oils and acrylics, every piece features rich textures and deliberate brushstrokes that a flat print can never replicate.",
        },
        {
          title: "The Artace Guarantee",
          body: "You aren't just buying a painting; you are co-creating a story. Through our multi-stage approval process, you review the initial sketches and color palettes. No surprises, just perfection.",
        },
      ],
      urgencyTitle: "See an artwork that speaks to you?",
      urgencyBody:
        "Secure an original handmade canvas painting today, or let it inspire a bespoke commission perfectly sized for your wall.",
      urgencyCta: "Order your Buddha Painting Today",
      advisoryTitle: "Find Your Perfect Peace",
      advisoryBody:
        "Unsure which size fits your wall, or want to discuss a custom color palette that matches your interior? Our complimentary art advisory service pairs you with an expert curator to guide your vision effortlessly, from concept to canvas.",
      heroVectorSrc: "/buddha.svg",
      heroBannerImage: "/buddha-hero-bg.webp",
      heroVectorOnly: true,
      staticEditorialImage: {
        src: "/buddha-lifestyle.webp",
        alt: "Buddha collection lifestyle artwork",
      },
    };
  }

  if (categorySlug === "landscapes-cityscapes-paintings") {
    return {
      ...fallback,
      heroEyebrow: "Bring the World to Your Walls",
      heroTitle: "Handcrafted Landscapes & Cityscapes",
      heroBody:
        "Expand your space and your imagination. Co-create a breathtaking, original canvas painting of serene nature or vibrant urban skylines with our master artists.",
      heroCta: "Commission Your Scenery",
      heroSecondaryCta: "Explore the Horizons",
      overviewTitle: "Beautiful Windows to a Wider World.",
      overviewBody:
        "Your walls shouldn't feel like boundaries; they should feel like horizons. In busy cities, a beautifully hand-painted landscape brings the calming, expansive energy of nature right into your living room. Conversely, a bold, textured cityscape adds an ambitious, global sophistication to any modern office or contemporary home. Stop settling for flat, lifeless printed posters. Invest in an original oil or acrylic masterpiece where you can feel every leaf, every wave, and every glowing city light through rich, deliberate brushstrokes.",
      galleryTitle: "The Horizon Gallery: Nature & Urban Views",
      galleryBody:
        "Browse our portfolio of hand-painted sceneries. From peaceful mountains and flowing rivers to the electric energy of iconic city streets at night. Choose an original design, or let us paint your favorite travel memory.",
      editorialTitle: "Beyond the Canvas: Capturing Depth and Light",
      editorialIntro:
        "Painting a convincing world on a flat canvas is the ultimate test of an artist. Here is how Artace Studio brings these scenes to life:",
      editorialItems: [
        {
          title: "The Illusion of Space",
          body: "Interior designers love landscapes because they act as \"trompe l'oeil\" (an optical illusion). A large, bright nature painting on a blank wall instantly creates a sense of depth, making cramped urban apartments and small rooms feel significantly larger and more open.",
        },
        {
          title: "Masterful Textures & Palette Knives",
          body: "A printed photograph is flat. Our artists use thick, artist-grade oils, acrylics, and palette knives to create physical texture (impasto). You can literally see the raised paint on the bark of a tree, the crest of a wave, or the glowing streetlamps of a rainy city street.",
        },
        {
          title: "Personalize Your Nostalgia",
          body: "Have a photograph from a honeymoon in Switzerland, a favorite childhood village, or a cherished trip to New York? Don't just frame a small photo. Our artists can transform your personal memories into a massive, breathtaking, hand-painted canvas masterpiece.",
        },
        {
          title: "How to Style This Art",
          body: "Large landscapes are the perfect \"statement piece\" to hang directly above a living room sofa or a master bed. Cityscapes bring a sharp, dynamic energy that looks incredibly professional in home offices, corporate boardrooms, or modern dining areas.",
        },
      ],
      testimonialTitle: "Spaces Transformed by Artace",
      testimonialItems: [
        {
          quote:
            "Living in a Mumbai apartment, I wanted something that made the room feel open. We commissioned a large, vibrant forest landscape. The textures are so real, it feels like we have a window to the mountains right in our hall.",
          name: "Neha & Vikram D.",
          location: "Mumbai",
        },
        {
          quote:
            "I wanted a powerful, modern vibe for my new startup office in Gurgaon. The Artace team painted an incredible, moody cityscape of the London skyline. The oil textures pop under the office lights. It's exactly the statement I wanted to make.",
          name: "Aditya K.",
          location: "Gurgaon",
        },
      ],
      advisoryTitle: "Not Sure Which Scene Fits Your Room?",
      advisoryBody:
        "Choosing the right scenery and color palette to match your furniture and wall paint can be tricky. Do you need warm autumn colors or cool, calming blues? Talk to our complimentary art advisory team. We will look at your space and guide you to the perfect landscape or cityscape, ensuring it looks flawless in your home.",
      advisoryCta: "Book a Free Design Call (or WhatsApp Us)",
      heroVectorSrc: "/landscape-collection-vector.svg",
      heroBannerImage: "/landscape-collection-bg.webp",
      heroVectorOnly: true,
    };
  }

  return fallback;
};

const benefitItems = [
  {
    title: "Step-by-Step Collaborative Approval",
    icon: BadgeCheck,
  },
  {
    title: "Secure Global Shipping",
    icon: Globe2,
  },
  {
    title: "100% Handpainted on Premium Canvas",
    icon: Palette,
  },
];

const HeroArtworkComposition = ({
  image,
  imageAlt,
  title,
  accent,
  accentSoft,
  vectorSrc,
  minimalVector = false,
  vectorOnly = false,
}: {
  image: string;
  imageAlt: string;
  title: string;
  accent: string;
  accentSoft: string;
  vectorSrc?: string;
  minimalVector?: boolean;
  vectorOnly?: boolean;
}) => {
  if (vectorOnly && vectorSrc) {
    return (
      <div className="mx-auto flex h-[220px] w-full max-w-[260px] items-center justify-center sm:h-[280px] sm:max-w-[320px] md:h-[320px] md:max-w-[360px]">
        <div className="relative h-[150px] w-[150px] sm:h-[190px] sm:w-[190px] md:h-[240px] md:w-[240px]">
          <Image src={vectorSrc} alt={`${title} vector`} fill className="object-contain" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto h-[280px] w-full max-w-[320px] overflow-hidden rounded-[24px] border border-black/8 sm:h-[320px] sm:max-w-[360px] sm:rounded-[28px]"
      style={{
        background: `linear-gradient(180deg, ${accentSoft} 0%, #fcfaf7 100%)`,
      }}
    >
      <div
        className="absolute left-1/2 top-6 h-[240px] w-[240px] -translate-x-1/2 rounded-full border"
        style={{ borderColor: `${accent}30` }}
      />

      {vectorSrc ? (
        <div
          className={
            minimalVector
              ? "absolute left-6 top-6 h-[86px] w-[86px]"
              : "absolute left-5 top-5 flex h-[72px] w-[72px] items-center justify-center rounded-[20px] border border-white/70 bg-white/92 p-3 shadow-[0_18px_36px_rgba(0,0,0,0.10)]"
          }
        >
          <div className="relative h-full w-full">
            <Image src={vectorSrc} alt={`${title} vector`} fill className="object-contain" />
          </div>
        </div>
      ) : (
        <div
          className="absolute left-6 top-8 rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.16em]"
          style={{
            backgroundColor: `${accent}16`,
            color: accent,
          }}
        >
          Handmade
        </div>
      )}

      <div className="absolute bottom-4 right-4 rounded-full bg-white/88 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-[#313131] shadow-[0_14px_30px_rgba(0,0,0,0.08)] sm:bottom-5 sm:right-5">
        Curated Collection
      </div>

      <div className="absolute bottom-0 left-1/2 w-[68%] -translate-x-1/2 sm:w-[70%]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-[128px] rounded-b-[20px] border border-black/8 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.10)] sm:rounded-t-[160px] sm:rounded-b-[24px]">
          <Image
            src={image || FALLBACK_PRODUCT_IMAGE}
            alt={imageAlt || title}
            fill
            sizes="(max-width: 1023px) 70vw, 360px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
        </div>
      </div>
    </div>
  );
};

const FeaturedProductCard = ({
  product,
  categoryLabel,
}: {
  product: CollectionProductCard;
  categoryLabel: string;
}) => {
  const productSubtitle = buildProductSubtitle(product);

  return (
    <article className="group relative flex flex-col">
      <Link
        href={`/shop/${product.slug}`}
        aria-label={`Open ${product.name}`}
        className="absolute inset-0 z-10"
      />

      <div className="relative z-0">
        <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-[12px] bg-[#d6d2ca]">
          <Image
            src={product.image || FALLBACK_PRODUCT_IMAGE}
            alt={product.imageAlt || product.name}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1200px) 48vw, 24vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[12px] text-[#666666] sm:text-[14px]">{categoryLabel}</p>
          <h3 className="font-display text-[17px] leading-snug text-[#2c2c2c] sm:text-[22px]">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-[12px] text-[#666666] sm:text-[14px]">
            {productSubtitle}
          </p>
          <p className="mt-1 text-[14px] text-[#2c2c2c] sm:text-[16px]">
            {formatPrice(product.price, product.currencyCode, product.currencySymbol)}
          </p>
        </div>
      </div>

      <div className="pointer-events-auto relative z-20 mt-4 translate-y-0 opacity-100 transition-all duration-300 md:pointer-events-none md:translate-y-1 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100">
        <AddToCartButton
          id={product.id}
          woocommerceProductId={product.id}
          title={product.name}
          image={product.image || FALLBACK_PRODUCT_IMAGE}
          subtitle={productSubtitle}
          price={product.price ?? undefined}
        />
      </div>
    </article>
  );
};

const GalleryCard = ({ product }: { product: CollectionProductCard }) => {
  return (
    <article className="relative aspect-[4/5] overflow-hidden rounded-[12px] bg-[#ded8ce]">
      <Image
        src={product.image || FALLBACK_PRODUCT_IMAGE}
        alt={product.imageAlt || product.name}
        fill
        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-10 sm:px-4 sm:pb-4 md:px-5 md:pb-5 md:pt-12">
        <h3 className="font-display text-[16px] leading-[1.15] text-white sm:text-[18px] md:text-[20px]">
          {product.name}
        </h3>
        <p className="mt-1 text-[12px] leading-[1.5] text-white/70 sm:text-[14px] md:text-[15px]">
          {product.sizeLabel}
        </p>
      </div>
    </article>
  );
};

const TestimonialCard = ({
  quote,
  name,
  location,
  accent,
}: {
  quote: string;
  name: string;
  location: string;
  accent: string;
}) => {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="flex h-full flex-col rounded-[12px] border border-[#1f1f1f]/10 bg-white p-5 shadow-[0_10px_24px_rgba(0,0,0,0.04)] md:p-6">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={`${name}-star-${index}`} className="h-4 w-4 fill-[#FFDB4D] text-[#FFDB4D]" />
        ))}
      </div>

      <p className="mt-4 text-[15px] leading-7 text-[#3f3a32] md:mt-5">&ldquo;{quote}&rdquo;</p>

      <div className="mt-auto pt-5">
        <div className="border-t border-[#1f1f1f]/10 pt-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold uppercase text-white"
              style={{ backgroundColor: accent }}
            >
              {initials}
            </div>
            <div>
              <p className="font-semibold text-[#1f1f1f]">{name}</p>
              <p className="mt-1 text-sm text-[#7a7368]">{location}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

const CollectionLandingPage = ({
  categoryName,
  categorySlug,
  description,
  heroImage,
  heroImageAlt,
  topProducts,
  products,
  suggestions,
}: CollectionLandingPageProps) => {
  const theme = getCollectionTheme(categorySlug);
  const isBuddhaCollection = categorySlug === "buddha-paintings";
  const isRadhaKrishnaCollection = categorySlug === "radha-krishna-paintings";
  const isGaneshaCollection = categorySlug === "ganapati-paintings";
  const isVectorOnlyHero = isBuddhaCollection || isRadhaKrishnaCollection;
  const baseCollectionName = toBaseCollectionName(categoryName) || categoryName;
  const collectionHeadline = getCollectionHeadline(categoryName);
  const collectionCopy = buildCollectionCopy(
    categorySlug,
    baseCollectionName,
    description
  );

  const featuredProducts = (topProducts.length > 0 ? topProducts : products).slice(0, 4);
  const galleryProducts = (products.length > 0 ? products : featuredProducts).slice(0, 8);
  const editorialVisuals = (featuredProducts.length > 0 ? featuredProducts : galleryProducts).slice(
    0,
    3
  );
  const relatedCollections = suggestions.slice(0, 3);

  const lowestPriceProduct = [...featuredProducts, ...products].find(
    (product) => product.price !== null
  );
  const startingAtLabel = lowestPriceProduct
    ? `Starting from ${formatPrice(
        lowestPriceProduct.price,
        lowestPriceProduct.currencyCode,
        lowestPriceProduct.currencySymbol
      )}`
    : "Starting from Price on Request";

  const heroBannerImage =
    collectionCopy.heroBannerImage || (isBuddhaCollection ? "/buddha-hero-bg.webp" : heroImage);
  const heroVectorSrc = collectionCopy.heroVectorSrc || "/museum-vector.svg";
  const editorialImages = collectionCopy.editorialItems.map((item, index) => ({
    src:
      editorialVisuals[index]?.image ||
      (index === 0 ? heroBannerImage : featuredProducts[index]?.image) ||
      FALLBACK_PRODUCT_IMAGE,
    alt: `${collectionHeadline} ${item.title}`,
  }));
  const staticEditorialImage = collectionCopy.staticEditorialImage;
  const editorialHeadingParts = collectionCopy.editorialTitle.split(/(Handmade)/i);
  const hasTightGallerySpacing =
    isBuddhaCollection || isRadhaKrishnaCollection || isGaneshaCollection;
  const featuredSectionClass = hasTightGallerySpacing
    ? "pb-10 pt-10 md:pb-[40px] md:pt-[100px]"
    : "py-10 md:py-[100px]";
  const gallerySectionClass = hasTightGallerySpacing
    ? "pb-10 pt-10 md:pb-[100px] md:pt-[60px]"
    : "py-10 md:py-[100px]";

  return (
    <main className="bg-[#fcfaf7] text-[#313131]">
      <section className="pb-8 pt-8 md:pb-14 lg:pt-[100px]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-[60px]">
            <div>
              <p className="font-display text-[18px] leading-[1.2] text-[#313131] md:text-[20px]">
                {collectionCopy.heroEyebrow}
              </p>
              <h1 className="mt-4 max-w-[900px] font-display text-[34px] leading-[1.08] text-[#313131] sm:text-[44px] md:mt-5 md:text-[52px]">
                {collectionCopy.heroTitle}
              </h1>
              <p className="mt-4 max-w-[860px] text-[16px] leading-[1.65] text-[#5b5b5b] sm:text-[17px] md:mt-5 md:text-[20px] md:leading-[1.5]">
                {collectionCopy.heroBody}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href={CAL_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-[14px] rounded-[6px] bg-[#292929] px-6 py-4 text-[16px] leading-none text-white transition-transform hover:-translate-y-0.5 sm:w-auto md:text-[18px]"
                >
                  {collectionCopy.heroCta}
                  <ArrowRight className="h-5 w-5" />
                </Link>

                {collectionCopy.heroSecondaryCta ? (
                  <Link
                    href="#collection-gallery"
                    className="inline-flex w-full items-center justify-center gap-[14px] rounded-[6px] border border-[#292929]/15 bg-white px-6 py-4 text-[16px] leading-none text-[#292929] transition-transform hover:-translate-y-0.5 sm:w-auto md:text-[18px]"
                  >
                    {collectionCopy.heroSecondaryCta}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                ) : null}
              </div>
            </div>

            <HeroArtworkComposition
              image={heroImage}
              imageAlt={heroImageAlt}
              title={collectionHeadline}
              accent={theme.accent}
              accentSoft={theme.accentSoft}
              vectorSrc={heroVectorSrc}
              minimalVector={isVectorOnlyHero}
              vectorOnly={isVectorOnlyHero || collectionCopy.heroVectorOnly}
            />
          </div>
        </div>
      </section>

      <section className="pb-10 md:pb-12">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[12px] bg-[#ded8ce] sm:aspect-[16/10] md:aspect-[16/9]">
            <Image
              src={heroBannerImage || FALLBACK_PRODUCT_IMAGE}
              alt={heroImageAlt || collectionHeadline}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1440px] border-t border-black/8 px-6 py-10 md:px-12 md:py-[100px]">
          <div className="grid gap-5 md:gap-8 lg:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)] lg:gap-[60px]">
            <p className="text-[16px] leading-[1.5] text-[#767676] md:text-[18px]">Overview</p>
            <h2 className="font-display text-[28px] leading-[1.18] text-[#313131] md:text-[32px]">
              {collectionCopy.overviewTitle}
            </h2>
            <p className="text-[16px] leading-[1.7] text-[#5b5b5b] sm:text-[17px] md:text-[20px] md:leading-[1.55]">
              {collectionCopy.overviewBody}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1440px] border-t border-black/8 px-6 py-10 md:px-12 md:py-[100px]">
          <div className="mx-auto grid gap-6 sm:grid-cols-3 sm:gap-5 lg:max-w-[940px]">
            {benefitItems.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="mx-auto flex max-w-[280px] flex-col items-center gap-5 text-center sm:max-w-none sm:gap-8"
                >
                  <div className="rounded-[12px] bg-white p-[18px]">
                    <Icon className="h-6 w-6 text-[#313131]" />
                  </div>
                  <h3 className="font-display text-[22px] leading-[1.2] text-[#313131] md:text-[28px]">
                    {item.title}
                  </h3>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={featuredSectionClass}>
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="mb-8 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-[30px] leading-[1.12] text-[#313131] sm:text-[34px] md:text-[52px]">
                {collectionCopy.featuredHeading}
              </h2>
              <p className="mt-3 text-[16px] leading-[1.6] text-[#5b5b5b] sm:text-[17px] md:mt-4 md:text-[20px]">
                {startingAtLabel} | {collectionCopy.featuredBody}
              </p>
            </div>

            <Link
              href={`/shop?category=${encodeURIComponent(categorySlug)}`}
              className="inline-flex items-center gap-3 self-start border-b border-[#313131] pb-1 text-[16px] uppercase tracking-[0.06em] text-[#313131] md:text-[18px]"
            >
              Shop All
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
            {featuredProducts.map((product) => (
              <FeaturedProductCard
                key={product.id}
                product={product}
                categoryLabel={baseCollectionName}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="collection-gallery" className={gallerySectionClass}>
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="max-w-[980px]">
            <p className="text-[16px] leading-[1.5] text-[#767676] md:text-[18px]">Collection</p>
            <h2 className="mt-4 font-display text-[28px] leading-[1.2] text-[#313131] md:mt-5 md:text-[32px]">
              {collectionCopy.galleryTitle}
            </h2>
            <p className="mt-4 text-[16px] leading-[1.65] text-[#5b5b5b] sm:text-[17px] md:mt-5 md:text-[20px]">
              {collectionCopy.galleryBody}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-4">
            {galleryProducts.map((product) => (
              <GalleryCard key={`gallery-${product.id}`} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f2ee] py-10 md:py-[70px]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <h2 className="font-display text-[30px] leading-[1.08] text-[#1f1f1f] sm:text-[34px] md:text-[52px]">
            {collectionCopy.testimonialTitle}
          </h2>

          <div className="mt-7 grid gap-4 md:mt-9 md:gap-5 lg:grid-cols-2">
            {collectionCopy.testimonialItems.map((item) => (
              <TestimonialCard
                key={`${item.name}-${item.location}`}
                quote={item.quote}
                name={item.name}
                location={item.location}
                accent={theme.accent}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-[100px]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="max-w-[980px]">
            <p className="text-[16px] leading-[1.5] text-[#767676] md:text-[18px]">Explore More</p>
            <h2 className="mt-4 font-display text-[34px] leading-[1.08] text-[#313131] sm:text-[40px] md:mt-5 md:text-[52px]">
              {editorialHeadingParts.map((part, index) =>
                /handmade/i.test(part) ? (
                  <span key={`${part}-${index}`} className="text-[#F0CF4C]">
                    {part}
                  </span>
                ) : (
                  <span key={`${part}-${index}`}>{part}</span>
                )
              )}
            </h2>
            {collectionCopy.editorialIntro ? (
              <p className="mt-4 max-w-[780px] text-[16px] leading-[1.65] text-[#5b5b5b] sm:text-[17px] md:mt-5 md:text-[20px]">
                {collectionCopy.editorialIntro}
              </p>
            ) : null}
          </div>

          <CollectionEditorialLoop
            items={collectionCopy.editorialItems}
            images={editorialImages}
            staticImage={staticEditorialImage}
          />
        </div>
      </section>
      <section className="bg-[#292929] py-10 text-white md:py-[100px]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="max-w-[860px]">
            <h2 className="font-display text-[30px] leading-[1.08] text-white sm:text-[34px] md:text-[52px]">
              {collectionCopy.urgencyTitle}
            </h2>
            <p className="mt-3 text-[16px] leading-[1.65] text-white/72 sm:text-[17px] md:mt-4 md:text-[20px]">
              {collectionCopy.urgencyBody}
            </p>
            <p className="mt-6 max-w-[760px] text-[15px] leading-[1.7] text-white/78 md:mt-8 md:text-[18px]">
              Original, ready-to-ship pieces are highly sought after and sell quickly.
              For custom sizes, our artist commission calendar is strictly limited.
            </p>
            <Link
              href={CAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex w-full items-center justify-center gap-[14px] rounded-[6px] bg-white px-6 py-4 text-[16px] leading-none text-[#292929] transition-transform hover:-translate-y-0.5 sm:w-auto md:mt-8 md:text-[18px]"
            >
              {collectionCopy.urgencyCta}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-[50px]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <h2 className="font-display text-[30px] leading-[1.12] text-[#313131] sm:text-[34px] md:text-[52px]">
              Discover our other Collections
            </h2>

            <Link
              href="/shop"
              className="inline-flex items-center gap-3 self-start border-b border-[#313131] pb-1 text-[16px] tracking-[0.06em] text-[#313131] md:text-[18px]"
            >
              See All
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:gap-5 lg:max-w-[1080px] lg:grid-cols-3">
            {relatedCollections.map((item) => (
              <Link key={item.slug} href={getCollectionHref(item.slug)} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-[12px] bg-[#ded8ce]">
                  <Image
                    src={item.image || FALLBACK_PRODUCT_IMAGE}
                    alt={item.imageAlt || item.name}
                    fill
                    sizes="(max-width: 767px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="mt-3 font-display text-[18px] leading-[1.2] text-[#313131] md:mt-4 md:text-[22px]">
                  {toBaseCollectionName(item.name) || item.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0e0e0e] py-10 text-white md:py-[100px]">
        <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-6 md:gap-10 md:px-12 lg:grid-cols-[minmax(0,850px)_minmax(280px,1fr)] lg:gap-[80px]">
          <div>
            <p className="text-[16px] leading-[1.5] text-white/65 md:text-[18px]">
              Complimentary Art Advisory
            </p>
            <h2 className="mt-4 font-display text-[28px] leading-[1.2] sm:text-[32px] md:mt-6 md:text-[36px]">
              {collectionCopy.advisoryTitle}
            </h2>
            <p className="mt-4 max-w-[820px] text-[16px] leading-[1.7] text-white/80 sm:text-[17px] md:mt-6 md:text-[20px]">
              {collectionCopy.advisoryBody}
            </p>
            <Link
              href={collectionCopy.advisoryHref || CAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex w-full items-center justify-center gap-[14px] rounded-[6px] bg-white px-6 py-4 text-[16px] leading-none text-[#292929] transition-transform hover:-translate-y-0.5 sm:w-auto md:mt-10 md:text-[18px]"
            >
              {collectionCopy.advisoryCta}
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="justify-self-center text-center lg:justify-self-end">
            <div className="relative mx-auto h-[220px] w-[220px] overflow-hidden rounded-full sm:h-[260px] sm:w-[260px] md:h-[350px] md:w-[350px]">
              <Image
                src="/Sahil-mahalley.webp"
                alt="Sahil Mahalley"
                fill
                sizes="(max-width: 768px) 260px, 350px"
                className="object-cover"
              />
            </div>
            <p className="mt-6 text-[18px] leading-[1.5] text-white/65">
              Sahil Mahalley, Art Advisor
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export type { CollectionProductCard, CollectionSuggestionCard };
export default CollectionLandingPage;
