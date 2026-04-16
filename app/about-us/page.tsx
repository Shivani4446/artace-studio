import React from "react";
import type { Metadata } from "next";
import Abouthero from "@/components/About/Abouthero";

export const metadata: Metadata = {
  title: "About Us | Our Story | Artace Studio",
  description: "Learn about Artace Studio - A Repository of Paintings. Discover our mission to bring unique handcrafted paintings to art lovers worldwide.",
  keywords: "about Artace Studio, our story, art gallery mission, painting gallery",
  openGraph: {
    title: "About Us | Our Story | Artace Studio",
    description: "Learn about Artace Studio and our mission.",
    url: "https://artacestudio.com/about-us",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Our Story | Artace Studio",
    description: "Our mission - bringing handcrafted paintings to art lovers.",
  },
};
import AboutusSecondsection from "@/components/About/AboutusSecondsection"
import AboutusWhoarewe from "@/components/About/AboutusWhoarewe";
import Whyus from "@/components/About/Whyus";
import OurCommitment from "@/components/About/OurCommitment";
import Legacy from "@/components/About/Legacy";

const about = () => {
  return (
  <main>
  <Abouthero />
  <AboutusSecondsection />
  <AboutusWhoarewe />
  <Whyus />
  <OurCommitment />
  <Legacy />
  </main>
  );
};


export default about;