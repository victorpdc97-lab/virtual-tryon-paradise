"use client";

import { useEffect, useRef, useState } from "react";
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
import { RateLimitBadge } from "@/components/rate-limit-badge";

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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevStatusRef = useRef(pipeline.status);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!photoUrl) {
      router.push("/");
    }
  }, [photoUrl, router]);

  // Trigger celebration + scroll to result when status changes to completed
  useEffect(() => {
    if (prevStatusRef.current !== "completed" && pipeline.status === "completed") {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3500);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
    prevStatusRef.current = pipeline.status;
  }, [pipeline.status]);

  // Countdown timer for rate limit
  useEffect(() => {
    if (retryCountdown <= 0) return;
    const timer = setInterval(() => {
      setRetryCountdown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [retryCountdown]);

  const handleTryOn = async () => {
    const items = getSelectedList();
    if (!photoBlobUrl || items.length === 0) return;

    resetPipeline();
    setPipelineStatus({
      status: "processing",
      currentStep: 1,
      totalSteps: items.length,
      stepLabel: "Processando seu look...",
    });

    const tryOnStart = Date.now();

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
        if (res.status === 429 && data.retryAfter) {
          setRetryCountdown(data.retryAfter);
        }
        setPipelineStatus({
          status: "failed",
          error: data.error || "Erro ao processar try-on",
        });
        return;
      }

      // Response comes with final result directly (no polling needed)
      if (data.remaining !== undefined) setRemaining(data.remaining);

      setPipelineStatus({
        status: "completed",
        resultUrl: data.resultUrl,
        currentStep: data.totalSteps,
        totalSteps: data.totalSteps,
        stepLabel: "Look completo!",
      });

      // Track funnel completion + processing timing (fire-and-forget)
      const processingDuration = Date.now() - tryOnStart;
      fetch("/api/track-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "funnel", step: "tryon_completed" }),
      }).catch(() => {});
      fetch("/api/track-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "timing", step: "processing", durationMs: processingDuration }),
      }).catch(() => {});
      // Track cohort activity if lead exists
      if (lead?.email) {
        fetch("/api/track-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "cohort_activity", leadCreatedAt: new Date().toISOString() }),
        }).catch(() => {});
      }
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
      <header className="border-b border-white/5 px-4 sm:px-6 py-3 sm:py-4" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 sm:gap-3 min-h-[44px]"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-black font-bold text-sm">
              P
            </div>
            <span className="text-white/80 font-semibold text-sm sm:text-base">Paradise</span>
            <span className="text-white/20 text-xs sm:text-sm">Studio</span>
          </button>

          <div className="flex items-center gap-4">
            <RateLimitBadge />
          </div>
          {/* Desktop breadcrumbs */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-white/30">
            <span className="hover:text-white/50 cursor-pointer transition-colors" onClick={() => router.push("/")}>Início</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            <span className="text-white/60">Studio</span>
            {isProcessing && (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                <span className="text-teal-400">Processando...</span>
              </>
            )}
            {isCompleted && (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                <span className="text-teal-400">Resultado</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Studio Layout - Desktop: 3 columns, Mobile: stacked */}
      <div className="flex-1 max-w-7xl xl:max-w-[1400px] mx-auto w-full p-4 sm:p-6 pb-24 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

          {/* Photo + Result — full width on mobile, left col on desktop */}
          <div className="lg:col-span-4 space-y-4">
            <PhotoUpload />
            {isProcessing && <TryOnProgress />}
            {isFailed && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center space-y-2">
                <p className="text-red-400 text-sm font-medium">
                  {pipeline.error || "Erro no processamento"}
                </p>
                {retryCountdown > 0 ? (
                  <p className="text-white/40 text-xs">
                    Tente novamente em <span className="text-white/70 font-mono">{retryCountdown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={() => { resetPipeline(); handleTryOn(); }}
                    className="text-xs text-teal-400 hover:text-teal-300 underline transition-colors active:scale-95"
                  >
                    Tentar novamente
                  </button>
                )}
              </div>
            )}
            {isCompleted && (
              <div ref={resultRef}>
                <TryOnPreview />
                <BuyLookCta />
              </div>
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
