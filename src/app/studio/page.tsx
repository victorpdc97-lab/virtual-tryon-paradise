"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTryOnStore } from "@/store/use-tryon-store";
import { PhotoUpload } from "@/components/photo-upload";
import { ProductCatalog } from "@/components/product-catalog";
import { LookBuilder } from "@/components/look-builder";
import { TryOnProgress } from "@/components/try-on-progress";
import { TryOnPreview } from "@/components/try-on-preview";
import { BuyLookCta } from "@/components/buy-look-cta";

export default function StudioPage() {
  const router = useRouter();
  const {
    photoUrl,
    getSelectedList,
    pipeline,
    setPipelineStatus,
    resetPipeline,
  } = useTryOnStore();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!photoUrl) {
      router.push("/");
    }
  }, [photoUrl, router]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (pipelineId: string) => {
      stopPolling();

      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/try-on/${pipelineId}`);
          const data = await res.json();

          if (data.error && !data.status) {
            setPipelineStatus({
              status: "failed",
              error: data.error,
            });
            stopPolling();
            return;
          }

          setPipelineStatus({
            currentStep: data.currentStep,
            totalSteps: data.totalSteps,
            stepLabel: data.stepLabel,
          });

          if (data.status === "completed") {
            setPipelineStatus({
              status: "completed",
              resultUrl: data.resultUrl,
              stepLabel: "Look completo!",
            });
            stopPolling();
          } else if (data.status === "failed") {
            setPipelineStatus({
              status: "failed",
              error: data.error || "Erro no processamento",
            });
            stopPolling();
          }
        } catch {
          // Network error, keep polling
        }
      }, 3000);
    },
    [setPipelineStatus, stopPolling]
  );

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleTryOn = async () => {
    const items = getSelectedList();
    if (!photoUrl || items.length === 0) return;

    resetPipeline();
    setPipelineStatus({
      status: "processing",
      currentStep: 1,
      totalSteps: items.length,
      stepLabel: "Iniciando...",
    });

    try {
      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoUrl,
          items: items.map((item) => ({
            category: item.category,
            imageUrl: item.image,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPipelineStatus({
          status: "failed",
          error: data.error || "Erro ao iniciar try-on",
        });
        return;
      }

      setPipelineStatus({
        jobId: data.pipelineId,
        currentStep: data.currentStep,
        totalSteps: data.totalSteps,
        stepLabel: data.stepLabel,
      });

      startPolling(data.pipelineId);
    } catch {
      setPipelineStatus({
        status: "failed",
        error: "Erro de conexão",
      });
    }
  };

  if (!photoUrl) return null;

  const isProcessing = pipeline.status === "processing";
  const isCompleted = pipeline.status === "completed";

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-black font-bold text-sm">
              P
            </div>
            <span className="text-white/80 font-semibold">Paradise</span>
            <span className="text-white/20 text-sm">Studio</span>
          </button>
        </div>
      </header>

      {/* Studio Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Photo + Result */}
          <div className="lg:col-span-4 space-y-4">
            <PhotoUpload />
            {isProcessing && <TryOnProgress />}
            {isCompleted && (
              <>
                <TryOnPreview />
                <BuyLookCta />
              </>
            )}
          </div>

          {/* Center: Catalog */}
          <div className="lg:col-span-5">
            <ProductCatalog />
          </div>

          {/* Right: Look Builder */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-6">
              <LookBuilder
                onTryOn={handleTryOn}
                disabled={isProcessing || !photoUrl}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
