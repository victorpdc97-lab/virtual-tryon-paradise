"use client";

import type { Product } from "@/types";
import { useTryOnStore } from "@/store/use-tryon-store";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { selectedItems, selectItem, removeItem } = useTryOnStore();
  const isSelected = selectedItems[product.category]?.id === product.id;

  const handleClick = () => {
    if (isSelected) {
      removeItem(product.category);
    } else {
      selectItem(product);
    }
  };

  const displayPrice = product.promoPrice ?? product.price;
  const hasPromo = product.promoPrice !== null && product.promoPrice < product.price;

  return (
    <button
      onClick={handleClick}
      className={`group relative rounded-xl overflow-hidden border transition-all text-left ${
        isSelected
          ? "border-teal-400 ring-2 ring-teal-400/30 scale-[1.02]"
          : "border-white/10 hover:border-white/25"
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-teal-400 flex items-center justify-center">
          <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div className="aspect-square bg-white/5 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      <div className="p-3">
        <p className="text-white/80 text-sm font-medium truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-teal-400 font-semibold text-sm">
            R$ {displayPrice.toFixed(2).replace(".", ",")}
          </span>
          {hasPromo && (
            <span className="text-white/30 text-xs line-through">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
