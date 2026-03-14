"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product, GarmentCategory } from "@/types";
import { ProductCard } from "./product-card";
import { CategoryFilter } from "./category-filter";

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<GarmentCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProducts = useCallback(
    async (pageNum: number, cat: GarmentCategory | "all", searchTerm: string, append = false) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ page: String(pageNum) });
        if (cat !== "all") params.set("category", cat);
        if (searchTerm.trim()) params.set("search", searchTerm.trim());

        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        setProducts((prev) => (append ? [...prev, ...data.products] : data.products));
        setHasMore(data.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao buscar produtos");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setPage(1);
    fetchProducts(1, category, search);
  }, [category, search, fetchProducts]);

  const handleSearchChange = (value: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(value);
    }, 300);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, category, search, true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg lg:text-xl">Catálogo Paradise</h2>
        <span className="text-white/40 text-xs sm:text-sm">
          {products.length} {products.length === 1 ? "peça" : "peças"}
        </span>
      </div>

      <div className="relative">
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
          placeholder="Buscar produto..."
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-teal-400/50 focus:bg-white/[0.07] transition-all"
        />
      </div>

      <CategoryFilter active={category} onChange={setCategory} />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {!loading && products.length === 0 && !error && (
        <div className="text-center py-16 lg:py-24 text-white/40">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-base lg:text-lg mb-2">Nenhum produto encontrado</p>
          <p className="text-sm text-white/25">Tente outra categoria ou limpe a busca</p>
          {category !== "all" && (
            <button
              onClick={() => setCategory("all")}
              className="mt-4 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-sm hover:bg-white/10 hover:text-white/70 transition-all"
            >
              Ver todos os produtos
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {loading && products.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-white/10 overflow-hidden">
                <div className="aspect-square bg-white/[0.04] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent animate-shimmer" />
                </div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-white/[0.06] rounded-lg w-3/4" />
                  <div className="h-3 bg-white/[0.04] rounded-lg w-1/2" />
                </div>
              </div>
            ))
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

      {loading && products.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {hasMore && !loading && products.length > 0 && (
        <button
          onClick={loadMore}
          className="w-full py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-all text-sm active:scale-[0.98]"
        >
          Carregar mais
        </button>
      )}
    </div>
  );
}
