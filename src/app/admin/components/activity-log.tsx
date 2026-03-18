"use client";

import type { Activity } from "../types";
import { cardBg, textPrimary, textSecondary, textMuted } from "../utils";

const ICONS: Record<Activity["type"], string> = {
  lead: "👤",
  tryon: "✨",
  buy: "🛒",
};

const LABELS: Record<Activity["type"], string> = {
  lead: "Novo lead",
  tryon: "Try-on",
  buy: "Clique compra",
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDay(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Hoje";
  if (d.toDateString() === yesterday.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

interface Props {
  activities: Activity[];
  isDark: boolean;
}

export function ActivityLog({ activities, isDark }: Props) {
  if (activities.length === 0) {
    return (
      <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>📋</span> Atividade Recente
        </h3>
        <p className={`text-sm text-center py-6 ${textMuted(isDark)}`}>Nenhuma atividade ainda</p>
      </div>
    );
  }

  return (
    <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
      <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textPrimary(isDark)}`}>
        <span>📋</span> Atividade Recente
      </h3>
      <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
        {activities.slice(0, 20).map((a, i) => (
          <div
            key={`${a.ts}-${i}`}
            className={`flex items-center gap-3 py-2 px-2 rounded-lg transition-colors ${
              isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50"
            }`}
          >
            <span className="text-base shrink-0">{ICONS[a.type]}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${textSecondary(isDark)}`}>
                <span className={`font-medium ${textPrimary(isDark)}`}>{LABELS[a.type]}</span>
                {" — "}
                {a.label}
              </p>
            </div>
            <div className={`text-xs shrink-0 text-right ${textMuted(isDark)}`}>
              <span>{formatTime(a.ts)}</span>
              <span className="ml-1.5">{formatDay(a.ts)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
