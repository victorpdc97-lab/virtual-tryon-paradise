"use client";

import Image from "next/image";
import { useTryOnStore } from "@/store/use-tryon-store";
import type { Product } from "@/types";
import { showToast } from "./toast";
import { ResultRating } from "./result-rating";

function trackBuy(item: Product) {
  fetch("/api/track-buy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: item.id, productName: item.name }),
  }).catch(() => {});
}

export function BuyLookCta() {
  const { pipeline, getSelectedList, resetPipeline, clearItems } = useTryOnStore();
  const items = getSelectedList();

  if (pipeline.status !== "completed" || items.length === 0) return null;

  const totalPrice = items.reduce(
    (sum, item) => sum + (item.promoPrice ?? item.price ?? 0),
    0
  );

  const handleNewLook = () => {
    resetPipeline();
    clearItems();
  };

  const handleBuyAll = () => {
    items.forEach(trackBuy);
    for (const item of items) {
      window.open(item.nuvemshopUrl, "_blank");
    }
  };

  const handleBuySingle = (item: Product) => {
    trackBuy(item);
    window.open(item.nuvemshopUrl, "_blank");
  };


  return (
    <div className="bg-gradient-to-br from-teal-400/10 to-teal-600/5 border border-teal-400/20 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-semibold text-lg lg:text-xl">Gostou do look?</h3>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-3"
          >
            <Image
              src={item.image}
              alt={item.name}
              width={56}
              height={56}
              className="w-14 h-14 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm truncate">{item.name}</p>
              <p className="text-teal-400 text-sm font-medium">
                R$ {(item.promoPrice ?? item.price ?? 0).toFixed(2).replace(".", ",")}
              </p>
            </div>
            <button
              onClick={() => handleBuySingle(item)}
              className="shrink-0 px-4 py-2 rounded-lg bg-teal-400 text-black text-xs font-bold hover:bg-teal-300 transition-colors"
            >
              Comprar
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-3 flex justify-between items-center">
        <span className="text-white/40 text-sm">Total do look ({items.length} {items.length === 1 ? "peça" : "peças"})</span>
        <span className="text-teal-400 font-bold text-lg lg:text-xl">
          R$ {(totalPrice || 0).toFixed(2).replace(".", ",")}
        </span>
      </div>

      {/* Main actions */}
      <div className="flex gap-3">
        <button
          onClick={handleBuyAll}
          className="flex-1 py-3.5 lg:py-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-black font-bold text-sm lg:text-base text-center hover:from-teal-400 hover:to-teal-300 transition-all active:scale-95 hover:shadow-lg hover:shadow-teal-400/20"
        >
          Comprar Tudo
        </button>
        <button
          onClick={handleNewLook}
          className="px-5 py-3.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-all text-sm"
        >
          Novo Look
        </button>
      </div>

      {/* Download */}
      {pipeline.resultUrl && (
        <div className="flex gap-2 lg:gap-3">
          <button
            onClick={async () => {
              try {
                const res = await fetch(pipeline.resultUrl!);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "meu-look-paradise.jpg";
                a.click();
                URL.revokeObjectURL(url);
                showToast("Imagem baixada!");
              } catch {
                window.open(pipeline.resultUrl!, "_blank");
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm font-medium hover:bg-white/10 hover:text-white/70 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar imagem
          </button>
        </div>
      )}

      {/* Rating */}
      <div className="border-t border-white/10 pt-2">
        <ResultRating pipelineId={pipeline.jobId} />
      </div>
    </div>
  );
}
