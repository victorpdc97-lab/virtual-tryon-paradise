"use client";

import { useMemo } from "react";
import type { Lead, LeadEvent } from "../types";
import { formatPhone, cardBg, textPrimary, textSecondary, textMuted } from "../utils";

interface LeadTimelineModalProps {
  lead: Lead;
  isDark: boolean;
  onClose: () => void;
}

const EVENT_CONFIG: Record<LeadEvent["type"], { icon: string; color: string; label: string }> = {
  signup: { icon: "👤", color: "text-gray-400", label: "Cadastrou-se" },
  photo_upload: { icon: "📷", color: "text-gray-400", label: "Enviou foto" },
  product_selected: { icon: "➕", color: "text-teal-400", label: "Selecionou" },
  product_removed: { icon: "➖", color: "text-gray-400", label: "Removeu" },
  tryon_started: { icon: "▶️", color: "text-teal-400", label: "Iniciou try-on" },
  tryon_completed: { icon: "✅", color: "text-green-400", label: "Try-on concluido" },
  tryon_failed: { icon: "❌", color: "text-red-400", label: "Try-on falhou" },
  buy_click: { icon: "🛒", color: "text-green-400", label: "Clicou comprar" },
  rating: { icon: "👍", color: "text-teal-400", label: "Avaliou" },
  download: { icon: "⬇️", color: "text-gray-400", label: "Baixou imagem" },
};

function formatEventDescription(event: LeadEvent): string {
  const config = EVENT_CONFIG[event.type];
  const d = event.data;

  switch (event.type) {
    case "photo_upload":
      return d?.sizeKb ? `${config.label} (${d.sizeKb}KB)` : config.label;
    case "product_selected":
    case "product_removed":
      return d?.productName ? `${config.label} ${d.productName} (${d.category})` : config.label;
    case "tryon_started":
      return d?.steps ? `${config.label} (${d.steps} ${Number(d.steps) === 1 ? "peca" : "pecas"})` : config.label;
    case "tryon_completed": {
      const secs = d?.durationMs ? Math.round(Number(d.durationMs) / 1000) : null;
      return secs ? `${config.label} (${secs}s)` : config.label;
    }
    case "tryon_failed":
      return d?.error ? `${config.label}: ${d.error}` : config.label;
    case "buy_click":
      return d?.productName ? `${config.label} ${d.productName}` : config.label;
    case "rating":
      return d?.value === "up" ? "Avaliou: positivo" : d?.value === "down" ? "Avaliou: negativo" : config.label;
    default:
      return config.label;
  }
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `ha ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `ha ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `ha ${days}d`;
  return new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatEventTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function getDayLabel(ts: number): string {
  const date = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function getLeadStatus(lead: Lead): { label: string; color: string } {
  if (lead.tryOnCount === 0) return { label: "Novo", color: "bg-blue-400/10 text-blue-400" };
  const lastActive = lead.lastTryOn || lead.createdAt;
  const daysAgo = (Date.now() - new Date(lastActive).getTime()) / 86400000;
  if (daysAgo <= 7) return { label: "Ativo", color: "bg-green-400/10 text-green-400" };
  return { label: "Inativo", color: "bg-orange-400/10 text-orange-400" };
}

export function LeadTimelineModal({ lead, isDark, onClose }: LeadTimelineModalProps) {
  const status = getLeadStatus(lead);
  const events = lead.events || [];
  const buyClicks = events.filter((e) => e.type === "buy_click").length;

  // Group events by day
  const groupedEvents = useMemo(() => {
    const sorted = [...events].sort((a, b) => b.ts - a.ts);
    const groups: Array<{ label: string; events: LeadEvent[] }> = [];
    let currentLabel = "";

    for (const event of sorted) {
      const label = getDayLabel(event.ts);
      if (label !== currentLabel) {
        groups.push({ label, events: [] });
        currentLabel = label;
      }
      groups[groups.length - 1].events.push(event);
    }

    return groups;
  }, [events]);

  const daysAgo = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000);

  const handleCopyTimeline = () => {
    const lines = events
      .sort((a, b) => b.ts - a.ts)
      .map((e) => `[${new Date(e.ts).toLocaleString("pt-BR")}] ${formatEventDescription(e)}`);
    const text = `Timeline: ${lead.email}\n${lines.join("\n")}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl ${
          isDark ? "bg-[#111] border-white/10" : "bg-white border-gray-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors z-10 ${
            isDark ? "hover:bg-white/10 text-white/40" : "hover:bg-gray-100 text-gray-400"
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className={`p-5 pb-4 border-b ${isDark ? "border-white/5" : "border-gray-100"}`}>
          <div className="flex items-start gap-3 pr-8">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
              isDark ? "bg-teal-400/10 text-teal-400" : "bg-teal-50 text-teal-600"
            }`}>
              {lead.email[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-semibold truncate ${textPrimary(isDark)}`}>{lead.email}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <a
                  href={`https://wa.me/55${lead.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 text-sm hover:underline"
                >
                  {formatPhone(lead.phone)}
                </a>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className={`rounded-xl p-3 text-center ${isDark ? "bg-white/[0.03]" : "bg-gray-50"}`}>
              <p className={`text-[10px] uppercase tracking-wider ${textMuted(isDark)}`}>Cadastro</p>
              <p className={`text-sm font-semibold mt-0.5 ${textSecondary(isDark)}`}>
                {daysAgo === 0 ? "Hoje" : `${daysAgo}d atras`}
              </p>
            </div>
            <div className={`rounded-xl p-3 text-center ${isDark ? "bg-white/[0.03]" : "bg-gray-50"}`}>
              <p className={`text-[10px] uppercase tracking-wider ${textMuted(isDark)}`}>Try-ons</p>
              <p className="text-sm font-semibold mt-0.5 text-teal-400">{lead.tryOnCount}</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${isDark ? "bg-white/[0.03]" : "bg-gray-50"}`}>
              <p className={`text-[10px] uppercase tracking-wider ${textMuted(isDark)}`}>Compras</p>
              <p className="text-sm font-semibold mt-0.5 text-green-400">{buyClicks}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-5">
          {events.length === 0 ? (
            <p className={`text-sm text-center py-8 ${textMuted(isDark)}`}>
              Nenhum evento registrado
            </p>
          ) : (
            <div className="space-y-5">
              {groupedEvents.map((group) => (
                <div key={group.label}>
                  <p className={`text-[10px] uppercase tracking-wider font-bold mb-3 ${textMuted(isDark)}`}>
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {group.events.map((event, i) => {
                      const config = EVENT_CONFIG[event.type];
                      return (
                        <div
                          key={`${event.ts}-${i}`}
                          className={`flex items-start gap-3 py-2 px-3 rounded-lg transition-colors ${
                            isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-base shrink-0 mt-0.5">{config.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${config.color}`}>
                              {formatEventDescription(event)}
                            </p>
                          </div>
                          <span className={`text-[11px] shrink-0 ${textMuted(isDark)}`}>
                            {formatEventTime(event.ts)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex gap-2 ${isDark ? "border-white/5" : "border-gray-100"}`}>
          <a
            href={`https://wa.me/55${lead.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
          <button
            onClick={handleCopyTimeline}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              isDark
                ? "border-white/10 text-white/50 hover:bg-white/5 hover:text-white"
                : "border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copiar
          </button>
        </div>
      </div>
    </div>
  );
}
