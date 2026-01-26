import React from "react";
import { Search } from "lucide-react";
import Link from "next/link";

const Navbar: React.FC = () => {
  return (
    <nav className="w-full bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tighter text-[#C5A059]"
        >
          AFS
        </Link>
      </div>

      {/* Nav Links */}
      <div className="hidden md:flex items-center space-x-8 text-[13px] font-medium text-neutral-700 uppercase tracking-wide">
        <Link href="#" className="hover:text-[#C5A059] transition-colors">
          New & Featured
        </Link>
        <Link href="#" className="hover:text-[#C5A059] transition-colors">
          Discovery Essentials
        </Link>
        <Link href="#" className="hover:text-[#C5A059] transition-colors">
          Shop by Artist
        </Link>
        <Link href="#" className="hover:text-[#C5A059] transition-colors">
          Sale
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative w-64 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#C5A059] transition-colors" />
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-[#f4f4f4] rounded-full py-2 pl-10 pr-4 text-[13px] outline-none border border-transparent focus:border-[#C5A059]/20 transition-all"
        />
      </div>
    </nav>
  );
};

export default Navbar;
