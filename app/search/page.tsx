import { Suspense } from "react";
import SearchClient from "./SearchClient";

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
