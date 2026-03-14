import { NextRequest, NextResponse } from "next/server";
import { startTryOn, waitForCompletion } from "@/lib/fashn";
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

export const maxDuration = 300; // 5 min max for Vercel serverless

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

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

    // Track analytics
    trackTryOn(
      body.items
        .filter((item) => item.productId)
        .map((item) => ({ id: item.productId!, name: item.productName || "" }))
    );

    if (body.leadEmail) {
      incrementLeadTryOn(body.leadEmail);
    }

    // Process ALL steps sequentially in a single request
    let currentImage = body.photoUrl;

    for (let i = 0; i < sortedItems.length; i++) {
      const step = sortedItems[i];

      const { id, error } = await startTryOn(currentImage, step.imageUrl, step.category);
      if (error) {
        return NextResponse.json(
          { error: `Erro no step ${i + 1}: ${error}` },
          { status: 500 }
        );
      }

      // Wait for this step to complete before starting next
      currentImage = await waitForCompletion(id);
    }

    return NextResponse.json({
      status: "completed",
      resultUrl: currentImage,
      totalSteps: sortedItems.length,
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
