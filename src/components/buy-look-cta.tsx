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

  const handleShareWhatsApp = () => {
    const itemList = items.map((item) => `- ${item.name}`).join("\n");
    const total = `R$ ${(totalPrice || 0).toFixed(2).replace(".", ",")}`;
    const lookUrl = pipeline.resultUrl || "https://virtual-tryon-paradise.vercel.app";

    const text = `Olha o look que montei no Provador Virtual da Paradise! 🛍️\n\n${itemList}\n\nTotal: ${total}\n\nVeja: ${lookUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleShareInstagram = () => {
    if (pipeline.resultUrl) {
      navigator.clipboard.writeText(pipeline.resultUrl).then(() => {
        showToast("Link copiado! Cole nos seus Stories do Instagram");
      }).catch(() => {
        window.open(pipeline.resultUrl!, "_blank");
      });
    }
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

      {/* Share + Download */}
      <div className="flex gap-2 lg:gap-3">
        <button
          onClick={handleShareWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-sm font-medium hover:bg-[#25D366]/20 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </button>
        <button
          onClick={handleShareInstagram}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#E4405F]/10 border border-[#E4405F]/20 text-[#E4405F] text-sm font-medium hover:bg-[#E4405F]/20 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          Instagram
        </button>
        {pipeline.resultUrl && (
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
            Baixar
          </button>
        )}
      </div>

      {/* Rating */}
      <div className="border-t border-white/10 pt-2">
        <ResultRating pipelineId={pipeline.jobId} />
      </div>
    </div>
  );
}
