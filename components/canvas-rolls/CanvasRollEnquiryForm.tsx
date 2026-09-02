"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type CanvasRollEnquiryFormProps = {
  className?: string;
};

const PRODUCT_INTEREST_OPTIONS = ["Fine Art Canvas", "Digital Printing Canvas"];
const MATERIAL_OPTIONS = [
  "100% Cotton",
  "65/35 Cotton-Polyester Blend",
  "Linen",
  "100% Polyester",
  "Not sure yet",
];

const CanvasRollEnquiryForm = ({ className }: CanvasRollEnquiryFormProps) => {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [productInterest, setProductInterest] = useState("");
  const [material, setMaterial] = useState("");
  const [openDropdown, setOpenDropdown] = useState<"product" | "material" | null>(null);

  const productRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const outsideProduct = !productRef.current || !productRef.current.contains(target);
      const outsideMaterial = !materialRef.current || !materialRef.current.contains(target);
      if (outsideProduct && outsideMaterial) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!productInterest) {
      setErrorMessage("Please select what you're enquiring about.");
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
      productInterest,
      materialPreference: material,
      quantity: String(formData.get("quantity") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/canvas-roll-enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "We could not submit your enquiry. Please try again.");
      }

      setStatus("success");
      setProductInterest("");
      setMaterial("");
      form.reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "We could not submit your enquiry."
      );
    }
  };

  return (
    <form
      id="enquire"
      className={`grid grid-cols-1 gap-6 rounded-[24px] border border-black/10 bg-[#faf8f4] p-6 md:grid-cols-2 md:gap-8 md:p-8 ${
        className ?? ""
      }`}
      onSubmit={handleSubmit}
    >
      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
        Name
        <input
          type="text"
          name="fullName"
          placeholder="Enter your name"
          required
          className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5"
        />
      </label>
      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
        Company / Studio Name
        <input
          type="text"
          name="companyName"
          placeholder="Your studio or company"
          className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5"
        />
      </label>

      <div
        className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]"
        ref={productRef}
      >
        Product Interest
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "product" ? null : "product")}
            className={`flex min-h-[48px] w-full items-center justify-between rounded-[12px] border bg-white px-4 text-[15px] transition-all duration-200 outline-none ${
              openDropdown === "product" ? "border-[#1a1a1a] ring-1 ring-[#1a1a1a]/5" : "border-black/10"
            }`}
          >
            <span className={productInterest ? "text-[#1a1a1a]" : "text-[#1a1a1a]/40"}>
              {productInterest || "Select product"}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[#313131]/60 transition-transform duration-200 ${
                openDropdown === "product" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openDropdown === "product" && (
            <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-[12px] border border-black/10 bg-[#faf8f4] p-2 shadow-[0_18px_35px_rgba(0,0,0,0.08)]">
              {PRODUCT_INTEREST_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setProductInterest(option);
                    setOpenDropdown(null);
                  }}
                  className={`block w-full rounded-[8px] px-3 py-2 text-left text-[14px] font-medium transition-colors ${
                    productInterest === option
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

      <div
        className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]"
        ref={materialRef}
      >
        Material Preference
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "material" ? null : "material")}
            className={`flex min-h-[48px] w-full items-center justify-between rounded-[12px] border bg-white px-4 text-[15px] transition-all duration-200 outline-none ${
              openDropdown === "material" ? "border-[#1a1a1a] ring-1 ring-[#1a1a1a]/5" : "border-black/10"
            }`}
          >
            <span className={material ? "text-[#1a1a1a]" : "text-[#1a1a1a]/40"}>
              {material || "Select material"}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[#313131]/60 transition-transform duration-200 ${
                openDropdown === "material" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openDropdown === "material" && (
            <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-[12px] border border-black/10 bg-[#faf8f4] p-2 shadow-[0_18px_35px_rgba(0,0,0,0.08)]">
              {MATERIAL_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setMaterial(option);
                    setOpenDropdown(null);
                  }}
                  className={`block w-full rounded-[8px] px-3 py-2 text-left text-[14px] font-medium transition-colors ${
                    material === option
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
        Quantity Needed
        <input
          type="text"
          name="quantity"
          placeholder="e.g. 200 meters, or 10 rolls"
          className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5"
        />
      </label>
      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
        Email Address
        <input
          type="email"
          name="email"
          placeholder="you@studio.com"
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

      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131] md:col-span-2">
        Message
        <textarea
          name="message"
          rows={4}
          placeholder="Tell us about your project, timelines, or any custom requirements."
          className="w-full rounded-[12px] border border-black/10 bg-white px-4 py-3 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5"
        />
      </label>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="min-h-[48px] w-full rounded-[12px] bg-[#1a1a1a] px-6 text-[16px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting..." : "Request Pricing & Samples"}
        </button>
      </div>
      {status === "success" ? (
        <p className="md:col-span-2 text-[14px] text-green-700">
          Thanks! We&apos;ve received your enquiry and will get back to you within 24-48
          hours.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="md:col-span-2 text-[14px] text-red-600">
          {errorMessage || "We could not submit your enquiry. Please try again."}
        </p>
      ) : null}
    </form>
  );
};

export default CanvasRollEnquiryForm;
