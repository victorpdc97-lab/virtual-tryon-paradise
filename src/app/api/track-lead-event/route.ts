import { NextRequest, NextResponse } from "next/server";
import { trackLeadEvent } from "@/lib/leads";
import type { LeadEvent } from "@/lib/leads";

const VALID_TYPES: LeadEvent["type"][] = [
  "product_selected", "product_removed", "download",
  "photo_upload", "rating",
];

export async function POST(req: NextRequest) {
  try {
    const { email, type, data } = await req.json();

    if (!email || !type) {
      return NextResponse.json({ error: "email e type obrigatorios" }, { status: 400 });
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "type invalido" }, { status: 400 });
    }

    await trackLeadEvent(email, { type, data });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao rastrear" }, { status: 500 });
  }
}
