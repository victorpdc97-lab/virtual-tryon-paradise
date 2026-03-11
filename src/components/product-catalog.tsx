"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product, GarmentCategory } from "@/types";
import { ProductCard } from "./product-card";
import { CategoryFilter } from "./category-filter";

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<GarmentCategory | "all">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (pageNum: number, cat: GarmentCategory | "all", append = false) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ page: String(pageNum) });
        if (cat !== "all") params.set("category", cat);

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
    fetchProducts(1, category);
  }, [category, fetchProducts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, category, true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">Catálogo Paradise</h2>
        <span className="text-white/40 text-sm">
          {products.length} {products.length === 1 ? "peça" : "peças"}
        </span>
      </div>

      <CategoryFilter active={category} onChange={setCategory} />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {!loading && products.length === 0 && !error && (
        <div className="text-center py-12 text-white/40">
          <p>Nenhum produto encontrado nesta categoria</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {hasMore && !loading && products.length > 0 && (
        <button
          onClick={loadMore}
          className="w-full py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-all text-sm"
        >
          Carregar mais
        </button>
      )}
    </div>
  );
}
