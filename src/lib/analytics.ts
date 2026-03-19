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

interface AnalyticsStore {
  totalTryOns: number;
  totalBuyClicks: number;
  products: Record<string, ProductStat>;
  dailyTryOns: Record<string, number>;
  hourlyTryOns?: Record<string, number>; // "day-hour" → count (e.g. "1-14" = Monday 14h)
  processingTimes?: number[];
  activities?: Activity[];
  ratings?: { up: number; down: number };
}

interface AnalyticsData {
  totalTryOns: number;
  totalBuyClicks: number;
  products: Map<number, ProductStat>;
  dailyTryOns: Map<string, number>;
  processingTimes: number[];
  activities: Activity[];
  hourlyTryOns: Map<string, number>; // "dayOfWeek-hour" → count
  ratings: { up: number; down: number };
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

export function trackLeadCreated(email: string) {
  init().catch(() => {});
  addActivity("lead", email);
  flush();
}

export function trackTryOn(items: Array<{ id: number; name: string }>) {
  // Trigger init in background
  init().catch(() => {});

  analytics.totalTryOns++;
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

export function trackBuyClick(productId: number, productName: string) {
  init().catch(() => {});

  analytics.totalBuyClicks++;
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
  };
}
