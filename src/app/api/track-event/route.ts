import { NextRequest, NextResponse } from "next/server";
import { trackFunnelEvent, trackTiming, trackTryOnCompleted, trackCohortActivity } from "@/lib/analytics";

type FunnelStep = "photo_upload" | "look_selected" | "tryon_completed";
type TimingStep = "upload" | "selection" | "processing";

export async function POST(req: NextRequest) {
  try {
    const { event, step, durationMs, leadCreatedAt } = await req.json();

    if (event === "funnel") {
      const validSteps: FunnelStep[] = ["photo_upload", "look_selected", "tryon_completed"];
      if (!validSteps.includes(step)) {
        return NextResponse.json({ error: "step inválido" }, { status: 400 });
      }
      if (step === "tryon_completed") {
        await trackTryOnCompleted();
      } else {
        await trackFunnelEvent(step);
      }
    } else if (event === "timing") {
      const validSteps: TimingStep[] = ["upload", "selection", "processing"];
      if (!validSteps.includes(step) || typeof durationMs !== "number") {
        return NextResponse.json({ error: "step ou durationMs inválido" }, { status: 400 });
      }
      await trackTiming(step, durationMs);
    } else if (event === "cohort_activity") {
      if (!leadCreatedAt) {
        return NextResponse.json({ error: "leadCreatedAt obrigatório" }, { status: 400 });
      }
      await trackCohortActivity(leadCreatedAt);
    } else {
      return NextResponse.json({ error: "event inválido" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao rastrear" }, { status: 500 });
  }
}
