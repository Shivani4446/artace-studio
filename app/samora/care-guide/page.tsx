import type { Metadata } from "next";
import SamoraArticleLayout from "@/components/samora/SamoraArticleLayout";
import { markdownToHtmlWithToc } from "@/utils/article";

export const runtime = "edge";

const TITLE = "Care & Materials Guide | Samora by Artace Studio";
const DESCRIPTION =
  "How to care for your handcrafted Samora pieces — cotton and jute tote bags, hand-painted MDF tea coasters, wood and ceramic trays, and personalized name plates.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/samora/care-guide",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/samora/care-guide",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const CARE_MARKDOWN = `
## Tote Bags (Cotton & Jute)

Handwoven totes are sturdy, but a little care keeps them looking new for years.

- Spot clean with a damp cloth and mild soap for small marks.
- For a full wash, hand wash in cold water and lay flat to dry — avoid the washing machine and tumble dryer, which can warp the shape and fade hand-printed or hand-painted designs.
- Avoid prolonged direct sunlight when drying, as it can fade natural dyes over time.
- Don't overload beyond a comfortable, everyday carry weight — these are made for daily use, not heavy freight.

## Tea Coasters (Hand-Painted MDF)

Each coaster is hand-painted and finished by hand, so a gentle touch keeps the artwork intact.

- Wipe with a soft, dry or barely-damp cloth after use — avoid soaking or running under a tap.
- Always place a cup or glass on the coaster rather than directly on the painted surface for hot beverages, to protect the finish from heat marks.
- Keep away from direct, prolonged sunlight, which can dull hand-painted colors over time.
- Store flat, not stacked with heavy weight on top, to prevent warping.

## Trays (Wood & Ceramic)

- **Wood trays**: wipe clean with a dry or lightly damp cloth. Avoid soaking in water or leaving wet items on the surface for long periods, which can warp or dull the wood finish.
- **Ceramic trays**: hand wash with mild soap and a soft sponge. Avoid abrasive scrubbers, which can scratch hand-finished glazes.
- For both: avoid placing directly on an open flame or stovetop, and avoid extreme temperature changes (for example, moving straight from a hot oven to a cold surface).

## Name Plates

Personalized name plates are meant for display, typically at an entryway or wall.

- Dust regularly with a soft, dry cloth.
- Avoid direct exposure to heavy rain or prolonged moisture if mounted outdoors — check with our team on outdoor-suitability for your specific piece before installing it outside.
- Avoid harsh chemical cleaners, which can affect hand-painted or hand-finished detailing.

## A Note on Handmade Variation

Because every Samora piece is made and finished by hand, small variations in texture, color, and finish are part of the craft, not a flaw — no two pieces are perfectly identical. This is the same natural-materials philosophy behind everything Samora makes.

## Questions About a Specific Piece?

If you're ever unsure how to care for a particular item, reach out to us on WhatsApp or by email and we'll walk you through it.
`;

const { html: careHtml, toc: careToc } = markdownToHtmlWithToc(CARE_MARKDOWN);

const SamoraCareGuidePage = () => {
  return (
    <SamoraArticleLayout
      eyebrow="Care & Materials"
      title="Caring for Your Handcrafted Samora Pieces"
      intro="Natural materials and hand-finishing mean each piece deserves a little extra care. Here's how to keep your totes, coasters, trays, and name plates looking their best."
      contentHtml={careHtml}
      toc={careToc}
    />
  );
};

export default SamoraCareGuidePage;
