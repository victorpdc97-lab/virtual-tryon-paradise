import { loadFromBlob, flushToBlob } from "./persistence";

interface ProductStat {
  productId: number;
  productName: string;
  tryOnCount: number;
  buyClickCount: number;
  lastTryOn: number;
}

interface Activity {
  type: "lead" | "tryon" | "buy";
  label: string;
  ts: number;
}

interface FunnelCounts {
  lead_signup: number;
  photo_upload: number;
  look_selected: number;
  tryon_started: number;
  tryon_completed: number;
  buy_click: number;
}

interface TimingEntry {
  step: "upload" | "selection" | "processing";
  durationMs: number;
  ts: number;
}

// "YYYY-Wnn" → { signups: number; week1: number; week2: number; ... }
interface CohortEntry {
  cohortWeek: string;
  signups: number;
  returnsByWeek: Record<string, number>; // "week1", "week2", etc. → count of users active
}

interface AnalyticsStore {
  totalTryOns: number;
  totalBuyClicks: number;
  products: Record<string, ProductStat>;
  dailyTryOns: Record<string, number>;
  hourlyTryOns?: Record<string, number>;
  processingTimes?: number[];
  activities?: Activity[];
  ratings?: { up: number; down: number };
  funnel?: FunnelCounts;
  timings?: TimingEntry[];
  cohorts?: Record<string, CohortEntry>;
}

interface AnalyticsData {
  totalTryOns: number;
  totalBuyClicks: number;
  products: Map<number, ProductStat>;
  dailyTryOns: Map<string, number>;
  processingTimes: number[];
  activities: Activity[];
  hourlyTryOns: Map<string, number>;
  ratings: { up: number; down: number };
  funnel: FunnelCounts;
  timings: TimingEntry[];
  cohorts: Map<string, CohortEntry>;
}

const analytics: AnalyticsData = {
  totalTryOns: 0,
  totalBuyClicks: 0,
  products: new Map(),
  dailyTryOns: new Map(),
  processingTimes: [],
  activities: [],
  hourlyTryOns: new Map(),
  ratings: { up: 0, down: 0 },
  funnel: { lead_signup: 0, photo_upload: 0, look_selected: 0, tryon_started: 0, tryon_completed: 0, buy_click: 0 },
  timings: [],
  cohorts: new Map(),
};

function addActivity(type: Activity["type"], label: string) {
  analytics.activities.push({ type, label, ts: Date.now() });
  if (analytics.activities.length > 50) {
    analytics.activities = analytics.activities.slice(-50);
  }
}

let initPromise: Promise<void> | null = null;

function init(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const data = await loadFromBlob<AnalyticsStore>("analytics");
      if (data) {
        analytics.totalTryOns = Math.max(analytics.totalTryOns, data.totalTryOns || 0);
        analytics.totalBuyClicks = Math.max(analytics.totalBuyClicks, data.totalBuyClicks || 0);

        if (data.products) {
          for (const [id, stat] of Object.entries(data.products)) {
            if (!analytics.products.has(Number(id))) {
              analytics.products.set(Number(id), stat);
            }
          }
        }

        if (data.dailyTryOns) {
          for (const [day, count] of Object.entries(data.dailyTryOns)) {
            const existing = analytics.dailyTryOns.get(day) || 0;
            analytics.dailyTryOns.set(day, Math.max(existing, count));
          }
        }

        if (data.processingTimes?.length && analytics.processingTimes.length === 0) {
          analytics.processingTimes = data.processingTimes;
        }

        if (data.activities?.length && analytics.activities.length === 0) {
          analytics.activities = data.activities;
        }

        if (data.hourlyTryOns && analytics.hourlyTryOns.size === 0) {
          for (const [key, count] of Object.entries(data.hourlyTryOns)) {
            analytics.hourlyTryOns.set(key, count);
          }
        }

        if (data.ratings) {
          analytics.ratings.up = Math.max(analytics.ratings.up, data.ratings.up || 0);
          analytics.ratings.down = Math.max(analytics.ratings.down, data.ratings.down || 0);
        }

        if (data.funnel) {
          for (const key of Object.keys(analytics.funnel) as (keyof FunnelCounts)[]) {
            analytics.funnel[key] = Math.max(analytics.funnel[key], data.funnel[key] || 0);
          }
        }

        if (data.timings?.length && analytics.timings.length === 0) {
          analytics.timings = data.timings;
        }

        if (data.cohorts && analytics.cohorts.size === 0) {
          for (const [week, entry] of Object.entries(data.cohorts)) {
            analytics.cohorts.set(week, entry);
          }
        }
      }
    })();
  }
  return initPromise;
}

function getSerializable(): AnalyticsStore {
  return {
    totalTryOns: analytics.totalTryOns,
    totalBuyClicks: analytics.totalBuyClicks,
    products: Object.fromEntries(analytics.products),
    dailyTryOns: Object.fromEntries(analytics.dailyTryOns),
    processingTimes: analytics.processingTimes.slice(-100),
    activities: analytics.activities.slice(-50),
    hourlyTryOns: Object.fromEntries(analytics.hourlyTryOns),
    ratings: { ...analytics.ratings },
    funnel: { ...analytics.funnel },
    timings: analytics.timings.slice(-200),
    cohorts: Object.fromEntries(analytics.cohorts),
  };
}

function flush() {
  flushToBlob("analytics", getSerializable);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function trackProcessingTime(durationMs: number) {
  init().catch(() => {});
  analytics.processingTimes.push(durationMs);
  // Keep last 100 entries
  if (analytics.processingTimes.length > 100) {
    analytics.processingTimes = analytics.processingTimes.slice(-100);
  }
  flush();
}

function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function trackFunnelEvent(step: keyof FunnelCounts) {
  init().catch(() => {});
  analytics.funnel[step]++;
  flush();
}

export function trackTiming(step: TimingEntry["step"], durationMs: number) {
  init().catch(() => {});
  analytics.timings.push({ step, durationMs, ts: Date.now() });
  if (analytics.timings.length > 200) {
    analytics.timings = analytics.timings.slice(-200);
  }
  flush();
}

export function trackCohortActivity(leadCreatedAt: string) {
  init().catch(() => {});
  const cohortWeek = getISOWeek(new Date(leadCreatedAt));
  const currentWeek = getISOWeek(new Date());

  const entry = analytics.cohorts.get(cohortWeek) || {
    cohortWeek,
    signups: 0,
    returnsByWeek: {},
  };

  // Calculate weeks since cohort start
  const cohortDate = new Date(leadCreatedAt);
  const now = new Date();
  const weeksDiff = Math.floor((now.getTime() - cohortDate.getTime()) / (7 * 86400000));
  const weekKey = `week${weeksDiff}`;

  entry.returnsByWeek[weekKey] = (entry.returnsByWeek[weekKey] || 0) + 1;
  analytics.cohorts.set(cohortWeek, entry);
  flush();
}

export function trackLeadCreated(email: string) {
  init().catch(() => {});
  analytics.funnel.lead_signup++;
  addActivity("lead", email);

  // Initialize cohort for this week
  const cohortWeek = getISOWeek(new Date());
  const entry = analytics.cohorts.get(cohortWeek) || {
    cohortWeek,
    signups: 0,
    returnsByWeek: {},
  };
  entry.signups++;
  analytics.cohorts.set(cohortWeek, entry);

  flush();
}

export function trackTryOn(items: Array<{ id: number; name: string }>) {
  init().catch(() => {});

  analytics.totalTryOns++;
  analytics.funnel.tryon_started++;
  const names = items.map((i) => i.name).filter(Boolean);
  addActivity("tryon", names.length > 0 ? names.join(", ") : "try-on");

  const day = today();
  analytics.dailyTryOns.set(day, (analytics.dailyTryOns.get(day) || 0) + 1);

  // Track hourly usage (dayOfWeek-hour, e.g. "1-14" = Monday 14h)
  const now = new Date();
  const hourKey = `${now.getDay()}-${now.getHours()}`;
  analytics.hourlyTryOns.set(hourKey, (analytics.hourlyTryOns.get(hourKey) || 0) + 1);

  for (const item of items) {
    const existing = analytics.products.get(item.id);
    if (existing) {
      existing.tryOnCount++;
      existing.lastTryOn = Date.now();
    } else {
      analytics.products.set(item.id, {
        productId: item.id,
        productName: item.name,
        tryOnCount: 1,
        buyClickCount: 0,
        lastTryOn: Date.now(),
      });
    }
  }

  flush();
}

export function trackAdminLogin(adminLabel: string) {
  init().catch(() => {});
  addActivity("lead", `Login: ${adminLabel}`);
  flush();
}

export function trackRating(value: "up" | "down") {
  init().catch(() => {});
  if (value === "up") analytics.ratings.up++;
  else analytics.ratings.down++;
  flush();
}

export function trackTryOnCompleted() {
  init().catch(() => {});
  analytics.funnel.tryon_completed++;
  flush();
}

export function trackBuyClick(productId: number, productName: string) {
  init().catch(() => {});

  analytics.totalBuyClicks++;
  analytics.funnel.buy_click++;
  addActivity("buy", productName || `Produto #${productId}`);

  const existing = analytics.products.get(productId);
  if (existing) {
    existing.buyClickCount++;
  } else {
    analytics.products.set(productId, {
      productId,
      productName,
      tryOnCount: 0,
      buyClickCount: 1,
      lastTryOn: 0,
    });
  }

  flush();
}

export async function getAnalytics() {
  await init();

  const productStats = Array.from(analytics.products.values())
    .sort((a, b) => b.tryOnCount - a.tryOnCount);

  const topTried = productStats.slice(0, 20);
  const topBought = [...productStats]
    .sort((a, b) => b.buyClickCount - a.buyClickCount)
    .filter((p) => p.buyClickCount > 0)
    .slice(0, 20);

  const conversionRates = productStats
    .filter((p) => p.tryOnCount > 0 && p.buyClickCount > 0)
    .map((p) => ({
      ...p,
      conversionRate: Math.round((p.buyClickCount / p.tryOnCount) * 100),
    }))
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 20);

  const dailyStats = Object.fromEntries(analytics.dailyTryOns);

  const times = analytics.processingTimes;
  const avgProcessingTime = times.length > 0
    ? Math.round(times.reduce((a, b) => a + b, 0) / times.length / 1000)
    : null;

  // Timing stats by step
  const timingsByStep: Record<string, number[]> = {};
  for (const t of analytics.timings) {
    if (!timingsByStep[t.step]) timingsByStep[t.step] = [];
    timingsByStep[t.step].push(t.durationMs);
  }
  const timingStats: Record<string, { avg: number; p50: number; p90: number; count: number }> = {};
  for (const [step, durations] of Object.entries(timingsByStep)) {
    const sorted = [...durations].sort((a, b) => a - b);
    const avg = Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length);
    const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
    const p90 = sorted[Math.floor(sorted.length * 0.9)] || 0;
    timingStats[step] = { avg, p50, p90, count: sorted.length };
  }

  // Processing time distribution
  const processingDistribution = { under60: 0, under120: 0, over120: 0 };
  for (const ms of analytics.processingTimes) {
    const s = ms / 1000;
    if (s < 60) processingDistribution.under60++;
    else if (s < 120) processingDistribution.under120++;
    else processingDistribution.over120++;
  }

  // Cohort data sorted by week
  const cohorts = Array.from(analytics.cohorts.values())
    .sort((a, b) => a.cohortWeek.localeCompare(b.cohortWeek))
    .slice(-12); // Last 12 weeks

  // Credits projection (estimate days remaining based on recent daily usage)
  const dailyEntries = Object.entries(analytics.dailyTryOns).sort(([a], [b]) => b.localeCompare(a));
  const last7Days = dailyEntries.slice(0, 7);
  const avgDailyTryOns = last7Days.length > 0
    ? last7Days.reduce((sum, [, c]) => sum + c, 0) / last7Days.length
    : 0;

  return {
    totalTryOns: analytics.totalTryOns,
    totalBuyClicks: analytics.totalBuyClicks,
    overallConversion: analytics.totalTryOns > 0
      ? Math.round((analytics.totalBuyClicks / analytics.totalTryOns) * 100)
      : 0,
    topTried,
    topBought,
    conversionRates,
    dailyStats,
    avgProcessingTime,
    activities: analytics.activities.slice(-30).reverse(),
    hourlyStats: Object.fromEntries(analytics.hourlyTryOns),
    ratings: { ...analytics.ratings },
    funnel: { ...analytics.funnel },
    timingStats,
    processingDistribution,
    cohorts,
    avgDailyTryOns: Math.round(avgDailyTryOns * 10) / 10,
  };
}
