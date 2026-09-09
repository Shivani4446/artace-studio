"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChevronDown } from "lucide-react";

const INTEREST_OPTIONS = [
  "Employee Gifting",
  "Client & Festive Hampers",
  "Event & Conference Kits",
  "Custom Branded Pieces",
  "Other",
];

const QUANTITY_OPTIONS = ["5-10", "11-25", "26-50", "50+"];

const SamoraCorporateLeadForm = ({ className = "" }: { className?: string }) => {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [interest, setInterest] = useState("");
  const [quantity, setQuantity] = useState("");
  const [openDropdown, setOpenDropdown] = useState<"interest" | "quantity" | null>(null);

  const interestRef = useRef<HTMLDivElement>(null);
  const quantityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        interestRef.current &&
        !interestRef.current.contains(target) &&
        quantityRef.current &&
        !quantityRef.current.contains(target)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!interest || !quantity) {
      setErrorMessage("Please select all required fields.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      fullName: String(formData.get("fullName") ?? "").trim(),
      companyName: String(formData.get("companyName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      // Prefixed so this shared lead inbox/table can tell Samora leads apart
      // from Artace Studio's own corporate-bulk-orders submissions.
      interest: `Samora — ${interest}`,
      quantity,
      details: String(formData.get("details") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/corporate-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "We could not submit your request. Please try again.");
      }

      setStatus("success");
      setInterest("");
      setQuantity("");
      form.reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "We could not submit your request."
      );
    }
  };

  return (
    <form
      className={`grid grid-cols-1 gap-6 rounded-[24px] border border-[#2b2420]/10 bg-[#f3ead9] p-6 md:grid-cols-2 md:gap-7 md:p-8 ${className}`}
      onSubmit={handleSubmit}
    >
      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#3f382f]">
        Full Name
        <input
          type="text"
          name="fullName"
          placeholder="Enter your name"
          required
          className="min-h-[48px] w-full rounded-[12px] border border-[#2b2420]/15 bg-[#fbf6ef] px-4 text-[15px] text-[#2b2420] outline-none transition-colors focus:border-[#c1683d]"
        />
      </label>
      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#3f382f]">
        Company Name
        <input
          type="text"
          name="companyName"
          placeholder="Company or organization"
          className="min-h-[48px] w-full rounded-[12px] border border-[#2b2420]/15 bg-[#fbf6ef] px-4 text-[15px] text-[#2b2420] outline-none transition-colors focus:border-[#c1683d]"
        />
      </label>
      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#3f382f]">
        Email Address
        <input
          type="email"
          name="email"
          placeholder="you@company.com"
          required
          className="min-h-[48px] w-full rounded-[12px] border border-[#2b2420]/15 bg-[#fbf6ef] px-4 text-[15px] text-[#2b2420] outline-none transition-colors focus:border-[#c1683d]"
        />
      </label>
      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#3f382f]">
        Phone / WhatsApp Number
        <input
          type="tel"
          name="phone"
          placeholder="+91 00000 00000"
          required
          className="min-h-[48px] w-full rounded-[12px] border border-[#2b2420]/15 bg-[#fbf6ef] px-4 text-[15px] text-[#2b2420] outline-none transition-colors focus:border-[#c1683d]"
        />
      </label>

      <div className="flex flex-col gap-2 text-[14px] font-medium text-[#3f382f]" ref={interestRef}>
        What are you looking for?
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "interest" ? null : "interest")}
            className={`flex min-h-[48px] w-full items-center justify-between rounded-[12px] border bg-[#fbf6ef] px-4 text-[15px] outline-none transition-colors ${
              openDropdown === "interest" ? "border-[#c1683d]" : "border-[#2b2420]/15"
            }`}
          >
            <span className={interest ? "text-[#2b2420]" : "text-[#2b2420]/40"}>
              {interest || "Select an option"}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[#8a7c68] transition-transform ${
                openDropdown === "interest" ? "rotate-180" : ""
              }`}
            />
          </button>

          {openDropdown === "interest" ? (
            <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-[12px] border border-[#2b2420]/10 bg-[#fbf6ef] p-2 shadow-[0_18px_35px_rgba(43,36,32,0.12)]">
              {INTEREST_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setInterest(option);
                    setOpenDropdown(null);
                  }}
                  className={`block w-full rounded-[8px] px-3 py-2 text-left text-[14px] font-medium transition-colors ${
                    interest === option
                      ? "bg-[#c1683d] text-white"
                      : "text-[#3f382f] hover:bg-[#2b2420]/[0.06]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-[14px] font-medium text-[#3f382f]" ref={quantityRef}>
        Estimated Quantity
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "quantity" ? null : "quantity")}
            className={`flex min-h-[48px] w-full items-center justify-between rounded-[12px] border bg-[#fbf6ef] px-4 text-[15px] outline-none transition-colors ${
              openDropdown === "quantity" ? "border-[#c1683d]" : "border-[#2b2420]/15"
            }`}
          >
            <span className={quantity ? "text-[#2b2420]" : "text-[#2b2420]/40"}>
              {quantity || "Select quantity range"}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[#8a7c68] transition-transform ${
                openDropdown === "quantity" ? "rotate-180" : ""
              }`}
            />
          </button>

          {openDropdown === "quantity" ? (
            <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-[12px] border border-[#2b2420]/10 bg-[#fbf6ef] p-2 shadow-[0_18px_35px_rgba(43,36,32,0.12)]">
              {QUANTITY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setQuantity(option);
                    setOpenDropdown(null);
                  }}
                  className={`block w-full rounded-[8px] px-3 py-2 text-left text-[14px] font-medium transition-colors ${
                    quantity === option
                      ? "bg-[#c1683d] text-white"
                      : "text-[#3f382f] hover:bg-[#2b2420]/[0.06]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#3f382f] md:col-span-2">
        Tell us about your requirement
        <textarea
          name="details"
          rows={4}
          placeholder="Occasion, theme, branding needs, and timeline."
          className="w-full rounded-[12px] border border-[#2b2420]/15 bg-[#fbf6ef] px-4 py-3 text-[15px] text-[#2b2420] outline-none transition-colors focus:border-[#c1683d]"
        />
      </label>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="min-h-[48px] w-full rounded-[12px] bg-[#2b2420] px-6 text-[16px] font-medium text-white transition-colors hover:bg-[#1c1712] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting..." : "Get Your Custom Quote"}
        </button>
      </div>

      {status === "success" ? (
        <p className="text-[14px] text-[#4a6b3f] md:col-span-2">
          Thanks! We&apos;ve received your details and will be in touch within 24 hours.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-[14px] text-[#b3402c] md:col-span-2">
          {errorMessage || "We could not submit your request. Please try again."}
        </p>
      ) : null}
    </form>
  );
};

export default SamoraCorporateLeadForm;
