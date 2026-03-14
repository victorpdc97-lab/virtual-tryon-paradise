"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTryOnStore } from "@/store/use-tryon-store";

const ReactCompareSlider = dynamic(
  () => import("react-compare-slider").then((mod) => mod.ReactCompareSlider),
  { ssr: false }
);

const ReactCompareSliderImage = dynamic(
  () => import("react-compare-slider").then((mod) => mod.ReactCompareSliderImage),
  { ssr: false }
);

type ViewMode = "slider" | "sideBySide";

export function TryOnPreview() {
  const { photoUrl, pipeline } = useTryOnStore();
  const [viewMode, setViewMode] = useState<ViewMode>("slider");

  if (!photoUrl || !pipeline.resultUrl) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-lg lg:text-xl flex items-center gap-2">
          <span className="text-xl">👀</span>
          Resultado — Antes & Depois
        </h3>

        {/* Desktop view mode toggle */}
        <div className="hidden lg:flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
          <button
            onClick={() => setViewMode("slider")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === "slider"
                ? "bg-teal-400/20 text-teal-400"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            Slider
          </button>
          <button
            onClick={() => setViewMode("sideBySide")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === "sideBySide"
                ? "bg-teal-400/20 text-teal-400"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            Lado a lado
          </button>
        </div>
      </div>

      {viewMode === "slider" ? (
        <>
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
              className="h-[300px] sm:h-[400px] lg:h-[600px] xl:h-[700px]"
            />
          </div>
          <div className="flex justify-between text-xs lg:text-sm text-white/30 px-2">
            <span>← Foto original</span>
            <span>Arraste para comparar</span>
            <span>Com o look →</span>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
            <div className="text-center text-white/30 text-xs py-2 border-b border-white/5">Antes</div>
            <img
              src={photoUrl}
              alt="Antes"
              className="w-full h-[250px] sm:h-[350px] lg:h-[550px] xl:h-[650px] object-contain"
            />
          </div>
          <div className="rounded-2xl overflow-hidden border border-teal-400/20 bg-[#0a0a0a]">
            <div className="text-center text-teal-400/60 text-xs py-2 border-b border-teal-400/10">Com o look</div>
            <img
              src={pipeline.resultUrl}
              alt="Depois - com look"
              className="w-full h-[250px] sm:h-[350px] lg:h-[550px] xl:h-[650px] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
