"use client";

import { useState, useMemo } from "react";
import type { Analytics, Lead } from "../types";
import type { Period } from "../utils";
import {
  formatDate,
  formatPhone,
  filterDailyStats,
  estimateCost,
  cardBg,
  cardInnerBg,
  textPrimary,
  textSecondary,
  textMuted,
  barBg,
} from "../utils";
import { StatCard } from "./stat-card";

interface OverviewTabProps {
  analytics: Analytics;
  leads: Lead[];
  isDark: boolean;
}

const PERIODS: Array<{ id: Period; label: string }> = [
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "all", label: "Tudo" },
];

export function OverviewTab({ analytics, leads, isDark }: OverviewTabProps) {
  const [period, setPeriod] = useState<Period>("30d");

  const filteredDaily = useMemo(
    () => filterDailyStats(analytics.dailyStats, period),
    [analytics.dailyStats, period]
  );

  const periodTryOns = useMemo(() => {
    return Object.values(filteredDaily).reduce((sum, n) => sum + n, 0);
  }, [filteredDaily]);

  // Abandonment & recurrence stats
  const abandonedLeads = useMemo(() => leads.filter((l) => l.tryOnCount === 0), [leads]);
  const recurrentLeads = useMemo(() => leads.filter((l) => l.tryOnCount > 1), [leads]);
  const newLeads = useMemo(() => leads.filter((l) => l.tryOnCount === 1), [leads]);
  const abandonRate = leads.length > 0 ? Math.round((abandonedLeads.length / leads.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Period Filter */}
      <div className="flex items-center gap-2">
        <span className={`text-xs mr-1 ${textMuted(isDark)}`}>Periodo:</span>
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              period === p.id
                ? isDark
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-gray-200 text-gray-800 border border-gray-300"
                : isDark
                ? "text-white/30 hover:text-white/60 hover:bg-white/5"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stats Cards - row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard label="Total de Leads" value={leads.length} icon="👥" color="teal" isDark={isDark} />
        <StatCard label="Try-Ons Realizados" value={analytics.totalTryOns} icon="✨" color="purple" isDark={isDark} />
        <StatCard label="Cliques de Compra" value={analytics.totalBuyClicks} icon="🛒" color="amber" isDark={isDark} />
        <StatCard label="Taxa de Conversao" value={`${analytics.overallConversion}%`} icon="💰" color="green" isDark={isDark} />
        <StatCard label="Custo Estimado" value={estimateCost(analytics.totalTryOns)} icon="💸" color="red" isDark={isDark} />
      </div>

      {/* Stats Cards - row 2: processing time + abandonment + recurrence */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Tempo Medio"
          value={analytics.avgProcessingTime !== null ? `${analytics.avgProcessingTime}s` : "—"}
          icon="⏱️"
          color="purple"
          isDark={isDark}
        />
        <StatCard
          label="Taxa de Abandono"
          value={`${abandonRate}%`}
          subtitle={`${abandonedLeads.length} leads sem uso`}
          icon="🚪"
          color={abandonRate > 50 ? "red" : abandonRate > 25 ? "amber" : "green"}
          isDark={isDark}
        />
        <StatCard
          label="Leads Recorrentes"
          value={recurrentLeads.length}
          subtitle={leads.length > 0 ? `${Math.round((recurrentLeads.length / leads.length) * 100)}% do total` : ""}
          icon="🔄"
          color="teal"
          isDark={isDark}
        />
        <StatCard
          label="Leads com 1 Uso"
          value={newLeads.length}
          subtitle={leads.length > 0 ? `${Math.round((newLeads.length / leads.length) * 100)}% do total` : ""}
          icon="🆕"
          color="amber"
          isDark={isDark}
        />
      </div>

      {/* Funnel */}
      <FunnelCard analytics={analytics} leadsCount={leads.length} isDark={isDark} />

      {/* Recent leads + Daily stats side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Leads */}
        <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textPrimary(isDark)}`}>
            <span>👥</span> Leads Recentes
          </h3>
          {leads.length === 0 ? (
            <p className={`text-sm text-center py-8 ${textMuted(isDark)}`}>Nenhum lead ainda</p>
          ) : (
            <div className="space-y-3">
              {leads.slice(0, 5).map((lead) => (
                <div
                  key={lead.email}
                  className={`flex items-center justify-between gap-3 rounded-xl p-3 ${cardInnerBg(isDark)}`}
                >
                  <div className="min-w-0">
                    <p className={`text-sm truncate ${textSecondary(isDark)}`}>{lead.email}</p>
                    <p className={`text-xs ${textMuted(isDark)}`}>{formatPhone(lead.phone)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-teal-400 text-xs font-medium">
                      {lead.tryOnCount} {lead.tryOnCount === 1 ? "uso" : "usos"}
                    </p>
                    <p className={`text-xs ${textMuted(isDark)}`}>{formatDate(lead.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Stats - Line Chart */}
        <LineChartCard dailyStats={filteredDaily} periodTryOns={periodTryOns} period={period} isDark={isDark} />
      </div>

      {/* Abandoned leads (follow-up list) */}
      {abandonedLeads.length > 0 && (
        <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textPrimary(isDark)}`}>
            <span>🚪</span> Leads sem Try-On
            <span className="text-xs font-normal bg-red-400/10 text-red-400 px-2 py-0.5 rounded-full">
              {abandonedLeads.length} leads
            </span>
          </h3>
          <p className={`text-xs mb-3 ${textMuted(isDark)}`}>
            Cadastraram mas nunca experimentaram — oportunidade de follow-up via WhatsApp
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {abandonedLeads.slice(0, 6).map((lead) => (
              <div key={lead.email} className={`flex items-center justify-between rounded-xl p-3 ${cardInnerBg(isDark)}`}>
                <div className="min-w-0">
                  <p className={`text-sm truncate ${textSecondary(isDark)}`}>{lead.email}</p>
                  <p className={`text-xs ${textMuted(isDark)}`}>{formatDate(lead.createdAt)}</p>
                </div>
                <a
                  href={`https://wa.me/55${lead.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 text-xs hover:underline shrink-0 ml-2"
                >
                  WhatsApp
                </a>
              </div>
            ))}
          </div>
          {abandonedLeads.length > 6 && (
            <p className={`text-xs mt-3 text-center ${textMuted(isDark)}`}>
              +{abandonedLeads.length - 6} leads na aba Clientes
            </p>
          )}
        </div>
      )}

      {/* Top Products Quick View */}
      <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>🔥</span> Top 5 Produtos Experimentados
        </h3>
        {analytics.topTried.length === 0 ? (
          <p className={`text-sm text-center py-8 ${textMuted(isDark)}`}>Sem dados ainda</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {analytics.topTried.slice(0, 5).map((product, i) => (
              <div
                key={product.productId}
                className={`border rounded-xl p-4 text-center ${cardBg(isDark)}`}
              >
                <div className="text-2xl mb-2">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </div>
                <p className={`text-xs truncate mb-1 ${textSecondary(isDark)}`}>{product.productName}</p>
                <p className="text-teal-400 text-sm font-bold">{product.tryOnCount}x</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────── Funnel Card ──────────── */

function FunnelCard({ analytics, leadsCount, isDark }: { analytics: Analytics; leadsCount: number; isDark: boolean }) {
  const steps = [
    { label: "Leads", value: leadsCount, color: "bg-teal-400" },
    { label: "Try-Ons", value: analytics.totalTryOns, color: "bg-purple-400" },
    { label: "Cliques Compra", value: analytics.totalBuyClicks, color: "bg-amber-400" },
  ];

  const maxValue = Math.max(...steps.map((s) => s.value), 1);

  return (
    <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
      <h3 className={`font-semibold mb-5 flex items-center gap-2 ${textPrimary(isDark)}`}>
        <span>📉</span> Funil de Conversao
      </h3>
      <div className="space-y-3">
        {steps.map((step, i) => {
          const width = Math.max((step.value / maxValue) * 100, 5);
          const prevValue = i > 0 ? steps[i - 1].value : null;
          const rate = prevValue && prevValue > 0
            ? Math.round((step.value / prevValue) * 100)
            : null;

          return (
            <div key={step.label} className="flex items-center gap-3">
              <div className="w-28 sm:w-32 shrink-0 text-right">
                <p className={`text-sm font-medium ${textSecondary(isDark)}`}>{step.label}</p>
                {rate !== null && (
                  <p className={`text-xs ${textMuted(isDark)}`}>{rate}% do anterior</p>
                )}
              </div>
              <div className={`flex-1 h-8 rounded-lg overflow-hidden ${barBg(isDark)}`}>
                <div
                  className={`h-full ${step.color} rounded-lg flex items-center justify-end pr-3 transition-all duration-500`}
                  style={{ width: `${width}%` }}
                >
                  <span className="text-black text-xs font-bold">{step.value}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {analytics.totalTryOns > 0 && (
        <div className={`mt-4 pt-4 border-t flex items-center justify-between ${isDark ? "border-white/5" : "border-gray-100"}`}>
          <span className={`text-sm ${textMuted(isDark)}`}>Lead → Compra</span>
          <span className="text-green-400 font-bold text-lg">
            {leadsCount > 0
              ? Math.round((analytics.totalBuyClicks / leadsCount) * 100)
              : 0}%
          </span>
        </div>
      )}
    </div>
  );
}

/* ──────────── Line Chart (SVG) ──────────── */

function LineChartCard({
  dailyStats,
  periodTryOns,
  period,
  isDark,
}: {
  dailyStats: Record<string, number>;
  periodTryOns: number;
  period: Period;
  isDark: boolean;
}) {
  const entries = useMemo(() => {
    return Object.entries(dailyStats).sort(([a], [b]) => a.localeCompare(b));
  }, [dailyStats]);

  const maxCount = useMemo(() => Math.max(...entries.map(([, c]) => c), 1), [entries]);

  const W = 500;
  const H = 180;
  const PAD_X = 10;
  const PAD_TOP = 10;
  const PAD_BOTTOM = 25;
  const chartW = W - PAD_X * 2;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  const points = useMemo(() => {
    if (entries.length === 0) return [];
    if (entries.length === 1) {
      return [{ x: W / 2, y: PAD_TOP + chartH * 0.3, date: entries[0][0], value: entries[0][1] }];
    }
    return entries.map(([date, count], i) => ({
      x: PAD_X + (i / (entries.length - 1)) * chartW,
      y: PAD_TOP + chartH - (count / maxCount) * chartH,
      date,
      value: count,
    }));
  }, [entries, maxCount, chartW, chartH]);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = linePath
    ? `${linePath} L ${points[points.length - 1]?.x} ${PAD_TOP + chartH} L ${points[0]?.x} ${PAD_TOP + chartH} Z`
    : "";

  const variation = useMemo(() => {
    if (entries.length < 2) return null;
    const last = entries[entries.length - 1][1];
    const prev = entries[entries.length - 2][1];
    if (prev === 0) return null;
    return Math.round(((last - prev) / prev) * 100);
  }, [entries]);

  const periodLabel = period === "7d" ? "7 dias" : period === "30d" ? "30 dias" : "Total";
  const labelColor = isDark ? "white" : "#6b7280";
  const labelOpacity = isDark ? 0.3 : 1;
  const gridOpacity = isDark ? 0.05 : 0.1;

  return (
    <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>📈</span> Try-Ons por Dia
        </h3>
        <div className="flex items-center gap-3">
          {variation !== null && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                variation > 0
                  ? "bg-green-400/10 text-green-400"
                  : variation < 0
                  ? "bg-red-400/10 text-red-400"
                  : isDark ? "bg-white/5 text-white/30" : "bg-gray-100 text-gray-400"
              }`}
            >
              {variation > 0 ? "+" : ""}{variation}% vs ontem
            </span>
          )}
          <span className={`text-xs ${textMuted(isDark)}`}>
            {periodTryOns} em {periodLabel}
          </span>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className={`text-sm text-center py-8 ${textMuted(isDark)}`}>Sem dados no periodo</p>
      ) : (
        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const y = PAD_TOP + chartH - pct * chartH;
              return (
                <line key={pct} x1={PAD_X} y1={y} x2={W - PAD_X} y2={y} stroke={labelColor} strokeOpacity={gridOpacity} />
              );
            })}
            {areaPath && <path d={areaPath} fill="url(#areaGradient)" />}
            {linePath && (
              <path d={linePath} fill="none" stroke="#2dd4bf" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            )}
            {points.map((p) => (
              <circle key={p.date} cx={p.x} cy={p.y} r={entries.length > 20 ? 2 : 3} fill="#2dd4bf" />
            ))}
            {points
              .filter((_, i) => {
                if (entries.length <= 7) return true;
                if (entries.length <= 14) return i % 2 === 0 || i === entries.length - 1;
                return i % Math.ceil(entries.length / 7) === 0 || i === entries.length - 1;
              })
              .map((p) => (
                <text key={`label-${p.date}`} x={p.x} y={H - 5} textAnchor="middle" fill={labelColor} fillOpacity={labelOpacity} fontSize={10}>
                  {new Date(p.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                </text>
              ))}
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
}
