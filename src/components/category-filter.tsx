"use client";

import type { GarmentCategory } from "@/types";

interface CategoryFilterProps {
  active: GarmentCategory | "all";
  onChange: (category: GarmentCategory | "all") => void;
}

const CATEGORIES: Array<{ id: GarmentCategory | "all"; label: string; icon: string }> = [
  { id: "all", label: "Todos", icon: "grid" },
  { id: "tops", label: "Parte de Cima", icon: "tops" },
  { id: "bottoms", label: "Parte de Baixo", icon: "bottoms" },
  { id: "shoes", label: "Calçados", icon: "shoes" },
];

function CategoryIcon({ type, className }: { type: string; className?: string }) {
  const cn = className || "w-5 h-5";
  switch (type) {
    case "tops":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M6 4l-4 4 2 2 2-1v11h12V9l2 1 2-2-4-4H6z" strokeLinejoin="round" />
        </svg>
      );
    case "bottoms":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M6 4h12v6l-2 10h-3l-1-8-1 8H8L6 10V4z" strokeLinejoin="round" />
        </svg>
      );
    case "shoes":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M3 16l2-4c1-2 3-3 5-3h2l4 1c2 0 4 1 5 3v3H3z" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" strokeLinejoin="round" />
        </svg>
      );
  }
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            active === cat.id
              ? "bg-teal-400 text-black"
              : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          <CategoryIcon type={cat.icon} className="w-4 h-4" />
          {cat.label}
        </button>
      ))}
    </div>
  );
}
