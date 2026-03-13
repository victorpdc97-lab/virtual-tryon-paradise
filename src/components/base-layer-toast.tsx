"use client";

import { useEffect, useState } from "react";
import { useTryOnStore } from "@/store/use-tryon-store";

interface BaseLayerToastProps {
  onChangeTap: () => void;
}

export function BaseLayerToast({ onChangeTap }: BaseLayerToastProps) {
  const { showBaseToast, baseLayer, dismissBaseToast } = useTryOnStore();
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showBaseToast && baseLayer) {
      setVisible(true);
      setProgress(100);

      const start = Date.now();
      const duration = 5000;

      const interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);

        if (elapsed >= duration) {
          clearInterval(interval);
          setVisible(false);
          dismissBaseToast();
        }
      }, 50);

      return () => clearInterval(interval);
    } else {
      setVisible(false);
    }
  }, [showBaseToast, baseLayer, dismissBaseToast]);

  if (!visible || !baseLayer) return null;

  const handleTap = () => {
    setVisible(false);
    dismissBaseToast();
    onChangeTap();
  };

  return (
    <button
      onClick={handleTap}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-black/90 backdrop-blur-xl border border-white/15 rounded-2xl px-5 py-3.5 shadow-2xl shadow-black/50 max-w-[90vw] animate-slideUp"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-400/20 flex items-center justify-center shrink-0">
          <span className="text-base">👕</span>
        </div>
        <div className="text-left">
          <p className="text-white/90 text-xs font-medium">
            {baseLayer.name.length > 30 ? baseLayer.name.slice(0, 30) + "..." : baseLayer.name} adicionada como base
          </p>
          <p className="text-teal-400 text-[10px]">Toque para trocar</p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-2 h-0.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-400/60 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </button>
  );
}
