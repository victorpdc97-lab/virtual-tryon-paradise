"use client";

import { useState, useMemo } from "react";
import type { Lead, LeadSortField, SortDirection } from "../types";
import { formatDate, formatPhone, exportLeadsCsv } from "../utils";

const LEADS_PER_PAGE = 20;

interface LeadsTabProps {
  leads: Lead[];
}

const COLUMNS: Array<{ field: LeadSortField; label: string; span: string }> = [
  { field: "email", label: "Email", span: "col-span-4" },
  { field: "createdAt", label: "Cadastro", span: "col-span-2" },
  { field: "tryOnCount", label: "Try-Ons", span: "col-span-2" },
  { field: "lastTryOn", label: "Ultimo Uso", span: "col-span-2" },
];

export function LeadsTab({ leads }: LeadsTabProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<LeadSortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const handleSort = (field: LeadSortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  const sorted = useMemo(() => {
    const arr = [...leads];
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
  }, [leads, sortField, sortDir]);

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

  return (
    <div className="space-y-4">
      {/* Search + Export + Count */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-teal-400/50 transition-all"
          />
        </div>
        <button
          onClick={() => exportLeadsCsv(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar CSV
        </button>
        <span className="text-white/30 text-sm">
          {filtered.length} {filtered.length === 1 ? "lead" : "leads"}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        {/* Sortable header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5">
          {COLUMNS.map((col) => (
            <button
              key={col.field}
              onClick={() => handleSort(col.field)}
              className={`${col.span} flex items-center gap-1 text-xs font-medium uppercase tracking-wider transition-colors ${
                sortField === col.field ? "text-teal-400" : "text-white/40 hover:text-white/60"
              }`}
            >
              {col.label}
              {sortField === col.field && (
                <span className="text-[10px]">{sortDir === "asc" ? "▲" : "▼"}</span>
              )}
            </button>
          ))}
          {/* Telefone column (not sortable) */}
          <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-white/40">
            Telefone
          </div>
        </div>

        {paginated.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-12">Nenhum lead encontrado</p>
        ) : (
          <div className="divide-y divide-white/5">
            {paginated.map((lead) => (
              <div
                key={lead.email}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="sm:col-span-4">
                  <p className="text-white/80 text-sm">{lead.email}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-white/40 text-sm">{formatDate(lead.createdAt)}</p>
                </div>
                <div className="sm:col-span-2">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      lead.tryOnCount > 0
                        ? "bg-teal-400/10 text-teal-400"
                        : "bg-white/5 text-white/30"
                    }`}
                  >
                    {lead.tryOnCount} {lead.tryOnCount === 1 ? "uso" : "usos"}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-white/30 text-sm">
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
          <p className="text-white/30 text-xs">
            Mostrando {(page - 1) * LEADS_PER_PAGE + 1}–
            {Math.min(page * LEADS_PER_PAGE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/50 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                      : "text-white/50 hover:bg-white/5"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/50 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Proximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
