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
  baseLayer: Product | null;
  showBaseToast: boolean;
  pipeline: TryOnPipelineState;

  setLead: (lead: LeadInfo) => void;
  setPhoto: (url: string, file: File, blobUrl: string) => void;
  clearPhoto: () => void;
  selectItem: (product: Product) => void;
  removeItem: (category: GarmentCategory) => void;
  clearItems: () => void;
  getSelectedCount: () => number;
  getSelectedList: () => Product[];
  setBaseLayer: (product: Product) => void;
  clearBaseLayer: () => void;
  dismissBaseToast: () => void;

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
  selectedItems: { tops: null, bottoms: null, shoes: null, overlays: null },
  baseLayer: null,
  showBaseToast: false,
  pipeline: { ...initialPipeline },

  setLead: (lead) => set({ lead }),
  setPhoto: (url, file, blobUrl) => set({ photoUrl: url, photoFile: file, photoBlobUrl: blobUrl }),
  clearPhoto: () =>
    set({ photoUrl: null, photoBlobUrl: null, photoFile: null, pipeline: { ...initialPipeline } }),

  selectItem: (product) => {
    const state = get();

    if (product.category === "overlays") {
      // Selecting an overlay (blazer)
      const currentTop = state.selectedItems.tops;

      if (currentTop) {
        // Move current top to base layer
        set({
          selectedItems: { ...state.selectedItems, overlays: product },
          baseLayer: currentTop,
          showBaseToast: false,
        });
      } else if (!state.baseLayer) {
        // No top and no base — need to auto-fetch one
        // Set overlay immediately, base will be set async via setBaseLayer
        set({
          selectedItems: { ...state.selectedItems, overlays: product },
          showBaseToast: true,
        });
        // Fetch default base layer
        fetchDefaultBase().then((base) => {
          if (base && get().selectedItems.overlays?.id === product.id) {
            set({ baseLayer: base, showBaseToast: true });
          }
        });
      } else {
        // Already has a base layer from previous overlay
        set({
          selectedItems: { ...state.selectedItems, overlays: product },
        });
      }
      return;
    }

    if (product.category === "tops" && state.selectedItems.overlays) {
      // Selecting a top while overlay is active — set as base layer
      set({ baseLayer: product, showBaseToast: false });
      return;
    }

    set({
      selectedItems: {
        ...state.selectedItems,
        [product.category]: product,
      },
    });
  },

  removeItem: (category) => {
    const state = get();

    if (category === "overlays") {
      // Removing overlay: base becomes normal top
      const base = state.baseLayer;
      set({
        selectedItems: {
          ...state.selectedItems,
          overlays: null,
          tops: base || state.selectedItems.tops,
        },
        baseLayer: null,
        showBaseToast: false,
      });
      return;
    }

    if (category === "tops" && state.selectedItems.overlays && state.baseLayer) {
      // Trying to remove base while overlay active — auto-select new base
      set({ showBaseToast: true });
      fetchDefaultBase().then((base) => {
        if (base && get().selectedItems.overlays) {
          set({ baseLayer: base, showBaseToast: true });
        }
      });
      return;
    }

    set({
      selectedItems: { ...state.selectedItems, [category]: null },
    });
  },

  clearItems: () =>
    set({
      selectedItems: { tops: null, bottoms: null, shoes: null, overlays: null },
      baseLayer: null,
      showBaseToast: false,
    }),

  getSelectedCount: () => {
    const { selectedItems, baseLayer } = get();
    let count = [selectedItems.tops, selectedItems.bottoms, selectedItems.shoes, selectedItems.overlays]
      .filter(Boolean).length;
    if (baseLayer && selectedItems.overlays) count++; // base counts as extra piece
    return count;
  },

  getSelectedList: () => {
    const { selectedItems, baseLayer } = get();
    const list: Product[] = [];

    if (selectedItems.overlays && baseLayer) {
      // Base first, then overlay — both sent as "tops" to Fashn
      list.push({ ...baseLayer, category: "tops" });
      list.push({ ...selectedItems.overlays, category: "tops" });
    } else if (selectedItems.tops) {
      list.push(selectedItems.tops);
    }

    if (selectedItems.bottoms) list.push(selectedItems.bottoms);
    if (selectedItems.shoes) list.push(selectedItems.shoes);

    return list;
  },

  setBaseLayer: (product) => set({ baseLayer: product, showBaseToast: true }),
  clearBaseLayer: () => set({ baseLayer: null, showBaseToast: false }),
  dismissBaseToast: () => set({ showBaseToast: false }),

  setPipelineStatus: (update) =>
    set((state) => ({
      pipeline: { ...state.pipeline, ...update },
    })),

  resetPipeline: () => set({ pipeline: { ...initialPipeline } }),
}));

// Fetch the first simple top (t-shirt/shirt) as default base layer
async function fetchDefaultBase(): Promise<Product | null> {
  try {
    const res = await fetch("/api/products?category=tops&page=1");
    if (!res.ok) return null;
    const data = await res.json();
    // Return first product that's a simple top (not an overlay)
    return data.products?.[0] || null;
  } catch {
    return null;
  }
}
