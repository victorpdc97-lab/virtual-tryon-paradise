"use client";

import { useState } from "react";
import { showToast } from "./toast";

interface ResultRatingProps {
  pipelineId?: string | null;
}

export function ResultRating({ pipelineId }: ResultRatingProps) {
  const [rating, setRating] = useState<"up" | "down" | null>(null);

  const handleRate = async (value: "up" | "down") => {
    setRating(value);
    showToast(
      value === "up" ? "Obrigado pelo feedback!" : "Vamos melhorar!",
      value === "up" ? "success" : "info"
    );

    // Send to analytics (fire-and-forget)
    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "result_rating",
          data: { rating: value, pipelineId },
        }),
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 py-3">
      <span className="text-white/40 text-sm">Gostou do resultado?</span>
      <div className="flex gap-2">
        <button
          onClick={() => handleRate("up")}
          disabled={rating !== null}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            rating === "up"
              ? "bg-teal-400 text-black scale-110"
              : rating === "down"
              ? "bg-white/5 text-white/20 opacity-50"
              : "bg-white/5 text-white/50 hover:bg-teal-400/20 hover:text-teal-400"
          }`}
          aria-label="Gostei"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zm-9 11H4a2 2 0 01-2-2v-7a2 2 0 012-2h1" />
          </svg>
        </button>
        <button
          onClick={() => handleRate("down")}
          disabled={rating !== null}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            rating === "down"
              ? "bg-red-500 text-white scale-110"
              : rating === "up"
              ? "bg-white/5 text-white/20 opacity-50"
              : "bg-white/5 text-white/50 hover:bg-red-500/20 hover:text-red-400"
          }`}
          aria-label="Nao gostei"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zm9-13h1a2 2 0 012 2v7a2 2 0 01-2 2h-1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
