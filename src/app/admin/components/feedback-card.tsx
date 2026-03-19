"use client";

import { cardBg, textPrimary, textMuted, barBg } from "../utils";

interface Props {
  ratings: { up: number; down: number };
  isDark: boolean;
}

export function FeedbackCard({ ratings, isDark }: Props) {
  const total = ratings.up + ratings.down;
  const satisfaction = total > 0 ? Math.round((ratings.up / total) * 100) : 0;

  return (
    <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
      <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textPrimary(isDark)}`}>
        <span>⭐</span> Feedback dos Resultados
      </h3>

      {total === 0 ? (
        <p className={`text-sm text-center py-6 ${textMuted(isDark)}`}>
          Nenhum feedback recebido ainda
        </p>
      ) : (
        <div className="space-y-4">
          {/* Satisfaction bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${textMuted(isDark)}`}>Satisfacao</span>
              <span className={`text-lg font-bold ${
                satisfaction >= 70 ? "text-green-400"
                : satisfaction >= 40 ? "text-amber-400"
                : "text-red-400"
              }`}>
                {satisfaction}%
              </span>
            </div>
            <div className={`h-3 rounded-full overflow-hidden ${barBg(isDark)}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  satisfaction >= 70 ? "bg-green-400"
                  : satisfaction >= 40 ? "bg-amber-400"
                  : "bg-red-400"
                }`}
                style={{ width: `${satisfaction}%` }}
              />
            </div>
          </div>

          {/* Counts */}
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl mb-1">👍</div>
              <p className="text-green-400 font-bold text-lg">{ratings.up}</p>
              <p className={`text-xs ${textMuted(isDark)}`}>Gostaram</p>
            </div>
            <div className={`w-px h-12 ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
            <div className="text-center">
              <div className="text-2xl mb-1">👎</div>
              <p className="text-red-400 font-bold text-lg">{ratings.down}</p>
              <p className={`text-xs ${textMuted(isDark)}`}>Nao gostaram</p>
            </div>
          </div>

          <p className={`text-xs text-center ${textMuted(isDark)}`}>
            {total} avaliacoe{total > 1 ? "s" : ""} no total
          </p>
        </div>
      )}
    </div>
  );
}
