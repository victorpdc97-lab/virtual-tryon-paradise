"use client";

import { useMemo } from "react";
import type { CohortEntry } from "../types";
import { cardBg, textPrimary, textMuted } from "../utils";

interface Props {
  cohorts: CohortEntry[];
  isDark: boolean;
}

function weekLabel(isoWeek: string): string {
  // "2026-W13" → "S13"
  const match = isoWeek.match(/W(\d+)/);
  return match ? `S${match[1]}` : isoWeek;
}

export function CohortGrid({ cohorts, isDark }: Props) {
  const { grid, maxWeeks, maxRate } = useMemo(() => {
    if (cohorts.length === 0) return { grid: [], maxWeeks: 0, maxRate: 0 };

    // Find max weeks of retention data
    let mw = 0;
    for (const c of cohorts) {
      const weeks = Object.keys(c.returnsByWeek)
        .map((k) => parseInt(k.replace("week", ""), 10))
        .filter((n) => !isNaN(n));
      if (weeks.length > 0) mw = Math.max(mw, ...weeks);
    }
    mw = Math.min(mw, 8); // Cap at 8 weeks

    let mr = 0;
    const rows = cohorts.map((c) => {
      const rates: (number | null)[] = [];
      for (let w = 0; w <= mw; w++) {
        const count = c.returnsByWeek[`week${w}`] || 0;
        const rate = c.signups > 0 ? Math.round((count / c.signups) * 100) : 0;
        rates.push(rate);
        if (rate > mr) mr = rate;
      }
      return { ...c, rates };
    });

    return { grid: rows, maxWeeks: mw, maxRate: mr };
  }, [cohorts]);

  function cellColor(rate: number | null): string {
    if (rate === null || rate === 0) return isDark ? "bg-white/[0.02]" : "bg-gray-50";
    const intensity = maxRate > 0 ? rate / maxRate : 0;
    if (intensity < 0.2) return "bg-purple-400/15";
    if (intensity < 0.4) return "bg-purple-400/30";
    if (intensity < 0.6) return "bg-purple-400/45";
    if (intensity < 0.8) return "bg-purple-400/60";
    return "bg-purple-400/80";
  }

  if (cohorts.length === 0) {
    return (
      <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>📈</span> Analise de Cohort
        </h3>
        <p className={`text-sm text-center py-6 ${textMuted(isDark)}`}>
          Sem dados de cohort ainda — precisa de leads recorrentes ao longo de semanas
        </p>
      </div>
    );
  }

  return (
    <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className={`font-semibold flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>📈</span> Analise de Cohort (Retencao Real)
        </h3>
        <span className={`text-xs ${textMuted(isDark)}`}>
          % de leads que voltaram por semana
        </span>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr>
              <th className={`text-left text-[11px] font-medium pb-2 pr-3 ${textMuted(isDark)}`}>Cohort</th>
              <th className={`text-center text-[11px] font-medium pb-2 px-1 ${textMuted(isDark)}`}>Leads</th>
              {Array.from({ length: maxWeeks + 1 }, (_, w) => (
                <th key={w} className={`text-center text-[11px] font-medium pb-2 px-1 ${textMuted(isDark)}`}>
                  {w === 0 ? "Sem 0" : `Sem ${w}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row) => (
              <tr key={row.cohortWeek}>
                <td className={`text-xs font-medium py-1 pr-3 ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  {weekLabel(row.cohortWeek)}
                </td>
                <td className={`text-center text-xs py-1 px-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>
                  {row.signups}
                </td>
                {row.rates.map((rate, w) => (
                  <td key={w} className="py-1 px-0.5">
                    <div
                      className={`rounded-sm h-7 flex items-center justify-center text-[10px] font-bold transition-colors ${cellColor(rate)} ${
                        rate && rate > 0 ? "text-white" : isDark ? "text-white/10" : "text-gray-300"
                      }`}
                      title={`${weekLabel(row.cohortWeek)} → Semana ${w}: ${rate}%`}
                    >
                      {rate !== null && rate > 0 ? `${rate}%` : "—"}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className={`text-[10px] ${textMuted(isDark)}`}>Baixo</span>
        <div className={`w-3 h-3 rounded-sm ${isDark ? "bg-white/[0.02]" : "bg-gray-50"}`} />
        <div className="w-3 h-3 rounded-sm bg-purple-400/15" />
        <div className="w-3 h-3 rounded-sm bg-purple-400/30" />
        <div className="w-3 h-3 rounded-sm bg-purple-400/60" />
        <div className="w-3 h-3 rounded-sm bg-purple-400/80" />
        <span className={`text-[10px] ${textMuted(isDark)}`}>Alto</span>
      </div>
    </div>
  );
}
