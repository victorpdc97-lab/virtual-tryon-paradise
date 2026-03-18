// In-memory rate limiter for serverless (per-instance)
// Tracks try-on usage per IP: daily limit + per-minute throttle

interface RateLimitEntry {
  // Daily try-on count
  dailyCount: number;
  dailyReset: number;
  // Per-minute request count
  minuteCount: number;
  minuteReset: number;
}

const store = new Map<string, RateLimitEntry>();

const DAILY_LIMIT = 5; // max try-ons per IP per day
const MINUTE_LIMIT = 3; // max requests per IP per minute

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.dailyReset && now > entry.minuteReset) {
      store.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function checkRateLimit(ip: string): { allowed: boolean; error?: string; remaining?: number; retryAfter?: number } {
  const now = Date.now();
  let entry = store.get(ip);

  if (!entry) {
    entry = {
      dailyCount: 0,
      dailyReset: now + 24 * 60 * 60 * 1000,
      minuteCount: 0,
      minuteReset: now + 60 * 1000,
    };
    store.set(ip, entry);
  }

  // Reset daily counter if expired
  if (now > entry.dailyReset) {
    entry.dailyCount = 0;
    entry.dailyReset = now + 24 * 60 * 60 * 1000;
  }

  // Reset minute counter if expired
  if (now > entry.minuteReset) {
    entry.minuteCount = 0;
    entry.minuteReset = now + 60 * 1000;
  }

  // Check per-minute limit
  if (entry.minuteCount >= MINUTE_LIMIT) {
    const retryAfter = Math.ceil((entry.minuteReset - now) / 1000);
    return {
      allowed: false,
      error: "Muitas requisições. Aguarde um momento antes de tentar novamente.",
      retryAfter,
    };
  }

  // Check daily limit
  if (entry.dailyCount >= DAILY_LIMIT) {
    return {
      allowed: false,
      error: `Você atingiu o limite de ${DAILY_LIMIT} experimentações por dia. Volte amanhã!`,
      retryAfter: Math.ceil((entry.dailyReset - now) / 1000),
    };
  }

  // Increment counters
  entry.minuteCount++;
  entry.dailyCount++;

  return {
    allowed: true,
    remaining: DAILY_LIMIT - entry.dailyCount,
  };
}

export function getRemainingTryOns(ip: string): number {
  const now = Date.now();
  const entry = store.get(ip);
  if (!entry || now > entry.dailyReset) return DAILY_LIMIT;
  return Math.max(0, DAILY_LIMIT - entry.dailyCount);
}

export function getClientIp(req: Request): string {
  const headers = new Headers(req.headers);
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
