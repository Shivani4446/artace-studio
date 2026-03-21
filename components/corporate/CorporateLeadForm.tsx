"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type CorporateLeadFormProps = {
  className?: string;
};

const INTEREST_OPTIONS = [
  "Office Decor",
  "Corporate Gifting",
  "Hospitality",
  "Interior Design",
  "Other",
];

const QUANTITY_OPTIONS = ["5-10", "11-25", "26-50", "50+"];

const CorporateLeadForm = ({ className }: CorporateLeadFormProps) => {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Custom Dropdown States
  const [interest, setInterest] = useState("");
  const [quantity, setQuantity] = useState("");
  const [openDropdown, setOpenDropdown] = useState<"interest" | "quantity" | null>(null);

  const interestRef = useRef<HTMLDivElement>(null);
  const quantityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        interestRef.current &&
        !interestRef.current.contains(event.target as Node) &&
        quantityRef.current &&
        !quantityRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      interest,
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
      className={`grid grid-cols-1 gap-6 rounded-[24px] border border-black/10 bg-[#faf8f4] p-6 md:grid-cols-2 md:gap-8 md:p-8 ${
        className ?? ""
      }`}
      onSubmit={handleSubmit}
    >
      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
        Full Name
        <input
          type="text"
          name="fullName"
          placeholder="Enter your name"
          required
          className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5"
        />
      </label>
      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
        Company Name
        <input
          type="text"
          name="companyName"
          placeholder="Company or organization"
          className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5"
        />
      </label>
      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
        Email Address
        <input
          type="email"
          name="email"
          placeholder="you@company.com"
          required
          className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5"
        />
      </label>
      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
        Phone / WhatsApp Number
        <input
          type="tel"
          name="phone"
          placeholder="+91 00000 00000"
          required
          className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5"
        />
      </label>

      {/* Custom Dropdown: Interest */}
      <div className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]" ref={interestRef}>
        What are you looking for?
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "interest" ? null : "interest")}
            className={`flex min-h-[48px] w-full items-center justify-between rounded-[12px] border bg-white px-4 text-[15px] transition-all duration-200 outline-none ${
              openDropdown === "interest" ? "border-[#1a1a1a] ring-1 ring-[#1a1a1a]/5" : "border-black/10"
            }`}
          >
            <span className={interest ? "text-[#1a1a1a]" : "text-[#1a1a1a]/40"}>
              {interest || "Select an option"}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[#313131]/60 transition-transform duration-200 ${
                openDropdown === "interest" ? "rotate-180" : ""
              }`}
            />
          </button>

          {openDropdown === "interest" && (
            <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-[12px] border border-black/10 bg-[#faf8f4] p-2 shadow-[0_18px_35px_rgba(0,0,0,0.08)]">
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
                      ? "bg-[#1f1f1f] text-white"
                      : "text-[#333333] hover:bg-black/5 hover:text-black"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom Dropdown: Quantity */}
      <div className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]" ref={quantityRef}>
        Estimated Quantity
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "quantity" ? null : "quantity")}
            className={`flex min-h-[48px] w-full items-center justify-between rounded-[12px] border bg-white px-4 text-[15px] transition-all duration-200 outline-none ${
              openDropdown === "quantity" ? "border-[#1a1a1a] ring-1 ring-[#1a1a1a]/5" : "border-black/10"
            }`}
          >
            <span className={quantity ? "text-[#1a1a1a]" : "text-[#1a1a1a]/40"}>
              {quantity || "Select quantity range"}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[#313131]/60 transition-transform duration-200 ${
                openDropdown === "quantity" ? "rotate-180" : ""
              }`}
            />
          </button>

          {openDropdown === "quantity" && (
            <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-[12px] border border-black/10 bg-[#faf8f4] p-2 shadow-[0_18px_35px_rgba(0,0,0,0.08)]">
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
                      ? "bg-[#1f1f1f] text-white"
                      : "text-[#333333] hover:bg-black/5 hover:text-black"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131] md:col-span-2">
        Brief details about your requirement
        <textarea
          name="details"
          rows={4}
          placeholder="Tell us about timelines, themes, sizes, and any special requests."
          className="w-full rounded-[12px] border border-black/10 bg-white px-4 py-3 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5"
        />
      </label>
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="min-h-[48px] w-full rounded-[12px] bg-[#1a1a1a] px-6 text-[16px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting..." : "Get Your Custom Quote"}
        </button>
      </div>
      {status === "success" ? (
        <p className="md:col-span-2 text-[14px] text-green-700">
          Thanks! We&apos;ve received your details and will contact you within 24 hours.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="md:col-span-2 text-[14px] text-red-600">
          {errorMessage || "We could not submit your request. Please try again."}
        </p>
      ) : null}
    </form>
  );
};

export default CorporateLeadForm;
