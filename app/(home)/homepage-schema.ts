export const homepageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://artacestudio.com/#organization",
      name: "Artace Studio",
      url: "https://artacestudio.com",
      logo: {
        "@type": "ImageObject",
        url: "https://artacestudio.com/Artace-logo.svg",
        width: 200,
        height: 60,
      },
      description:
        "Premium handcrafted canvas paintings, bespoke to your vision. Original oil and acrylic artworks by master Indian artists.",
      foundingDate: "2013",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Pune",
        addressRegion: "Maharashtra",
        addressCountry: "IN",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-9657609102",
        contactType: "customer service",
        availableLanguage: ["English", "Hindi"],
      },
      sameAs: [
        "https://www.instagram.com/artace_studio",
        "https://facebook.com/artacestudio",
        "https://x.com/ArtaceStudio",
        "https://in.pinterest.com/artacestudio/",
        "https://www.linkedin.com/company/artace-studio/",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://artacestudio.com/#website",
      url: "https://artacestudio.com",
      name: "Artace Studio",
      description: "Handcrafted Canvas Paintings, Bespoke to Your Vision",
      publisher: {
        "@id": "https://artacestudio.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate:
            "https://artacestudio.com/shop?search={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://artacestudio.com/#localbusiness",
      name: "Artace Studio",
      image: "https://artacestudio.com/Artace-logo.svg",
      url: "https://artacestudio.com",
      telephone: "+91-9657609102",
      priceRange: "\u20B9\u20B9",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Pune",
        addressRegion: "Maharashtra",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 18.5204,
        longitude: 73.8567,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          opens: "09:00",
          closes: "19:00",
        },
      ],
      sameAs: [
        "https://www.instagram.com/artace_studio",
        "https://facebook.com/artacestudio",
      ],
    },
    {
      "@type": "AggregateRating",
      "@id": "https://artacestudio.com/#aggregaterating",
      itemReviewed: {
        "@id": "https://artacestudio.com/#organization",
      },
      ratingValue: "4.9",
      bestRating: "5",
      worstRating: "1",
      ratingCount: "6",
      reviewCount: "6",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://artacestudio.com",
        },
      ],
    },
  ],
} as const;
