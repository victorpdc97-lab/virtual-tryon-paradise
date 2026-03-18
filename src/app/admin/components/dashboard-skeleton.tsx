"use client";

function Pulse({ className, isDark }: { className: string; isDark: boolean }) {
  return (
    <div
      className={`animate-pulse rounded-2xl ${
        isDark ? "bg-white/[0.04]" : "bg-gray-200/60"
      } ${className}`}
    />
  );
}

export function DashboardSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header skeleton */}
      <div className={`h-16 rounded-2xl animate-pulse ${isDark ? "bg-white/[0.03]" : "bg-gray-100"}`} />

      {/* Tab skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Pulse key={i} className="h-10 w-28" isDark={isDark} />
        ))}
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Pulse key={i} className="h-28" isDark={isDark} />
        ))}
      </div>

      {/* Two column skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Pulse className="h-64" isDark={isDark} />
        <Pulse className="h-64" isDark={isDark} />
      </div>

      {/* Wide card skeleton */}
      <Pulse className="h-48" isDark={isDark} />
    </div>
  );
}
