"use client";

import { useTryOnStore } from "@/store/use-tryon-store";

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

  return (
    <div className="bg-gradient-to-br from-teal-400/10 to-teal-600/5 border border-teal-400/20 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-semibold text-lg">Gostou do look?</h3>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-3"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-14 h-14 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm truncate">{item.name}</p>
              <p className="text-teal-400 text-sm font-medium">
                R$ {(item.promoPrice ?? item.price ?? 0).toFixed(2).replace(".", ",")}
              </p>
            </div>
            <a
              href={item.nuvemshopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-4 py-2 rounded-lg bg-teal-400 text-black text-xs font-bold hover:bg-teal-300 transition-colors"
            >
              Comprar
            </a>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-3 flex justify-between items-center">
        <span className="text-white/40 text-sm">Total do look</span>
        <span className="text-teal-400 font-bold text-lg">
          R$ {(totalPrice || 0).toFixed(2).replace(".", ",")}
        </span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            for (const item of items) {
              window.open(item.nuvemshopUrl, "_blank");
            }
          }}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-black font-bold text-sm text-center hover:from-teal-400 hover:to-teal-300 transition-all"
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
