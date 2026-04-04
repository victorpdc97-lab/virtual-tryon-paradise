"use client";

import { useState, useMemo } from "react";
import type { Lead, LeadSortField, SortDirection } from "../types";
import { formatDate, formatPhone, exportLeadsCsv, cardBg, cardInnerBg, textPrimary, textMuted, textSecondary, inputBg } from "../utils";
import { LeadTimelineModal } from "./lead-timeline-modal";

const LEADS_PER_PAGE = 20;

type LeadFilter = "all" | "never_used" | "used_once" | "recurrent" | "inactive_7d";

interface LeadsTabProps {
  leads: Lead[];
  isDark: boolean;
}

const COLUMNS: Array<{ field: LeadSortField; label: string; span: string }> = [
  { field: "email", label: "Email", span: "col-span-4" },
  { field: "createdAt", label: "Cadastro", span: "col-span-2" },
  { field: "tryOnCount", label: "Try-Ons", span: "col-span-2" },
  { field: "lastTryOn", label: "Ultimo Uso", span: "col-span-2" },
];

function matchesFilter(lead: Lead, filter: LeadFilter): boolean {
  switch (filter) {
    case "all": return true;
    case "never_used": return lead.tryOnCount === 0;
    case "used_once": return lead.tryOnCount === 1;
    case "recurrent": return lead.tryOnCount > 1;
    case "inactive_7d": {
      const lastActive = lead.lastTryOn || lead.createdAt;
      const daysAgo = (Date.now() - new Date(lastActive).getTime()) / 86400000;
      return daysAgo > 7 && lead.tryOnCount > 0;
    }
  }
}

export function LeadsTab({ leads, isDark }: LeadsTabProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<LeadSortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [filter, setFilter] = useState<LeadFilter>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleSort = (field: LeadSortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  // Filter counts
  const filterCounts = useMemo(() => ({
    all: leads.length,
    never_used: leads.filter((l) => matchesFilter(l, "never_used")).length,
    used_once: leads.filter((l) => matchesFilter(l, "used_once")).length,
    recurrent: leads.filter((l) => matchesFilter(l, "recurrent")).length,
    inactive_7d: leads.filter((l) => matchesFilter(l, "inactive_7d")).length,
  }), [leads]);

  const FILTERS: Array<{ id: LeadFilter; label: string; color?: string }> = [
    { id: "all", label: "Todos" },
    { id: "never_used", label: "Nunca usou", color: "text-red-400" },
    { id: "used_once", label: "Usou 1x", color: "text-amber-400" },
    { id: "recurrent", label: "Recorrente", color: "text-green-400" },
    { id: "inactive_7d", label: "Inativo >7d", color: "text-orange-400" },
  ];

  const sorted = useMemo(() => {
    const arr = leads.filter((l) => matchesFilter(l, filter));
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "email":
          cmp = a.email.localeCompare(b.email);
          break;
        case "createdAt":
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "tryOnCount":
          cmp = a.tryOnCount - b.tryOnCount;
          break;
        case "lastTryOn": {
          const aTime = a.lastTryOn ? new Date(a.lastTryOn).getTime() : 0;
          const bTime = b.lastTryOn ? new Date(b.lastTryOn).getTime() : 0;
          cmp = aTime - bTime;
          break;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [leads, filter, sortField, sortDir]);

  const filtered = search
    ? sorted.filter(
        (l) =>
          l.email.toLowerCase().includes(search.toLowerCase()) ||
          l.phone.includes(search.replace(/\D/g, ""))
      )
    : sorted;

  const totalPages = Math.ceil(filtered.length / LEADS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * LEADS_PER_PAGE,
    page * LEADS_PER_PAGE
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const btnStyle = isDark
    ? "border-white/10 text-white/50 hover:bg-white/5"
    : "border-gray-200 text-gray-500 hover:bg-gray-100";

  // Lead engagement ranking (score = tryOnCount * 2, sorted desc)
  const topEngaged = useMemo(() => {
    return [...leads]
      .filter((l) => l.tryOnCount > 0)
      .sort((a, b) => b.tryOnCount - a.tryOnCount)
      .slice(0, 5);
  }, [leads]);

  return (
    <div className="space-y-4">
      {/* Top Engaged Leads */}
      {topEngaged.length > 0 && (
        <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${textPrimary(isDark)}`}>
            <span>🏆</span> Leads Mais Engajados
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {topEngaged.map((lead, i) => (
              <div key={lead.email} className={`rounded-xl p-3 text-center ${cardInnerBg(isDark)}`}>
                <div className="text-lg mb-1">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </div>
                <p className={`text-xs truncate ${textSecondary(isDark)}`}>{lead.email.split("@")[0]}</p>
                <p className="text-teal-400 text-sm font-bold">{lead.tryOnCount} usos</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); setPage(1); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              filter === f.id
                ? "bg-teal-400 text-black"
                : isDark
                ? "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                : "bg-gray-200/60 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            }`}
          >
            {f.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
              filter === f.id
                ? "bg-black/20 text-black"
                : isDark ? "bg-white/10 text-white/40" : "bg-gray-300/60 text-gray-500"
            }`}>
              {filterCounts[f.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Export + Count */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/30" : "text-gray-400"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por email ou telefone..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${inputBg(isDark)}`}
          />
        </div>
        <button
          onClick={() => exportLeadsCsv(filtered)}
          disabled={filtered.length === 0}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
            isDark
              ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar CSV
        </button>
        <span className={`text-sm ${textMuted(isDark)}`}>
          {filtered.length} {filtered.length === 1 ? "lead" : "leads"}
        </span>
      </div>

      {/* Table */}
      <div className={`border rounded-2xl overflow-hidden ${cardBg(isDark)}`}>
        {/* Sortable header */}
        <div className={`hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b ${isDark ? "border-white/5" : "border-gray-100"}`}>
          {COLUMNS.map((col) => (
            <button
              key={col.field}
              onClick={() => handleSort(col.field)}
              className={`${col.span} flex items-center gap-1 text-xs font-medium uppercase tracking-wider transition-colors ${
                sortField === col.field ? "text-teal-400" : `${isDark ? "text-white/40 hover:text-white/60" : "text-gray-400 hover:text-gray-600"}`
              }`}
            >
              {col.label}
              {sortField === col.field && (
                <span className="text-[10px]">{sortDir === "asc" ? "▲" : "▼"}</span>
              )}
            </button>
          ))}
          <div className={`col-span-2 text-xs font-medium uppercase tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>
            Telefone
          </div>
        </div>

        {paginated.length === 0 ? (
          <p className={`text-sm text-center py-12 ${textMuted(isDark)}`}>Nenhum lead encontrado</p>
        ) : (
          <div className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
            {paginated.map((lead) => (
              <div
                key={lead.email}
                onClick={() => setSelectedLead(lead)}
                className={`grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-5 py-4 transition-colors cursor-pointer ${
                  isDark ? "hover:bg-white/[0.04]" : "hover:bg-gray-50"
                }`}
              >
                <div className="sm:col-span-4">
                  <p className={`text-sm ${textSecondary(isDark)}`}>{lead.email}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className={`text-sm ${textMuted(isDark)}`}>{formatDate(lead.createdAt)}</p>
                </div>
                <div className="sm:col-span-2">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      lead.tryOnCount > 0
                        ? "bg-teal-400/10 text-teal-400"
                        : isDark ? "bg-white/5 text-white/30" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {lead.tryOnCount} {lead.tryOnCount === 1 ? "uso" : "usos"}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <p className={`text-sm ${textMuted(isDark)}`}>
                    {lead.lastTryOn ? formatDate(lead.lastTryOn) : "—"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <a
                    href={`https://wa.me/55${lead.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-400 text-sm hover:underline"
                  >
                    {formatPhone(lead.phone)}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className={`text-xs ${textMuted(isDark)}`}>
            Mostrando {(page - 1) * LEADS_PER_PAGE + 1}–
            {Math.min(page * LEADS_PER_PAGE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3 py-1.5 rounded-lg text-xs border disabled:opacity-30 disabled:cursor-not-allowed transition-all ${btnStyle}`}
            >
              Anterior
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    page === pageNum
                      ? "bg-teal-400 text-black"
                      : isDark ? "text-white/50 hover:bg-white/5" : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-3 py-1.5 rounded-lg text-xs border disabled:opacity-30 disabled:cursor-not-allowed transition-all ${btnStyle}`}
            >
              Proximo
            </button>
          </div>
        </div>
      )}
      {/* Timeline Modal */}
      {selectedLead && (
        <LeadTimelineModal
          lead={selectedLead}
          isDark={isDark}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
