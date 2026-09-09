"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";

const SamoraWishlistClient = () => {
  const { addItem } = useCart();
  const currency = useCurrency();
  const { items: allItems, removeItem } = useWishlist();

  // The wishlist is shared across both storefronts (same account, same
  // localStorage list) — scope this page to Samora items only, the same way
  // the navbar's wishlist count does.
  const items = allItems.filter((item) => item.href?.startsWith("/samora/shop/"));

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[65vh] w-full max-w-[1320px] flex-col items-center justify-center px-5 py-16 text-center md:px-10">
        <div className="mb-6 rounded-full bg-[#f3ead9] p-6">
          <Heart className="h-10 w-10 text-[#8a7c68]" strokeWidth={1.5} />
        </div>
        <h1 className="font-samora-display text-[32px] leading-[1.15] text-[#2b2420] sm:text-[38px]">
          Your Wishlist Is Empty
        </h1>
        <p className="mt-4 max-w-[440px] text-[16px] leading-[1.7] text-[#5c5344]">
          Save handcrafted pieces you love and come back to them anytime.
        </p>
        <Link
          href="/samora/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#c1683d] px-6 py-3 text-[14.5px] font-medium text-white transition-colors hover:bg-[#a8552f]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Explore the Collection
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1320px] px-5 py-12 md:px-10 md:py-16">
      <div className="mb-10">
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c1683d]">
          Wishlist
        </p>
        <h1 className="font-samora-display mt-3 text-[32px] leading-[1.15] text-[#2b2420] sm:text-[38px]">
          Saved Pieces
        </h1>
        <p className="mt-2 text-[15px] text-[#5c5344]">
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      <div className="space-y-5">
        {items.map((item) => {
          const formattedPrice =
            typeof item.price === "number" ? currency.formatPrice(item.price) : null;

          return (
            <article
              key={item.id}
              className="flex flex-col gap-4 border-b border-[#2b2420]/10 pb-5 sm:flex-row sm:gap-6"
            >
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[14px] bg-[#f3ead9]">
                <Image src={item.image} alt={item.title} fill sizes="112px" className="object-cover" />
              </div>

              <div className="flex flex-1 flex-col justify-between gap-4">
                <div>
                  <h2 className="font-samora-display text-[19px] text-[#2b2420]">{item.title}</h2>
                  {item.subtitle ? (
                    <p className="mt-1 text-[13.5px] text-[#8a7c68]">{item.subtitle}</p>
                  ) : null}
                  {formattedPrice ? (
                    <p className="mt-2 text-[14.5px] font-semibold text-[#c1683d]">{formattedPrice}</p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <button
                    type="button"
                    onClick={() => addItem({ id: item.id, title: item.title, image: item.image, price: item.price ?? 0 }, 1)}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#2b2420] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1c1712] sm:w-auto"
                  >
                    <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
                    Add to Cart
                  </button>

                  {item.href ? (
                    <Link
                      href={item.href}
                      className="min-h-[44px] w-full px-1 text-center text-[14px] font-medium text-[#3f382f] underline underline-offset-4 hover:text-[#c1683d] sm:w-auto sm:text-left"
                    >
                      View Product
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full px-3 text-[14px] text-[#8a7c68] transition-colors hover:bg-[#f3ead9] hover:text-[#2b2420] sm:w-auto sm:justify-start"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    Remove
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Link
        href="/samora/shop"
        className="mt-10 inline-flex items-center gap-2 text-[14.5px] font-medium text-[#3f382f] transition-colors hover:text-[#c1683d]"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Continue Shopping
      </Link>
    </main>
  );
};

export default SamoraWishlistClient;
