"use client";

import { useState, useEffect } from "react";
import type { Theme } from "../types";
import { getCreditsLabel, timeAgo } from "../utils";

interface AdminHeaderProps {
  credits: number;
  autoRefresh: boolean;
  lastUpdated: Date | null;
  loading: boolean;
  theme: Theme;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  onLogout: () => void;
  onToggleTheme: () => void;
}

export function AdminHeader({
  credits,
  autoRefresh,
  lastUpdated,
  loading,
  theme,
  onToggleAutoRefresh,
  onRefresh,
  onLogout,
  onToggleTheme,
}: AdminHeaderProps) {
  const [, setTick] = useState(0);
  const isDark = theme === "dark";

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const btnBase = isDark
    ? "border-white/10 text-white/50 hover:text-white hover:border-white/25"
    : "border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300";

  return (
    <>
      {credits >= 0 && credits < 50 && (
        <div
          className={`px-4 py-2 text-center text-sm font-medium ${
            credits < 20
              ? "bg-red-500/20 text-red-300 border-b border-red-500/30"
              : "bg-amber-500/20 text-amber-300 border-b border-amber-500/30"
          }`}
        >
          {credits < 20
            ? `Creditos Fashn CRITICOS: ${credits} restantes. Recarregue imediatamente!`
            : `Creditos Fashn baixos: ${credits} restantes. Considere recarregar.`}
        </div>
      )}

      <header className={`border-b px-4 sm:px-6 py-4 ${isDark ? "border-white/5" : "border-gray-200"}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-black font-bold text-sm">
              P
            </div>
            <span className={`font-semibold hidden sm:inline ${isDark ? "text-white/80" : "text-gray-700"}`}>Admin</span>
            <CreditsBadge credits={credits} isDark={isDark} />
            {lastUpdated && (
              <span className={`text-xs hidden md:inline ${isDark ? "text-white/20" : "text-gray-400"}`}>
                {timeAgo(lastUpdated)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {lastUpdated && (
              <span className={`text-xs md:hidden ${isDark ? "text-white/20" : "text-gray-400"}`}>
                {timeAgo(lastUpdated)}
              </span>
            )}
            {/* Theme toggle */}
            <button
              onClick={onToggleTheme}
              className={`text-xs px-2 py-1.5 rounded-lg border transition-all ${btnBase}`}
              title={isDark ? "Modo claro" : "Modo escuro"}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
            <button
              onClick={onToggleAutoRefresh}
              className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all ${
                autoRefresh
                  ? "border-teal-400/30 text-teal-400 bg-teal-400/10"
                  : isDark ? "border-white/10 text-white/30" : "border-gray-200 text-gray-400"
              }`}
            >
              {autoRefresh ? "Auto ON" : "Auto OFF"}
            </button>
            <button
              onClick={onRefresh}
              disabled={loading}
              className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 ${btnBase}`}
            >
              {loading ? (
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="hidden sm:inline">Atualizando</span>
                </span>
              ) : (
                "Atualizar"
              )}
            </button>
            <button
              onClick={onLogout}
              className="text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border border-red-400/20 text-red-400/60 hover:text-red-400 hover:border-red-400/40 transition-all"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

function CreditsBadge({ credits, isDark }: { credits: number; isDark: boolean }) {
  const style =
    credits < 0
      ? isDark ? "bg-white/5 text-white/30" : "bg-gray-100 text-gray-400"
      : credits < 50
      ? "bg-red-400/10 border border-red-400/20 text-red-400"
      : credits < 100
      ? "bg-amber-400/10 border border-amber-400/20 text-amber-400"
      : "bg-green-400/10 border border-green-400/20 text-green-400";

  const dotColor =
    credits < 0
      ? isDark ? "bg-white/30" : "bg-gray-400"
      : credits < 50
      ? "bg-red-400"
      : credits < 100
      ? "bg-amber-400"
      : "bg-green-400";

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="hidden sm:inline">
        {credits >= 0 ? `${credits} creditos` : "Creditos N/A"}
      </span>
      <span className="sm:hidden">
        {credits >= 0 ? credits : "N/A"}
      </span>
      <span className={`ml-1 hidden sm:inline ${isDark ? "text-white/30" : "text-gray-400"}`}>
        ({getCreditsLabel(credits)})
      </span>
    </div>
  );
}
