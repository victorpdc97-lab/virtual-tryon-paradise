"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTryOnStore } from "@/store/use-tryon-store";
import { PhotoUpload } from "@/components/photo-upload";
import { ProductCatalog } from "@/components/product-catalog";
import { LookBuilder } from "@/components/look-builder";
import { TryOnProgress } from "@/components/try-on-progress";
import { TryOnPreview } from "@/components/try-on-preview";
import { BuyLookCta } from "@/components/buy-look-cta";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { Onboarding } from "@/components/onboarding";
import { Celebration } from "@/components/celebration";
import { MobileLookBar } from "@/components/mobile-look-bar";

export default function StudioPage() {
  const router = useRouter();
  const {
    lead,
    photoUrl,
    photoBlobUrl,
    getSelectedList,
    pipeline,
    setPipelineStatus,
    resetPipeline,
  } = useTryOnStore();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevStatusRef = useRef(pipeline.status);

  useEffect(() => {
    if (!photoUrl) {
      router.push("/");
    }
  }, [photoUrl, router]);

  // Trigger celebration when status changes to completed
  useEffect(() => {
    if (prevStatusRef.current !== "completed" && pipeline.status === "completed") {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3500);
    }
    prevStatusRef.current = pipeline.status;
  }, [pipeline.status]);

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
            ...(data.intermediateUrl && { intermediateUrl: data.intermediateUrl }),
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
      }, 1500);
    },
    [setPipelineStatus, stopPolling]
  );

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleTryOn = async () => {
    const items = getSelectedList();
    if (!photoBlobUrl || items.length === 0) return;

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
          photoUrl: photoBlobUrl,
          items: items.map((item) => ({
            category: item.category,
            imageUrl: item.image,
            productId: item.id,
            productName: item.name,
          })),
          turnstileToken: turnstileToken || undefined,
          leadEmail: lead?.email || undefined,
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

      if (data.remaining !== undefined) setRemaining(data.remaining);
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
  const isFailed = pipeline.status === "failed";

  return (
    <main className="min-h-screen flex flex-col">
      {/* Onboarding (first visit only) */}
      <Onboarding />

      {/* Celebration confetti */}
      {showCelebration && <Celebration />}

      {/* Header */}
      <header className="border-b border-white/5 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-black font-bold text-sm">
              P
            </div>
            <span className="text-white/80 font-semibold text-sm sm:text-base">Paradise</span>
            <span className="text-white/20 text-xs sm:text-sm">Studio</span>
          </button>
        </div>
      </header>

      {/* Studio Layout - Desktop: 3 columns, Mobile: stacked */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-24 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

          {/* Photo + Result — full width on mobile, left col on desktop */}
          <div className="lg:col-span-4 space-y-4">
            <PhotoUpload />
            {isProcessing && <TryOnProgress />}
            {isFailed && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                <p className="text-red-400 text-sm font-medium">
                  {pipeline.error || "Erro no processamento"}
                </p>
                <button
                  onClick={resetPipeline}
                  className="mt-2 text-xs text-white/50 hover:text-white/80 underline"
                >
                  Tentar novamente
                </button>
              </div>
            )}
            {isCompleted && (
              <>
                <TryOnPreview />
                <BuyLookCta />
              </>
            )}
          </div>

          {/* Catalog — full width on mobile, center on desktop */}
          <div className="lg:col-span-5">
            <ProductCatalog />
          </div>

          {/* Look Builder — hidden on mobile (replaced by floating bar), right col on desktop */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="lg:sticky lg:top-6 space-y-3">
              <LookBuilder
                onTryOn={handleTryOn}
                disabled={isProcessing || !photoUrl}
              />
              {remaining !== null && remaining <= 2 && (
                <p className="text-center text-xs text-amber-400/80">
                  {remaining === 0
                    ? "Você atingiu o limite diário de experimentações"
                    : `${remaining} experimentação${remaining > 1 ? "ões" : ""} restante${remaining > 1 ? "s" : ""} hoje`}
                </p>
              )}
              <TurnstileWidget onToken={setTurnstileToken} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile floating look bar */}
      <MobileLookBar
        onTryOn={handleTryOn}
        disabled={isProcessing || !photoUrl}
      />
      <div className="lg:hidden">
        <TurnstileWidget onToken={setTurnstileToken} />
      </div>
    </main>
  );
}
