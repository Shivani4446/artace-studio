export const homepageFaqs = [
  {
    question: "Can I buy handcrafted canvas paintings online from Artace Studio?",
    answer:
      "Yes. Artace Studio lets you buy handcrafted canvas paintings online across India, including ready-to-ship artworks and custom commissions tailored to your space.",
  },
  {
    question: "Do you offer custom painting sizes and personalized commissions?",
    answer:
      "Yes. You can request custom sizes, color adjustments, and bespoke artwork concepts for living rooms, bedrooms, offices, gifting, and devotional spaces.",
  },
  {
    question: "What types of paintings can I shop at Artace Studio?",
    answer:
      "You can explore spiritual paintings, Radha Krishna art, Buddha paintings, Ganapati artworks, abstract canvases, figurative work, landscapes, cityscapes, and tabletop pieces.",
  },
  {
    question: "How do I choose the right painting for my wall?",
    answer:
      "Start with the room, wall size, and mood you want to create. Artace Studio also offers direct guidance for custom orders, placement, sizing, and style selection.",
  },
] as const;

export const homepageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ArtGallery",
      "@id": "https://artacestudio.com/#organization",
      "name": "Artace Studio",
      "url": "https://artacestudio.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://artacestudio.com/Artace-logo.svg",
        "width": 200,
        "height": 60
      },
      "description": "Premium handcrafted canvas paintings, bespoke to your vision. Original oil and acrylic artworks by master Indian artists.",
      "foundingDate": "2010",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Pune, Maharashtra",
        "addressLocality": "Pune",
        "addressRegion": "Maharashtra",
        "addressCountry": "IN"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-9657609102",
        "contactType": "customer service",
        "availableLanguage": ["English", "Hindi", "Marathi"]
      },
      "sameAs": [
        "https://www.instagram.com/artace_studio",
        "https://facebook.com/artacestudio",
        "https://x.com/ArtaceStudio",
        "https://in.pinterest.com/artacestudio/",
        "https://www.linkedin.com/company/artace-studio/"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://artacestudio.com/#website",
      "url": "https://artacestudio.com",
      "name": "Artace Studio",
      "publisher": {
        "@id": "https://artacestudio.com/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://artacestudio.com/shop?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://artacestudio.com/#webpage",
      "url": "https://artacestudio.com",
      "name": "Handcrafted Canvas Paintings in India | Artace Studio",
      "description": "Buy handcrafted canvas paintings online in India. Discover original wall art, spiritual paintings, abstract artworks, and custom-made commissions from Artace Studio.",
      "isPartOf": {
        "@id": "https://artacestudio.com/#website"
      },
      "about": {
        "@id": "https://artacestudio.com/#organization"
      }
    },
    {
      "@type": "AggregateRating",
      "@id": "https://artacestudio.com/#rating",
      "itemReviewed": {
        "@id": "https://artacestudio.com/#organization"
      },
      "ratingValue": "4.9",
      "bestRating": "5",
      "ratingCount": "6"
    },
    {
      "@type": "FAQPage",
      "@id": "https://artacestudio.com/#faq",
      "mainEntity": homepageFaqs.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://artacestudio.com"
        }
      ]
    }
  ]
} as const;
