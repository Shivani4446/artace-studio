"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type SearchProduct = {
  id: number;
  name: string;
  slug: string;
  image?: string;
};

type SearchBlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
};

type SearchCollection = {
  id: string;
  title: string;
  href: string;
};

type SearchPage = {
  id: string;
  title: string;
  href: string;
};

type SearchResponse = {
  products: SearchProduct[];
  blogs: SearchBlogPost[];
  collections: SearchCollection[];
  pages: SearchPage[];
};

const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = useMemo(() => (searchParams.get("q") || "").trim(), [searchParams]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse>({
    products: [],
    blogs: [],
    collections: [],
    pages: [],
  });

  useEffect(() => {
    let isActive = true;

    const fetchResults = async () => {
      if (!query) {
        setResults({ products: [], blogs: [], collections: [], pages: [] });
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?mode=full&q=${encodeURIComponent(query)}&limit=12`
        );
        if (!isActive) return;
        if (response.ok) {
          const data = (await response.json()) as SearchResponse;
          setResults({
            products: data.products ?? [],
            blogs: data.blogs ?? [],
            collections: data.collections ?? [],
            pages: data.pages ?? [],
          });
        } else {
          setResults({ products: [], blogs: [], collections: [], pages: [] });
        }
      } catch {
        if (isActive) {
          setResults({ products: [], blogs: [], collections: [], pages: [] });
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      isActive = false;
    };
  }, [query]);

  return (
    <main className="bg-white text-[#1a1a1a]">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-12 md:py-20">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.35em] text-[#7a7368]">
            Search Results
          </p>
          <h1 className="mt-4 font-display text-[32px] leading-[1.15] sm:text-[40px] md:text-[48px]">
            {query ? `Results for "${query}"` : "Search the Artace catalog"}
          </h1>
          <p className="mt-3 text-[16px] text-[#5b5b5b] md:text-[18px]">
            {query
              ? "Browse matching artworks, collections, and journal stories."
              : "Type a query in the search bar to explore artworks and journal stories."}
          </p>
        </div>

        {query && (
          <div className="mt-10 grid gap-12">
            {isLoading ? (
              <p className="text-[15px] text-[#777]">Searching...</p>
            ) : null}

            <section>
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-display text-[24px] text-[#2c2c2c]">Artworks</h2>
                <Link
                  href="/shop"
                  className="text-[14px] font-medium text-[#2c2c2c] underline underline-offset-4"
                >
                  Shop all art
                </Link>
              </div>
              {results.products.length === 0 ? (
                <p className="mt-4 text-[15px] text-[#777]">
                  No artworks found for this query.
                </p>
              ) : (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {results.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop/${product.slug}`}
                      className="group rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="relative h-48 w-full overflow-hidden rounded-xl bg-[#f4f4f4]">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 1024px) 100vw, 320px"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        ) : null}
                      </div>
                      <p className="mt-4 text-[16px] font-medium text-[#1f1f1f]">
                        {product.name}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-display text-[24px] text-[#2c2c2c]">Collections</h2>
                <Link
                  href="/shop"
                  className="text-[14px] font-medium text-[#2c2c2c] underline underline-offset-4"
                >
                  View collections
                </Link>
              </div>
              {results.collections.length === 0 ? (
                <p className="mt-4 text-[15px] text-[#777]">
                  No collections found for this query.
                </p>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.collections.map((collection) => (
                    <Link
                      key={collection.id}
                      href={collection.href}
                      className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <p className="text-[12px] uppercase tracking-[0.2em] text-[#8a8073]">
                        Collection
                      </p>
                      <h3 className="mt-3 font-display text-[20px] text-[#2c2c2c]">
                        {collection.title}
                      </h3>
                      <p className="mt-2 text-[14px] text-[#5b5b5b]">
                        Explore this curated series.
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-display text-[24px] text-[#2c2c2c]">Pages</h2>
              </div>
              {results.pages.length === 0 ? (
                <p className="mt-4 text-[15px] text-[#777]">
                  No pages found for this query.
                </p>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {results.pages.map((page) => (
                    <Link
                      key={page.id}
                      href={page.href}
                      className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <span className="font-display text-[18px] text-[#2c2c2c]">
                        {page.title}
                      </span>
                      <span className="text-[12px] uppercase tracking-[0.2em] text-[#8a8073]">
                        Page
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-display text-[24px] text-[#2c2c2c]">Journal</h2>
                <Link
                  href="/blogs"
                  className="text-[14px] font-medium text-[#2c2c2c] underline underline-offset-4"
                >
                  Explore all blogs
                </Link>
              </div>
              {results.blogs.length === 0 ? (
                <p className="mt-4 text-[15px] text-[#777]">
                  No journal posts found for this query.
                </p>
              ) : (
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  {results.blogs.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blogs/${post.slug}`}
                      className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <p className="text-[12px] uppercase tracking-[0.2em] text-[#8a8073]">
                        Journal
                      </p>
                      <h3 className="mt-3 font-display text-[20px] text-[#2c2c2c]">
                        {post.title}
                      </h3>
                      {post.excerpt ? (
                        <p className="mt-3 text-[14px] leading-relaxed text-[#5b5b5b]">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default SearchPage;
