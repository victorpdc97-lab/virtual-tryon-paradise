export interface Lead {
  email: string;
  phone: string;
  createdAt: string;
  tryOnCount: number;
  lastTryOn: string | null;
}

export interface ProductStat {
  productId: number;
  productName: string;
  tryOnCount: number;
  buyClickCount: number;
}

export interface ConversionStat extends ProductStat {
  conversionRate: number;
}

export interface Activity {
  type: "lead" | "tryon" | "buy";
  label: string;
  ts: number;
}

export interface Analytics {
  totalTryOns: number;
  totalBuyClicks: number;
  overallConversion: number;
  topTried: ProductStat[];
  topBought: ProductStat[];
  conversionRates: ConversionStat[];
  dailyStats: Record<string, number>;
  hourlyStats: Record<string, number>;
  avgProcessingTime: number | null;
  activities: Activity[];
  ratings: { up: number; down: number };
}

export interface DashboardData {
  analytics: Analytics;
  leads: Lead[];
  credits: number;
  token?: string;
}

export type Tab = "overview" | "leads" | "products" | "conversion" | "settings";
export type Theme = "dark" | "light";

export type SortDirection = "asc" | "desc";
export type LeadSortField = "email" | "createdAt" | "tryOnCount" | "lastTryOn";
