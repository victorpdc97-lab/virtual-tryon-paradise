"use client";

import { memo, useState } from "react";
import Image from "next/image";
import type { Product } from "@/types";
import { useTryOnStore } from "@/store/use-tryon-store";
import { ProductZoomModal } from "./product-zoom-modal";
import { showToast } from "./toast";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const { selectedItems, selectItem, removeItem } = useTryOnStore();
  const isSelected = selectedItems[product.category]?.id === product.id;
  const [showZoom, setShowZoom] = useState(false);
  const [justSelected, setJustSelected] = useState(false);

  const handleClick = () => {
    if (isSelected) {
      removeItem(product.category);
      showToast(`${product.name} removido`, "info");
    } else {
      selectItem(product);
      setJustSelected(true);
      setTimeout(() => setJustSelected(false), 400);
      showToast(`${product.name} adicionado ao look`);
    }
  };

  const handleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowZoom(true);
  };

  const displayPrice = product.promoPrice ?? product.price ?? 0;
  const hasPromo = product.promoPrice !== null && product.promoPrice < (product.price ?? 0);

  return (
    <>
      <button
        onClick={handleClick}
        className={`group relative rounded-xl overflow-hidden border transition-all duration-300 text-left active:scale-95 focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none ${
          isSelected
            ? "border-teal-400 ring-2 ring-teal-400/30 scale-[1.02] shadow-lg shadow-teal-400/10"
            : "border-white/10 hover:border-white/25 hover:shadow-xl hover:shadow-teal-400/10 lg:hover:scale-[1.04] hover:bg-white/[0.02]"
        }`}
      >
        {isSelected && (
          <div className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-teal-400 flex items-center justify-center ${justSelected ? "animate-checkPop" : ""}`}>
            <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {/* Zoom button — min 44x44 touch target */}
        <button
          onClick={handleZoom}
          aria-label={`Ampliar ${product.name}`}
          className="absolute top-1.5 left-1.5 z-10 w-9 h-9 rounded-full bg-black/70 flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity active:scale-90 hover:bg-black/90"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>

        <div className="aspect-square bg-white/5 overflow-hidden relative">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover lg:group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            placeholder="empty"
          />
        </div>

        <div className="p-3">
          <p className="text-white/80 text-sm font-medium truncate">{product.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-teal-400 font-semibold text-sm">
              R$ {(displayPrice || 0).toFixed(2).replace(".", ",")}
            </span>
            {hasPromo && (
              <span className="text-white/40 text-xs line-through">
                R$ {(product.price || 0).toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>
        </div>
      </button>

      {showZoom && (
        <ProductZoomModal
          product={product}
          isSelected={isSelected}
          onSelect={handleClick}
          onClose={() => setShowZoom(false)}
        />
      )}
    </>
  );
});
