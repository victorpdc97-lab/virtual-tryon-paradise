"use client";

import { useMemo } from "react";
import type { Analytics, Lead } from "../types";
import { generateExecutiveSummary, cardBg, textPrimary, textMuted } from "../utils";

interface Props {
  analytics: Analytics;
  leads: Lead[];
  credits: number;
  isDark: boolean;
}

export function ExecutiveSummary({ analytics, leads, credits, isDark }: Props) {
  const lines = useMemo(
    () => generateExecutiveSummary(analytics, leads, credits),
    [analytics, leads, credits]
  );

  if (lines.length === 0) return null;

  return (
    <div className={`border rounded-2xl p-5 ${isDark ? "bg-gradient-to-br from-teal-400/5 to-purple-400/5 border-teal-400/20" : "bg-gradient-to-br from-teal-50 to-purple-50 border-teal-200"}`}>
      <h3 className={`font-semibold mb-3 flex items-center gap-2 ${textPrimary(isDark)}`}>
        <span>🧠</span> Resumo da Semana
      </h3>
      <ul className="space-y-1.5">
        {lines.map((line, i) => (
          <li key={i} className={`text-sm flex items-start gap-2 ${isDark ? "text-white/60" : "text-gray-600"}`}>
            <span className={`shrink-0 mt-1 ${textMuted(isDark)}`}>•</span>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
