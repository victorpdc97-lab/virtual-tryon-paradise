"use client";

import { useMemo } from "react";
import type { Analytics } from "../types";
import { cardBg, textPrimary, textSecondary, textMuted } from "../utils";
import { StatCard } from "./stat-card";

interface ConversionTabProps {
  analytics: Analytics;
  isDark: boolean;
}

export function ConversionTab({ analytics, isDark }: ConversionTabProps) {
  return (
    <div className="space-y-6">
      {/* Overall stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Try-Ons" value={analytics.totalTryOns} icon="✨" color="teal" isDark={isDark} />
        <StatCard label="Cliques Compra" value={analytics.totalBuyClicks} icon="🛒" color="amber" isDark={isDark} />
        <StatCard label="Conversao Geral" value={`${analytics.overallConversion}%`} icon="📈" color="green" isDark={isDark} />
      </div>

      {/* Scatter Plot */}
      <ScatterPlot analytics={analytics} isDark={isDark} />

      {/* Per-product conversion */}
      <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>💰</span> Conversao por Produto
        </h3>
        {analytics.conversionRates.length === 0 ? (
          <p className={`text-sm text-center py-8 ${textMuted(isDark)}`}>
            Sem dados de conversao ainda (precisa de try-ons + cliques de compra)
          </p>
        ) : (
          <div className="space-y-3">
            {analytics.conversionRates.map((product) => (
              <div
                key={product.productId}
                className={`flex items-center gap-4 rounded-xl p-4 ${isDark ? "bg-white/[0.02]" : "bg-gray-50"}`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${textSecondary(isDark)}`}>{product.productName}</p>
                  <div className="flex gap-4 mt-1">
                    <span className={`text-xs ${textMuted(isDark)}`}>{product.tryOnCount} try-ons</span>
                    <span className={`text-xs ${textMuted(isDark)}`}>{product.buyClickCount} cliques</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-lg font-bold ${
                      product.conversionRate >= 50
                        ? "text-green-400"
                        : product.conversionRate >= 25
                        ? "text-amber-400"
                        : isDark ? "text-white/50" : "text-gray-400"
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

/* ──────────── Scatter Plot: Try-Ons vs Buy Clicks ──────────── */

function ScatterPlot({ analytics, isDark }: { analytics: Analytics; isDark: boolean }) {
  const products = useMemo(() => {
    return analytics.topTried.filter((p) => p.tryOnCount > 0);
  }, [analytics.topTried]);

  const maxTryOns = useMemo(() => Math.max(...products.map((p) => p.tryOnCount), 1), [products]);
  const maxClicks = useMemo(() => Math.max(...products.map((p) => p.buyClickCount), 1), [products]);

  const W = 500;
  const H = 300;
  const PAD_L = 45;
  const PAD_R = 15;
  const PAD_TOP = 15;
  const PAD_BOTTOM = 35;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  const points = useMemo(() => {
    return products.map((p) => ({
      x: PAD_L + (p.tryOnCount / maxTryOns) * chartW,
      y: PAD_TOP + chartH - (p.buyClickCount / maxClicks) * chartH,
      name: p.productName,
      tryOns: p.tryOnCount,
      clicks: p.buyClickCount,
      rate: p.tryOnCount > 0 ? Math.round((p.buyClickCount / p.tryOnCount) * 100) : 0,
    }));
  }, [products, maxTryOns, maxClicks, chartW, chartH]);

  const labelColor = isDark ? "white" : "#6b7280";
  const gridColor = isDark ? "white" : "#d1d5db";
  const gridOpacity = isDark ? 0.05 : 0.3;

  if (products.length === 0) {
    return (
      <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>🔬</span> Try-Ons vs Cliques de Compra
        </h3>
        <p className={`text-sm text-center py-8 ${textMuted(isDark)}`}>Sem dados suficientes</p>
      </div>
    );
  }

  // Y-axis labels
  const ySteps = [0, 0.25, 0.5, 0.75, 1];
  // X-axis labels
  const xSteps = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>🔬</span> Try-Ons vs Cliques de Compra
        </h3>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className={textMuted(isDark)}>Alta conversao</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className={textMuted(isDark)}>Media</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className={textMuted(isDark)}>Baixa/zero</span>
          </span>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          {/* Grid */}
          {ySteps.map((pct) => {
            const y = PAD_TOP + chartH - pct * chartH;
            return (
              <line key={`y-${pct}`} x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke={gridColor} strokeOpacity={gridOpacity} />
            );
          })}
          {xSteps.map((pct) => {
            const x = PAD_L + pct * chartW;
            return (
              <line key={`x-${pct}`} x1={x} y1={PAD_TOP} x2={x} y2={PAD_TOP + chartH} stroke={gridColor} strokeOpacity={gridOpacity} />
            );
          })}

          {/* Y-axis labels */}
          {ySteps.map((pct) => {
            const y = PAD_TOP + chartH - pct * chartH;
            const val = Math.round(pct * maxClicks);
            return (
              <text key={`yl-${pct}`} x={PAD_L - 8} y={y + 4} textAnchor="end" fill={labelColor} fillOpacity={isDark ? 0.3 : 0.6} fontSize={10}>
                {val}
              </text>
            );
          })}

          {/* X-axis labels */}
          {xSteps.map((pct) => {
            const x = PAD_L + pct * chartW;
            const val = Math.round(pct * maxTryOns);
            return (
              <text key={`xl-${pct}`} x={x} y={H - 8} textAnchor="middle" fill={labelColor} fillOpacity={isDark ? 0.3 : 0.6} fontSize={10}>
                {val}
              </text>
            );
          })}

          {/* Axis labels */}
          <text x={W / 2} y={H - 0} textAnchor="middle" fill={labelColor} fillOpacity={isDark ? 0.4 : 0.7} fontSize={11}>
            Try-Ons
          </text>
          <text x={12} y={H / 2} textAnchor="middle" fill={labelColor} fillOpacity={isDark ? 0.4 : 0.7} fontSize={11} transform={`rotate(-90, 12, ${H / 2})`}>
            Cliques
          </text>

          {/* Data points */}
          {points.map((p, i) => {
            const dotColor =
              p.rate >= 50 ? "#4ade80" : p.rate >= 25 ? "#fbbf24" : "#f87171";
            const r = Math.max(4, Math.min(10, p.tryOns / maxTryOns * 8 + 4));
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={r} fill={dotColor} fillOpacity={0.7} stroke={dotColor} strokeWidth={1} strokeOpacity={0.3} />
                {/* Label for larger dots or few products */}
                {(products.length <= 10 || p.tryOns >= maxTryOns * 0.5) && (
                  <text
                    x={p.x}
                    y={p.y - r - 4}
                    textAnchor="middle"
                    fill={labelColor}
                    fillOpacity={isDark ? 0.5 : 0.7}
                    fontSize={9}
                  >
                    {p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
