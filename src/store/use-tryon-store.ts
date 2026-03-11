"use client";

import { create } from "zustand";
import type { Product, GarmentCategory, TryOnPipelineState } from "@/types";

interface LeadInfo {
  email: string;
  phone: string;
}

interface TryOnStore {
  lead: LeadInfo | null;
  photoUrl: string | null;
  photoBlobUrl: string | null;
  photoFile: File | null;
  selectedItems: Record<GarmentCategory, Product | null>;
  pipeline: TryOnPipelineState;

  setLead: (lead: LeadInfo) => void;
  setPhoto: (url: string, file: File, blobUrl: string) => void;
  clearPhoto: () => void;
  selectItem: (product: Product) => void;
  removeItem: (category: GarmentCategory) => void;
  clearItems: () => void;
  getSelectedCount: () => number;
  getSelectedList: () => Product[];

  setPipelineStatus: (update: Partial<TryOnPipelineState>) => void;
  resetPipeline: () => void;
}

const initialPipeline: TryOnPipelineState = {
  jobId: null,
  status: "idle",
  currentStep: 0,
  totalSteps: 0,
  stepLabel: "",
  resultUrl: null,
  error: null,
};

export const useTryOnStore = create<TryOnStore>((set, get) => ({
  lead: null,
  photoUrl: null,
  photoBlobUrl: null,
  photoFile: null,
  selectedItems: { tops: null, bottoms: null, shoes: null },
  pipeline: { ...initialPipeline },

  setLead: (lead) => set({ lead }),
  setPhoto: (url, file, blobUrl) => set({ photoUrl: url, photoFile: file, photoBlobUrl: blobUrl }),
  clearPhoto: () =>
    set({ photoUrl: null, photoBlobUrl: null, photoFile: null, pipeline: { ...initialPipeline } }),

  selectItem: (product) =>
    set((state) => ({
      selectedItems: {
        ...state.selectedItems,
        [product.category]: product,
      },
    })),

  removeItem: (category) =>
    set((state) => ({
      selectedItems: { ...state.selectedItems, [category]: null },
    })),

  clearItems: () =>
    set({ selectedItems: { tops: null, bottoms: null, shoes: null } }),

  getSelectedCount: () => {
    const items = get().selectedItems;
    return [items.tops, items.bottoms, items.shoes].filter(Boolean).length;
  },

  getSelectedList: () => {
    const items = get().selectedItems;
    return [items.tops, items.bottoms, items.shoes].filter(
      (item): item is Product => item !== null
    );
  },

  setPipelineStatus: (update) =>
    set((state) => ({
      pipeline: { ...state.pipeline, ...update },
    })),

  resetPipeline: () => set({ pipeline: { ...initialPipeline } }),
}));
