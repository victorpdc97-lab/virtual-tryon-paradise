import { NextResponse } from "next/server";
import { getCreditsBalance } from "@/lib/fashn";

export async function GET() {
  try {
    const credits = await getCreditsBalance();
    return NextResponse.json({ credits });
  } catch {
    return NextResponse.json({ credits: -1 });
  }
}
