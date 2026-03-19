"use client";

import { useMemo } from "react";
import { cardBg, textPrimary, textMuted } from "../utils";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface Props {
  hourlyStats: Record<string, number>;
  isDark: boolean;
}

export function HeatmapChart({ hourlyStats, isDark }: Props) {
  const { grid, maxCount } = useMemo(() => {
    let max = 0;
    const g: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    for (const [key, count] of Object.entries(hourlyStats)) {
      const [day, hour] = key.split("-").map(Number);
      if (day >= 0 && day <= 6 && hour >= 0 && hour <= 23) {
        g[day][hour] = count;
        if (count > max) max = count;
      }
    }
    return { grid: g, maxCount: max };
  }, [hourlyStats]);

  const total = Object.values(hourlyStats).reduce((a, b) => a + b, 0);

  // Find peak hour
  const peak = useMemo(() => {
    let bestDay = 0, bestHour = 0, bestCount = 0;
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        if (grid[d][h] > bestCount) {
          bestDay = d;
          bestHour = h;
          bestCount = grid[d][h];
        }
      }
    }
    return { day: DAYS[bestDay], hour: bestHour, count: bestCount };
  }, [grid]);

  function cellColor(count: number): string {
    if (count === 0) return isDark ? "bg-white/[0.02]" : "bg-gray-50";
    const intensity = maxCount > 0 ? count / maxCount : 0;
    if (intensity < 0.25) return "bg-teal-400/20";
    if (intensity < 0.5) return "bg-teal-400/40";
    if (intensity < 0.75) return "bg-teal-400/60";
    return "bg-teal-400/90";
  }

  if (total === 0) {
    return (
      <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>🕐</span> Horario de Pico
        </h3>
        <p className={`text-sm text-center py-6 ${textMuted(isDark)}`}>Sem dados ainda — aparece apos os primeiros try-ons</p>
      </div>
    );
  }

  return (
    <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className={`font-semibold flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>🕐</span> Horario de Pico
        </h3>
        {peak.count > 0 && (
          <span className={`text-xs ${textMuted(isDark)}`}>
            Pico: {peak.day} {peak.hour}h ({peak.count} try-ons)
          </span>
        )}
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto -mx-2 px-2">
        <div className="min-w-[500px]">
          {/* Hour labels */}
          <div className="flex items-center mb-1">
            <div className="w-10 shrink-0" />
            <div className="flex-1 flex">
              {HOURS.filter((h) => h % 3 === 0).map((h) => (
                <div
                  key={h}
                  className={`text-[10px] ${textMuted(isDark)}`}
                  style={{ width: `${100 / 8}%` }}
                >
                  {h}h
                </div>
              ))}
            </div>
          </div>

          {/* Grid rows */}
          {DAYS.map((day, dayIdx) => (
            <div key={day} className="flex items-center mb-0.5">
              <div className={`w-10 text-[11px] shrink-0 ${textMuted(isDark)}`}>{day}</div>
              <div className="flex-1 flex gap-px">
                {HOURS.map((hour) => {
                  const count = grid[dayIdx][hour];
                  return (
                    <div
                      key={hour}
                      className={`flex-1 h-5 sm:h-6 rounded-sm transition-colors ${cellColor(count)}`}
                      title={`${day} ${hour}h: ${count} try-ons`}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-end gap-1.5 mt-2">
            <span className={`text-[10px] ${textMuted(isDark)}`}>Menos</span>
            <div className={`w-3 h-3 rounded-sm ${isDark ? "bg-white/[0.02]" : "bg-gray-50"}`} />
            <div className="w-3 h-3 rounded-sm bg-teal-400/20" />
            <div className="w-3 h-3 rounded-sm bg-teal-400/40" />
            <div className="w-3 h-3 rounded-sm bg-teal-400/60" />
            <div className="w-3 h-3 rounded-sm bg-teal-400/90" />
            <span className={`text-[10px] ${textMuted(isDark)}`}>Mais</span>
          </div>
        </div>
      </div>
    </div>
  );
}
