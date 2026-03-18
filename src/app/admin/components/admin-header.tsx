"use client";

import { useState, useEffect } from "react";
import { getCreditsLabel, timeAgo } from "../utils";

interface AdminHeaderProps {
  credits: number;
  autoRefresh: boolean;
  lastUpdated: Date | null;
  loading: boolean;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  onLogout: () => void;
}

export function AdminHeader({
  credits,
  autoRefresh,
  lastUpdated,
  loading,
  onToggleAutoRefresh,
  onRefresh,
  onLogout,
}: AdminHeaderProps) {
  const [, setTick] = useState(0);

  // Re-render every 30s to update "time ago"
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Credits Warning Banner */}
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

      {/* Header */}
      <header className="border-b border-white/5 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-black font-bold text-sm">
              P
            </div>
            <span className="text-white/80 font-semibold hidden sm:inline">Admin</span>
            <CreditsBadge credits={credits} />
            {lastUpdated && (
              <span className="text-white/20 text-xs hidden md:inline">
                {timeAgo(lastUpdated)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {lastUpdated && (
              <span className="text-white/20 text-xs md:hidden">
                {timeAgo(lastUpdated)}
              </span>
            )}
            <button
              onClick={onToggleAutoRefresh}
              className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all ${
                autoRefresh
                  ? "border-teal-400/30 text-teal-400 bg-teal-400/10"
                  : "border-white/10 text-white/30"
              }`}
            >
              {autoRefresh ? "Auto ON" : "Auto OFF"}
            </button>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/25 transition-all disabled:opacity-50"
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

function CreditsBadge({ credits }: { credits: number }) {
  const style =
    credits < 0
      ? "bg-white/5 text-white/30"
      : credits < 50
      ? "bg-red-400/10 border border-red-400/20 text-red-400"
      : credits < 100
      ? "bg-amber-400/10 border border-amber-400/20 text-amber-400"
      : "bg-green-400/10 border border-green-400/20 text-green-400";

  const dotColor =
    credits < 0
      ? "bg-white/30"
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
      <span className="text-white/30 ml-1 hidden sm:inline">
        ({getCreditsLabel(credits)})
      </span>
    </div>
  );
}
