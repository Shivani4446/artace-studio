"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import ImageUpload from "@/components/custom-order/ImageUpload";

const MEDIUM_OPTIONS = [
  "Acrylic on Canvas",
  "Oil on Canvas",
  "Watercolor / Archival Paper",
  "Mixed Media",
  "Traditional / Spiritual / Folk Art",
];

const SellPaintingsApplicationForm = () => {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [medium, setMedium] = useState("");
  const [openDropdown, setOpenDropdown] = useState<"medium" | null>(null);
  const [sampleUrls, setSampleUrls] = useState<string[]>([]);

  const mediumRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mediumRef.current && !mediumRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!medium) {
      setErrorMessage("Please select your primary medium and style.");
      setStatus("error");
      return;
    }
    if (sampleUrls.length === 0) {
      setErrorMessage("Please upload at least one artwork sample.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      fullName: String(formData.get("fullName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      portfolioUrl: String(formData.get("portfolioUrl") ?? "").trim(),
      medium,
      sampleUrls,
    };

    try {
      const response = await fetch("/api/artist-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "We could not submit your application. Please try again.");
      }

      setStatus("success");
      setMedium("");
      setSampleUrls([]);
      form.reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "We could not submit your application."
      );
    }
  };

  return (
    <form
      ref={formRef}
      className="grid grid-cols-1 gap-6 rounded-[24px] border border-black/10 bg-[#faf8f4] p-6 md:grid-cols-2 md:gap-8 md:p-8"
      onSubmit={handleSubmit}
    >
      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
        Full Name
        <input
          type="text"
          name="fullName"
          placeholder="e.g., Ananya Sharma"
          required
          className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5"
        />
      </label>
      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
        Email Address
        <input
          type="email"
          name="email"
          placeholder="ananya@example.com"
          required
          className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5"
        />
      </label>
      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
        WhatsApp Phone Number
        <input
          type="tel"
          name="phone"
          placeholder="+91 98765 43210"
          required
          className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5"
        />
      </label>
      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
        City & State
        <input
          type="text"
          name="city"
          placeholder="e.g., Pune, Maharashtra"
          required
          className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5"
        />
      </label>

      <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
        Portfolio / Instagram Link (Optional)
        <input
          type="url"
          name="portfolioUrl"
          placeholder="https://instagram.com/yourhandle"
          className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]/5"
        />
      </label>

      <div className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]" ref={mediumRef}>
        Primary Medium & Style
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "medium" ? null : "medium")}
            className={`flex min-h-[48px] w-full items-center justify-between rounded-[12px] border bg-white px-4 text-[15px] transition-all duration-200 outline-none ${
              openDropdown === "medium" ? "border-[#1a1a1a] ring-1 ring-[#1a1a1a]/5" : "border-black/10"
            }`}
          >
            <span className={medium ? "text-[#1a1a1a]" : "text-[#1a1a1a]/40"}>
              {medium || "Select primary medium"}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[#313131]/60 transition-transform duration-200 ${
                openDropdown === "medium" ? "rotate-180" : ""
              }`}
            />
          </button>

          {openDropdown === "medium" && (
            <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-[12px] border border-black/10 bg-[#faf8f4] p-2 shadow-[0_18px_35px_rgba(0,0,0,0.08)]">
              {MEDIUM_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setMedium(option);
                    setOpenDropdown(null);
                  }}
                  className={`block w-full rounded-[8px] px-3 py-2 text-left text-[14px] font-medium transition-colors ${
                    medium === option
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

      <div className="md:col-span-2">
        <p className="mb-2 text-[14px] font-medium text-[#313131]">
          Upload Up to 3 Artwork Samples{" "}
          <span className="font-normal text-[#6a655d]">(clear, well-lit photos of completed, original creations)</span>
        </p>
        <ImageUpload maxFiles={3} onUpload={(urls) => setSampleUrls(urls)} />
      </div>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="min-h-[48px] w-full rounded-[12px] bg-[#1a1a1a] px-6 text-[16px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting Application..." : "Submit Application for Curator Review"}
        </button>
      </div>
      {status === "success" ? (
        <p className="md:col-span-2 text-[14px] text-green-700">
          Thanks for applying! Our curation team will respond within 24–48 hours via
          WhatsApp/Email. If approved, you'll choose your ₹999 Standard or ₹1,899
          Premium annual plan to activate your artist account.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="md:col-span-2 text-[14px] text-red-600">
          {errorMessage || "We could not submit your application. Please try again."}
        </p>
      ) : null}
      <p className="md:col-span-2 text-center text-[13px] leading-6 text-[#6a655d]">
        Your contact details and artwork images remain strictly confidential.
      </p>
    </form>
  );
};

export default SellPaintingsApplicationForm;