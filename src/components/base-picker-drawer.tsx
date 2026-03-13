"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { Product } from "@/types";
import { useTryOnStore } from "@/store/use-tryon-store";

interface BasePickerDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function BasePickerDrawer({ open, onClose }: BasePickerDrawerProps) {
  const { setBaseLayer } = useTryOnStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTops = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?category=tops&page=1");
      if (!res.ok) return;
      const data = await res.json();
      // Only simple tops (the API already filters out overlays when category=tops)
      setProducts(data.products || []);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchTops();
  }, [open, fetchTops]);

  const handleSelect = (product: Product) => {
    setBaseLayer(product);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-[#111] border-t border-white/10 rounded-t-3xl animate-slideUp max-h-[70vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-white/5">
          <h3 className="text-white font-semibold text-sm">Escolha a base do blazer</h3>
          <p className="text-white/40 text-xs mt-0.5">Selecione uma camiseta ou camisa para usar por baixo</p>
        </div>

        {/* Products grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-white/10 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-white/[0.04]" />
                  <div className="p-2 space-y-1">
                    <div className="h-3 bg-white/[0.06] rounded w-3/4" />
                    <div className="h-2 bg-white/[0.04] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="rounded-xl border border-white/10 overflow-hidden hover:border-teal-400/50 transition-all active:scale-95 text-left"
                >
                  <div className="aspect-square bg-white/5 overflow-hidden relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="33vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-white/70 text-[10px] truncate">{product.name}</p>
                    <p className="text-teal-400 text-[10px] font-semibold">
                      R$ {(product.promoPrice ?? product.price ?? 0).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-all active:scale-[0.98]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
