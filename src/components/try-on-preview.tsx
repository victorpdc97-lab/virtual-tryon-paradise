"use client";

import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { useTryOnStore } from "@/store/use-tryon-store";

export function TryOnPreview() {
  const { photoUrl, pipeline } = useTryOnStore();

  if (!photoUrl || !pipeline.resultUrl) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold text-lg flex items-center gap-2">
        <span className="text-xl">👀</span>
        Resultado — Antes & Depois
      </h3>

      <div className="rounded-2xl overflow-hidden border border-white/10">
        <ReactCompareSlider
          itemOne={
            <ReactCompareSliderImage
              src={photoUrl}
              alt="Antes"
              style={{ objectFit: "contain", background: "#0a0a0a" }}
            />
          }
          itemTwo={
            <ReactCompareSliderImage
              src={pipeline.resultUrl}
              alt="Depois - com look"
              style={{ objectFit: "contain", background: "#0a0a0a" }}
            />
          }
          style={{ height: "500px" }}
        />
      </div>

      <div className="flex justify-between text-xs text-white/30 px-2">
        <span>← Foto original</span>
        <span>Arraste para comparar</span>
        <span>Com o look →</span>
      </div>
    </div>
  );
}
