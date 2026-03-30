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

export interface FunnelCounts {
  lead_signup: number;
  photo_upload: number;
  look_selected: number;
  tryon_started: number;
  tryon_completed: number;
  buy_click: number;
}

export interface TimingStat {
  avg: number;
  p50: number;
  p90: number;
  count: number;
}

export interface CohortEntry {
  cohortWeek: string;
  signups: number;
  returnsByWeek: Record<string, number>;
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
  funnel: FunnelCounts;
  timingStats: Record<string, TimingStat>;
  processingDistribution: { under60: number; under120: number; over120: number };
  cohorts: CohortEntry[];
  avgDailyTryOns: number;
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
