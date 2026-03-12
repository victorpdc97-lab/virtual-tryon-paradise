import { loadFromBlob, flushToBlob } from "./persistence";

interface ProductStat {
  productId: number;
  productName: string;
  tryOnCount: number;
  buyClickCount: number;
  lastTryOn: number;
}

interface AnalyticsStore {
  totalTryOns: number;
  totalBuyClicks: number;
  products: Record<string, ProductStat>;
  dailyTryOns: Record<string, number>;
}

interface AnalyticsData {
  totalTryOns: number;
  totalBuyClicks: number;
  products: Map<number, ProductStat>;
  dailyTryOns: Map<string, number>;
}

const analytics: AnalyticsData = {
  totalTryOns: 0,
  totalBuyClicks: 0,
  products: new Map(),
  dailyTryOns: new Map(),
};

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
  };
}

function flush() {
  flushToBlob("analytics", getSerializable);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function trackTryOn(items: Array<{ id: number; name: string }>) {
  // Trigger init in background
  init().catch(() => {});

  analytics.totalTryOns++;

  const day = today();
  analytics.dailyTryOns.set(day, (analytics.dailyTryOns.get(day) || 0) + 1);

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

export function trackBuyClick(productId: number, productName: string) {
  init().catch(() => {});

  analytics.totalBuyClicks++;

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
  };
}
