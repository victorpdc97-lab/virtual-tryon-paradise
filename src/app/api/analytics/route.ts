import { NextRequest, NextResponse } from "next/server";
import { getAnalytics, trackRating } from "@/lib/analytics";

export async function GET() {
  return NextResponse.json(getAnalytics());
}

export async function POST(req: NextRequest) {
  try {
    const { event, data } = await req.json();

    if (event === "result_rating" && data?.rating) {
      trackRating(data.rating);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown event" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
