"use client";

import { useState, useMemo } from "react";
import type { Analytics, SortDirection } from "../types";
import { cardBg, cardInnerBg, textPrimary, textSecondary, textMuted, barBg, inputBg } from "../utils";

type ProductSortField = "name" | "value";

interface ProductsTabProps {
  analytics: Analytics;
  isDark: boolean;
}

export function ProductsTab({ analytics, isDark }: ProductsTabProps) {
  const [search, setSearch] = useState("");

  // Products with high try-ons but zero buy clicks
  const noClickProducts = useMemo(
    () => analytics.topTried.filter((p) => p.tryOnCount >= 3 && p.buyClickCount === 0),
    [analytics.topTried]
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
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
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${inputBg(isDark)}`}
        />
      </div>

      {/* Alert: products with no buy clicks */}
      {noClickProducts.length > 0 && (
        <div className={`border rounded-2xl p-5 ${isDark ? "bg-amber-400/5 border-amber-400/20" : "bg-amber-50 border-amber-200"}`}>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${textPrimary(isDark)}`}>
            <span>⚠️</span> Produtos sem Clique de Compra
            <span className="text-xs font-normal bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full">
              {noClickProducts.length}
            </span>
          </h3>
          <p className={`text-xs mb-3 ${textMuted(isDark)}`}>
            Experimentados 3+ vezes mas ninguem clicou para comprar — verifique preco, CTA ou qualidade do resultado
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {noClickProducts.slice(0, 6).map((p) => (
              <div key={p.productId} className={`flex items-center justify-between rounded-xl p-3 ${cardInnerBg(isDark)}`}>
                <span className={`text-sm truncate ${textSecondary(isDark)}`}>{p.productName}</span>
                <span className="text-amber-400 text-xs font-medium shrink-0 ml-2">{p.tryOnCount} try-ons</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <SortableBarChart
        title="Mais Experimentados"
        icon="🔥"
        items={analytics.topTried.map((p) => ({
          id: p.productId,
          label: p.productName,
          value: p.tryOnCount,
          alert: p.tryOnCount >= 3 && p.buyClickCount === 0,
        }))}
        color="teal"
        search={search}
        isDark={isDark}
      />

      <SortableBarChart
        title="Mais Clicados para Comprar"
        icon="🛒"
        items={analytics.topBought.map((p) => ({
          id: p.productId,
          label: p.productName,
          value: p.buyClickCount,
        }))}
        color="amber"
        search={search}
        isDark={isDark}
      />
    </div>
  );
}

function SortableBarChart({
  title,
  icon,
  items: rawItems,
  color,
  search,
  isDark,
}: {
  title: string;
  icon: string;
  items: Array<{ id: number; label: string; value: number; alert?: boolean }>;
  color: "teal" | "amber";
  search: string;
  isDark: boolean;
}) {
  const [sortField, setSortField] = useState<ProductSortField>("value");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const filtered = useMemo(() => {
    let arr = [...rawItems];
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter((item) => item.label.toLowerCase().includes(q));
    }
    arr.sort((a, b) => {
      const cmp = sortField === "name"
        ? a.label.localeCompare(b.label)
        : a.value - b.value;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [rawItems, sortField, sortDir, search]);

  const toggleSort = (field: ProductSortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "name" ? "asc" : "desc");
    }
  };

  const gradientMap = {
    teal: "from-teal-500 to-teal-400",
    amber: "from-amber-500 to-amber-400",
  };

  const maxValue = filtered.length > 0 ? Math.max(...filtered.map((i) => i.value)) : 1;

  return (
    <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>{icon}</span> {title}
        </h3>
        <div className="flex items-center gap-1">
          <span className={`text-xs mr-1 ${textMuted(isDark)}`}>Ordenar:</span>
          <button
            onClick={() => toggleSort("value")}
            className={`px-2 py-1 rounded text-xs transition-all ${
              sortField === "value" ? "text-teal-400 bg-teal-400/10" : `${textMuted(isDark)} hover:opacity-70`
            }`}
          >
            Qtd {sortField === "value" && (sortDir === "asc" ? "▲" : "▼")}
          </button>
          <button
            onClick={() => toggleSort("name")}
            className={`px-2 py-1 rounded text-xs transition-all ${
              sortField === "name" ? "text-teal-400 bg-teal-400/10" : `${textMuted(isDark)} hover:opacity-70`
            }`}
          >
            Nome {sortField === "name" && (sortDir === "asc" ? "▲" : "▼")}
          </button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className={`text-sm text-center py-8 ${textMuted(isDark)}`}>
          {search ? "Nenhum produto encontrado" : "Sem dados ainda"}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, i) => {
            const width = (item.value / maxValue) * 100;
            return (
              <div key={item.id} className="flex items-center gap-3">
                <span className={`text-xs w-6 text-right shrink-0 ${textMuted(isDark)}`}>{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm truncate ${textSecondary(isDark)}`}>{item.label}</span>
                    {item.alert && (
                      <span className="text-amber-400 text-[10px] shrink-0" title="Sem cliques de compra">⚠️</span>
                    )}
                  </div>
                  <div className={`h-5 rounded-lg overflow-hidden ${barBg(isDark)}`}>
                    <div
                      className={`h-full bg-gradient-to-r ${gradientMap[color]} rounded-lg flex items-center justify-end pr-2 transition-all duration-300`}
                      style={{ width: `${Math.max(width, 10)}%` }}
                    >
                      <span className="text-black text-xs font-bold">{item.value}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
