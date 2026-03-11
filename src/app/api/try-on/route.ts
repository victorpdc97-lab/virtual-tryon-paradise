import { NextRequest, NextResponse } from "next/server";
import { startTryOn } from "@/lib/fashn";

interface TryOnRequestBody {
  photoUrl: string;
  items: Array<{
    category: string;
    imageUrl: string;
  }>;
}

// Stores pipeline state in memory (per-process; fine for serverless)
const pipelines = new Map<
  string,
  {
    steps: Array<{ category: string; imageUrl: string }>;
    currentStep: number;
    currentFashnId: string | null;
    intermediateUrl: string | null;
    resultUrl: string | null;
    status: string;
    error: string | null;
  }
>();

export async function POST(req: NextRequest) {
  try {
    const body: TryOnRequestBody = await req.json();

    if (!body.photoUrl || !body.items?.length) {
      return NextResponse.json(
        { error: "photoUrl e items são obrigatórios" },
        { status: 400 }
      );
    }

    const categoryOrder = ["tops", "bottoms", "shoes"];
    const sortedItems = [...body.items].sort(
      (a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
    );

    // Start first step
    const first = sortedItems[0];
    const { id, error } = await startTryOn(body.photoUrl, first.imageUrl);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    const pipelineId = `pipeline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    pipelines.set(pipelineId, {
      steps: sortedItems,
      currentStep: 0,
      currentFashnId: id,
      intermediateUrl: body.photoUrl,
      resultUrl: null,
      status: "processing",
      error: null,
    });

    // Cleanup old pipelines (keep last 50)
    if (pipelines.size > 50) {
      const keys = Array.from(pipelines.keys());
      for (let i = 0; i < keys.length - 50; i++) {
        pipelines.delete(keys[i]);
      }
    }

    return NextResponse.json({
      pipelineId,
      currentStep: 1,
      totalSteps: sortedItems.length,
      stepLabel: getStepLabel(first.category),
    });
  } catch (error) {
    console.error("Try-on error:", error);
    return NextResponse.json(
      { error: "Erro ao iniciar try-on" },
      { status: 500 }
    );
  }
}

function getStepLabel(category: string): string {
  const labels: Record<string, string> = {
    tops: "Vestindo parte de cima...",
    bottoms: "Vestindo parte de baixo...",
    shoes: "Calçando...",
  };
  return labels[category] || "Processando...";
}

// Export for the status route
export { pipelines };
