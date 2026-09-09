"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Gift, Sparkles } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { type SamoraProduct } from "@/components/samora/SamoraProductCard";
import { HAMPER_COUPON_CODE, HAMPER_DISCOUNT_PERCENT, HAMPER_MIN_DISTINCT_ITEMS } from "@/lib/samora/pricing";

const SamoraHamperBuilder = ({ products }: { products: SamoraProduct[] }) => {
  const router = useRouter();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const selectedProducts = useMemo(
    () => products.filter((product) => selectedIds.has(product.id)),
    [products, selectedIds]
  );
  const selectedCount = selectedProducts.length;
  const remaining = Math.max(0, HAMPER_MIN_DISTINCT_ITEMS - selectedCount);
  const isUnlocked = selectedCount >= HAMPER_MIN_DISTINCT_ITEMS;
  const selectedSubtotal = selectedProducts.reduce((sum, product) => sum + (product.price ?? 0), 0);

  const toggleProduct = (id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddHamperToCart = () => {
    if (selectedCount === 0) return;
    selectedProducts.forEach((product) => {
      addItem(
        {
          id: product.id,
          woocommerceProductId: product.id,
          title: product.name,
          image: product.image,
          price: product.price ?? 0,
        },
        1
      );
    });
    const query = isUnlocked ? `?coupon=${HAMPER_COUPON_CODE}` : "";
    router.push(`/samora/checkout${query}`);
  };

  return (
    <main className="bg-[#fbf6ef]">
      <section className="mx-auto max-w-[1320px] px-5 pb-8 pt-14 md:px-10 md:pt-20">
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c1683d]">
          Build Your Own Hamper
        </p>
        <h1 className="font-samora-display mt-4 max-w-[680px] text-[32px] leading-[1.12] text-[#2b2420] sm:text-[38px] md:text-[46px]">
          Pick {HAMPER_MIN_DISTINCT_ITEMS} or more pieces, get {HAMPER_DISCOUNT_PERCENT}% off the whole hamper
        </h1>
        <p className="mt-4 max-w-[600px] text-[16px] leading-[1.7] text-[#5c5344]">
          Mix and match totes, coasters, trays, and name plates into one gift-ready set. The
          discount applies automatically once you&apos;ve picked {HAMPER_MIN_DISTINCT_ITEMS}{" "}
          different pieces.
        </p>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 pb-32 md:px-10 md:pb-16">
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => {
            const isSelected = selectedIds.has(product.id);
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => toggleProduct(product.id)}
                className={`group flex flex-col overflow-hidden rounded-[16px] border bg-[#fbf6ef] text-left transition-colors ${
                  isSelected ? "border-[#c1683d]" : "border-[#2b2420]/10 hover:border-[#2b2420]/25"
                }`}
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#f3ead9]">
                  <Image
                    src={product.image}
                    alt={product.imageAlt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <span
                    className={`absolute right-2.5 top-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                      isSelected
                        ? "border-[#c1683d] bg-[#c1683d] text-white"
                        : "border-[#2b2420]/20 bg-white/85 text-transparent"
                    }`}
                  >
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <h3 className="text-[14.5px] font-medium leading-snug text-[#2b2420]">
                    {product.name}
                  </h3>
                  {product.price !== null ? (
                    <span className="mt-auto text-[14.5px] font-semibold text-[#c1683d]">
                      {formatPrice(product.price)}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sticky hamper tray */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#2b2420]/10 bg-[#fbf6ef]/97 backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-10">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${
                isUnlocked ? "bg-[#c1683d]" : "bg-[#2b2420]/10"
              }`}
            >
              {isUnlocked ? (
                <Sparkles className="h-5 w-5 text-white" strokeWidth={1.75} />
              ) : (
                <Gift className="h-5 w-5 text-[#2b2420]" strokeWidth={1.75} />
              )}
            </span>
            <div>
              <p className="text-[14.5px] font-semibold text-[#2b2420]">
                {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
                {selectedSubtotal > 0 ? ` · ${formatPrice(selectedSubtotal)}` : ""}
              </p>
              <p className="text-[13px] text-[#5c5344]">
                {isUnlocked
                  ? `${HAMPER_DISCOUNT_PERCENT}% hamper discount unlocked!`
                  : `Add ${remaining} more ${remaining === 1 ? "item" : "items"} to unlock ${HAMPER_DISCOUNT_PERCENT}% off`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddHamperToCart}
            disabled={selectedCount === 0}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#2b2420] px-6 py-3 text-[14.5px] font-medium text-white transition-colors hover:bg-[#1c1712] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isUnlocked ? "Checkout with 20% Off" : "Add Hamper to Cart"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default SamoraHamperBuilder;
