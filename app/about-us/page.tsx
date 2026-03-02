import React from "react";
import Abouthero from "@/components/About/Abouthero";
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