"use client";

import Image from "next/image";
import { useTryOnStore } from "@/store/use-tryon-store";
import type { GarmentCategory } from "@/types";

const SLOTS: Array<{ category: GarmentCategory; label: string; icon: string }> = [
  { category: "tops", label: "Parte de cima", icon: "👕" },
  { category: "bottoms", label: "Parte de baixo", icon: "👖" },
  { category: "shoes", label: "Calçado", icon: "👟" },
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

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
      <h3 className="text-white font-semibold flex items-center gap-2">
        <span className="text-xl">✨</span>
        Seu Look
        {count > 0 && (
          <span className="ml-auto bg-teal-400/20 text-teal-400 text-xs px-2 py-0.5 rounded-full">
            {count} {count === 1 ? "peça" : "peças"}
          </span>
        )}
      </h3>

      <div className="space-y-2">
        {SLOTS.map(({ category, label, icon }) => {
          const item = selectedItems[category];
          return (
            <div
              key={category}
              className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
                item
                  ? "bg-teal-400/5 border border-teal-400/20"
                  : "bg-white/[0.02] border border-dashed border-white/10"
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
                    <p className="text-teal-400 text-xs">
                      R$ {(item.promoPrice ?? item.price ?? 0).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(category)}
                    className="text-white/30 hover:text-red-400 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <span className="text-2xl w-12 text-center">{icon}</span>
                  <p className="text-white/40 text-sm">{label}</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {count > 0 && (
        <div className="pt-2 border-t border-white/5">
          <div className="flex justify-between text-sm mb-4">
            <span className="text-white/40">Total do look</span>
            <span className="text-white font-semibold">
              R$ {(totalPrice || 0).toFixed(2).replace(".", ",")}
            </span>
          </div>

          <button
            onClick={onTryOn}
            disabled={disabled}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-black font-bold text-sm hover:from-teal-400 hover:to-teal-300 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✨ Experimentar Look
          </button>
        </div>
      )}
    </div>
  );
}
