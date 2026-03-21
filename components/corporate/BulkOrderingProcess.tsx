import React from "react";
import { Playfair_Display, Inter } from "next/font/google";
import { MessageSquareText, FileText, CheckCircle2, Truck, ChevronRight } from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const steps = [
  {
    id: 1,
    title: "Share Your Vision",
    icon: MessageSquareText,
    description:
      "Fill out our quick form or talk to our B2B expert about your quantity, timeline, and theme requirements.",
  },
  {
    id: 2,
    title: "Custom Quote & Proposal",
    icon: FileText,
    description:
      "We provide a detailed proposal with tiered bulk pricing, design suggestions, and clear timelines.",
  },
  {
    id: 3,
    title: "Sampling & Approval",
    icon: CheckCircle2,
    description:
      "For large orders, we can create a digital proof or physical artwork for your approval before full production.",
  },
  {
    id: 4,
    title: "Creation & Safe Delivery",
    icon: Truck,
    description:
      "Our artists get to work. We safely pack and deliver the final pieces directly to your office or clients.",
  },
];

const BulkOrderingProcess = () => {
  return (
    <section
      className={`relative overflow-hidden bg-[#FAF9F6] py-20 px-6 md:px-12 lg:px-24 ${playfair.variable} ${inter.variable}`}
    >
      {/* Subtle Background Accent */}
      <div className="pointer-events-none absolute -top-48 right-0 h-[500px] w-[500px] rounded-full bg-[#D4AF37]/5 blur-[120px]" />

      <div className="mx-auto max-w-[1400px]">
        <div className="max-w-3xl mb-8">
          <h2 className="font-playfair text-4xl font-medium tracking-tight text-[#1A1A1A] md:text-5xl lg:text-6xl">
            How Bulk Ordering Works
          </h2>
          <p className="font-inter mt-6 max-w-2xl text-[1.1rem] leading-relaxed text-[#555555]">
            Experience a seamless, high-touch process from initial concept to the
            final brushstroke.
          </p>
        </div>

        {/* Desktop View: Aligned in One Line with Chevrons */}
        <div className="hidden lg:block relative w-full pt-8 pb-10">
          <div className="relative flex justify-between items-start">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.id}>
                  <div className="relative flex flex-col items-center group w-[22%]">
                    {/* Step Label */}
                    <div className="mb-4">
                      <span className="font-inter text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]/60">
                        Step 0{step.id}
                      </span>
                    </div>

                    {/* Icon Indicator */}
                    <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] ring-1 ring-[#D4AF37]/20 transition-all duration-300 group-hover:ring-[#D4AF37] group-hover:scale-110">
                      <Icon className="h-7 w-7 text-[#D4AF37]" strokeWidth={1.5} />
                    </div>

                    {/* Content */}
                    <div className="mt-6 text-center">
                      <h3 className="font-playfair text-xl font-medium text-[#1A1A1A]">
                        {step.title}
                      </h3>
                      <p className="font-inter mt-3 text-[18px] leading-relaxed text-[#666666]">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Chevron between steps */}
                  {index < steps.length - 1 && (
                    <div className="mt-24">
                      <ChevronRight className="h-6 w-6 text-[#D4AF37]/40" strokeWidth={1.5} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Mobile/Tablet View */}
        <div className="lg:hidden relative flex flex-col gap-10 mt-12">
          <div className="absolute left-[27px] top-2 bottom-2 w-[1px] bg-[#D4AF37]/30"></div>

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="relative z-10 flex items-start gap-6 group"
              >
                <div className="shrink-0 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]/20">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </div>

                <div className="flex-1 pt-1">
                  <div className="mb-1">
                    <span className="font-inter text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
                      Step 0{step.id}
                    </span>
                  </div>
                  <h3 className="font-playfair text-xl font-medium text-[#1A1A1A]">
                    {step.title}
                  </h3>
                  <p className="font-inter mt-2 text-[16px] md:text-[18px] leading-relaxed text-[#666666]">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BulkOrderingProcess;
