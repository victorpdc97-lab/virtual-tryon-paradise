"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTryOnStore } from "@/store/use-tryon-store";

const TIPS = [
  "Analisando proporções do seu corpo...",
  "Ajustando o caimento da peça...",
  "Calibrando iluminação e cores...",
  "Refinando os detalhes finais...",
  "Quase lá, finalizando...",
];

const FUN_FACTS = [
  "Cada peça é ajustada individualmente ao seu corpo",
  "A iluminação da foto é usada para um resultado mais natural",
  "Fotos de corpo inteiro dão os melhores resultados",
  "Você pode experimentar quantas combinações quiser",
];

export function TryOnProgress() {
  const { pipeline, photoUrl } = useTryOnStore();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [tipFading, setTipFading] = useState(false);
  const [milestoneHit, setMilestoneHit] = useState<number | null>(null);
  const lastMilestoneRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  // Timer
  useEffect(() => {
    if (pipeline.status !== "processing") return;
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);

    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [pipeline.status]);

  // Rotate tips
  useEffect(() => {
    if (pipeline.status !== "processing") return;

    const interval = setInterval(() => {
      setTipFading(true);
      setTimeout(() => {
        setTipIndex((i) => (i + 1) % TIPS.length);
        setTipFading(false);
      }, 300);
    }, 3500);

    return () => clearInterval(interval);
  }, [pipeline.status]);

  // Rotate fun facts
  useEffect(() => {
    if (pipeline.status !== "processing") return;
    const interval = setInterval(() => {
      setFactIndex((i) => (i + 1) % FUN_FACTS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [pipeline.status]);

  // Milestone detection
  const checkMilestone = useCallback((percent: number) => {
    const milestones = [25, 50, 75, 100];
    for (const m of milestones) {
      if (percent >= m && lastMilestoneRef.current < m) {
        lastMilestoneRef.current = m;
        setMilestoneHit(m);
        setTimeout(() => setMilestoneHit(null), 1000);
        break;
      }
    }
  }, []);

  if (pipeline.status === "idle") return null;

  // Build active steps list based on total steps
  const buildSteps = () => {
    if (pipeline.totalSteps <= 0) return [];

    // Check step labels from the server to determine which steps
    const hasOverlay = pipeline.stepLabel === "Vestindo base..." ||
      pipeline.stepLabel === "Aplicando blazer...";

    if (hasOverlay || (pipeline.totalSteps === 4)) {
      // 4 steps: base + blazer + bottom + shoes
      // 3 steps with overlay: base + blazer + bottom
      // 2 steps with overlay: base + blazer
      const overlaySteps = [
        { label: "Vestindo base...", num: 1, doneLabel: "Base pronta" },
        { label: "Aplicando blazer...", num: 2, doneLabel: "Blazer aplicado" },
        { label: "Vestindo parte de baixo...", num: 3, doneLabel: "Parte de baixo pronta" },
        { label: "Calçando...", num: 4, doneLabel: "Calçado pronto" },
      ];
      return overlaySteps.slice(0, pipeline.totalSteps);
    }

    // Normal pipeline: top + bottom + shoes
    const normalSteps = [
      { label: "Vestindo parte de cima...", num: 1, doneLabel: "Parte de cima pronta" },
      { label: "Vestindo parte de baixo...", num: 2, doneLabel: "Parte de baixo pronta" },
      { label: "Calçando...", num: 3, doneLabel: "Calçado pronto" },
    ];
    return normalSteps.slice(0, pipeline.totalSteps);
  };

  const activeSteps = buildSteps();
  const stepBase = ((pipeline.currentStep - 1) / pipeline.totalSteps) * 100;
  const stepSize = 100 / pipeline.totalSteps;
  // Smooth fill within current step: crawl up to 80% of the step range over ~60s
  const inStepProgress = Math.min(0.8, elapsedSeconds / 60) * stepSize;
  const progressPercent = pipeline.status === "completed"
    ? 100
    : Math.min(95, stepBase + inStepProgress);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${sec}s`;
  };

  // Show intermediate or original photo
  const previewImage = pipeline.intermediateUrl || photoUrl;

  return (
    <div className="space-y-4" role="status" aria-busy={pipeline.status === "processing"} aria-label={pipeline.status === "processing" ? "Processando seu look" : pipeline.status === "completed" ? "Look pronto" : undefined}>
      {/* Preview with intermediate results */}
      {pipeline.status === "processing" && (
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10">
          {/* Background image — intermediate result or original */}
          {previewImage && (
            <img
              src={previewImage}
              alt={pipeline.intermediateUrl ? "Resultado parcial" : "Sua foto"}
              className={`w-full h-full object-cover transition-all duration-700 ${
                pipeline.intermediateUrl ? "opacity-80" : "opacity-30"
              }`}
              key={previewImage}
            />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

          {/* Top badge — intermediate result indicator */}
          {pipeline.intermediateUrl && (
            <div className="absolute top-3 left-3 bg-black/70 border border-white/10 rounded-full px-3 py-1 flex items-center gap-1.5 animate-scaleIn">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-white/70 text-[10px] font-medium">
                Resultado parcial
              </span>
            </div>
          )}

          {/* Center — spinner + tip */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
            <div className="w-12 h-12 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" role="status" aria-label="Processando look" />

            {/* Rotating tip */}
            <p
              className={`text-white/80 text-sm text-center font-medium max-w-[200px] transition-opacity duration-300 ${
                tipFading ? "opacity-0" : "opacity-100"
              }`}
            >
              {TIPS[tipIndex]}
            </p>
          </div>

          {/* Bottom — timer */}
          <div className="absolute bottom-3 right-3 bg-black/80 rounded-full px-3 py-1">
            <span className="text-white/50 text-xs font-mono">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>
      )}

      {/* Steps + Progress card */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {pipeline.status === "processing" && (
              <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
            )}
            <h3 className="text-white font-semibold text-sm">
              {pipeline.status === "processing" && "Processando seu look..."}
              {pipeline.status === "completed" && "Look pronto!"}
              {pipeline.status === "failed" && "Erro no processamento"}
            </h3>
          </div>
          {pipeline.status === "processing" && (
            <span className="text-white/30 text-xs">
              Passo {pipeline.currentStep}/{pipeline.totalSteps}
            </span>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {activeSteps.map((step, i) => {
            const stepNum = i + 1;
            const isDone = pipeline.currentStep > stepNum;
            const isCurrent = pipeline.currentStep === stepNum && pipeline.status === "processing";
            return (
              <div
                key={i}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  isDone ? "opacity-100" : isCurrent ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-500 ${
                    isDone
                      ? "bg-teal-400 text-black scale-100"
                      : isCurrent
                      ? "bg-teal-400/20 text-teal-400 border border-teal-400 scale-110"
                      : "bg-white/5 text-white/20 scale-100"
                  }`}
                >
                  {isDone ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-[10px] font-bold">{step.num}</span>
                  )}
                </div>
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                  isDone ? "text-teal-400" : isCurrent ? "text-white" : "text-white/30"
                }`}>
                  {isDone ? step.doneLabel : step.label}
                </p>
                {isCurrent && (
                  <div className="ml-auto flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Animated progress bar */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
              progressPercent >= 100 ? "shadow-[0_0_12px_rgba(10,186,181,0.5)]" : ""
            }`}
            style={{
              width: `${progressPercent}%`,
              background: "linear-gradient(90deg, #099e9a, #0abab5, #0eded8)",
            }}
            ref={(el) => { if (el) checkMilestone(progressPercent); }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
          {/* Milestone flash */}
          {milestoneHit && (
            <div className="absolute inset-0 bg-teal-400/20 rounded-full animate-milestoneFlash" />
          )}
        </div>

        {/* Fun fact */}
        {pipeline.status === "processing" && (
          <p className="text-white/25 text-xs sm:text-[11px] text-center italic transition-opacity duration-500">
            {FUN_FACTS[factIndex]}
          </p>
        )}

        {pipeline.error && (
          <p className="text-red-400 text-xs">{pipeline.error}</p>
        )}
      </div>
    </div>
  );
}
