"use client";

import type { Analytics } from "../types";
import { StatCard } from "./stat-card";

interface ConversionTabProps {
  analytics: Analytics;
}

export function ConversionTab({ analytics }: ConversionTabProps) {
  return (
    <div className="space-y-6">
      {/* Overall stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Try-Ons" value={analytics.totalTryOns} icon="✨" color="teal" />
        <StatCard label="Cliques Compra" value={analytics.totalBuyClicks} icon="🛒" color="amber" />
        <StatCard label="Conversao Geral" value={`${analytics.overallConversion}%`} icon="📈" color="green" />
      </div>

      {/* Per-product conversion */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span>💰</span> Conversao por Produto
        </h3>
        {analytics.conversionRates.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">
            Sem dados de conversao ainda (precisa de try-ons + cliques de compra)
          </p>
        ) : (
          <div className="space-y-3">
            {analytics.conversionRates.map((product) => (
              <div
                key={product.productId}
                className="flex items-center gap-4 bg-white/[0.02] rounded-xl p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm truncate">{product.productName}</p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-white/30 text-xs">
                      {product.tryOnCount} try-ons
                    </span>
                    <span className="text-white/30 text-xs">
                      {product.buyClickCount} cliques
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-lg font-bold ${
                      product.conversionRate >= 50
                        ? "text-green-400"
                        : product.conversionRate >= 25
                        ? "text-amber-400"
                        : "text-white/50"
                    }`}
                  >
                    {product.conversionRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
