import { NextRequest, NextResponse } from "next/server";
import { saveLead, getLeads } from "@/lib/leads";
import { trackLeadCreated } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  try {
    const { email, phone } = await req.json();

    if (!email || !phone) {
      return NextResponse.json(
        { error: "Email e telefone são obrigatórios" },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    await saveLead(email, phone);
    await trackLeadCreated(email);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao salvar dados" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const leads = await getLeads();
  return NextResponse.json({ leads });
}
