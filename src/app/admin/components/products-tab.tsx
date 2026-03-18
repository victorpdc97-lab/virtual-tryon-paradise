"use client";

import { useState, useMemo } from "react";
import type { Analytics, SortDirection } from "../types";

type ProductSortField = "name" | "value";

interface ProductsTabProps {
  analytics: Analytics;
}

export function ProductsTab({ analytics }: ProductsTabProps) {
  return (
    <div className="space-y-6">
      <SortableBarChart
        title="Mais Experimentados"
        icon="🔥"
        items={analytics.topTried.map((p) => ({
          id: p.productId,
          label: p.productName,
          value: p.tryOnCount,
        }))}
        color="teal"
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
      />
    </div>
  );
}

function SortableBarChart({
  title,
  icon,
  items: rawItems,
  color,
}: {
  title: string;
  icon: string;
  items: Array<{ id: number; label: string; value: number }>;
  color: "teal" | "amber";
}) {
  const [sortField, setSortField] = useState<ProductSortField>("value");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const items = useMemo(() => {
    const arr = [...rawItems];
    arr.sort((a, b) => {
      const cmp = sortField === "name"
        ? a.label.localeCompare(b.label)
        : a.value - b.value;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [rawItems, sortField, sortDir]);

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

  const maxValue = items.length > 0 ? Math.max(...items.map((i) => i.value)) : 1;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>{icon}</span> {title}
        </h3>
        <div className="flex items-center gap-1">
          <span className="text-white/20 text-xs mr-1">Ordenar:</span>
          <button
            onClick={() => toggleSort("value")}
            className={`px-2 py-1 rounded text-xs transition-all ${
              sortField === "value"
                ? "text-teal-400 bg-teal-400/10"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            Qtd {sortField === "value" && (sortDir === "asc" ? "▲" : "▼")}
          </button>
          <button
            onClick={() => toggleSort("name")}
            className={`px-2 py-1 rounded text-xs transition-all ${
              sortField === "name"
                ? "text-teal-400 bg-teal-400/10"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            Nome {sortField === "name" && (sortDir === "asc" ? "▲" : "▼")}
          </button>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-8">Sem dados ainda</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => {
            const width = (item.value / maxValue) * 100;
            return (
              <div key={item.id} className="flex items-center gap-3">
                <span className="text-white/30 text-xs w-6 text-right shrink-0">
                  {i + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/70 text-sm truncate">
                      {item.label}
                    </span>
                  </div>
                  <div className="h-5 bg-white/5 rounded-lg overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${gradientMap[color]} rounded-lg flex items-center justify-end pr-2 transition-all duration-300`}
                      style={{ width: `${Math.max(width, 10)}%` }}
                    >
                      <span className="text-black text-xs font-bold">
                        {item.value}
                      </span>
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
