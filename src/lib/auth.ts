import { createHmac } from "crypto";

const getSecret = () => process.env.ADMIN_PASSWORD || "paradise2026";
const TOKEN_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function generateToken(): string {
  const timestamp = Date.now().toString();
  const hmac = createHmac("sha256", getSecret()).update(timestamp).digest("hex");
  return `${timestamp}.${hmac}`;
}

export function verifyToken(token: string): boolean {
  if (!token) return false;

  const [timestamp, hmac] = token.split(".");
  if (!timestamp || !hmac) return false;

  const age = Date.now() - parseInt(timestamp);
  if (isNaN(age) || age > TOKEN_TTL || age < 0) return false;

  const expected = createHmac("sha256", getSecret()).update(timestamp).digest("hex");

  // Timing-safe comparison
  if (hmac.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < hmac.length; i++) {
    mismatch |= hmac.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export function extractToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
