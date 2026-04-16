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