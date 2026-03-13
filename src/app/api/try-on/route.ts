import { NextRequest, NextResponse } from "next/server";
import { startTryOn } from "@/lib/fashn";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { trackTryOn } from "@/lib/analytics";
import { incrementLeadTryOn } from "@/lib/leads";

interface TryOnRequestBody {
  photoUrl: string;
  items: Array<{
    category: string;
    imageUrl: string;
    productId?: number;
    productName?: string;
  }>;
  turnstileToken?: string;
  leadEmail?: string;
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
    const ip = getClientIp(req);

    // Rate limiting: check per-minute + daily limits
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.error, retryAfter: rateCheck.retryAfter },
        { status: 429 }
      );
    }

    const body: TryOnRequestBody = await req.json();

    if (!body.photoUrl || !body.items?.length) {
      return NextResponse.json(
        { error: "photoUrl e items são obrigatórios" },
        { status: 400 }
      );
    }

    // Turnstile CAPTCHA verification
    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!body.turnstileToken) {
        return NextResponse.json(
          { error: "Verificação de segurança necessária" },
          { status: 403 }
        );
      }
      const valid = await verifyTurnstile(body.turnstileToken, ip);
      if (!valid) {
        return NextResponse.json(
          { error: "Verificação de segurança falhou. Tente novamente." },
          { status: 403 }
        );
      }
    }

    const categoryOrder = ["tops", "bottoms", "shoes"];
    const sortedItems = [...body.items].sort(
      (a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
    );

    // Start first step with category hint for faster processing
    const first = sortedItems[0];
    const { id, error } = await startTryOn(body.photoUrl, first.imageUrl, first.category);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    // Track analytics
    trackTryOn(
      body.items
        .filter((item) => item.productId)
        .map((item) => ({ id: item.productId!, name: item.productName || "" }))
    );

    // Track lead usage
    if (body.leadEmail) {
      incrementLeadTryOn(body.leadEmail);
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
      stepLabel: getStepLabel(first.category, 0, sortedItems),
      remaining: rateCheck.remaining,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Try-on error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

function getStepLabel(category: string, _stepIndex: number, _steps: Array<{ category: string }>): string {
  const labels: Record<string, string> = {
    tops: "Vestindo parte de cima...",
    bottoms: "Vestindo parte de baixo...",
    shoes: "Calçando...",
  };
  return labels[category] || "Processando...";
}

// Export for the status route
export { pipelines };
