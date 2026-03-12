import { NextRequest, NextResponse } from "next/server";
import { getAnalytics } from "@/lib/analytics";
import { getLeads } from "@/lib/leads";
import { getCreditsBalance } from "@/lib/fashn";
import { generateToken, verifyToken, extractToken } from "@/lib/auth";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "paradise2026";

async function getDashboardData() {
  const [analytics, leads, credits] = await Promise.all([
    Promise.resolve(getAnalytics()),
    Promise.resolve(getLeads()),
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

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    const token = generateToken();
    const data = await getDashboardData();

    return NextResponse.json({ ...data, token });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
