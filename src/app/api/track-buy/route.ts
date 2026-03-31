import { NextRequest, NextResponse } from "next/server";
import { trackBuyClick } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  try {
    const { productId, productName } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "productId obrigatório" }, { status: 400 });
    }
    await trackBuyClick(productId, productName || "");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao rastrear" }, { status: 500 });
  }
}
