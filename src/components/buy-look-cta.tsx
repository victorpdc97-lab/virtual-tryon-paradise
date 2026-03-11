"use client";

import { useTryOnStore } from "@/store/use-tryon-store";

export function BuyLookCta() {
  const { pipeline, getSelectedList, resetPipeline, clearItems } = useTryOnStore();
  const items = getSelectedList();

  if (pipeline.status !== "completed" || items.length === 0) return null;

  const totalPrice = items.reduce(
    (sum, item) => sum + (item.promoPrice ?? item.price),
    0
  );

  const handleNewLook = () => {
    resetPipeline();
    clearItems();
  };

  return (
    <div className="bg-gradient-to-br from-teal-400/10 to-teal-600/5 border border-teal-400/20 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-semibold text-lg">Gostou do look?</h3>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-white/70">{item.name}</span>
            <span className="text-teal-400">
              R$ {(item.promoPrice ?? item.price).toFixed(2).replace(".", ",")}
            </span>
          </div>
        ))}
        <div className="border-t border-white/10 pt-2 flex justify-between">
          <span className="text-white font-medium">Total</span>
          <span className="text-teal-400 font-bold text-lg">
            R$ {totalPrice.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <a
          href="https://paradisemultimarcas.lojavirtualnuvem.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-black font-bold text-sm text-center hover:from-teal-400 hover:to-teal-300 transition-all"
        >
          Comprar na Loja
        </a>
        <button
          onClick={handleNewLook}
          className="px-5 py-3.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-all text-sm"
        >
          Novo Look
        </button>
      </div>

      {pipeline.resultUrl && (
        <a
          href={pipeline.resultUrl}
          download="meu-look-paradise.jpg"
          className="block w-full text-center text-sm text-white/40 hover:text-teal-400 transition-colors"
        >
          Baixar imagem do look
        </a>
      )}
    </div>
  );
}
