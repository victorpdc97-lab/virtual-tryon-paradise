"use client";

import type { ProductStat } from "../types";
import { textPrimary, textSecondary, textMuted, barBg } from "../utils";

interface Props {
  product: ProductStat;
  isDark: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, isDark, onClose }: Props) {
  const conversionRate = product.tryOnCount > 0
    ? Math.round((product.buyClickCount / product.tryOnCount) * 100)
    : 0;
  const costEstimate = (product.tryOnCount * 1.5).toFixed(2).replace(".", ",");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-2xl border p-6 space-y-5 animate-scaleIn ${
          isDark ? "bg-[#111] border-white/10" : "bg-white border-gray-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={`font-bold text-lg ${textPrimary(isDark)}`}>{product.productName}</h3>
            <p className={`text-xs ${textMuted(isDark)}`}>ID: {product.productId}</p>
          </div>
          <button
            onClick={onClose}
            className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isDark ? "hover:bg-white/10 text-white/40" : "hover:bg-gray-100 text-gray-400"
            }`}
          >
            ✕
          </button>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetricBox label="Try-Ons" value={product.tryOnCount} isDark={isDark} />
          <MetricBox label="Cliques Compra" value={product.buyClickCount} isDark={isDark} />
          <MetricBox label="Conversao" value={`${conversionRate}%`} isDark={isDark} color={
            conversionRate >= 50 ? "text-green-400" : conversionRate >= 25 ? "text-amber-400" : undefined
          } />
          <MetricBox label="Custo Estimado" value={`R$ ${costEstimate}`} isDark={isDark} />
        </div>

        {/* Conversion bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs ${textMuted(isDark)}`}>Taxa de conversao</span>
            <span className={`text-xs font-medium ${textSecondary(isDark)}`}>{conversionRate}%</span>
          </div>
          <div className={`h-2.5 rounded-full overflow-hidden ${barBg(isDark)}`}>
            <div
              className={`h-full rounded-full transition-all ${
                conversionRate >= 50 ? "bg-green-400" : conversionRate >= 25 ? "bg-amber-400" : "bg-red-400"
              }`}
              style={{ width: `${Math.max(conversionRate, 2)}%` }}
            />
          </div>
        </div>

        {/* Status */}
        {product.tryOnCount >= 3 && product.buyClickCount === 0 && (
          <div className={`rounded-lg p-3 text-sm ${isDark ? "bg-amber-400/5 text-amber-400" : "bg-amber-50 text-amber-600"}`}>
            ⚠️ Produto experimentado {product.tryOnCount}x mas sem cliques de compra. Verifique preco ou CTA.
          </div>
        )}

        <button
          onClick={onClose}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
            isDark
              ? "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
              : "bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

function MetricBox({ label, value, isDark, color }: { label: string; value: string | number; isDark: boolean; color?: string }) {
  return (
    <div className={`rounded-xl p-3 ${isDark ? "bg-white/[0.03]" : "bg-gray-50"}`}>
      <p className={`text-xs ${textMuted(isDark)}`}>{label}</p>
      <p className={`text-lg font-bold mt-1 ${color || textPrimary(isDark)}`}>{value}</p>
    </div>
  );
}
