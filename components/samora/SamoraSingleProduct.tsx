"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import SamoraProductCard, { type SamoraProduct } from "@/components/samora/SamoraProductCard";
import { useCurrency } from "@/components/currency/CurrencyProvider";

type SamoraVariation = {
  id: number;
  attributes: { name: string; value: string }[];
  price: number | null;
  regularPrice: number | null;
  inStock: boolean;
};

export type SamoraProductDetail = {
  id: number;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  sku: string;
  images: { id: number; src: string; alt: string }[];
  attributes: { id: number; name: string; options: string[] }[];
  price: number | null;
  regularPrice: number | null;
  currencySymbol: string;
  onSale: boolean;
  stockStatus: string;
  averageRating: number;
  reviewCount: number;
  variations: SamoraVariation[];
};

const FALLBACK_IMAGE = "/images/product-ship.png";

const SamoraSingleProduct = ({
  product,
  relatedProducts,
}: {
  product: SamoraProductDetail;
  relatedProducts: SamoraProduct[];
}) => {
  const { formatPrice } = useCurrency();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const variationAttributeNames = useMemo(() => {
    const names = new Set<string>();
    product.variations.forEach((variation) =>
      variation.attributes.forEach((attr) => attr.name && names.add(attr.name))
    );
    return Array.from(names);
  }, [product.variations]);

  const variationOptionsByName = useMemo(() => {
    const map = new Map<string, string[]>();
    variationAttributeNames.forEach((name) => {
      const options = Array.from(
        new Set(
          product.variations
            .flatMap((variation) => variation.attributes)
            .filter((attr) => attr.name === name)
            .map((attr) => attr.value)
            .filter(Boolean)
        )
      );
      map.set(name, options);
    });
    return map;
  }, [product.variations, variationAttributeNames]);

  const infoAttributes = product.attributes.filter(
    (attribute) => !variationAttributeNames.includes(attribute.name) && attribute.options.length > 0
  );

  const matchedVariation = useMemo(() => {
    if (variationAttributeNames.length === 0) return null;
    if (variationAttributeNames.some((name) => !selectedOptions[name])) return null;

    return (
      product.variations.find((variation) =>
        variationAttributeNames.every(
          (name) =>
            variation.attributes.find((attr) => attr.name === name)?.value === selectedOptions[name]
        )
      ) ?? null
    );
  }, [product.variations, variationAttributeNames, selectedOptions]);

  const needsSelection = variationAttributeNames.length > 0 && !matchedVariation;
  const effectivePrice = matchedVariation?.price ?? product.price;
  const effectiveRegularPrice = matchedVariation?.regularPrice ?? product.regularPrice;
  const isOnSale =
    effectivePrice !== null && effectiveRegularPrice !== null && effectivePrice < effectiveRegularPrice;
  const isOutOfStock = matchedVariation ? !matchedVariation.inStock : product.stockStatus === "outofstock";

  const images = product.images.length > 0 ? product.images : [{ id: 0, src: FALLBACK_IMAGE, alt: product.name }];
  const activeImage = images[activeImageIndex] ?? images[0];

  const cartItemId = matchedVariation ? `${product.id}-${matchedVariation.id}` : product.id;

  return (
    <main className="mx-auto max-w-[1320px] px-5 py-10 md:px-10 md:py-14">
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-[#f3ead9]">
            <Image
              src={activeImage.src}
              alt={activeImage.alt}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {images.length > 1 ? (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image.id || image.src}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-[12px] border ${
                    index === activeImageIndex ? "border-[#c1683d]" : "border-[#2b2420]/10"
                  }`}
                >
                  <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Details */}
        <div>
          <h1 className="font-samora-display text-[30px] leading-[1.12] text-[#2b2420] sm:text-[36px]">
            {product.name}
          </h1>

          {product.reviewCount > 0 ? (
            <div className="mt-3 flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-[#c1683d] text-[#c1683d]" strokeWidth={0} />
              <span className="text-[14px] font-medium text-[#2b2420]">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-[13px] text-[#8a7c68]">({product.reviewCount} reviews)</span>
            </div>
          ) : null}

          <div className="mt-5 flex items-baseline gap-3">
            {effectivePrice !== null ? (
              <span className="text-[24px] font-semibold text-[#2b2420]">
                {formatPrice(effectivePrice)}
              </span>
            ) : (
              <span className="text-[16px] text-[#5c5344]">Price on request</span>
            )}
            {isOnSale && effectiveRegularPrice !== null ? (
              <span className="text-[16px] text-[#8a7c68] line-through">
                {formatPrice(effectiveRegularPrice)}
              </span>
            ) : null}
          </div>

          {product.shortDescription ? (
            <div
              className="samora-product-content mt-5 text-[15px] leading-[1.7] text-[#5c5344]"
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />
          ) : null}

          {variationAttributeNames.length > 0 ? (
            <div className="mt-7 flex flex-col gap-5">
              {variationAttributeNames.map((name) => (
                <div key={name}>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#8a7c68]">
                    {name}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {(variationOptionsByName.get(name) ?? []).map((option) => {
                      const isSelected = selectedOptions[name] === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setSelectedOptions((prev) => ({ ...prev, [name]: option }))
                          }
                          className={`rounded-full border px-4 py-2 text-[13.5px] font-medium transition-colors ${
                            isSelected
                              ? "border-[#c1683d] bg-[#c1683d] text-white"
                              : "border-[#2b2420]/20 text-[#2b2420] hover:border-[#2b2420]/40"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {infoAttributes.length > 0 ? (
            <div className="mt-7 space-y-2 border-t border-[#2b2420]/10 pt-6">
              {infoAttributes.map((attribute) => (
                <p key={attribute.id} className="text-[14px] text-[#5c5344]">
                  <span className="font-medium text-[#2b2420]">{attribute.name}:</span>{" "}
                  {attribute.options.join(", ")}
                </p>
              ))}
            </div>
          ) : null}

          <div className="mt-8">
            {isOutOfStock ? (
              <span className="inline-flex items-center rounded-full border border-[#2b2420]/20 px-6 py-3 text-[14px] font-medium text-[#8a7c68]">
                Out of Stock
              </span>
            ) : needsSelection ? (
              <span className="inline-flex items-center rounded-full border border-[#2b2420]/20 px-6 py-3 text-[14px] font-medium text-[#8a7c68]">
                Select options to continue
              </span>
            ) : (
              <AddToCartButton
                id={cartItemId}
                woocommerceProductId={product.id}
                woocommerceVariationId={matchedVariation?.id}
                title={product.name}
                image={activeImage.src}
                subtitle={
                  matchedVariation
                    ? matchedVariation.attributes.map((attr) => attr.value).join(" / ")
                    : undefined
                }
                price={effectivePrice ?? undefined}
                className="!rounded-full !border-[#c1683d] !px-7 !py-3.5 !text-[14.5px] !font-medium !normal-case !tracking-normal !text-[#c1683d] hover:!bg-[#c1683d] hover:!text-white"
              />
            )}
          </div>
        </div>
      </div>

      {product.description ? (
        <div className="mt-14 border-t border-[#2b2420]/10 pt-10 md:mt-16 md:pt-12">
          <h2 className="font-samora-display text-[24px] text-[#2b2420] md:text-[28px]">
            Product Details
          </h2>
          <div
            className="samora-product-content mt-4 max-w-[820px] text-[15px] leading-[1.75] text-[#5c5344]"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      ) : null}

      {relatedProducts.length > 0 ? (
        <div className="mt-14 border-t border-[#2b2420]/10 pt-10 md:mt-16 md:pt-12">
          <h2 className="font-samora-display text-[24px] text-[#2b2420] md:text-[28px]">
            More from Samora
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <SamoraProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default SamoraSingleProduct;
