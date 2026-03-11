// Simple in-memory analytics for try-on tracking
// Persists per serverless instance; aggregated via API

interface ProductStat {
  productId: number;
  productName: string;
  tryOnCount: number;
  buyClickCount: number;
  lastTryOn: number;
}

interface AnalyticsData {
  totalTryOns: number;
  totalBuyClicks: number;
  products: Map<number, ProductStat>;
  dailyTryOns: Map<string, number>; // "YYYY-MM-DD" -> count
}

const analytics: AnalyticsData = {
  totalTryOns: 0,
  totalBuyClicks: 0,
  products: new Map(),
  dailyTryOns: new Map(),
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function trackTryOn(items: Array<{ id: number; name: string }>) {
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
}

export function trackBuyClick(productId: number, productName: string) {
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
}

export function getAnalytics() {
  const productStats = Array.from(analytics.products.values())
    .sort((a, b) => b.tryOnCount - a.tryOnCount);

  const topTried = productStats.slice(0, 20);
  const topBought = [...productStats]
    .sort((a, b) => b.buyClickCount - a.buyClickCount)
    .filter((p) => p.buyClickCount > 0)
    .slice(0, 20);

  // Conversion rate per product (buy clicks / try-ons)
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
