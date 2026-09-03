import type { ReactNode } from "react";
import SamoraFooter from "@/components/samora/SamoraFooter";
import SamoraNavbar from "@/components/samora/SamoraNavbar";
import { fraunces } from "@/lib/fonts";

export default function SamoraLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${fraunces.variable} font-inter min-h-screen bg-[#fbf6ef]`}>
      <SamoraNavbar />
      {children}
      <SamoraFooter />
    </div>
  );
}
