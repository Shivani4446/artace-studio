"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Search,
  ShoppingCart,
  Heart,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Package,
  Settings,
  UserRound,
} from "lucide-react";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import LogoutButton from "@/components/auth/LogoutButton";
import {
  collectionLinkItems,
  getCollectionHref,
} from "@/utils/collections";

type DesktopMenuId = "collections" | "shop" | "resources";

const resourceLinks = [
  {
    name: "About Us",
    href: "/about-us",
    description: "The Artace story, our process, and what makes each canvas original.",
  },
  {
    name: "Team",
    href: "/team",
    description: "Meet the artists, advisors, and makers behind every commission.",
  },
  {
    name: "Blogs",
    href: "/blogs",
    description: "Ideas on styling art, gifting, collecting, and choosing the right piece.",
  },
];

const collectionDescriptions: Record<string, string> = {
  "ganapati-paintings": "Auspicious canvases for prosperity and new beginnings.",
  "radha-krishna-paintings": "Devotional paintings centered on love and harmony.",
  "buddha-paintings": "Meditative works that bring stillness indoors.",
  "landscapes-cityscapes-paintings": "Expansive horizons and urban scenes with atmosphere.",
  "figurative-paintings": "Portrait-led storytelling with warmth and presence.",
};

const desktopLinks = [
  { name: "Home", href: "/" },
  { name: "Painting Collections", href: "/shop", menuId: "collections" as DesktopMenuId },
  { name: "Shop Art", href: "/shop", menuId: "shop" as DesktopMenuId },
  { name: "Resources", href: "/about-us", menuId: "resources" as DesktopMenuId },
  { name: "Contact", href: "/contact-us" },
];

const collectionLinks = collectionLinkItems.map((item) => ({
  name: item.name,
  href: getCollectionHref(item.categorySlug),
  slug: item.categorySlug,
  description:
    collectionDescriptions[item.categorySlug] ||
    "Handcrafted canvases curated for a distinct mood, story, and room.",
}));

const paintingLinks = [
  {
    name: "Religious Paintings",
    href: "/shop?category=religious-paintings",
    description: "Spiritual icons and devotional scenes painted with depth and reverence.",
  },
  {
    name: "Landscape Paintings",
    href: "/shop?category=landscapes-cityscapes-paintings",
    description: "Mountain air, rivers, forests, and serene horizons for expansive rooms.",
  },
  {
    name: "Cityscape Paintings",
    href: "/shop?category=landscapes-cityscapes-paintings",
    description: "Urban skylines and rainy streets with texture, contrast, and mood.",
  },
  {
    name: "Vastu Paintings",
    href: "/shop?category=vastu-paintings",
    description: "Artwork chosen to support energy, balance, and intentional placement.",
  },
  {
    name: "Table Top Paintings",
    href: "/shop?category=table-top-paintings",
    description: "Smaller-format originals for consoles, shelves, studies, and quiet corners.",
  },
  {
    name: "Buddha Paintings",
    href: "/shop?category=buddha-paintings",
    description: "Calm, meditative works that anchor the room with a quieter presence.",
  },
];

const shopHighlights = [
  {
    title: "Original Hand-Painted Art",
    body: "Rich texture, visible brushwork, and artist-grade materials in every piece.",
  },
  {
    title: "Custom Sizes Available",
    body: "Adjust scale, palette, and framing direction to fit your wall properly.",
  },
  {
    title: "Guided by Art Advisors",
    body: "Shortlist faster with support on placement, sizing, and collection curation.",
  },
];

type MobileMenuSubLink = {
  name: string;
  href: string;
};

type MobileMenuLink = {
  name: string;
  href: string;
  children?: MobileMenuSubLink[];
};

const mobileLinks: MobileMenuLink[] = [
  { name: "Home", href: "/" },
  {
    name: "Painting Collections",
    href: "/shop",
    children: [{ name: "View All Collections", href: "/shop" }, ...collectionLinks],
  },
  {
    name: "Shop Art",
    href: "/shop",
    children: [...paintingLinks, { name: "Shop All", href: "/shop" }],
  },
  {
    name: "Resources",
    href: "/about-us",
    children: resourceLinks,
  },
  { name: "Contact", href: "/contact-us" },
];

const searchStaticPrefix = "Search For";
const searchPlaceholderTerms = [
  "Paintings",
  "Acrylic Paintings",
  "Oil Paintings",
  "Radha Krishna",
  "Landscapes",
  "Abstract",
  "Buddha Paintings",
  "Modern Art",
  "Portraits",
  "Gifts",
  "Art",
  "Table Top Paintings",
  "Custom Order",
];

const DesktopNavArrow = ({ isOpen }: { isOpen: boolean }) => (
  <Image
    src="/slant-down-arrow-right.svg"
    alt=""
    width={18}
    height={18}
    aria-hidden="true"
    className={`h-[18px] w-[18px] transition-transform duration-200 ${
      isOpen ? "translate-x-[1px] translate-y-[1px]" : ""
    }`}
  />
);

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<DesktopMenuId | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [expandedMobileMenus, setExpandedMobileMenus] = useState<Record<string, boolean>>(
    {}
  );
  const [desktopSearchValue, setDesktopSearchValue] = useState("");
  const [mobileSearchValue, setMobileSearchValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isPlaceholderSliding, setIsPlaceholderSliding] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const { session, status: authStatus } = useAuthSession();
  const { itemCount: wishlistCount } = useWishlist();
  const { items, itemCount, subtotal, incrementItem, decrementItem, removeItem } =
    useCart();
  const isAuthenticated = authStatus === "authenticated";
  const accountHref = isAuthenticated ? "/dashboard" : "/login";
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setExpandedMobileMenus({});
  };
  const closeDesktopMenu = () => setOpenDesktopMenu(null);
  const toggleDesktopMenu = (menuId: DesktopMenuId) => {
    setIsAccountMenuOpen(false);
    setOpenDesktopMenu((current) => (current === menuId ? null : menuId));
  };
  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      setExpandedMobileMenus({});
    }
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const closeAccountMenu = () => setIsAccountMenuOpen(false);
  const toggleAccountMenu = () => {
    setOpenDesktopMenu(null);
    setIsAccountMenuOpen((current) => !current);
  };
  const accountDisplayName =
    session?.user?.name?.trim() || session?.user?.email?.trim() || "Artace Account";
  const accountInitials =
    accountDisplayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "A";

  useEffect(() => {
    if (!isMiniCartOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMiniCartOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMiniCartOpen]);

  useEffect(() => {
    if (!openDesktopMenu && !isAccountMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDesktopMenu(null);
        setIsAccountMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isAccountMenuOpen, openDesktopMenu]);

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isAccountMenuOpen]);

  useEffect(() => {
    const holdDurationMs = 2200;
    const slideDurationMs = 320;
    let holdTimeoutId: number | null = null;
    let slideTimeoutId: number | null = null;

    const startCycle = () => {
      holdTimeoutId = window.setTimeout(() => {
        setIsPlaceholderSliding(true);
        slideTimeoutId = window.setTimeout(() => {
          setPlaceholderIndex(
            (currentIndex) => (currentIndex + 1) % searchPlaceholderTerms.length
          );
          setIsPlaceholderSliding(false);
          startCycle();
        }, slideDurationMs);
      }, holdDurationMs);
    };

    startCycle();

    return () => {
      if (holdTimeoutId !== null) {
        window.clearTimeout(holdTimeoutId);
      }
      if (slideTimeoutId !== null) {
        window.clearTimeout(slideTimeoutId);
      }
    };
  }, []);

  const isDesktopMenuOpen = openDesktopMenu !== null;

  const renderDesktopMenu = () => {
    if (openDesktopMenu === "collections") {
      return (
        <div className="grid grid-cols-[250px_minmax(0,1fr)_300px] items-stretch gap-8">
          <div className="flex flex-col justify-between rounded-[18px] bg-white px-6 py-6">
            <div>
              <p className="font-inter text-[11px] font-medium uppercase tracking-[0.16em] text-[#7b746a]">
                Painting Collections
              </p>
              <h3 className="mt-4 font-display text-[28px] leading-[1.08] text-[#2a2a2a]">
                Explore all collections.
              </h3>
              <p className="mt-4 font-inter text-[15px] leading-[1.75] text-[#626262]">
                Choose a collection first, then refine the piece for your room.
              </p>
            </div>

            <Link
              href="/shop"
              onClick={closeDesktopMenu}
              className="mt-6 inline-flex items-center gap-2 font-inter text-[14px] font-medium text-[#2a2a2a] transition-colors hover:text-black"
            >
              View all collections
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 rounded-[18px] border border-black/6 bg-white px-6 py-5">
            {collectionLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeDesktopMenu}
                className="group border-b border-[#ebe5dc] py-4 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-inter text-[16px] font-medium leading-[1.35] text-[#2c2c2c] transition-colors group-hover:text-black">
                      {item.name}
                    </p>
                    <p className="mt-1 font-inter text-[14px] leading-[1.55] text-[#6b6b6b]">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#8a8a8a] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#2c2c2c]" />
                </div>
              </Link>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-[18px] bg-[#d8d2c8]">
            <Image
              src="/radha-krishna-collection-bg.webp"
              alt="Handmade painting collections"
              fill
              sizes="300px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/84 via-black/42 to-black/10 px-6 py-6 text-white">
              <div className="flex h-full flex-col justify-end">
                <p className="max-w-[220px] font-display text-[24px] leading-[1.08]">
                  Find the right collection faster.
                </p>
                <p className="mt-3 max-w-[240px] font-inter text-[14px] leading-[1.65] text-white/82">
                  Start with a theme, then tailor size and finish for your space.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (openDesktopMenu === "shop") {
      return (
        <div className="grid grid-cols-[minmax(0,1fr)_250px_300px] items-stretch gap-8">
          <div className="rounded-[18px] border border-black/6 bg-white px-6 py-5">
            <div className="flex items-end justify-between gap-6 border-b border-[#ebe5dc] pb-4">
              <div>
                <h3 className="font-display text-[28px] leading-[1.08] text-[#2a2a2a]">
                  Browse by art category.
                </h3>
                <p className="mt-3 max-w-[520px] font-inter text-[14px] leading-[1.7] text-[#626262]">
                  Use category-led navigation when you already know the kind of painting
                  you want to buy or commission.
                </p>
              </div>
              <Link
                href="/shop"
                onClick={closeDesktopMenu}
                className="inline-flex items-center gap-2 whitespace-nowrap font-inter text-[14px] font-medium text-[#2a2a2a] transition-colors hover:text-black"
              >
                Shop all art
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-1 pt-2">
              {paintingLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeDesktopMenu}
                  className="group border-b border-[#ebe5dc] py-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-inter text-[15px] font-medium leading-[1.35] text-[#2c2c2c] transition-colors group-hover:text-black">
                        {item.name}
                      </p>
                      <p className="mt-2 max-w-[260px] font-inter text-[13px] leading-[1.6] text-[#6b6b6b]">
                        {item.description}
                      </p>
                    </div>

                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#8a8a8a] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#2c2c2c]" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] bg-white px-5 py-5">
            <div className="space-y-4">
              {shopHighlights.map((item) => (
                <div
                  key={item.title}
                  className="border-b border-[#ebe5dc] pb-4 last:border-b-0 last:pb-0"
                >
                  <p className="font-inter text-[14px] font-medium text-[#2c2c2c]">
                    {item.title}
                  </p>
                  <p className="mt-1 font-inter text-[13px] leading-[1.6] text-[#6b6b6b]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-rows-[1fr_auto] gap-4">
            <div className="relative overflow-hidden rounded-[18px] bg-[#d8d2c8]">
              <Image
                src="/who-are-we.webp"
                alt="Original handmade artwork for home and office interiors"
                fill
                sizes="300px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/56 via-black/8 to-transparent px-6 py-6 text-white">
                <div className="flex h-full flex-col justify-end">
                  <p className="font-inter text-[11px] font-medium uppercase tracking-[0.16em] text-white/72">
                    Original Art
                  </p>
                  <p className="mt-3 max-w-[210px] font-display text-[24px] leading-[1.08]">
                    Buy with more confidence.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/contact-us"
              onClick={closeDesktopMenu}
              className="rounded-[18px] bg-[#2a2a2a] px-5 py-5 text-white transition-colors hover:bg-[#1f1f1f]"
            >
              <p className="font-inter text-[11px] font-medium uppercase tracking-[0.16em] text-white/62">
                Need Help Choosing?
              </p>
              <p className="mt-3 font-display text-[24px] leading-[1.08]">
                Talk to an art advisor.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 font-inter text-[14px] font-medium text-white">
                Contact us
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </div>
      );
    }

    if (openDesktopMenu === "resources") {
      return (
        <div className="grid grid-cols-[minmax(0,1fr)_300px] items-stretch gap-8">
          <div className="rounded-[18px] border border-black/6 bg-white px-6 py-5">
            <div className="flex items-end justify-between gap-6 border-b border-[#ebe5dc] pb-4">
              <div>
                <h3 className="font-display text-[28px] leading-[1.08] text-[#2a2a2a]">
                  Learn, explore, and contact the studio.
                </h3>
              </div>
              <Link
                href="/contact-us"
                onClick={closeDesktopMenu}
                className="inline-flex items-center gap-2 whitespace-nowrap font-inter text-[14px] font-medium text-[#2a2a2a] transition-colors hover:text-black"
              >
                Contact
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-5 pt-5">
              {resourceLinks.map((resource) => (
                <Link
                  key={resource.name}
                  href={resource.href}
                  onClick={closeDesktopMenu}
                  className="group rounded-[16px] bg-[#faf8f4] px-5 py-5 transition-colors hover:bg-[#f4efe7]"
                >
                  <p className="font-inter text-[15px] font-medium text-[#2c2c2c]">
                    {resource.name}
                  </p>
                  <p className="mt-2 font-inter text-[14px] leading-[1.7] text-[#6b6b6b]">
                    {resource.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 font-inter text-[14px] font-medium text-[#2c2c2c]">
                    Open
                    <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[18px] bg-[#d8d2c8]">
            <Image
              src="/journal-img.webp"
              alt="Artace resources and journal"
              fill
              sizes="300px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/58 via-black/12 to-transparent px-6 py-6 text-white">
              <div className="flex h-full flex-col justify-end">
                <p className="font-inter text-[11px] font-medium uppercase tracking-[0.16em] text-white/72">
                  Art Journal
                </p>
                <p className="mt-3 max-w-[220px] font-display text-[24px] leading-[1.08]">
                  Practical guidance for collecting and styling art.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <nav
        className="sticky top-0 z-[60] border-b border-[#d8d3ca] bg-white"
        onMouseLeave={closeDesktopMenu}
      >
        <div className="mx-auto flex h-[88px] max-w-[1440px] items-center justify-between px-6 md:h-[102px] md:px-12">
          <div className="flex-shrink-0">
            <Link href="/" className="group">
              <Image
                src="/Artace-logo.svg"
                alt="Artace logo"
                width={47}
                height={32}
                className="h-8 w-auto md:h-10"
                priority
              />
            </Link>
          </div>

          <div className="hidden items-center gap-10 lg:flex">
            {desktopLinks.map((link) =>
              link.menuId ? (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => toggleDesktopMenu(link.menuId)}
                  className={`inline-flex items-center gap-2 font-inter text-[18px] font-medium leading-none transition-colors hover:text-black ${
                    openDesktopMenu === link.menuId ? "text-black" : "text-[#2f2f2f]"
                  }`}
                >
                  {link.name}
                  <DesktopNavArrow isOpen={openDesktopMenu === link.menuId} />
                </button>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  onMouseEnter={closeDesktopMenu}
                  className="inline-flex items-center gap-1 font-inter text-[18px] font-medium text-[#2f2f2f] transition-colors hover:text-black"
                >
                  {link.name}
                </Link>
              )
            )}
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <div className="hidden md:flex items-center bg-[#f2f2f2] rounded-full px-4 py-2.5 w-[240px] lg:w-[320px] transition-all focus-within:ring-1 focus-within:ring-[#c6c1b6]">
              <Search className="w-5 h-5 text-[#555555] mr-3" strokeWidth={1.5} />
              <div className="relative w-full">
                <input
                  type="text"
                  aria-label="Search"
                  value={desktopSearchValue}
                  onChange={(event) => setDesktopSearchValue(event.target.value)}
                  className="relative z-10 bg-transparent border-none outline-none text-[16px] text-[#333333] w-full font-inter"
                />
                {desktopSearchValue.length === 0 && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 flex max-w-full items-center text-[16px] text-[#555555] font-inter"
                  >
                    <span className="mr-1 shrink-0">{searchStaticPrefix}</span>
                    <span className="relative h-[1.25em] overflow-hidden whitespace-nowrap">
                      <span
                        className={`flex flex-col ${
                          isPlaceholderSliding
                            ? "transition-transform duration-300 ease-out -translate-y-[1.25em]"
                            : "translate-y-0"
                        }`}
                      >
                        <span className="h-[1.25em] leading-[1.25em]">
                          {searchPlaceholderTerms[placeholderIndex]}
                        </span>
                        <span className="h-[1.25em] leading-[1.25em]">
                          {
                            searchPlaceholderTerms[
                              (placeholderIndex + 1) % searchPlaceholderTerms.length
                            ]
                          }
                        </span>
                      </span>
                    </span>
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/wishlist"
              aria-label="Open wishlist"
              className="relative inline-flex h-9 w-9 items-center justify-center text-[#2f2f2f] transition-colors hover:text-black md:h-10 md:w-10"
            >
              <Heart className="h-5 w-5" strokeWidth={1.7} />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#1f1f1f] px-1.5 text-center text-[11px] font-semibold leading-[18px] text-white">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            <div
              ref={accountMenuRef}
              className="relative"
              onMouseEnter={() => {
                if (!isAuthenticated && authStatus !== "loading") {
                  closeDesktopMenu();
                  setIsAccountMenuOpen(true);
                }
              }}
              onMouseLeave={() => {
                if (!isAuthenticated) {
                  setIsAccountMenuOpen(false);
                }
              }}
            >
              <button
                type="button"
                aria-label={isAuthenticated ? "Open account menu" : "Open account"}
                onClick={() => {
                  closeDesktopMenu();
                  if (isAuthenticated) {
                    toggleAccountMenu();
                    return;
                  }
                  if (window.innerWidth < 768) {
                    window.location.href = accountHref;
                    return;
                  }
                  setIsAccountMenuOpen((current) => !current);
                }}
                className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center text-[#2f2f2f] transition-colors hover:text-black md:h-10 md:w-10"
              >
                <Image
                  src="/user.svg"
                  alt=""
                  width={20}
                  height={20}
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              </button>

              {isAuthenticated ? (
                <div
                  className={`absolute right-0 top-[calc(100%+12px)] z-[75] hidden w-[290px] rounded-[18px] border border-black/8 bg-white p-3 shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-200 md:block ${
                    isAccountMenuOpen
                      ? "visible translate-y-0 opacity-100"
                      : "invisible -translate-y-2 opacity-0"
                  }`}
                  role="menu"
                >
                  <div className="rounded-[14px] bg-[#fcfaf7] px-4 py-4">
                    <p className="text-[12px] uppercase tracking-[0.08em] text-[#7a7368]">
                      Signed in as
                    </p>
                    <p className="mt-2 text-[16px] font-medium text-[#1f1f1f]">
                      {session?.user?.name || "Artace Customer"}
                    </p>
                    <p className="mt-1 break-words text-[14px] leading-[1.6] text-[#5b5b5b]">
                      {session?.user?.email || session?.user?.username || ""}
                    </p>
                  </div>

                  <div className="mt-3 space-y-1">
                    <Link
                      href="/dashboard"
                      onClick={closeAccountMenu}
                      className="flex items-center justify-between rounded-[12px] px-4 py-3 text-[15px] font-medium text-[#1f1f1f] transition-colors hover:bg-[#f4efe7]"
                      role="menuitem"
                    >
                      <span className="inline-flex items-center gap-3">
                        <LayoutDashboard className="h-4 w-4 text-[#5b5b5b]" />
                        Dashboard
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#7a7368]" />
                    </Link>
                    <Link
                      href="/dashboard/orders"
                      onClick={closeAccountMenu}
                      className="flex items-center justify-between rounded-[12px] px-4 py-3 text-[15px] font-medium text-[#1f1f1f] transition-colors hover:bg-[#f4efe7]"
                      role="menuitem"
                    >
                      <span className="inline-flex items-center gap-3">
                        <Package className="h-4 w-4 text-[#5b5b5b]" />
                        Orders
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#7a7368]" />
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={closeAccountMenu}
                      className="flex items-center justify-between rounded-[12px] px-4 py-3 text-[15px] font-medium text-[#1f1f1f] transition-colors hover:bg-[#f4efe7]"
                      role="menuitem"
                    >
                      <span className="inline-flex items-center gap-3">
                        <UserRound className="h-4 w-4 text-[#5b5b5b]" />
                        Profile
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#7a7368]" />
                    </Link>
                    <Link
                      href="/dashboard/details"
                      onClick={closeAccountMenu}
                      className="flex items-center justify-between rounded-[12px] px-4 py-3 text-[15px] font-medium text-[#1f1f1f] transition-colors hover:bg-[#f4efe7]"
                      role="menuitem"
                    >
                      <span className="inline-flex items-center gap-3">
                        <Settings className="h-4 w-4 text-[#5b5b5b]" />
                        Details
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#7a7368]" />
                    </Link>
                  </div>

                  <div className="mt-3 border-t border-black/8 pt-3">
                    <LogoutButton
                      className="flex w-full items-center justify-between rounded-[12px] px-4 py-3 text-[15px] font-medium text-[#1f1f1f] transition-colors hover:bg-[#f4efe7]"
                      label="Logout"
                    />
                  </div>
                </div>
              ) : (
                <div
                  className={`absolute right-0 top-[calc(100%+12px)] z-[75] hidden w-[250px] rounded-[18px] border border-black/8 bg-white p-3 shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-200 md:block ${
                    isAccountMenuOpen
                      ? "visible translate-y-0 opacity-100"
                      : "invisible -translate-y-2 opacity-0"
                  }`}
                  role="menu"
                >
                  <div className="rounded-[14px] bg-[#fcfaf7] px-4 py-4">
                    <p className="text-[12px] uppercase tracking-[0.08em] text-[#7a7368]">
                      Account Access
                    </p>
                    <p className="mt-2 text-[15px] leading-[1.6] text-[#1f1f1f]">
                      Login to track orders, or sign up first if you&apos;re new.
                    </p>
                  </div>

                  <div className="mt-3 grid gap-2">
                    <Link
                      href="/login"
                      onClick={closeAccountMenu}
                      className="inline-flex items-center justify-center rounded-[12px] bg-[#1f1f1f] px-4 py-3 text-[15px] font-medium text-white transition-colors hover:bg-black"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={closeAccountMenu}
                      className="inline-flex items-center justify-center rounded-[12px] border border-black/10 px-4 py-3 text-[15px] font-medium text-[#1f1f1f] transition-colors hover:bg-[#f4efe7]"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label="Open cart"
              onClick={() => setIsMiniCartOpen(true)}
              className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center text-[#2f2f2f] transition-colors hover:text-black md:h-10 md:w-10"
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={1.7} />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#1f1f1f] px-1.5 text-center text-[11px] font-semibold leading-[18px] text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            <button
              className="p-2 text-[#2f2f2f] lg:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        <div
          className={`absolute left-0 right-0 top-full hidden transition-all duration-200 lg:block ${
            isDesktopMenuOpen
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-2 opacity-0"
          }`}
          onMouseLeave={closeDesktopMenu}
        >
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mt-4 max-h-[calc(100vh-140px)] overflow-y-auto rounded-[12px] border border-[#d8d3ca] bg-[#f4f2ee] shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
              <div className="px-6 py-8 md:px-12">
                {renderDesktopMenu()}
              </div>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute left-0 top-full w-full border-b border-gray-100 bg-white px-6 py-6 shadow-xl lg:hidden">
            <div className="flex flex-col gap-6">
              <div className="flex items-center bg-[#f2f2f2] rounded-full px-4 py-3 w-full">
                <Search className="w-5 h-5 text-[#555555] mr-3" />
                <div className="relative w-full">
                  <input
                    type="text"
                    aria-label="Search"
                    value={mobileSearchValue}
                    onChange={(event) => setMobileSearchValue(event.target.value)}
                    className="relative z-10 bg-transparent border-none outline-none text-[16px] text-[#333333] w-full font-inter"
                  />
                  {mobileSearchValue.length === 0 && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 left-0 flex max-w-full items-center text-[16px] text-[#555555] font-inter"
                    >
                      <span className="mr-1 shrink-0">{searchStaticPrefix}</span>
                      <span className="relative h-[1.25em] overflow-hidden whitespace-nowrap">
                        <span
                          className={`flex flex-col ${
                            isPlaceholderSliding
                              ? "transition-transform duration-300 ease-out -translate-y-[1.25em]"
                              : "translate-y-0"
                          }`}
                        >
                          <span className="h-[1.25em] leading-[1.25em]">
                            {searchPlaceholderTerms[placeholderIndex]}
                          </span>
                          <span className="h-[1.25em] leading-[1.25em]">
                            {
                              searchPlaceholderTerms[
                                (placeholderIndex + 1) % searchPlaceholderTerms.length
                              ]
                            }
                          </span>
                        </span>
                      </span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {authStatus !== "loading" ? (
                  isAuthenticated ? (
                    <div className="rounded-[16px] bg-[#f7f7f7] p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1f1f] text-[14px] font-semibold uppercase tracking-[0.04em] text-white">
                          {accountInitials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-inter text-[16px] font-medium text-[#1f1f1f]">
                            {session?.user?.name || "Artace Customer"}
                          </p>
                          <p className="truncate text-[13px] text-[#6b6b6b]">
                            {session?.user?.email || session?.user?.username || ""}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <Link
                          href="/dashboard"
                          onClick={closeMobileMenu}
                          className="rounded-[12px] bg-[#1f1f1f] px-3 py-3 text-center font-inter text-[15px] font-medium text-white transition-colors hover:bg-black"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/orders"
                          onClick={closeMobileMenu}
                          className="rounded-[12px] bg-white px-3 py-3 text-center font-inter text-[15px] font-medium text-[#333333] transition-colors hover:bg-[#ececec]"
                        >
                          Orders
                        </Link>
                        <Link
                          href="/dashboard/profile"
                          onClick={closeMobileMenu}
                          className="rounded-[12px] bg-white px-3 py-3 text-center font-inter text-[15px] font-medium text-[#333333] transition-colors hover:bg-[#ececec]"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/dashboard/details"
                          onClick={closeMobileMenu}
                          className="rounded-[12px] bg-white px-3 py-3 text-center font-inter text-[15px] font-medium text-[#333333] transition-colors hover:bg-[#ececec]"
                        >
                          Details
                        </Link>
                      </div>

                      <LogoutButton
                        className="mt-3 w-full rounded-[12px] bg-white px-3 py-3 font-inter text-[15px] font-medium text-[#333333] transition-colors hover:bg-[#ececec]"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/login"
                        onClick={closeMobileMenu}
                        className="rounded-[12px] bg-[#1f1f1f] px-3 py-3 text-center font-inter text-[15px] font-medium text-white transition-colors hover:bg-black"
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        onClick={closeMobileMenu}
                        className="rounded-[12px] bg-[#f7f7f7] px-3 py-3 text-center font-inter text-[15px] font-medium text-[#333333] transition-colors hover:bg-[#ececec]"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )
                ) : null}

                {mobileLinks.map((link) => (
                  link.children && link.children.length > 0 ? (
                    <div key={link.name} className="rounded-[12px] bg-[#f7f7f7] p-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMobileMenus((current) => ({
                            ...current,
                            [link.name]: !current[link.name],
                          }))
                        }
                        className="flex w-full items-center justify-between rounded-[10px] px-1 py-1 font-inter text-lg font-medium text-[#333333]"
                        aria-expanded={Boolean(expandedMobileMenus[link.name])}
                        aria-controls={`mobile-submenu-${link.name}`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            expandedMobileMenus[link.name] ? "rotate-180" : ""
                          }`}
                          strokeWidth={1.8}
                        />
                      </button>

                      <div
                        id={`mobile-submenu-${link.name}`}
                        className={`grid transition-all duration-200 ${
                          expandedMobileMenus[link.name]
                            ? "mt-2 grid-rows-[1fr]"
                            : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="space-y-2">
                            {link.children.map((child) => (
                              <Link
                                key={`${link.name}-${child.name}`}
                                href={child.href}
                                onClick={closeMobileMenu}
                                className="block rounded-[10px] bg-white px-3 py-2.5 font-inter text-[15px] font-medium text-[#4a4a4a] transition-colors hover:bg-[#ececec] hover:text-black"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className="rounded-[12px] bg-[#f7f7f7] px-3 py-3 font-inter text-lg font-medium text-[#333333] transition-colors hover:bg-[#ececec]"
                    >
                      {link.name}
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      <div
        className={`fixed inset-0 z-[70] transition-opacity duration-300 ease-out ${
          isMiniCartOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Close mini cart"
          onClick={() => setIsMiniCartOpen(false)}
          className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
            isMiniCartOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          className={`absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
            isMiniCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <h3 className="font-display text-2xl text-[#222]">Your Cart</h3>
            <button
              type="button"
              onClick={() => setIsMiniCartOpen(false)}
              className="rounded-full p-2 text-[#444] transition-colors hover:bg-gray-100"
              aria-label="Close cart panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="font-display text-2xl text-[#222]">Cart is empty</p>
                <p className="mt-2 text-sm text-[#666]">
                  Add products to see them here.
                </p>
                <button
                  type="button"
                  onClick={() => setIsMiniCartOpen(false)}
                  className="mt-6 border border-[#222] px-5 py-2 text-sm font-medium text-[#222] transition-colors hover:bg-[#222] hover:text-white"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <ul className="space-y-5">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-4 border-b border-[#1f1f1f]/10 pb-5"
                  >
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-[#f4f4f4]">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-display text-[18px] leading-snug text-[#222]">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="mt-1 text-xs uppercase tracking-[0.05em] text-[#777]">
                          {item.subtitle}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center border border-[#222]/20">
                          <button
                            type="button"
                            onClick={() => decrementItem(item.id)}
                            className="px-2.5 py-1.5 text-[#222] hover:bg-[#f3f3f3]"
                            aria-label={`Decrease quantity of ${item.title}`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => incrementItem(item.id)}
                            className="px-2.5 py-1.5 text-[#222] hover:bg-[#f3f3f3]"
                            aria-label={`Increase quantity of ${item.title}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.05em] text-[#666] hover:text-[#111]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-gray-100 px-6 py-5">
            {subtotal > 0 && (
              <div className="mb-4 flex items-center justify-between text-sm text-[#444]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#222]">${subtotal.toFixed(2)}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsMiniCartOpen(false)}
                className="border border-[#222] px-4 py-3 text-sm font-medium text-[#222] transition-colors hover:bg-[#222] hover:text-white"
              >
                Continue
              </button>
              <Link
                href="/cart"
                onClick={() => setIsMiniCartOpen(false)}
                className="bg-[#222] px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-black"
              >
                Go to Cart
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Navbar;
