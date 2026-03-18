"use client";

const colorMap = {
  teal: "from-teal-400/10 to-teal-600/5 border-teal-400/20",
  purple: "from-purple-400/10 to-purple-600/5 border-purple-400/20",
  amber: "from-amber-400/10 to-amber-600/5 border-amber-400/20",
  green: "from-green-400/10 to-green-600/5 border-green-400/20",
  red: "from-red-400/10 to-red-600/5 border-red-400/20",
};

const textColorMap = {
  teal: "text-teal-400",
  purple: "text-purple-400",
  amber: "text-amber-400",
  green: "text-green-400",
  red: "text-red-400",
};

export function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: "teal" | "purple" | "amber" | "green" | "red";
}) {
  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-4 sm:p-5`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${textColorMap[color]}`}>
        {value}
      </p>
      <p className="text-white/40 text-xs sm:text-sm mt-1">{label}</p>
    </div>
  );
}
