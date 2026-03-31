import { NextRequest, NextResponse } from "next/server";
import { getAnalytics, trackAdminLogin } from "@/lib/analytics";
import { getLeads } from "@/lib/leads";
import { getCreditsBalance } from "@/lib/fashn";
import { generateToken, verifyToken, extractToken } from "@/lib/auth";

// Support comma-separated passwords for multi-admin (e.g. "admin1pass,admin2pass")
const ADMIN_PASSWORDS = (process.env.ADMIN_PASSWORD || "paradise2026").split(",").map((p) => p.trim());

function validatePassword(password: string): number {
  return ADMIN_PASSWORDS.findIndex((p) => p === password);
}

async function getDashboardData() {
  const [analytics, leads, credits] = await Promise.all([
    getAnalytics(),
    getLeads(),
    getCreditsBalance(),
  ]);
  return { analytics, leads, credits };
}

// GET — authenticated requests with token
export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req.headers.get("Authorization"));
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 });
    }

    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST — login with password, returns token
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    const adminIndex = validatePassword(password);
    if (adminIndex === -1) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    const token = generateToken();
    const data = await getDashboardData();

    // Track login activity
    await trackAdminLogin(`Admin ${adminIndex + 1}`);

    return NextResponse.json({ ...data, token, adminId: adminIndex + 1 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
