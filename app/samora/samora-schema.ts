export const samoraFaqs = [
  {
    question: "What is Samora?",
    answer:
      "Samora is a handcrafted home and lifestyle brand from the makers of Artace Studio. Instead of paintings, Samora focuses on everyday handmade pieces — tote bags, tea coasters, trays, and name plates — made from natural materials by skilled artisans.",
  },
  {
    question: "Is Samora related to Artace Studio?",
    answer:
      "Yes. Samora is a sub-brand of Artace Studio, the Pune-based art and design studio. Samora carries the same commitment to handcrafted quality, just applied to functional home accessories instead of wall art.",
  },
  {
    question: "What kind of products does Samora make?",
    answer:
      "Samora's early collection includes handwoven and hand-finished tote bags, tea coasters, decorative trays, and personalized name plates — with more handcrafted home essentials joining the range over time.",
  },
  {
    question: "Are Samora products handmade?",
    answer:
      "Yes. Every piece is made by hand or finished by hand, in small batches, using natural and durable materials such as jute, cotton, wood, and ceramic — not mass-manufactured in bulk.",
  },
  {
    question: "Can I get a personalized or custom name plate?",
    answer:
      "Yes, name plates can be personalized with your name, house name, or a custom design. Reach out to the Samora team with your requirements to get started on a custom piece.",
  },
  {
    question: "Do you ship across India?",
    answer:
      "Yes. Samora ships pan-India, with the same reliable logistics and packaging standards used across Artace Studio's shipments.",
  },
  {
    question: "When will the Samora shop be live?",
    answer:
      "The full Samora catalog is being onboarded. In the meantime, you can explore the collection categories here and get in touch directly for early access, pricing, and availability.",
  },
] as const;

const SITE_ORIGIN = "https://artacestudio.com";
const SAMORA_URL = `${SITE_ORIGIN}/samora`;

export const samoraSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SAMORA_URL}#organization`,
      name: "Samora",
      alternateName: "Samora by Artace Studio",
      url: SAMORA_URL,
      description:
        "Samora is a handcrafted home and lifestyle sub-brand of Artace Studio, making tote bags, tea coasters, trays, and name plates from natural materials.",
      parentOrganization: {
        "@id": `${SITE_ORIGIN}/#organization`,
      },
    },
    {
      "@type": "WebPage",
      "@id": `${SAMORA_URL}#webpage`,
      url: SAMORA_URL,
      name: "Samora by Artace Studio | Handcrafted Tote Bags, Coasters, Trays & More",
      description:
        "Shop handcrafted tote bags, tea coasters, trays, and personalized name plates from Samora, the handcrafted home and lifestyle sub-brand of Artace Studio.",
      about: {
        "@id": `${SAMORA_URL}#organization`,
      },
      isPartOf: {
        "@id": `${SITE_ORIGIN}/#website`,
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${SAMORA_URL}#faq`,
      mainEntity: samoraFaqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_ORIGIN,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Samora",
          item: SAMORA_URL,
        },
      ],
    },
  ],
} as const;
