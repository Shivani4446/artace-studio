"use client";

import React, { useState } from "react";
import {
  Search,
  MessageCircle,
  ArrowRight,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";

const ContactPage = () => {
  // Brand Gold Color: #C5A059 (approx)
  // Footer Dark: #0A0A0A
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const payload = {
      firstName: String(formData.get("firstName") ?? "").trim(),
      lastName: String(formData.get("lastName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      country: String(formData.get("country") ?? "").trim(),
      company: String(formData.get("company") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      consent: formData.get("privacyConsent") === "on",
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "We could not send your message. Please try again.");
      }

      setStatus("success");
      form.reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "We could not send your message.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans selection:bg-[#C5A059]/20">
      <main className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* --- HERO / CONTACT US --- */}
        <section className="pt-32">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12">
            <div className="max-w-2xl">
              <h1 className="text-[80px] font-serif mb-[32px] text-[#222] whitespace-nowrap">
                Contact Us
              </h1>
              <p className="text-[#666] leading-relaxed text-[15px]">
                Artace Studio has stood as a beacon of artistic excellence,
                specializing in premium canvas paintings that transform spaces
                into galleries of distinction and aim for all thing everything
                about paintings.
              </p>
            </div>
            <button className="flex items-center gap-2 bg-[#292929] text-white px-5 py-3 rounded text-[18px] hover:bg-black transition-colors">
              Chat via Whatsapp 
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.75 9.75V14.25C15.75 14.6478 15.592 15.0294 15.3107 15.3107C15.0294 15.592 14.6478 15.75 14.25 15.75H3.75C3.35218 15.75 2.97064 15.592 2.68934 15.3107C2.40804 15.0294 2.25 14.6478 2.25 14.25V3.75C2.25 3.35218 2.40804 2.97064 2.68934 2.68934C2.97064 2.40804 3.35218 2.25 3.75 2.25H8.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.75 2.25L9 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11.25 2.25H15.75V6.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="h-[1px] bg-gray-100 mt-20"></div>
        </section>

        {/* --- GENERAL ENQUIRIES --- */}
        <section className="py-20 flex flex-col md:flex-row gap-27">
          <h2 className="text-[52px] font-serif text-[#222] whitespace-nowrap flex-shrink-0">General enquiries</h2>
          <div className="flex-grow flex flex-col md:flex-row gap-10 md:gap-16">
            <div className="space-y-1 flex-1">
              <p className="text-[18px] text-[#595959] mb-2">
                Email
              </p>
              <p className="text-[18px] text-gray-700">info@artacestudio.com</p>
            </div>
            <div className="space-y-1 flex-1">
              <p className="text-[18px] text-[#595959] mb-2">
                Get in touch
              </p>
              <a
                href="#"
                className="text-[18px] underline underline-offset-8 flex items-center gap-2 hover:text-[#C5A059] transition-colors"
              >
                Fill Out The Contact Form <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>

        <div className="h-[1px] bg-gray-100"></div>

        {/* --- SEND US A MESSAGE FORM --- */}
        <section className="py-20 flex flex-col md:flex-row gap-20">
          <div className="flex-shrink-0">
            <p className="text-[18px] text-[#595959] mb-2">
              Contact Form
            </p>
            <h2 className="text-[52px] font-serif text-[#313131]">
              Send Us a Message
            </h2>
          </div>

          <div className="flex-grow">
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12"
              onSubmit={handleSubmit}
            >
              <div className="border-b border-gray-200 pb-3">
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full outline-none text-[18px] placeholder:text-[#595959]"
                  name="firstName"
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="border-b border-gray-200 pb-3">
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full outline-none text-[18px] placeholder:text-[#595959]"
                  name="lastName"
                  autoComplete="family-name"
                />
              </div>
              <div className="border-b border-gray-200 pb-3">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full outline-none text-[18px] placeholder:text-[#595959]"
                  name="email"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="border-b border-gray-200 pb-3">
                <input
                  type="tel"
                  placeholder="Phone No."
                  className="w-full outline-none text-[18px] placeholder:text-[#595959]"
                  name="phone"
                  autoComplete="tel"
                />
              </div>
              <div className="border-b border-gray-200 pb-3">
                <input
                  type="text"
                  placeholder="Country"
                  className="w-full outline-none text-[18px] placeholder:text-[#595959]"
                  name="country"
                  autoComplete="country-name"
                />
              </div>
              <div className="border-b border-gray-200 pb-3">
                <input
                  type="text"
                  placeholder="Company Name"
                  className="w-full outline-none text-[18px] placeholder:text-[#595959]"
                  name="company"
                  autoComplete="organization"
                />
              </div>
              <div className="md:col-span-2 border-b border-gray-200 pb-3">
                <textarea
                  placeholder="Write Your Message"
                  rows={1}
                  className="w-full outline-none text-[18px] placeholder:text-[#595959] resize-none"
                  name="message"
                  required
                />
              </div>

              <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-10 pt-4">
                <button
                  className="bg-[#292929] text-white px-[24px] py-[16px] rounded text-[18px] hover:bg-black transition-all flex items-center gap-[14px] disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? "Sending..." : "Send Message"}
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.25 5.25H12.75V12.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.25 12.75L12.75 5.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="flex items-center gap-3 text-[18px] text-[#595959]">
                  <input
                    type="checkbox"
                    id="privacy"
                    className="w-4 h-4 accent-[#222] border-gray-300"
                    name="privacyConsent"
                    required
                  />
                  <label htmlFor="privacy">
                    I Agree to the{" "}
                    <a href="#" className="underline text-[#313131]">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>

              {status === "success" ? (
                <p className="md:col-span-2 text-[14px] text-green-700 -mt-4">
                  Thanks for reaching out! We&apos;ve received your message and will
                  respond ASAP.
                </p>
              ) : null}
              {status === "error" ? (
                <p className="md:col-span-2 text-[14px] text-red-600 -mt-4">
                  {errorMessage || "We could not send your message. Please try again."}
                </p>
              ) : (
                <p className="md:col-span-2 text-[14px] text-[#595959] -mt-4">
                  We&apos;ll get back to you within 1-2 business days.
                </p>
              )}
            </form>
          </div>
        </section>
      </main>

      {/* --- WORLDWIDE DISTRIBUTORS --- */}
      <section className="bg-[#0A0A0A] text-white py-32 mt-10">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <p className="text-[18px] text-[#AAAAAA] mb-8">
            Worldwide Distributors
          </p>
            <div className="flex flex-col md:flex-row justify-between items-end gap-10">
              <h2 className="text-5xl font-serif max-w-4xl leading-[1.2]">
              We&apos;re proudly based in India. However, you can also find us in
              Europe, the Middle East, Australia and around the globe.
              </h2>
              <button className="bg-white text-black px-8 py-4 rounded text-[18px] flex items-center gap-3 hover:bg-gray-200 transition-colors whitespace-nowrap mb-2">
                Become a Distributor
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.25 5.25H12.75V12.75" stroke="#292929" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.25 12.75L12.75 5.25" stroke="#292929" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
