"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import SamoraProductCard, { type SamoraProduct } from "@/components/samora/SamoraProductCard";

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "name-asc": "Name: A to Z",
};

const pillClass = (active: boolean) =>
  `rounded-full border px-4 py-2 text-[13.5px] font-medium transition-colors ${
    active
      ? "border-[#c1683d] bg-[#c1683d] text-white"
      : "border-[#2b2420]/20 text-[#2b2420] hover:border-[#2b2420]/40"
  }`;

const SamoraShopCatalog = ({ products }: { products: SamoraProduct[] }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});

  const categories = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; count: number }>();
    products.forEach((product) => {
      product.categories.forEach((category) => {
        const existing = map.get(category.slug);
        if (existing) existing.count += 1;
        else map.set(category.slug, { slug: category.slug, name: category.name, count: 1 });
      });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [products]);

  // Facets like Material/Color show up automatically as soon as products
  // carry real WooCommerce attributes — nothing to configure here.
  const attributeFacets = useMemo(() => {
    const facetMap = new Map<string, Map<string, number>>();
    products.forEach((product) => {
      product.attributes.forEach((attribute) => {
        const optionMap = facetMap.get(attribute.name) ?? new Map<string, number>();
        attribute.options.forEach((option) => {
          optionMap.set(option, (optionMap.get(option) ?? 0) + 1);
        });
        facetMap.set(attribute.name, optionMap);
      });
    });

    return Array.from(facetMap.entries()).map(([name, optionMap]) => ({
      name,
      options: Array.from(optionMap.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
    }));
  }, [products]);

  const toggleAttributeOption = (attributeName: string, optionValue: string) => {
    setSelectedAttributes((current) => {
      const selectedValues = current[attributeName] ?? [];
      const nextValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((value) => value !== optionValue)
        : [...selectedValues, optionValue];

      const next = { ...current, [attributeName]: nextValues };
      if (nextValues.length === 0) delete next[attributeName];
      return next;
    });
  };

  const priceBounds = useMemo(() => {
    const prices = products
      .map((product) => product.price)
      .filter((price): price is number => price !== null);
    if (prices.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    const activeAttributeFilters = Object.entries(selectedAttributes).filter(
      ([, values]) => values.length > 0
    );

    return products.filter((product) => {
      if (
        selectedCategory !== "all" &&
        !product.categories.some((category) => category.slug === selectedCategory)
      ) {
        return false;
      }
      if (query && !product.name.toLowerCase().includes(query)) return false;
      if (min !== null && (product.price === null || product.price < min)) return false;
      if (max !== null && (product.price === null || product.price > max)) return false;

      for (const [attributeName, selectedValues] of activeAttributeFilters) {
        const productAttribute = product.attributes.find((attr) => attr.name === attributeName);
        const matches = productAttribute?.options.some((option) => selectedValues.includes(option));
        if (!matches) return false;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery, minPrice, maxPrice, selectedAttributes]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
      case "price-desc":
        return list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
      case "name-asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "newest":
      default:
        // Products already arrive newest-first from the server query.
        return list;
    }
  }, [filteredProducts, sortBy]);

  const hasActiveFilters =
    selectedCategory !== "all" ||
    searchQuery.trim() !== "" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    Object.values(selectedAttributes).some((values) => values.length > 0);

  const resetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedAttributes({});
  };

  return (
    <div className="mt-10 md:mt-12">
      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setSelectedCategory("all")} className={pillClass(selectedCategory === "all")}>
            All ({products.length})
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setSelectedCategory(category.slug)}
              className={pillClass(selectedCategory === category.slug)}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      ) : null}

      {attributeFacets.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {attributeFacets.map((facet) => (
            <div key={facet.name} className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-medium text-[#8a7c68]">{facet.name}:</span>
              {facet.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleAttributeOption(facet.name, option.value)}
                  className={pillClass((selectedAttributes[facet.name] ?? []).includes(option.value))}
                >
                  {option.value} ({option.count})
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-[260px] sm:flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7c68]"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search products"
            className="w-full rounded-full border border-[#2b2420]/15 bg-[#fbf6ef] py-2.5 pl-10 pr-4 text-[13.5px] text-[#2b2420] outline-none transition-colors focus:border-[#c1683d]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder={priceBounds.min ? `Min ₹${priceBounds.min}` : "Min"}
              className="w-[92px] rounded-full border border-[#2b2420]/15 bg-[#fbf6ef] px-3.5 py-2.5 text-[13.5px] text-[#2b2420] outline-none transition-colors focus:border-[#c1683d]"
            />
            <span className="text-[#8a7c68]">&ndash;</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder={priceBounds.max ? `Max ₹${priceBounds.max}` : "Max"}
              className="w-[92px] rounded-full border border-[#2b2420]/15 bg-[#fbf6ef] px-3.5 py-2.5 text-[13.5px] text-[#2b2420] outline-none transition-colors focus:border-[#c1683d]"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="appearance-none rounded-full border border-[#2b2420]/15 bg-[#fbf6ef] py-2.5 pl-4 pr-9 text-[13.5px] text-[#2b2420] outline-none transition-colors focus:border-[#c1683d]"
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a7c68]"
              strokeWidth={1.75}
            />
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-[13px] font-medium text-[#c1683d] hover:text-[#a8552f]"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {sortedProducts.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {sortedProducts.map((product) => (
            <SamoraProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[20px] border border-[#2b2420]/10 bg-[#f3ead9] px-6 py-14 text-center">
          <p className="font-samora-display text-[20px] text-[#2b2420]">
            No products match your filters
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex items-center rounded-full border border-[#2b2420]/20 px-5 py-2.5 text-[13.5px] font-medium text-[#2b2420] transition-colors hover:border-[#2b2420]/40"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SamoraShopCatalog;
