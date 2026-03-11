"use client";

import { useEffect } from "react";
import type { Product } from "@/types";

interface ProductZoomModalProps {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  tops: "Parte de Cima",
  bottoms: "Parte de Baixo",
  shoes: "Calçado",
};

export function ProductZoomModal({ product, isSelected, onSelect, onClose }: ProductZoomModalProps) {
  const displayPrice = product.promoPrice ?? product.price ?? 0;
  const hasPromo = product.promoPrice !== null && product.promoPrice < (product.price ?? 0);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#111] border border-white/10 rounded-2xl overflow-hidden max-w-md w-full max-h-[90vh] animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <div className="aspect-square bg-white/5">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Details */}
        <div className="p-5 space-y-4">
          <div>
            <span className="text-teal-400 text-xs font-medium uppercase tracking-wider">
              {CATEGORY_LABELS[product.category] || product.category}
            </span>
            <h3 className="text-white font-semibold text-lg mt-1">{product.name}</h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-teal-400 font-bold text-2xl">
              R$ {(displayPrice || 0).toFixed(2).replace(".", ",")}
            </span>
            {hasPromo && (
              <span className="text-white/30 text-sm line-through">
                R$ {(product.price || 0).toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>

          <button
            onClick={() => {
              onSelect();
              onClose();
            }}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
              isSelected
                ? "bg-white/10 border border-white/20 text-white/70 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                : "bg-gradient-to-r from-teal-500 to-teal-400 text-black hover:from-teal-400 hover:to-teal-300"
            }`}
          >
            {isSelected ? "Remover do Look" : "Adicionar ao Look"}
          </button>
        </div>
      </div>
    </div>
  );
}
