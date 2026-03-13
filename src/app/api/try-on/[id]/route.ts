import { NextRequest, NextResponse } from "next/server";
import { aggressivePoll, startTryOn } from "@/lib/fashn";
import { pipelines } from "../route";

function getStepLabel(category: string, stepIndex: number, steps: Array<{ category: string }>): string {
  if (category === "tops") {
    // Count how many "tops" steps exist before this one
    const topsBeforeThis = steps.slice(0, stepIndex).filter((s) => s.category === "tops").length;
    if (topsBeforeThis > 0) return "Aplicando blazer...";
    // Check if there's another tops step after this one (meaning this is the base)
    const topsAfterThis = steps.slice(stepIndex + 1).filter((s) => s.category === "tops").length;
    if (topsAfterThis > 0) return "Vestindo base...";
    return "Vestindo parte de cima...";
  }

  const labels: Record<string, string> = {
    bottoms: "Vestindo parte de baixo...",
    shoes: "Calçando...",
  };
  return labels[category] || "Processando...";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pipelineId } = await params;
    const pipeline = pipelines.get(pipelineId);

    if (!pipeline) {
      return NextResponse.json(
        { error: "Pipeline não encontrada" },
        { status: 404 }
      );
    }

    if (pipeline.status === "completed" || pipeline.status === "failed") {
      return NextResponse.json({
        status: pipeline.status,
        currentStep: pipeline.steps.length,
        totalSteps: pipeline.steps.length,
        stepLabel: pipeline.status === "completed" ? "Look completo!" : "Erro",
        resultUrl: pipeline.resultUrl,
        error: pipeline.error,
      });
    }

    if (!pipeline.currentFashnId) {
      return NextResponse.json({
        status: "failed",
        error: "Estado inválido da pipeline",
      });
    }

    // Aggressive polling: check Fashn multiple times within this request
    // to detect completion faster and reduce inter-step latency
    const result = await aggressivePoll(pipeline.currentFashnId);

    if (result.status === "failed") {
      pipeline.status = "failed";
      pipeline.error = result.error || "Falha no processamento";
      return NextResponse.json({
        status: "failed",
        currentStep: pipeline.currentStep + 1,
        totalSteps: pipeline.steps.length,
        stepLabel: "Erro no processamento",
        error: pipeline.error,
      });
    }

    if (result.status === "completed" && result.output?.[0]) {
      const outputUrl = result.output[0];
      const nextStepIndex = pipeline.currentStep + 1;

      if (nextStepIndex < pipeline.steps.length) {
        // Start next step immediately with category hint
        const nextStep = pipeline.steps[nextStepIndex];
        const { id: newId, error } = await startTryOn(
          outputUrl,
          nextStep.imageUrl,
          nextStep.category
        );

        if (error) {
          pipeline.status = "failed";
          pipeline.error = error;
          return NextResponse.json({
            status: "failed",
            error,
          });
        }

        pipeline.currentStep = nextStepIndex;
        pipeline.currentFashnId = newId;
        pipeline.intermediateUrl = outputUrl;

        return NextResponse.json({
          status: "processing",
          currentStep: nextStepIndex + 1,
          totalSteps: pipeline.steps.length,
          stepLabel: getStepLabel(nextStep.category, nextStepIndex, pipeline.steps),
          intermediateUrl: outputUrl,
        });
      } else {
        // All steps done
        pipeline.status = "completed";
        pipeline.resultUrl = outputUrl;

        return NextResponse.json({
          status: "completed",
          currentStep: pipeline.steps.length,
          totalSteps: pipeline.steps.length,
          stepLabel: "Look completo!",
          resultUrl: outputUrl,
        });
      }
    }

    // Still processing current step
    return NextResponse.json({
      status: "processing",
      currentStep: pipeline.currentStep + 1,
      totalSteps: pipeline.steps.length,
      stepLabel: getStepLabel(
        pipeline.steps[pipeline.currentStep].category,
        pipeline.currentStep,
        pipeline.steps
      ),
    });
  } catch (error) {
    console.error("Poll error:", error);
    return NextResponse.json(
      { error: "Erro ao verificar status" },
      { status: 500 }
    );
  }
}
