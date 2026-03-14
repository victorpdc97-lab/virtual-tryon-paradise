"use client";

import Image from "next/image";
import { useTryOnStore } from "@/store/use-tryon-store";
import type { GarmentCategory } from "@/types";

function SlotIcon({ type, className }: { type: string; className?: string }) {
  const cn = className || "w-5 h-5";
  switch (type) {
    case "tops":
      return <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M6 4l-4 4 2 2 2-1v11h12V9l2 1 2-2-4-4H6z" strokeLinejoin="round" /></svg>;
    case "bottoms":
      return <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M6 4h12v6l-2 10h-3l-1-8-1 8H8L6 10V4z" strokeLinejoin="round" /></svg>;
    case "shoes":
      return <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M3 16l2-4c1-2 3-3 5-3h2l4 1c2 0 4 1 5 3v3H3z" strokeLinejoin="round" /></svg>;
    default:
      return null;
  }
}

const SLOTS: Array<{ category: GarmentCategory; label: string }> = [
  { category: "tops", label: "Parte de cima" },
  { category: "bottoms", label: "Parte de baixo" },
  { category: "shoes", label: "Calçado" },
];

interface LookBuilderProps {
  onTryOn: () => void;
  disabled?: boolean;
}

export function LookBuilder({ onTryOn, disabled }: LookBuilderProps) {
  const { selectedItems, removeItem, getSelectedCount } = useTryOnStore();
  const count = getSelectedCount();

  const totalPrice = (() => {
    let sum = 0;
    if (selectedItems.tops) sum += selectedItems.tops.promoPrice ?? selectedItems.tops.price ?? 0;
    if (selectedItems.bottoms) sum += selectedItems.bottoms.promoPrice ?? selectedItems.bottoms.price ?? 0;
    if (selectedItems.shoes) sum += selectedItems.shoes.promoPrice ?? selectedItems.shoes.price ?? 0;
    return sum;
  })();

  const totalOriginal = (() => {
    let sum = 0;
    if (selectedItems.tops) sum += selectedItems.tops.price ?? 0;
    if (selectedItems.bottoms) sum += selectedItems.bottoms.price ?? 0;
    if (selectedItems.shoes) sum += selectedItems.shoes.price ?? 0;
    return sum;
  })();

  const savings = totalOriginal - totalPrice;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-4">
      <h3 className="text-white font-semibold flex items-center gap-2">
        Seu Look
        {count > 0 && (
          <span className="ml-auto bg-teal-400/20 text-teal-400 text-xs px-2 py-0.5 rounded-full">
            {count} {count === 1 ? "peça" : "peças"}
          </span>
        )}
      </h3>

      <div className="space-y-2">
        {SLOTS.map(({ category, label }) => {
          const item = selectedItems[category];
          return (
            <div
              key={category}
              className={`flex items-center gap-3 rounded-lg p-3 transition-all duration-300 ${
                item
                  ? "bg-teal-400/5 border border-teal-400/20 hover:bg-teal-400/10"
                  : "bg-white/[0.02] border border-dashed border-white/10 hover:border-white/20"
              }`}
            >
              {item ? (
                <>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm truncate">{item.name}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-teal-400 text-xs">
                        R$ {(item.promoPrice ?? item.price ?? 0).toFixed(2).replace(".", ",")}
                      </p>
                      {item.promoPrice !== null && item.promoPrice < (item.price ?? 0) && (
                        <span className="text-[10px] bg-amber-400/15 text-amber-400 px-1.5 py-0.5 rounded font-medium">
                          Promo
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(category)}
                    aria-label={`Remover ${item.name}`}
                    className="text-white/30 hover:text-red-400 transition-colors p-2.5 -mr-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 flex items-center justify-center text-white/25">
                    <SlotIcon type={category} className="w-6 h-6" />
                  </div>
                  <p className="text-white/40 text-sm">{label}</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {count > 0 && (
        <div className="pt-2 border-t border-white/5">
          <div className="space-y-1 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Total do look</span>
              <span className="text-white font-semibold">
                R$ {(totalPrice || 0).toFixed(2).replace(".", ",")}
              </span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-emerald-400/60">Economia</span>
                <span className="text-emerald-400 font-medium">
                  -R$ {savings.toFixed(2).replace(".", ",")}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onTryOn}
            disabled={disabled}
            className="w-full py-3.5 rounded-lg bg-teal-400 text-black font-bold text-sm hover:bg-teal-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Experimentar Look
          </button>
        </div>
      )}
    </div>
  );
}
