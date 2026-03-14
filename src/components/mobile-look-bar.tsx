"use client";

import Image from "next/image";
import { useTryOnStore } from "@/store/use-tryon-store";
import type { GarmentCategory } from "@/types";

interface MobileLookBarProps {
  onTryOn: () => void;
  disabled?: boolean;
}

const SLOT_ICONS: Record<GarmentCategory, string> = {
  tops: "👕",
  bottoms: "👖",
  shoes: "👟",
};

export function MobileLookBar({ onTryOn, disabled }: MobileLookBarProps) {
  const { selectedItems, getSelectedCount, removeItem } = useTryOnStore();
  const count = getSelectedCount();

  if (count === 0) return null;

  const slots: GarmentCategory[] = ["tops", "bottoms", "shoes"];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden animate-slideInUp">
      <div className="bg-[#111]/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 safe-area-pb">
        <div className="flex items-center gap-3">
          {/* Selected items preview */}
          <div className="flex gap-2 flex-1 min-w-0">
            {slots.map((cat) => {
              const item = selectedItems[cat];
              return (
                <div key={cat} className="relative">
                  {item ? (
                    <div className="relative">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-lg object-cover border border-teal-400/30"
                      />
                      <button
                        onClick={() => removeItem(cat)}
                        aria-label={`Remover ${item.name}`}
                        className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center active:scale-90 hover:bg-red-400 transition-all shadow-lg shadow-black/30"
                      >
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-lg border border-dashed border-white/15 flex items-center justify-center text-lg">
                      {SLOT_ICONS[cat]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Try on button */}
          <button
            onClick={onTryOn}
            disabled={disabled}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-black font-bold text-sm whitespace-nowrap hover:from-teal-400 hover:to-teal-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Experimentar ({count})
          </button>
        </div>
      </div>
    </div>
  );
}
