"use client";

import type { FunnelCounts } from "../types";
import { cardBg, textPrimary, textSecondary, textMuted, barBg } from "../utils";

interface Props {
  funnel: FunnelCounts;
  isDark: boolean;
}

const STEPS: Array<{ key: keyof FunnelCounts; label: string; icon: string; color: string }> = [
  { key: "lead_signup", label: "Cadastrou", icon: "👤", color: "bg-teal-400" },
  { key: "photo_upload", label: "Enviou Foto", icon: "📷", color: "bg-sky-400" },
  { key: "look_selected", label: "Montou Look", icon: "👗", color: "bg-violet-400" },
  { key: "tryon_started", label: "Iniciou Try-On", icon: "🚀", color: "bg-purple-400" },
  { key: "tryon_completed", label: "Completou Try-On", icon: "✅", color: "bg-green-400" },
  { key: "buy_click", label: "Clicou Comprar", icon: "🛒", color: "bg-amber-400" },
];

export function GranularFunnel({ funnel, isDark }: Props) {
  const maxValue = Math.max(...STEPS.map((s) => funnel[s.key] || 0), 1);

  // Find biggest drop-off
  let biggestDrop = { from: "", to: "", pct: 0 };
  for (let i = 1; i < STEPS.length; i++) {
    const prev = funnel[STEPS[i - 1].key] || 0;
    const curr = funnel[STEPS[i].key] || 0;
    if (prev > 0) {
      const dropPct = Math.round(((prev - curr) / prev) * 100);
      if (dropPct > biggestDrop.pct) {
        biggestDrop = { from: STEPS[i - 1].label, to: STEPS[i].label, pct: dropPct };
      }
    }
  }

  const hasData = STEPS.some((s) => funnel[s.key] > 0);

  return (
    <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h3 className={`font-semibold flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>🔬</span> Funil Detalhado
        </h3>
        {biggestDrop.pct > 0 && (
          <span className="text-xs bg-red-400/10 text-red-400 px-2.5 py-1 rounded-full">
            Maior perda: {biggestDrop.from} → {biggestDrop.to} ({biggestDrop.pct}%)
          </span>
        )}
      </div>

      {!hasData ? (
        <p className={`text-sm text-center py-8 ${textMuted(isDark)}`}>
          Sem dados de funil ainda — aparece apos os primeiros cadastros
        </p>
      ) : (
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const value = funnel[step.key] || 0;
            const width = Math.max((value / maxValue) * 100, 4);
            const prevValue = i > 0 ? funnel[STEPS[i - 1].key] || 0 : null;
            const convRate = prevValue && prevValue > 0
              ? Math.round((value / prevValue) * 100)
              : null;
            const dropoff = prevValue && prevValue > 0
              ? prevValue - value
              : null;

            return (
              <div key={step.key}>
                <div className="flex items-center gap-3">
                  <div className="w-32 sm:w-40 shrink-0 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm">{step.icon}</span>
                      <span className={`text-sm font-medium ${textSecondary(isDark)}`}>{step.label}</span>
                    </div>
                    {convRate !== null && (
                      <p className={`text-xs ${convRate < 50 ? "text-red-400/70" : convRate < 75 ? "text-amber-400/70" : "text-green-400/70"}`}>
                        {convRate}% do anterior
                      </p>
                    )}
                  </div>
                  <div className={`flex-1 h-9 rounded-lg overflow-hidden ${barBg(isDark)}`}>
                    <div
                      className={`h-full ${step.color} rounded-lg flex items-center justify-end pr-3 transition-all duration-500`}
                      style={{ width: `${width}%` }}
                    >
                      <span className="text-black text-xs font-bold">{value}</span>
                    </div>
                  </div>
                  {dropoff !== null && dropoff > 0 && (
                    <span className={`text-xs shrink-0 w-16 text-right ${textMuted(isDark)}`}>
                      -{dropoff}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* End-to-end conversion */}
      {funnel.lead_signup > 0 && funnel.buy_click > 0 && (
        <div className={`mt-4 pt-4 border-t flex items-center justify-between ${isDark ? "border-white/5" : "border-gray-100"}`}>
          <span className={`text-sm ${textMuted(isDark)}`}>Cadastro → Compra (end-to-end)</span>
          <span className="text-green-400 font-bold text-lg">
            {Math.round((funnel.buy_click / funnel.lead_signup) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
