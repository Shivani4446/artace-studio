import Image from "next/image";
import Link from "next/link";
import { getCollectionHref } from "@/utils/collections";

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
      { label: "Radha Krishna", href: getCollectionHref("radha-krishna-paintings") },
      { label: "Buddha", href: getCollectionHref("buddha-paintings") },
      { label: "Ganesha", href: getCollectionHref("ganapati-paintings") },
      {
        label: "Landscape & Cityscape",
        href: getCollectionHref("landscapes-cityscapes-paintings"),
      },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "Shop", href: "/shop" },
      { label: "Corporate & Bulk Orders", href: "/corporate-bulk-orders" },
      { label: "Cart", href: "/cart" },
      { label: "Track Your Order", href: "/dashboard/orders" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blogs", href: "/blogs" },
      { label: "About Us", href: "/about-us" },
      { label: "Team", href: "/team" },
      { label: "Painting Categories", href: "/shop" },
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

const socialLinks = [
  {
    label: "Pinterest",
    href: "https://in.pinterest.com/artacestudio/",
    icon: "/pinterest-3.svg",
    iconClassName: "h-6 w-6",
  },
  {
    label: "Facebook",
    href: "https://facebook.com/artacestudio",
    icon: "/facebook-3-2.svg",
    iconClassName: "h-6 w-6",
  },
  {
    label: "X",
    href: "https://x.com/ArtaceStudio",
    icon: "/x-2.svg",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/artace_studio",
    icon: "/instagram-2016-5.svg",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/artace-studio/",
    icon: "/linkedin-icon-1.svg",
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
            <p className="mt-16 max-w-[320px] text-[18px] leading-[1.35] text-white/90">
              We empower independent artists to share their stories with the
              world.
            </p>
          </div>

          {footerSections.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h2 className="mb-5 text-[18px] font-medium leading-tight text-white">
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
          <p className="text-[18px] text-[#d4d5d8]">
            © 2026 Artace Studio. All rights reserved
          </p>

          <div className="flex items-center gap-5">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="inline-flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-70"
              >
                <Image
                  src={social.icon}
                  alt=""
                  aria-hidden="true"
                  width={20}
                  height={20}
                  className={`${social.iconClassName ?? "h-5 w-5"} object-contain`}
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <p className="pointer-events-none absolute inset-x-0 -bottom-[34px] z-0 text-center whitespace-nowrap text-[20vw] font-semibold leading-none tracking-[0.02em] text-[#0d1014] md:-bottom-[44px] md:text-[13vw] lg:-bottom-[52px] lg:text-[12vw]">
        ARTACE STUDIO
      </p>
    </footer>
  );
}

