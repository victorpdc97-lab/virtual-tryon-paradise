"use client";

import { useMemo } from "react";
import type { Lead } from "../types";
import { cardBg, textPrimary, textMuted, barBg } from "../utils";

interface Props {
  leads: Lead[];
  isDark: boolean;
}

function getWeekLabel(weeksAgo: number): string {
  if (weeksAgo === 0) return "Esta semana";
  if (weeksAgo === 1) return "Semana passada";
  return `${weeksAgo} sem atras`;
}

export function RetentionChart({ leads, isDark }: Props) {
  const weeklyData = useMemo(() => {
    const now = Date.now();
    const weeks: Array<{ label: string; total: number; returned: number }> = [];

    for (let w = 0; w < 8; w++) {
      const weekStart = now - (w + 1) * 7 * 86400000;
      const weekEnd = now - w * 7 * 86400000;

      const leadsInWeek = leads.filter((l) => {
        const created = new Date(l.createdAt).getTime();
        return created >= weekStart && created < weekEnd;
      });

      const returned = leadsInWeek.filter((l) => l.tryOnCount > 1).length;

      weeks.push({
        label: getWeekLabel(w),
        total: leadsInWeek.length,
        returned,
      });
    }

    return weeks.reverse();
  }, [leads]);

  const maxTotal = Math.max(...weeklyData.map((w) => w.total), 1);

  if (leads.length === 0) {
    return (
      <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>📊</span> Retencao Semanal
        </h3>
        <p className={`text-sm text-center py-6 ${textMuted(isDark)}`}>Sem dados suficientes</p>
      </div>
    );
  }

  return (
    <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>📊</span> Retencao Semanal
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-teal-400/60" />
            <span className={textMuted(isDark)}>Novos leads</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-400" />
            <span className={textMuted(isDark)}>Voltaram (2+ usos)</span>
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {weeklyData.map((week) => {
          const totalWidth = (week.total / maxTotal) * 100;
          const returnedWidth = week.total > 0 ? (week.returned / week.total) * totalWidth : 0;

          return (
            <div key={week.label} className="flex items-center gap-3">
              <span className={`text-xs w-28 sm:w-32 text-right shrink-0 ${textMuted(isDark)}`}>
                {week.label}
              </span>
              <div className={`flex-1 h-6 rounded-lg overflow-hidden relative ${barBg(isDark)}`}>
                {/* Total bar */}
                <div
                  className="absolute inset-y-0 left-0 bg-teal-400/30 rounded-lg transition-all duration-500"
                  style={{ width: `${Math.max(totalWidth, 3)}%` }}
                />
                {/* Returned bar */}
                {returnedWidth > 0 && (
                  <div
                    className="absolute inset-y-0 left-0 bg-purple-400 rounded-lg transition-all duration-500"
                    style={{ width: `${Math.max(returnedWidth, 2)}%` }}
                  />
                )}
                {/* Label */}
                <div className="absolute inset-0 flex items-center px-2">
                  <span className="text-xs font-medium text-black/70">
                    {week.total > 0 ? `${week.total} (${week.returned} voltaram)` : ""}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
