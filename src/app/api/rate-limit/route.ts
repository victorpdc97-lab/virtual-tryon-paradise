import { NextRequest, NextResponse } from "next/server";
import { getRemainingTryOns, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const remaining = getRemainingTryOns(ip);

  return NextResponse.json({ remaining, limit: 5 });
}
