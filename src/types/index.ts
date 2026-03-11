export interface NuvemshopProduct {
  id: number;
  name: { pt: string };
  description: { pt: string };
  price: string | null;
  promotional_price: string | null;
  images: Array<{ id: number; src: string }>;
  categories: Array<{ id: number; name: { pt: string } }>;
  canonical_url?: string;
  variants: Array<{
    id: number;
    price: string;
    promotional_price: string | null;
    stock: number | null;
    values: Array<{ pt: string }>;
  }>;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  promoPrice: number | null;
  image: string;
  category: GarmentCategory;
  nuvemshopUrl: string;
}

export type GarmentCategory = "tops" | "bottoms" | "shoes";

export interface SelectedItems {
  tops: Product | null;
  bottoms: Product | null;
  shoes: Product | null;
}

export interface TryOnJob {
  id: string;
  status: "starting" | "in_queue" | "processing" | "completed" | "failed";
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
  output?: string;
  error?: string | null;
}

export interface TryOnRequest {
  photoUrl: string;
  items: Product[];
}

export interface TryOnPipelineState {
  jobId: string | null;
  status: "idle" | "processing" | "completed" | "failed";
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
  resultUrl: string | null;
  error: string | null;
}
