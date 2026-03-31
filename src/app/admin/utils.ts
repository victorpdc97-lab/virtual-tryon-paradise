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

export function costPerConversion(totalTryOns: number, totalBuyClicks: number): string {
  if (totalBuyClicks === 0) return "—";
  const cost = (totalTryOns * 1.5) / totalBuyClicks;
  return cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export interface SummaryLine {
  text: string;
  severity: "info" | "warning" | "critical" | "success";
}

export function generateExecutiveSummary(
  analytics: {
    totalTryOns: number;
    totalBuyClicks: number;
    overallConversion: number;
    dailyStats: Record<string, number>;
    avgProcessingTime: number | null;
    topTried: Array<{ productName: string; tryOnCount: number; buyClickCount: number }>;
    conversionRates: Array<{ productName: string; conversionRate: number }>;
    hourlyStats: Record<string, number>;
    avgDailyTryOns: number;
  },
  leads: Array<{ tryOnCount: number; createdAt: string; lastTryOn: string | null }>,
  credits: number
): SummaryLine[] {
  const lines: SummaryLine[] = [];
  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);

  // --- CRITICAL ALERTS (top of summary) ---

  // Credits projection
  if (credits >= 0) {
    const dailyBurn = analytics.avgDailyTryOns * 4; // 4 credits per try-on
    const daysLeft = dailyBurn > 0 ? Math.round(credits / dailyBurn) : null;
    if (daysLeft !== null && daysLeft <= 3) {
      lines.push({ text: `URGENTE: Creditos acabam em ~${daysLeft} dia${daysLeft !== 1 ? "s" : ""} (${credits} restantes, ${Math.round(dailyBurn)}/dia)`, severity: "critical" });
    } else if (daysLeft !== null && daysLeft <= 7) {
      lines.push({ text: `Creditos acabam em ~${daysLeft} dias (${credits} restantes) — considere recarregar`, severity: "warning" });
    }
  }

  // Products with many try-ons but zero purchases
  const zeroConversionProducts = analytics.topTried.filter((p) => p.tryOnCount >= 5 && p.buyClickCount === 0);
  if (zeroConversionProducts.length > 0) {
    const names = zeroConversionProducts.slice(0, 2).map((p) => p.productName).join(", ");
    const extra = zeroConversionProducts.length > 2 ? ` (+${zeroConversionProducts.length - 2})` : "";
    lines.push({ text: `${names}${extra}: ${zeroConversionProducts.reduce((s, p) => s + p.tryOnCount, 0)} try-ons e 0 compras — verificar preco/foto`, severity: "warning" });
  }

  // --- WEEKLY COMPARISON ---

  let thisWeek = 0, lastWeek = 0;
  for (const [date, count] of Object.entries(analytics.dailyStats)) {
    if (date >= sevenDaysAgo) thisWeek += count;
    else if (date >= fourteenDaysAgo) lastWeek += count;
  }
  if (thisWeek > 0 && lastWeek > 0) {
    const pct = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
    if (pct <= -30) {
      lines.push({ text: `Try-ons caíram ${Math.abs(pct)}% essa semana (${thisWeek} vs ${lastWeek}) — investigar`, severity: "warning" });
    } else if (pct >= 30) {
      lines.push({ text: `Try-ons subiram ${pct}% essa semana (${thisWeek} vs ${lastWeek})`, severity: "success" });
    } else {
      lines.push({ text: `Esta semana: ${thisWeek} try-ons (${pct > 0 ? "+" : ""}${pct}% vs anterior)`, severity: "info" });
    }
  } else if (thisWeek > 0) {
    lines.push({ text: `Esta semana: ${thisWeek} try-ons`, severity: "info" });
  }

  // --- ABANDONMENT TREND ---

  const abandonedTotal = leads.filter((l) => l.tryOnCount === 0).length;
  const abandonRate = leads.length > 0 ? Math.round((abandonedTotal / leads.length) * 100) : 0;
  const recentLeads = leads.filter((l) => l.createdAt >= sevenDaysAgo);
  const recentAbandoned = recentLeads.filter((l) => l.tryOnCount === 0).length;
  const recentAbandonRate = recentLeads.length > 0 ? Math.round((recentAbandoned / recentLeads.length) * 100) : 0;

  if (recentLeads.length >= 3 && recentAbandonRate > abandonRate + 15) {
    lines.push({ text: `Taxa de abandono subiu para ${recentAbandonRate}% essa semana (era ${abandonRate}% geral) — verificar UX do upload`, severity: "warning" });
  } else if (abandonedTotal > 0) {
    lines.push({ text: `${abandonedTotal} lead${abandonedTotal > 1 ? "s" : ""} sem try-on (${abandonRate}%) — oportunidade de follow-up`, severity: "info" });
  }

  // --- INACTIVE LEADS ---

  const inactiveLeads = leads.filter((l) => {
    if (l.tryOnCount === 0) return false;
    const lastActive = l.lastTryOn || l.createdAt;
    return (Date.now() - new Date(lastActive).getTime()) / 86400000 > 7;
  });
  if (inactiveLeads.length >= 3) {
    lines.push({ text: `${inactiveLeads.length} leads inativos ha +7 dias — reengajar via WhatsApp`, severity: "info" });
  }

  // --- PEAK HOUR INSIGHT ---

  const hourlyEntries = Object.entries(analytics.hourlyStats);
  if (hourlyEntries.length > 0) {
    let bestKey = "", bestCount = 0;
    for (const [key, count] of hourlyEntries) {
      if (count > bestCount) { bestKey = key; bestCount = count; }
    }
    const [dayStr, hourStr] = bestKey.split("-");
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    const dayName = days[parseInt(dayStr)] || dayStr;
    lines.push({ text: `Melhor horario para campanhas: ${dayName} ${hourStr}h (${bestCount} try-ons nesse slot)`, severity: "info" });
  }

  // --- POSITIVE HIGHLIGHTS ---

  const newLeads = leads.filter((l) => l.createdAt >= sevenDaysAgo).length;
  if (newLeads > 0) {
    lines.push({ text: `${newLeads} lead${newLeads > 1 ? "s" : ""} novo${newLeads > 1 ? "s" : ""} nos ultimos 7 dias`, severity: newLeads >= 10 ? "success" : "info" });
  }

  if (analytics.conversionRates.length > 0) {
    const best = analytics.conversionRates[0];
    if (best.conversionRate >= 50) {
      lines.push({ text: `Destaque: ${best.productName} com ${best.conversionRate}% de conversao`, severity: "success" });
    }
  }

  // Today's activity
  const todayCount = analytics.dailyStats[today] || 0;
  if (todayCount > 0) {
    lines.push({ text: `Hoje: ${todayCount} try-on${todayCount > 1 ? "s" : ""}`, severity: "info" });
  }

  return lines;
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
