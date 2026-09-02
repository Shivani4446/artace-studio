import Link from "next/link";
import { Printer } from "lucide-react";

const DigitalPrintingTeaser = () => {
  return (
    <section className="w-full bg-[#efeeec] px-4 py-12 sm:px-6 md:px-12 md:py-16">
      <div className="mx-auto max-w-[900px]">
        <div className="flex flex-col items-center gap-4 rounded-[20px] border border-[#1f1f1f]/10 bg-white p-8 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EFE7DA] text-[#5b4f3f]">
            <Printer className="h-6 w-6" />
          </span>
          <div>
            <p className="font-inter text-[12px] font-medium uppercase tracking-[0.14em] text-[#7b746a]">
              Also Available
            </p>
            <h2 className="mt-2 font-display text-[22px] leading-[1.2] text-[#1f1f1f] sm:text-[26px]">
              Digital Printing Canvas Rolls
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-[#595959]">
              Starting ₹210/meter · Minimum order 10 meters · Compatible with UV, Eco-Solvent,
              Solvent, Latex, Pigment, and Dye-Sublimation printing.
            </p>
            <Link
              href="#enquire"
              className="mt-4 inline-flex items-center gap-2 font-inter text-[14px] font-medium text-[#1f1f1f] underline underline-offset-4"
            >
              Enquire About Digital Printing Canvas →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DigitalPrintingTeaser;
