import React from "react";
import { Twitter, Instagram, Facebook } from "lucide-react";
import Link from "next/link";

const Footer: React.FC = () => {
  const footerLinks = {
    Collections: [
      "Collection 1",
      "Collection 2",
      "Collection 3",
      "Collection 4",
      "Collection 5",
      "Collection 6",
    ],
    Shop: [
      "Shop",
      "My Account",
      "Orders",
      "Cart",
      "Track Your Order",
      "Wishlist",
    ],
    Resources: ["Blogs", "About Us", "Family Portraits", "Painting Categories"],
    Support: [
      "Contact Us",
      "Return Policy",
      "Cancellation Policy",
      "Privacy Policy",
      "Term of Use",
    ],
  };

  return (
    <footer className="bg-[#0A0A0A] text-white pt-20 pb-10 px-8 lg:px-16 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Top Section: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 mb-20">
          {/* Brand Info */}
          <div className="col-span-2">
            <div className="text-3xl font-bold text-[#C5A059] tracking-tighter mb-6">
              AFS
            </div>
            <p className="text-[14px] text-gray-400 max-w-[240px] leading-relaxed">
              We empower independent artists to share their stories with the
              world.
            </p>
          </div>

          {/* Map through Link Categories */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h4 className="text-[14px] font-semibold text-white">{title}</h4>
              <ul className="space-y-3 text-[13px] text-gray-400">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-6">
          <p className="text-[12px] text-gray-500">
            © 2023 Artace Studio. All rights reserved
          </p>
          <div className="flex gap-8">
            <Twitter className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white transition-colors" />
            <Instagram className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white transition-colors" />
            <Facebook className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        {/* Huge Background Text */}
        <div className="mt-16 select-none pointer-events-none">
          <h1 className="text-[14vw] font-bold text-[#141414] leading-none text-center tracking-tight">
            ARTACE STUDIO
          </h1>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
