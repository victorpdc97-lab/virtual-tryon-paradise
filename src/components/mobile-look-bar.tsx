"use client";

import Image from "next/image";
import { useTryOnStore } from "@/store/use-tryon-store";
import type { GarmentCategory } from "@/types";

interface MobileLookBarProps {
  onTryOn: () => void;
  disabled?: boolean;
}

function SlotSvg({ type }: { type: string }) {
  switch (type) {
    case "tops":
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M6 4l-4 4 2 2 2-1v11h12V9l2 1 2-2-4-4H6z" strokeLinejoin="round" /></svg>;
    case "bottoms":
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M6 4h12v6l-2 10h-3l-1-8-1 8H8L6 10V4z" strokeLinejoin="round" /></svg>;
    case "shoes":
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M3 16l2-4c1-2 3-3 5-3h2l4 1c2 0 4 1 5 3v3H3z" strokeLinejoin="round" /></svg>;
    default:
      return null;
  }
}

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
                    <div className="w-11 h-11 rounded-lg border border-dashed border-white/15 flex items-center justify-center text-white/20">
                      <SlotSvg type={cat} />
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
            className="px-5 py-3 rounded-lg bg-teal-400 text-black font-bold text-sm whitespace-nowrap hover:bg-teal-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Experimentar ({count})
          </button>
        </div>
      </div>
    </div>
  );
}
