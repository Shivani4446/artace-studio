import React from "react";
import {
  Search,
  MessageCircle,
  ArrowRight,
  ExternalLink,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";

const ContactPage = () => {
  // Brand Gold Color: #C5A059 (approx)
  // Footer Dark: #0A0A0A

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans selection:bg-[#C5A059]/20">
      <main className="max-w-7xl mx-auto px-10">
        {/* --- HERO / CONTACT US --- */}
        <section className="pt-32 pb-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-2xl">
              <h1 className="text-6xl font-serif mb-8 text-[#222]">
                Contact Us
              </h1>
              <p className="text-[#666] leading-relaxed text-[15px]">
                Artace Studio has stood as a beacon of artistic excellence,
                specializing in premium canvas paintings that transform spaces
                into galleries of distinction and aim for all thing everything
                about paintings.
              </p>
            </div>
            <button className="flex items-center gap-2 bg-[#222] text-white px-5 py-3 rounded text-[13px] hover:bg-black transition-colors">
              Chat via Whatsapp <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="h-[1px] bg-gray-100 mt-20"></div>
        </section>

        {/* --- GENERAL ENQUIRIES --- */}
        <section className="py-20 grid md:grid-cols-3 gap-10">
          <h2 className="text-4xl font-serif text-[#222]">General enquiries</h2>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-semibold">
              Email
            </p>
            <p className="text-[15px] text-gray-700">info@artacestudio.com</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-semibold">
              Get in touch
            </p>
            <a
              href="#"
              className="text-[15px] underline underline-offset-8 flex items-center gap-2 hover:text-[#C5A059] transition-colors"
            >
              Fill Out The Contact Form <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </section>

        <div className="h-[1px] bg-gray-100"></div>

        {/* --- SEND US A MESSAGE FORM --- */}
        <section className="py-20 grid md:grid-cols-3 gap-10">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-2">
              Contact Form
            </p>
            <h2 className="text-4xl font-serif text-[#222]">
              Send Us a Message
            </h2>
          </div>

          <div className="md:col-span-2">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
              <div className="border-b border-gray-200 pb-3">
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full outline-none text-[15px] placeholder:text-gray-400"
                />
              </div>
              <div className="border-b border-gray-200 pb-3">
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full outline-none text-[15px] placeholder:text-gray-400"
                />
              </div>
              <div className="border-b border-gray-200 pb-3">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full outline-none text-[15px] placeholder:text-gray-400"
                />
              </div>
              <div className="border-b border-gray-200 pb-3">
                <input
                  type="tel"
                  placeholder="Phone No."
                  className="w-full outline-none text-[15px] placeholder:text-gray-400"
                />
              </div>
              <div className="border-b border-gray-200 pb-3">
                <input
                  type="text"
                  placeholder="Country"
                  className="w-full outline-none text-[15px] placeholder:text-gray-400"
                />
              </div>
              <div className="border-b border-gray-200 pb-3">
                <input
                  type="text"
                  placeholder="Company Name"
                  className="w-full outline-none text-[15px] placeholder:text-gray-400"
                />
              </div>
              <div className="md:col-span-2 border-b border-gray-200 pb-3">
                <textarea
                  placeholder="Write Your Message"
                  rows={1}
                  className="w-full outline-none text-[15px] placeholder:text-gray-400 resize-none"
                />
              </div>

              <div className="md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                <button className="bg-[#222] text-white px-10 py-3 rounded text-[13px] hover:bg-black transition-all flex items-center gap-2">
                  Send Message <span className="text-[10px] opacity-50">▼</span>
                </button>
                <div className="flex items-center gap-3 text-[12px] text-gray-500">
                  <input
                    type="checkbox"
                    id="privacy"
                    className="w-4 h-4 accent-[#222] border-gray-300"
                  />
                  <label htmlFor="privacy">
                    I Agree to the{" "}
                    <a href="#" className="underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>

              <p className="md:col-span-2 text-[10px] text-gray-400 mt-2">
                This site is protected by reCAPTCHA and the Google Privacy
                Policy and Terms of Service apply.
              </p>
            </form>
          </div>
        </section>
      </main>

      {/* --- WORLDWIDE DISTRIBUTORS --- */}
      <section className="bg-[#0A0A0A] text-white py-32 px-10 mt-10">
        <div className="max-w-7xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-8 font-semibold">
            Worldwide Distributors
          </p>
          <div className="flex flex-col md:flex-row justify-between items-end gap-10">
            <h2 className="text-5xl font-serif max-w-4xl leading-[1.2]">
              We're proudly based in India. However, you can also find us in
              Europe, the Middle East, Australia and around the globe.
            </h2>
            <button className="bg-white text-black px-8 py-4 rounded text-[13px] font-semibold flex items-center gap-3 hover:bg-gray-200 transition-colors whitespace-nowrap mb-2">
              Become a Distributor <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
