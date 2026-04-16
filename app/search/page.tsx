import { Suspense } from "react";
import type { Metadata } from "next";
import SearchClient from "./SearchClient";

export const metadata: Metadata = {
  title: "Search Art | Find Paintings | Artace Studio",
  description: "Search for art and paintings at Artace Studio. Find canvas art, wall decor, and unique artworks. Browse our complete collection.",
  keywords: "search art, find paintings, canvas art, wall art, search artworks",
  openGraph: {
    title: "Search Art | Find Paintings",
    description: "Search and find your perfect painting.",
    url: "https://artacestudio.com/search",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search Art | Find Paintings",
    description: "Search and find your perfect painting.",
  },
};

const SearchPage = () => {
  return (
    <main className="bg-white text-[#1a1a1a]">
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-12 md:py-20">
            <p className="text-[15px] text-[#777]">Loading search results...</p>
          </div>
        }
      >
        <SearchClient />
      </Suspense>
    </main>
  );
};

export default SearchPage;
