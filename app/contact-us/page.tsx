import type { Metadata } from "next";

export function generateMetadata(): Promise<Metadata> {
  return Promise.resolve({
    title: "Contact Us | Artace Studio",
    description: "Get in touch with Artace Studio. Questions about paintings, orders, or custom artwork? We'd love to hear from you.",
    keywords: "contact art gallery, customer support, reach us, painting inquiry",
    openGraph: {
      title: "Contact Us | Artace Studio",
      description: "Get in touch with questions about our paintings.",
      url: "https://artacestudio.com/contact-us",
    },
    twitter: {
      card: "summary_large_image",
      title: "Contact Us | Artace Studio",
      description: "Get in touch about paintings and art.",
    },
  });
}

import ContactPageClient from "./contact-us-client";

export default ContactPageClient;