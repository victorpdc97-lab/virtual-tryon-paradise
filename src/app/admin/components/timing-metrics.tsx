"use client";

import type { TimingStat } from "../types";
import { cardBg, textPrimary, textSecondary, textMuted, barBg } from "../utils";

interface Props {
  timingStats: Record<string, TimingStat>;
  processingDistribution: { under60: number; under120: number; over120: number };
  avgProcessingTime: number | null;
  avgDailyTryOns: number;
  credits: number;
  isDark: boolean;
}

const STEP_LABELS: Record<string, { label: string; icon: string }> = {
  upload: { label: "Upload + Compressao", icon: "📤" },
  selection: { label: "Selecao de Look", icon: "👗" },
  processing: { label: "Processamento IA", icon: "🤖" },
};

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function TimingMetrics({ timingStats, processingDistribution, avgProcessingTime, avgDailyTryOns, credits, isDark }: Props) {
  const steps = Object.entries(timingStats);
  const hasData = steps.length > 0;
  const distTotal = processingDistribution.under60 + processingDistribution.under120 + processingDistribution.over120;

  // Credits projection
  const creditsPerTryOn = 4; // tryon-max uses 4 credits
  const dailyCreditBurn = avgDailyTryOns * creditsPerTryOn;
  const daysRemaining = dailyCreditBurn > 0 && credits > 0
    ? Math.round(credits / dailyCreditBurn)
    : null;

  return (
    <div className="space-y-4">
      {/* Step Timing Cards */}
      <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>⏱️</span> Tempo por Etapa
        </h3>

        {!hasData ? (
          <p className={`text-sm text-center py-6 ${textMuted(isDark)}`}>
            Sem dados de timing ainda — aparece apos os primeiros try-ons
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {steps.map(([step, stat]) => {
              const info = STEP_LABELS[step] || { label: step, icon: "📊" };
              return (
                <div key={step} className={`rounded-xl p-4 ${isDark ? "bg-white/[0.03]" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{info.icon}</span>
                    <span className={`text-sm font-medium ${textSecondary(isDark)}`}>{info.label}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${textMuted(isDark)}`}>Media</span>
                      <span className="text-teal-400 font-bold text-sm">{formatMs(stat.avg)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${textMuted(isDark)}`}>P50</span>
                      <span className={`text-sm font-medium ${textSecondary(isDark)}`}>{formatMs(stat.p50)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${textMuted(isDark)}`}>P90</span>
                      <span className={`text-sm font-medium ${stat.p90 > stat.avg * 2 ? "text-amber-400" : textSecondary(isDark)}`}>
                        {formatMs(stat.p90)}
                      </span>
                    </div>
                    <div className={`text-xs text-center pt-1 border-t ${isDark ? "border-white/5" : "border-gray-200"} ${textMuted(isDark)}`}>
                      {stat.count} amostras
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Processing Distribution + Credits Projection side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Distribution */}
        <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textPrimary(isDark)}`}>
            <span>📊</span> Distribuicao de Tempo
          </h3>

          {distTotal === 0 ? (
            <p className={`text-sm text-center py-6 ${textMuted(isDark)}`}>Sem dados</p>
          ) : (
            <div className="space-y-3">
              <DistBar label="< 60s" value={processingDistribution.under60} total={distTotal} color="bg-green-400" isDark={isDark} />
              <DistBar label="60s-120s" value={processingDistribution.under120} total={distTotal} color="bg-amber-400" isDark={isDark} />
              <DistBar label="> 120s" value={processingDistribution.over120} total={distTotal} color="bg-red-400" isDark={isDark} />
              {avgProcessingTime !== null && (
                <div className={`mt-3 pt-3 border-t flex items-center justify-between ${isDark ? "border-white/5" : "border-gray-100"}`}>
                  <span className={`text-xs ${textMuted(isDark)}`}>Tempo medio geral</span>
                  <span className="text-teal-400 font-bold">{avgProcessingTime}s</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Credits Projection */}
        <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textPrimary(isDark)}`}>
            <span>🔮</span> Projecao de Creditos
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${textMuted(isDark)}`}>Creditos atuais</span>
              <span className={`text-lg font-bold ${credits < 50 ? "text-red-400" : credits < 100 ? "text-amber-400" : "text-green-400"}`}>
                {credits >= 0 ? credits : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${textMuted(isDark)}`}>Media diaria de try-ons</span>
              <span className={`text-sm font-medium ${textSecondary(isDark)}`}>{avgDailyTryOns}/dia</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${textMuted(isDark)}`}>Consumo diario estimado</span>
              <span className={`text-sm font-medium ${textSecondary(isDark)}`}>{Math.round(dailyCreditBurn)} creditos/dia</span>
            </div>
            <div className={`pt-3 border-t ${isDark ? "border-white/5" : "border-gray-100"}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${textPrimary(isDark)}`}>Creditos acabam em</span>
                {daysRemaining !== null ? (
                  <span className={`text-xl font-bold ${
                    daysRemaining <= 3 ? "text-red-400" : daysRemaining <= 7 ? "text-amber-400" : "text-green-400"
                  }`}>
                    ~{daysRemaining} dias
                  </span>
                ) : (
                  <span className={`text-sm ${textMuted(isDark)}`}>Sem dados suficientes</span>
                )}
              </div>
              {daysRemaining !== null && daysRemaining <= 5 && (
                <p className="text-xs text-red-400/80 mt-2">
                  Recarregue creditos em breve para evitar downtime!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DistBar({ label, value, total, color, isDark }: {
  label: string; value: number; total: number; color: string; isDark: boolean;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const width = Math.max(pct, 3);

  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs w-16 text-right shrink-0 ${textMuted(isDark)}`}>{label}</span>
      <div className={`flex-1 h-7 rounded-lg overflow-hidden ${barBg(isDark)}`}>
        <div
          className={`h-full ${color} rounded-lg flex items-center justify-end pr-2 transition-all duration-300`}
          style={{ width: `${width}%` }}
        >
          <span className="text-black text-xs font-bold">{value}</span>
        </div>
      </div>
      <span className={`text-xs w-10 shrink-0 ${textSecondary(isDark)}`}>{pct}%</span>
    </div>
  );
}
