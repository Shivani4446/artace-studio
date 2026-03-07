"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import type { ShopProduct, SizeBucket } from "@/components/shop/types";

type ShopCatalogProps = {
  products: ShopProduct[];
  loadError?: string | null;
  initialSelectedCategory?: string | null;
};

type SortById =
  | "price"
  | "date-added"
  | "popularity"
  | "size"
  | "best-selling";

type ProductsPerRow = 1 | 2 | 3 | 4 | 5 | 6;
type ToolbarMenuId = "sort" | "per-page" | "per-row" | null;

const SIZE_FILTERS: SizeBucket[] = ["Small", "Medium", "Large", "XL"];
const MATERIAL_FILTERS = ["Canvas", "Paper"];
const COLOR_FILTERS = ["Acrylic", "Oil", "Watercolor"];
const PER_PAGE_OPTIONS = [6, 12, 18, 24, 36];
const PRODUCTS_PER_ROW_OPTIONS: ProductsPerRow[] = [1, 2, 3, 4, 5, 6];

const SORT_OPTIONS: Array<{ id: SortById; label: string }> = [
  { id: "price", label: "By Price" },
  { id: "date-added", label: "By Date Added" },
  { id: "popularity", label: "Popularity" },
  { id: "size", label: "By Size" },
  { id: "best-selling", label: "Best Selling" },
];

const bucketRank: Record<SizeBucket, number> = {
  Small: 1,
  Medium: 2,
  Large: 3,
  XL: 4,
};

const formatPrice = (
  value: number | null,
  currencyCode: string,
  currencySymbol: string
) => {
  if (value === null) return "Price On Request";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currencySymbol}${Math.round(value).toLocaleString("en-IN")}`;
  }
};

const formatNumber = (value: number) => value.toLocaleString("en-IN");

const toTitleCase = (value: string) =>
  value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const toggleSelection = (current: string[], value: string) => {
  if (current.includes(value)) {
    return current.filter((item) => item !== value);
  }
  return [...current, value];
};

const getSizeRank = (product: ShopProduct) => {
  if (product.sizeBuckets.length === 0) return Number.POSITIVE_INFINITY;
  const total = product.sizeBuckets.reduce((sum, bucket) => sum + bucketRank[bucket], 0);
  return total / product.sizeBuckets.length;
};

const getPaintingSizeLabel = (product: ShopProduct) => {
  const directSize = product.attributes.sizes.find((size) => size.trim().length > 0);
  if (directSize) return toTitleCase(directSize);

  if (product.sizeBuckets.length === 1) return product.sizeBuckets[0];
  if (product.sizeBuckets.length > 1) return "Multiple Sizes";
  return "Custom Size";
};

const getProductGridClassName = (productsPerRow: ProductsPerRow) => {
  switch (productsPerRow) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
    case 4:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4";
    case 5:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";
    case 6:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6";
    default:
      return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
  }
};

const getProductGridGapClassName = (productsPerRow: ProductsPerRow) => {
  if (productsPerRow >= 5) return "gap-x-4 gap-y-8";
  if (productsPerRow === 4) return "gap-x-5 gap-y-9";
  return "gap-x-6 gap-y-10";
};

const getCardTypography = (productsPerRow: ProductsPerRow) => {
  if (productsPerRow >= 6) {
    return {
      category: "text-[12px]",
      title: "text-[15px]",
      meta: "text-[12px]",
      regularPrice: "text-[14px]",
      price: "text-[18px]",
      addToCart: "!px-3 !py-1.5 !text-[10px]",
    };
  }

  if (productsPerRow === 5) {
    return {
      category: "text-[13px]",
      title: "text-[16px]",
      meta: "text-[12px]",
      regularPrice: "text-[15px]",
      price: "text-[20px]",
      addToCart: "!px-3 !py-1.5 !text-[10px]",
    };
  }

  return {
    category: "text-[14px]",
    title: "text-[18px]",
    meta: "text-[14px]",
    regularPrice: "text-[18px]",
    price: "text-[24px]",
    addToCart: "!px-4 !py-2 !text-[11px]",
  };
};

const FilterChipGroup = ({
  title,
  options,
  selected,
  onToggle,
  getCount,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  getCount?: (value: string) => number;
}) => {
  return (
    <div className="rounded-[12px] border border-[#1f1f1f]/12 bg-transparent p-4">
      <h3 className="text-[14px] font-semibold text-[#24211d]">{title}</h3>
      {options.length === 0 ? (
        <p className="mt-2 text-xs text-[#8a8378]">No Options Available</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = selected.includes(option);
            const count = getCount ? getCount(option) : null;
            const isDisabled = count !== null && count <= 0;

            return (
              <button
                key={option}
                type="button"
                disabled={isDisabled}
                onClick={() => onToggle(option)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  isSelected
                    ? "border-[#1f1f1f] bg-[#1f1f1f] text-white"
                    : "border-[#1f1f1f]/18 bg-transparent text-[#3e3a34] hover:border-[#1f1f1f]/35"
                } ${
                  isDisabled
                    ? "cursor-not-allowed border-[#1f1f1f]/8 text-[#b0aaa1] hover:border-[#1f1f1f]/8"
                    : ""
                }`}
              >
                <span>{toTitleCase(option)}</span>
                {count !== null && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                      isSelected ? "bg-white/20" : "bg-black/5"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ShopCatalog = ({
  products,
  loadError = null,
  initialSelectedCategory = null,
}: ShopCatalogProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    initialSelectedCategory ? [initialSelectedCategory] : []
  );
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<SizeBucket[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortById>("date-added");
  const [openToolbarMenu, setOpenToolbarMenu] = useState<ToolbarMenuId>(null);
  const [isPriceSliderDragging, setIsPriceSliderDragging] = useState(false);
  const [productsPerPage, setProductsPerPage] = useState<number>(12);
  const [productsPerRow, setProductsPerRow] = useState<ProductsPerRow>(3);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const toolbarMenusRef = useRef<HTMLDivElement | null>(null);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(products.flatMap((product) => product.categories))).sort(
      (a, b) => a.localeCompare(b)
    );
  }, [products]);

  const moodOptions = useMemo(() => {
    return Array.from(
      new Set(products.flatMap((product) => product.attributes.moods))
    ).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const materialOptions = MATERIAL_FILTERS;

  const colorOptions = COLOR_FILTERS;

  const sizeCounts = useMemo(() => {
    const counts: Record<SizeBucket, number> = {
      Small: 0,
      Medium: 0,
      Large: 0,
      XL: 0,
    };
    products.forEach((product) => {
      product.sizeBuckets.forEach((sizeBucket) => {
        counts[sizeBucket] += 1;
      });
    });
    return counts;
  }, [products]);

  const pricedProducts = useMemo(
    () =>
      products
        .map((product) => product.price)
        .filter((price): price is number => typeof price === "number"),
    [products]
  );

  const minAvailablePrice = useMemo(() => {
    if (pricedProducts.length === 0) return 0;
    return Math.floor(Math.min(...pricedProducts));
  }, [pricedProducts]);

  const maxAvailablePrice = useMemo(() => {
    if (pricedProducts.length === 0) return 0;
    return Math.ceil(Math.max(...pricedProducts));
  }, [pricedProducts]);

  const [priceMin, setPriceMin] = useState<number>(minAvailablePrice);
  const [priceMax, setPriceMax] = useState<number>(maxAvailablePrice);

  const hasPriceFilter =
    priceMin > minAvailablePrice || priceMax < maxAvailablePrice;

  const rangeSpan = Math.max(maxAvailablePrice - minAvailablePrice, 1);
  const rangeStartPercent = ((priceMin - minAvailablePrice) / rangeSpan) * 100;
  const rangeEndPercent = ((priceMax - minAvailablePrice) / rangeSpan) * 100;
  const sliderDisabled =
    pricedProducts.length === 0 || minAvailablePrice >= maxAvailablePrice;

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (
        selectedCategories.length > 0 &&
        !product.categories.some((category) => selectedCategories.includes(category))
      ) {
        return false;
      }

      if (
        selectedMoods.length > 0 &&
        !product.attributes.moods.some((mood) => selectedMoods.includes(mood))
      ) {
        return false;
      }

      if (
        selectedSizes.length > 0 &&
        !product.sizeBuckets.some((size) => selectedSizes.includes(size))
      ) {
        return false;
      }

      if (
        selectedMaterials.length > 0 &&
        !product.attributes.materials.some((material) =>
          selectedMaterials.includes(material)
        )
      ) {
        return false;
      }

      if (
        selectedColors.length > 0 &&
        !product.attributes.colors.some((color) => selectedColors.includes(color))
      ) {
        return false;
      }

      if (product.price === null) {
        return !hasPriceFilter;
      }

      return product.price >= priceMin && product.price <= priceMax;
    });
  }, [
    products,
    selectedCategories,
    selectedMoods,
    selectedSizes,
    selectedMaterials,
    selectedColors,
    hasPriceFilter,
    priceMin,
    priceMax,
  ]);

  const sortedProducts = useMemo(() => {
    const sortable = [...filteredProducts];
    sortable.sort((first, second) => {
      switch (sortBy) {
        case "price": {
          const firstPrice = first.price ?? Number.POSITIVE_INFINITY;
          const secondPrice = second.price ?? Number.POSITIVE_INFINITY;
          return firstPrice - secondPrice;
        }
        case "date-added": {
          const firstDate = first.dateCreated
            ? new Date(first.dateCreated).getTime()
            : first.id;
          const secondDate = second.dateCreated
            ? new Date(second.dateCreated).getTime()
            : second.id;
          return secondDate - firstDate;
        }
        case "popularity": {
          const firstScore = first.averageRating * Math.max(first.reviewCount, 1);
          const secondScore = second.averageRating * Math.max(second.reviewCount, 1);
          return secondScore - firstScore;
        }
        case "size": {
          return getSizeRank(first) - getSizeRank(second);
        }
        case "best-selling": {
          if (second.totalSales !== first.totalSales) {
            return second.totalSales - first.totalSales;
          }
          return second.reviewCount - first.reviewCount;
        }
        default:
          return 0;
      }
    });
    return sortable;
  }, [filteredProducts, sortBy]);

  useEffect(() => {
    if (!openToolbarMenu) return;

    const onMouseDown = (event: MouseEvent) => {
      if (!toolbarMenusRef.current) return;
      if (toolbarMenusRef.current.contains(event.target as Node)) return;
      setOpenToolbarMenu(null);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenToolbarMenu(null);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openToolbarMenu]);

  useEffect(() => {
    if (!isPriceSliderDragging) return;

    const stopDragging = () => setIsPriceSliderDragging(false);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [isPriceSliderDragging]);

  const selectedSortLabel =
    SORT_OPTIONS.find((option) => option.id === sortBy)?.label ?? "By Date Added";
  const selectedPerPageLabel = `${productsPerPage}`;
  const selectedPerRowLabel = `${productsPerRow}`;
  const sliderHighlightColor = isPriceSliderDragging ? "#292929" : "#a7a39a";
  const sliderInputStyle = {
    "--slider-thumb-color": sliderHighlightColor,
    accentColor: sliderHighlightColor,
  } as React.CSSProperties;

  const activeFilterCount =
    selectedCategories.length +
    selectedMoods.length +
    selectedSizes.length +
    selectedMaterials.length +
    selectedColors.length +
    (hasPriceFilter ? 1 : 0);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / productsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * productsPerPage;
    return sortedProducts.slice(startIndex, startIndex + productsPerPage);
  }, [sortedProducts, safeCurrentPage, productsPerPage]);

  const paginationWindow = useMemo(() => {
    const start = Math.max(1, safeCurrentPage - 2);
    const end = Math.min(totalPages, safeCurrentPage + 2);
    const pages: number[] = [];

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [safeCurrentPage, totalPages]);

  const firstVisibleIndex =
    sortedProducts.length === 0 ? 0 : (safeCurrentPage - 1) * productsPerPage + 1;
  const lastVisibleIndex = Math.min(
    safeCurrentPage * productsPerPage,
    sortedProducts.length
  );

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedMoods([]);
    setSelectedSizes([]);
    setSelectedMaterials([]);
    setSelectedColors([]);
    setPriceMin(minAvailablePrice);
    setPriceMax(maxAvailablePrice);
    setCurrentPage(1);
  };

  return (
    <main className="bg-[#f4f2ee] px-6 py-10 md:px-12 md:py-14 lg:px-24">
      <section className="mx-auto max-w-[1440px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-[42px] leading-none text-[#1f1f1f] md:text-[60px]">
            Handmade Canvas Paintings
          </h1>
          <p className="max-w-xl text-sm text-[#5f5a52]">
            Discover Original Artworks And Handcrafted Canvas Paintings From Our
            Curated WooCommerce Collection.
          </p>
        </div>

        {loadError ? (
          <div className="border border-[#1f1f1f]/10 bg-white px-6 py-8 text-[#5f5a52]">
            <p className="font-semibold text-[#222]">Could Not Load Products</p>
            <p className="mt-2 text-sm">{loadError}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="border border-[#1f1f1f]/10 bg-white px-6 py-8 text-[#5f5a52]">
            <p className="font-semibold text-[#222]">No Products Found</p>
            <p className="mt-2 text-sm">
              Your WooCommerce Store Returned An Empty Product List.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="h-fit rounded-[12px] border border-[#1f1f1f]/12 bg-transparent p-4 lg:sticky lg:top-28">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-[22px] font-semibold text-[#1f1f1f]">Filters</h2>
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-[#1f1f1f] px-2 py-0.5 text-[11px] font-semibold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full border border-[#1f1f1f]/15 px-3 py-1 text-[11px] font-semibold text-[#5f5a52] transition-colors hover:border-[#1f1f1f]/35 hover:text-black"
                >
                  Clear All
                </button>
              </div>

              <div className="lg:max-h-[calc(100vh-13rem)] lg:overflow-y-hidden lg:pr-1 lg:hover:overflow-y-auto lg:[scrollbar-width:thin] lg:[&::-webkit-scrollbar]:w-1.5 lg:[&::-webkit-scrollbar-thumb]:rounded-full lg:[&::-webkit-scrollbar-thumb]:bg-[#1f1f1f]/25">
                <div className="space-y-4">
                  <div className="rounded-[12px] border border-[#1f1f1f]/12 bg-transparent p-4">
                  <h3 className="text-[14px] font-semibold text-[#24211d]">By Price</h3>
                  <p className="mt-1 text-xs text-[#7b7468]">Set Your Budget Range</p>

                  <div className="mt-4">
                    <div className="relative h-6">
                      <div
                        className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full"
                        style={{ backgroundColor: "#a7a39a" }}
                      />
                      <div
                        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
                        style={{
                          left: `${Math.max(0, rangeStartPercent)}%`,
                          width: `${Math.max(2, rangeEndPercent - rangeStartPercent)}%`,
                          backgroundColor: sliderHighlightColor,
                        }}
                      />

                      <input
                        type="range"
                        min={minAvailablePrice}
                        max={maxAvailablePrice}
                        step={100}
                        value={priceMin}
                        disabled={sliderDisabled}
                        onChange={(event) => {
                          const nextValue = Number(event.target.value);
                          setPriceMin(Math.min(nextValue, priceMax));
                        }}
                        onPointerDown={() => setIsPriceSliderDragging(true)}
                        style={sliderInputStyle}
                        className="slider-thin absolute inset-0 z-[2] h-6 w-full appearance-none bg-transparent disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      <input
                        type="range"
                        min={minAvailablePrice}
                        max={maxAvailablePrice}
                        step={100}
                        value={priceMax}
                        disabled={sliderDisabled}
                        onChange={(event) => {
                          const nextValue = Number(event.target.value);
                          setPriceMax(Math.max(nextValue, priceMin));
                        }}
                        onPointerDown={() => setIsPriceSliderDragging(true)}
                        style={sliderInputStyle}
                        className="slider-thin absolute inset-0 z-[3] h-6 w-full appearance-none bg-transparent disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-[10px] border border-[#1f1f1f]/14 bg-transparent px-3 py-2">
                      <p className="text-[10px] text-[#7b7468]">Min Price</p>
                      <p className="mt-1 text-sm font-semibold text-[#1f1f1f]">
                        Rs. {formatNumber(priceMin)}
                      </p>
                    </div>
                    <div className="rounded-[10px] border border-[#1f1f1f]/14 bg-transparent px-3 py-2">
                      <p className="text-[10px] text-[#7b7468]">Max Price</p>
                      <p className="mt-1 text-sm font-semibold text-[#1f1f1f]">
                        Rs. {formatNumber(priceMax)}
                      </p>
                    </div>
                  </div>
                  </div>

                  <FilterChipGroup
                    title="By Category"
                    options={categoryOptions}
                    selected={selectedCategories}
                    onToggle={(value) =>
                      setSelectedCategories((current) => toggleSelection(current, value))
                    }
                  />

                  <FilterChipGroup
                    title="By Mood"
                    options={moodOptions}
                    selected={selectedMoods}
                    onToggle={(value) =>
                      setSelectedMoods((current) => toggleSelection(current, value))
                    }
                  />

                  <FilterChipGroup
                    title="By Sizes"
                    options={SIZE_FILTERS}
                    selected={selectedSizes}
                    onToggle={(value) =>
                      setSelectedSizes((current) =>
                        toggleSelection(current, value as SizeBucket) as SizeBucket[]
                      )
                    }
                    getCount={(value) => sizeCounts[value as SizeBucket] ?? 0}
                  />

                  <FilterChipGroup
                    title="By Material"
                    options={materialOptions}
                    selected={selectedMaterials}
                    onToggle={(value) =>
                      setSelectedMaterials((current) => toggleSelection(current, value))
                    }
                  />

                  <FilterChipGroup
                    title="By Colors"
                    options={colorOptions}
                    selected={selectedColors}
                    onToggle={(value) =>
                      setSelectedColors((current) => toggleSelection(current, value))
                    }
                  />
                </div>
              </div>
            </aside>

            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[#5f5a52]">
                  Showing{" "}
                  <span className="font-semibold text-[#1f1f1f]">
                    {firstVisibleIndex}-{lastVisibleIndex}
                  </span>{" "}
                  Of {sortedProducts.length} Products
                </p>

                <div ref={toolbarMenusRef} className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenToolbarMenu((menu) => (menu === "per-page" ? null : "per-page"))
                      }
                      aria-haspopup="menu"
                      aria-expanded={openToolbarMenu === "per-page"}
                      className="inline-flex items-center gap-2 rounded-[12px] border border-[#1f1f1f]/10 bg-transparent px-3 py-2 transition-colors hover:border-[#1f1f1f]/25"
                    >
                      <span className="text-xs font-semibold text-[#4f4b45]">Per Page</span>
                      <span className="text-sm font-medium text-[#1f1f1f]">
                        {selectedPerPageLabel}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#4f4b45] transition-transform ${
                          openToolbarMenu === "per-page" ? "rotate-180" : ""
                        }`}
                        strokeWidth={1.8}
                      />
                    </button>

                    {openToolbarMenu === "per-page" && (
                      <div
                        role="menu"
                        className="absolute right-0 top-full z-20 mt-2 min-w-[180px] rounded-[12px] border border-[#1f1f1f]/10 bg-[#f4f2ee] p-2 shadow-[0_18px_35px_rgba(0,0,0,0.08)]"
                      >
                        {PER_PAGE_OPTIONS.map((option) => {
                          const isSelected = productsPerPage === option;

                          return (
                            <button
                              key={option}
                              type="button"
                              role="menuitemradio"
                              aria-checked={isSelected}
                              onClick={() => {
                                setProductsPerPage(option);
                                setCurrentPage(1);
                                setOpenToolbarMenu(null);
                              }}
                              className={`block w-full rounded-[6px] px-3 py-2 text-left text-[14px] font-medium transition-colors ${
                                isSelected
                                  ? "bg-[#1f1f1f] text-white"
                                  : "text-[#333333] hover:bg-[#ece8df] hover:text-black"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenToolbarMenu((menu) => (menu === "per-row" ? null : "per-row"))
                      }
                      aria-haspopup="menu"
                      aria-expanded={openToolbarMenu === "per-row"}
                      className="inline-flex items-center gap-2 rounded-[12px] border border-[#1f1f1f]/10 bg-transparent px-3 py-2 transition-colors hover:border-[#1f1f1f]/25"
                    >
                      <span className="text-xs font-semibold text-[#4f4b45]">
                        Products Per Row
                      </span>
                      <span className="text-sm font-medium text-[#1f1f1f]">
                        {selectedPerRowLabel}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#4f4b45] transition-transform ${
                          openToolbarMenu === "per-row" ? "rotate-180" : ""
                        }`}
                        strokeWidth={1.8}
                      />
                    </button>

                    {openToolbarMenu === "per-row" && (
                      <div
                        role="menu"
                        className="absolute right-0 top-full z-20 mt-2 min-w-[220px] rounded-[12px] border border-[#1f1f1f]/10 bg-[#f4f2ee] p-2 shadow-[0_18px_35px_rgba(0,0,0,0.08)]"
                      >
                        {PRODUCTS_PER_ROW_OPTIONS.map((option) => {
                          const isSelected = productsPerRow === option;

                          return (
                            <button
                              key={option}
                              type="button"
                              role="menuitemradio"
                              aria-checked={isSelected}
                              onClick={() => {
                                setProductsPerRow(option);
                                setOpenToolbarMenu(null);
                              }}
                              className={`block w-full rounded-[6px] px-3 py-2 text-left text-[14px] font-medium transition-colors ${
                                isSelected
                                  ? "bg-[#1f1f1f] text-white"
                                  : "text-[#333333] hover:bg-[#ece8df] hover:text-black"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenToolbarMenu((menu) => (menu === "sort" ? null : "sort"))
                      }
                      aria-haspopup="menu"
                      aria-expanded={openToolbarMenu === "sort"}
                      className="inline-flex items-center gap-2 rounded-[12px] border border-[#1f1f1f]/10 bg-transparent px-3 py-2 transition-colors hover:border-[#1f1f1f]/25"
                    >
                      <span className="text-xs font-semibold text-[#4f4b45]">Sort By</span>
                      <span className="text-sm font-medium text-[#1f1f1f]">
                        {selectedSortLabel}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#4f4b45] transition-transform ${
                          openToolbarMenu === "sort" ? "rotate-180" : ""
                        }`}
                        strokeWidth={1.8}
                      />
                    </button>

                    {openToolbarMenu === "sort" && (
                      <div
                        role="menu"
                        className="absolute right-0 top-full z-20 mt-2 min-w-[220px] rounded-[12px] border border-[#1f1f1f]/10 bg-[#f4f2ee] p-2 shadow-[0_18px_35px_rgba(0,0,0,0.08)]"
                      >
                        {SORT_OPTIONS.map((option) => {
                          const isSelected = sortBy === option.id;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              role="menuitemradio"
                              aria-checked={isSelected}
                              onClick={() => {
                                setSortBy(option.id);
                                setCurrentPage(1);
                                setOpenToolbarMenu(null);
                              }}
                              className={`block w-full rounded-[6px] px-3 py-2 text-left text-[14px] font-medium transition-colors ${
                                isSelected
                                  ? "bg-[#1f1f1f] text-white"
                                  : "text-[#333333] hover:bg-[#ece8df] hover:text-black"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {sortedProducts.length === 0 ? (
                <div className="rounded-[12px] border border-[#1f1f1f]/10 bg-white px-6 py-10 text-center text-[#5f5a52]">
                  <p className="font-semibold text-[#222]">No Products Match These Filters</p>
                  <p className="mt-2 text-sm">Try Adjusting Your Filters Or Clear All Selections.</p>
                </div>
              ) : (
                <div
                  className={`grid ${getProductGridGapClassName(productsPerRow)} ${getProductGridClassName(productsPerRow)}`}
                >
                  {paginatedProducts.map((product) => {
                    const categoryLabel = product.categories[0] || "Artwork";
                    const paintingMetaLine = `Handmade Painting | ${getPaintingSizeLabel(
                      product
                    )} | Acrylic Colors on Canvas`;
                    const isSingleRowLayout = productsPerRow === 1;
                    const cardTypography = getCardTypography(productsPerRow);

                    return (
                      <article
                        key={product.id}
                        className={`group relative ${isSingleRowLayout ? "rounded-[12px] border border-[#1f1f1f]/10 bg-[#f7f5f0] p-3 sm:p-4" : "flex flex-col"}`}
                      >
                        <Link
                          href={`/shop/${product.slug}`}
                          aria-label={`Open ${product.name}`}
                          className="absolute inset-0 z-10"
                        />

                        <div
                          className={`relative z-0 ${
                            isSingleRowLayout
                              ? "grid grid-cols-[42%_58%] gap-4 sm:grid-cols-[34%_66%] md:grid-cols-[30%_70%]"
                              : ""
                          }`}
                        >
                          <div
                            className={`relative overflow-hidden rounded-[12px] bg-[#e7e3dc] ${
                              isSingleRowLayout ? "aspect-[4/5] h-full" : "aspect-square"
                            }`}
                          >
                            <Image
                              src={product.image}
                              alt={product.imageAlt || product.name}
                              fill
                              sizes={
                                isSingleRowLayout
                                  ? "(max-width: 768px) 42vw, (max-width: 1024px) 34vw, 30vw"
                                  : productsPerRow >= 5
                                    ? "(max-width: 640px) 100vw, (max-width: 1400px) 20vw, 16vw"
                                    : "(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              }
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>

                          <div className={isSingleRowLayout ? "" : "mt-4"}>
                            <p className={`${cardTypography.category} text-[#7a7368]`}>
                              {toTitleCase(categoryLabel)}
                            </p>
                            <h3
                              className={`mt-1 font-display leading-[1.32] text-[#1f1f1f] ${cardTypography.title}`}
                            >
                              {product.name}
                            </h3>
                            <p className={`mt-1 text-[#6f685f] ${cardTypography.meta}`}>
                              {paintingMetaLine}
                            </p>

                            <div className="mt-2 flex items-center gap-2">
                              {product.regularPrice &&
                                product.price !== null &&
                                product.regularPrice > product.price && (
                                  <span
                                    className={`${cardTypography.regularPrice} text-[#7a7368] line-through`}
                                  >
                                    {formatPrice(
                                      product.regularPrice,
                                      product.currencyCode,
                                      product.currencySymbol
                                    )}
                                  </span>
                                )}
                              <span
                                className={`${cardTypography.price} font-semibold leading-none text-[#27231f]`}
                              >
                                {formatPrice(
                                  product.price,
                                  product.currencyCode,
                                  product.currencySymbol
                                )}
                              </span>
                            </div>

                            <div className="relative z-20 mt-3 translate-y-1 opacity-0 transition-all duration-300 pointer-events-none group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto">
                              <AddToCartButton
                                id={product.id}
                                woocommerceProductId={product.id}
                                title={product.name}
                                image={product.image}
                                subtitle={paintingMetaLine}
                                price={product.price ?? undefined}
                                className={cardTypography.addToCart}
                              />
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {sortedProducts.length > 0 && totalPages > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-[#5f5a52]">
                    Page <span className="font-semibold text-[#1f1f1f]">{safeCurrentPage}</span> Of{" "}
                    <span className="font-semibold text-[#1f1f1f]">{totalPages}</span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={safeCurrentPage === 1}
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      className="rounded-[8px] border border-[#1f1f1f]/15 px-3 py-1.5 text-xs font-semibold text-[#4f4b45] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {paginationWindow.map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 min-w-8 rounded-[8px] px-2 text-xs font-semibold transition-colors ${
                          safeCurrentPage === page
                            ? "bg-[#1f1f1f] text-white"
                            : "border border-[#1f1f1f]/15 text-[#4f4b45] hover:border-[#1f1f1f]/30"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={safeCurrentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                      }
                      className="rounded-[8px] border border-[#1f1f1f]/15 px-3 py-1.5 text-xs font-semibold text-[#4f4b45] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
      <style jsx>{`
        .slider-thin {
          pointer-events: none;
        }

        .slider-thin::-webkit-slider-runnable-track {
          height: 1px;
          border-radius: 9999px;
          background: transparent;
        }

        .slider-thin::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          margin-top: -5px;
          height: 11px;
          width: 11px;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.72);
          background: var(--slider-thumb-color, #a7a39a);
          cursor: pointer;
        }

        .slider-thin::-moz-range-track {
          height: 1px;
          border-radius: 9999px;
          background: transparent;
        }

        .slider-thin::-moz-range-thumb {
          pointer-events: auto;
          height: 11px;
          width: 11px;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.72);
          background: var(--slider-thumb-color, #a7a39a);
          cursor: pointer;
        }
      `}</style>
    </main>
  );
};

export default ShopCatalog;
