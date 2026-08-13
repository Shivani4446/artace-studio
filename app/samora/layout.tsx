import type { ReactNode } from "react";
import SamoraFooter from "@/components/samora/SamoraFooter";
import SamoraNavbar from "@/components/samora/SamoraNavbar";
import SamoraPromoBanner from "@/components/samora/SamoraPromoBanner";
import { fraunces } from "@/lib/fonts";

export default function SamoraLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${fraunces.variable} font-inter min-h-screen bg-[#fbf6ef]`}>
      <div className="sticky top-0 z-[60]">
        <SamoraPromoBanner />
        <SamoraNavbar />
      </div>
      {children}
      <SamoraFooter />
    </div>
  );
}
