"use client";

import { useMemo } from "react";
import type { Analytics, Lead } from "../types";
import { generateExecutiveSummary, type SummaryLine, cardBg, textPrimary } from "../utils";

interface Props {
  analytics: Analytics;
  leads: Lead[];
  credits: number;
  isDark: boolean;
}

const SEVERITY_STYLES: Record<SummaryLine["severity"], { icon: string; dark: string; light: string }> = {
  critical: { icon: "🚨", dark: "text-red-400", light: "text-red-600" },
  warning: { icon: "⚠️", dark: "text-amber-400", light: "text-amber-600" },
  success: { icon: "✅", dark: "text-green-400", light: "text-green-600" },
  info: { icon: "💡", dark: "text-white/60", light: "text-gray-600" },
};

export function ExecutiveSummary({ analytics, leads, credits, isDark }: Props) {
  const lines = useMemo(
    () => generateExecutiveSummary(analytics, leads, credits),
    [analytics, leads, credits]
  );

  if (lines.length === 0) return null;

  const hasCritical = lines.some((l) => l.severity === "critical");
  const hasWarning = lines.some((l) => l.severity === "warning");

  const borderColor = hasCritical
    ? isDark ? "border-red-400/30" : "border-red-200"
    : hasWarning
    ? isDark ? "border-amber-400/20" : "border-amber-200"
    : isDark ? "border-teal-400/20" : "border-teal-200";

  const bgGradient = hasCritical
    ? isDark ? "from-red-400/5 to-amber-400/5" : "from-red-50 to-amber-50"
    : isDark ? "from-teal-400/5 to-purple-400/5" : "from-teal-50 to-purple-50";

  return (
    <div className={`border rounded-2xl p-5 bg-gradient-to-br ${bgGradient} ${borderColor}`}>
      <h3 className={`font-semibold mb-3 flex items-center gap-2 ${textPrimary(isDark)}`}>
        <span>{hasCritical ? "🚨" : hasWarning ? "⚠️" : "🧠"}</span>
        {hasCritical ? "Alertas & Resumo" : "Resumo da Semana"}
      </h3>
      <ul className="space-y-2">
        {lines.map((line, i) => {
          const style = SEVERITY_STYLES[line.severity];
          return (
            <li key={i} className={`text-sm flex items-start gap-2 ${isDark ? style.dark : style.light}`}>
              <span className="shrink-0">{style.icon}</span>
              <span>{line.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
