"use client";

import { useState, useEffect } from "react";

export function RateLimitBadge() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    fetch("/api/rate-limit")
      .then((res) => res.json())
      .then((data) => {
        setRemaining(data.remaining);
        setLimit(data.limit);
      })
      .catch(() => {});
  }, []);

  if (remaining === null) return null;

  const pct = (remaining / limit) * 100;
  const color =
    remaining === 0
      ? "text-red-400"
      : remaining <= 2
      ? "text-amber-400"
      : "text-teal-400";
  const bgColor =
    remaining === 0
      ? "bg-red-400"
      : remaining <= 2
      ? "bg-amber-400"
      : "bg-teal-400";

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex gap-1">
        {Array.from({ length: limit }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-4 rounded-full transition-all ${
              i < remaining ? bgColor + " opacity-80" : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <span className={`text-xs font-medium ${color}`}>
        {remaining === 0
          ? "Limite atingido"
          : `${remaining}/${limit} restante${remaining > 1 ? "s" : ""}`}
      </span>
    </div>
  );
}
