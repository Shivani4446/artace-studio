import type { ReactNode } from "react";
import { Fraunces } from "next/font/google";
import SamoraFooter from "@/components/samora/SamoraFooter";
import SamoraNavbar from "@/components/samora/SamoraNavbar";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

export default function SamoraLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${fraunces.variable} font-inter min-h-screen bg-[#fbf6ef]`}>
      <SamoraNavbar />
      {children}
      <SamoraFooter />
    </div>
  );
}
