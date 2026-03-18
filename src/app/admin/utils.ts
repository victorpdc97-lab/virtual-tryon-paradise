export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPhone(phone: string) {
  if (phone.length === 11) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  }
  if (phone.length === 10) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
  }
  return phone;
}

export function getCreditsColor(credits: number): string {
  if (credits < 0) return "text-white/30";
  if (credits < 50) return "text-red-400";
  if (credits < 100) return "text-amber-400";
  return "text-green-400";
}

export function getCreditsLabel(credits: number): string {
  if (credits < 0) return "N/A";
  if (credits < 50) return "Baixo";
  if (credits < 100) return "Medio";
  return "OK";
}

export type Period = "7d" | "30d" | "all";

export function filterDailyStats(
  dailyStats: Record<string, number>,
  period: Period
): Record<string, number> {
  if (period === "all") return dailyStats;
  const days = period === "7d" ? 7 : 30;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const filtered: Record<string, number> = {};
  for (const [date, count] of Object.entries(dailyStats)) {
    if (date >= cutoffStr) filtered[date] = count;
  }
  return filtered;
}

export function estimateCost(totalTryOns: number): string {
  const costBrl = totalTryOns * 1.5;
  return costBrl.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `ha ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  return `ha ${hours}h`;
}

// Theme-aware class helpers
export function cardBg(isDark: boolean) {
  return isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-gray-200";
}

export function cardInnerBg(isDark: boolean) {
  return isDark ? "bg-white/[0.02]" : "bg-gray-50";
}

export function textPrimary(isDark: boolean) {
  return isDark ? "text-white" : "text-gray-900";
}

export function textSecondary(isDark: boolean) {
  return isDark ? "text-white/70" : "text-gray-600";
}

export function textMuted(isDark: boolean) {
  return isDark ? "text-white/30" : "text-gray-400";
}

export function barBg(isDark: boolean) {
  return isDark ? "bg-white/5" : "bg-gray-100";
}

export function inputBg(isDark: boolean) {
  return isDark
    ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-teal-400/50"
    : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-teal-500";
}

export function exportLeadsCsv(
  leads: Array<{
    email: string;
    phone: string;
    createdAt: string;
    tryOnCount: number;
    lastTryOn: string | null;
  }>
) {
  const header = "Email,Telefone,Cadastro,Try-Ons,Ultimo Uso";
  const rows = leads.map((l) =>
    [
      l.email,
      formatPhone(l.phone),
      formatDate(l.createdAt),
      l.tryOnCount,
      l.lastTryOn ? formatDate(l.lastTryOn) : "",
    ].join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-paradise-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
