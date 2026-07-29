import Image from "next/image";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

const CATEGORY_LINKS = [
  { label: "Tote Bags", href: "/samora/shop" },
  { label: "Tea Coasters", href: "/samora/shop" },
  { label: "Trays", href: "/samora/shop" },
  { label: "Name Plates", href: "/samora/shop" },
];

const QUICK_LINKS = [
  { label: "Shop", href: "/samora/shop" },
  { label: "Our Craft", href: "/samora#craft" },
  { label: "Our Story", href: "/samora#story" },
  { label: "FAQ", href: "/samora#faq" },
];

const SamoraFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#2b2420]/10 bg-[#f3ead9] text-[#2b2420]">
      <div className="mx-auto max-w-[1320px] px-5 py-14 md:px-10 md:py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <Image
              src="/samroa-logo.svg"
              alt="Samora by Artace Studio"
              width={190}
              height={125}
              className="h-14 w-auto"
            />
            <p className="mt-4 max-w-[320px] text-[14.5px] leading-[1.7] text-[#5c5344]">
              Handcrafted tote bags, tea coasters, trays, and name plates, made slowly by hand
              from natural materials. A sub-brand of Artace Studio.
            </p>
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#8a7c68]">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[14.5px] text-[#3f382f] hover:text-[#c1683d]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#8a7c68]">
              Categories
            </p>
            <ul className="mt-4 space-y-2.5">
              {CATEGORY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[14.5px] text-[#3f382f] hover:text-[#c1683d]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#8a7c68]">
              Get in Touch
            </p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href="https://wa.me/9657609102"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[14.5px] text-[#3f382f] hover:text-[#c1683d]"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                  WhatsApp Us
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@artacestudio.com"
                  className="inline-flex items-center gap-2 text-[14.5px] text-[#3f382f] hover:text-[#c1683d]"
                >
                  <Mail className="h-4 w-4" strokeWidth={1.75} />
                  info@artacestudio.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[#2b2420]/10 pt-6 text-[13px] text-[#8a7c68] md:flex-row md:items-center md:justify-between">
          <p>&copy; {year} Samora. A sub-brand of Artace Studio.</p>
          <Link href="https://artacestudio.com" className="hover:text-[#c1683d]">
            Visit Artace Studio &rarr;
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default SamoraFooter;
