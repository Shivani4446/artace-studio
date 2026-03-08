import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";

type FooterSection = {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
};

const footerSections: FooterSection[] = [
  {
    title: "Collections",
    links: [
      { label: "Radha Krishna", href: "#" },
      { label: "Buddha", href: "#" },
      { label: "Ganesha", href: "#" },
      { label: "Landscapes", href: "#" },
      { label: "Modern/ Contemporary", href: "#" },
      { label: "Portraits", href: "#" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "Shop", href: "/shop" },
      { label: "Cart", href: "/cart" },
      { label: "Track Your Order", href: "#" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blogs", href: "/blogs" },
      { label: "About Us", href: "/about-us" },
      { label: "Team", href: "/team" },
      { label: "Family Portraits", href: "#" },
      { label: "Painting Categories", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: "/contact-us" },
      { label: "Return Policy", href: "/return-policy" },
      { label: "Cancellation Policy", href: "/cancellation-policy" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Use", href: "/terms-of-use" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#050608] text-white">
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 pb-32 pt-16 md:px-12 md:pt-20 lg:pb-36">
        <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-[1.55fr_1fr_1fr_1fr_1fr]">
          <div className="lg:pr-8">
            <Link
              href="/"
              aria-label="Artace Studio home"
              className="inline-block"
            >
              <Image
                src="/Artace-logo.svg"
                alt="Artace Studio logo"
                width={120}
                height={82}
                className="h-auto w-[88px]"
              />
            </Link>
            <p className="mt-16 max-w-[320px] text-[19px] leading-[1.35] text-white/90">
              We empower independent artists to share their stories with the
              world.
            </p>
          </div>

          {footerSections.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h2 className="mb-5 text-[19px] font-medium leading-tight text-white">
                {section.title}
              </h2>
              <ul className="space-y-4 text-[18px] leading-tight text-[#95979f]">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-20 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between md:mt-24">
          <p className="text-[19px] text-[#d4d5d8]">
            © 2025 Artace Studio. All rights reserved
          </p>

          <div className="flex items-center gap-5 text-[#f2f3f5]">
            <Link
              href="#"
              aria-label="X"
              className="text-[15px] font-medium leading-none transition-opacity hover:opacity-70"
            >
              X
            </Link>
            <Link href="#" aria-label="Instagram" className="hover:opacity-70">
              <Instagram className="h-4 w-4" strokeWidth={1.8} />
            </Link>
            <Link href="#" aria-label="Facebook" className="hover:opacity-70">
              <Facebook className="h-4 w-4" strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </div>

      <p className="pointer-events-none absolute inset-x-0 -bottom-[34px] z-0 text-center whitespace-nowrap text-[20vw] font-semibold leading-none tracking-[0.02em] text-[#0d1014] md:-bottom-[44px] md:text-[13vw] lg:-bottom-[52px] lg:text-[12vw]">
        ARTACE STUDIO
      </p>
    </footer>
  );
}
