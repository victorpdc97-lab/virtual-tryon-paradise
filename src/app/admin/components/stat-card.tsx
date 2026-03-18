"use client";

type Color = "teal" | "purple" | "amber" | "green" | "red";

const colorMap: Record<Color, { dark: string; light: string }> = {
  teal:   { dark: "from-teal-400/10 to-teal-600/5 border-teal-400/20", light: "from-teal-50 to-teal-100/50 border-teal-200" },
  purple: { dark: "from-purple-400/10 to-purple-600/5 border-purple-400/20", light: "from-purple-50 to-purple-100/50 border-purple-200" },
  amber:  { dark: "from-amber-400/10 to-amber-600/5 border-amber-400/20", light: "from-amber-50 to-amber-100/50 border-amber-200" },
  green:  { dark: "from-green-400/10 to-green-600/5 border-green-400/20", light: "from-green-50 to-green-100/50 border-green-200" },
  red:    { dark: "from-red-400/10 to-red-600/5 border-red-400/20", light: "from-red-50 to-red-100/50 border-red-200" },
};

const textColorMap: Record<Color, { dark: string; light: string }> = {
  teal:   { dark: "text-teal-400", light: "text-teal-600" },
  purple: { dark: "text-purple-400", light: "text-purple-600" },
  amber:  { dark: "text-amber-400", light: "text-amber-600" },
  green:  { dark: "text-green-400", light: "text-green-600" },
  red:    { dark: "text-red-400", light: "text-red-600" },
};

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  color,
  isDark = true,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: Color;
  isDark?: boolean;
}) {
  const theme = isDark ? "dark" : "light";
  return (
    <div className={`bg-gradient-to-br ${colorMap[color][theme]} border rounded-2xl p-4 sm:p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${textColorMap[color][theme]}`}>
        {value}
      </p>
      <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>{label}</p>
      {subtitle && (
        <p className={`text-xs mt-0.5 ${isDark ? "text-white/20" : "text-gray-400"}`}>{subtitle}</p>
      )}
    </div>
  );
}
