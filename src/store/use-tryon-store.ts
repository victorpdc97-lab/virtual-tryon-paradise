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
  intermediateUrl: null,
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

  selectItem: (product) => {
    const state = get();
    const hadItems = [state.selectedItems.tops, state.selectedItems.bottoms, state.selectedItems.shoes].some(Boolean);
    set({
      selectedItems: {
        ...state.selectedItems,
        [product.category]: product,
      },
    });
    // Track first item selection in funnel (fire-and-forget)
    if (!hadItems) {
      fetch("/api/track-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "funnel", step: "look_selected" }),
      }).catch(() => {});
    }
  },

  removeItem: (category) => {
    const state = get();
    set({
      selectedItems: { ...state.selectedItems, [category]: null },
    });
  },

  clearItems: () =>
    set({
      selectedItems: { tops: null, bottoms: null, shoes: null },
    }),

  getSelectedCount: () => {
    const { selectedItems } = get();
    return [selectedItems.tops, selectedItems.bottoms, selectedItems.shoes]
      .filter(Boolean).length;
  },

  getSelectedList: () => {
    const { selectedItems } = get();
    const list: Product[] = [];

    if (selectedItems.tops) list.push(selectedItems.tops);
    if (selectedItems.bottoms) list.push(selectedItems.bottoms);
    if (selectedItems.shoes) list.push(selectedItems.shoes);

    return list;
  },

  setPipelineStatus: (update) =>
    set((state) => ({
      pipeline: { ...state.pipeline, ...update },
    })),

  resetPipeline: () => set({ pipeline: { ...initialPipeline } }),
}));
