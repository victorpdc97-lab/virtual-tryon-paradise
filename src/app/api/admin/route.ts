import { NextRequest, NextResponse } from "next/server";
import { getAnalytics } from "@/lib/analytics";
import { getLeads } from "@/lib/leads";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "paradise2026";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    const analytics = getAnalytics();
    const leads = getLeads();

    return NextResponse.json({ analytics, leads });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
