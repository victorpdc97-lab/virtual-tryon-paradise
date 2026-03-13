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
  overlays: "🧥",
};

export function MobileLookBar({ onTryOn, disabled }: MobileLookBarProps) {
  const { selectedItems, getSelectedCount, removeItem, baseLayer } = useTryOnStore();
  const count = getSelectedCount();
  const hasOverlay = !!selectedItems.overlays;

  if (count === 0) return null;

  const slots: GarmentCategory[] = ["tops", "bottoms", "shoes"];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="bg-[#111]/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 safe-area-pb">
        <div className="flex items-center gap-3">
          {/* Selected items preview */}
          <div className="flex gap-2 flex-1 min-w-0">
            {hasOverlay ? (
              <>
                {/* Base layer mini */}
                {baseLayer ? (
                  <div className="relative">
                    <Image
                      src={baseLayer.image}
                      alt={baseLayer.name}
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-lg object-cover border border-white/20"
                    />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[7px] bg-amber-400/90 text-black font-bold px-1 rounded">
                      BASE
                    </span>
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-lg border border-dashed border-white/15 flex items-center justify-center text-lg animate-pulse">
                    👕
                  </div>
                )}
                {/* Overlay */}
                <div className="relative">
                  <Image
                    src={selectedItems.overlays!.image}
                    alt={selectedItems.overlays!.name}
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-lg object-cover border border-teal-400/30"
                  />
                  <button
                    onClick={() => removeItem("overlays")}
                    aria-label={`Remover ${selectedItems.overlays!.name}`}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center active:scale-90 hover:bg-red-400 transition-all"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              /* Normal top slot */
              (() => {
                const item = selectedItems.tops;
                return (
                  <div className="relative">
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
                          onClick={() => removeItem("tops")}
                          aria-label={`Remover ${item.name}`}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center active:scale-90 hover:bg-red-400 transition-all"
                        >
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-lg border border-dashed border-white/15 flex items-center justify-center text-lg">
                        👕
                      </div>
                    )}
                  </div>
                );
              })()
            )}

            {/* Bottom and shoes slots */}
            {(["bottoms", "shoes"] as GarmentCategory[]).map((cat) => {
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
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center active:scale-90 hover:bg-red-400 transition-all"
                      >
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
