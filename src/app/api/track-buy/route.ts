import { NextRequest, NextResponse } from "next/server";
import { trackBuyClick } from "@/lib/analytics";
import { trackLeadEvent } from "@/lib/leads";

export async function POST(req: NextRequest) {
  try {
    const { productId, productName, email } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "productId obrigatório" }, { status: 400 });
    }
    await trackBuyClick(productId, productName || "");

    if (email) {
      await trackLeadEvent(email, {
        type: "buy_click",
        data: { productId, productName: productName || "" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao rastrear" }, { status: 500 });
  }
}
