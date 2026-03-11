"use client";

import { useTryOnStore } from "@/store/use-tryon-store";

const TIPS = [
  "A IA está analisando seu corpo...",
  "Ajustando o caimento da roupa...",
  "Aplicando iluminação natural...",
  "Refinando os detalhes...",
  "Quase lá! Finalizando seu look...",
];

export function TryOnProgress() {
  const { pipeline, photoUrl } = useTryOnStore();

  if (pipeline.status === "idle") return null;

  const steps = [
    { label: "Vestindo parte de cima...", icon: "👕" },
    { label: "Vestindo parte de baixo...", icon: "👖" },
    { label: "Calçando...", icon: "👟" },
  ];

  const activeSteps = steps.slice(0, pipeline.totalSteps);
  const tipIndex = Math.min(
    Math.floor(((pipeline.currentStep - 1) / pipeline.totalSteps) * TIPS.length),
    TIPS.length - 1
  );

  return (
    <div className="space-y-4">
      {/* Skeleton preview with pulse animation */}
      {pipeline.status === "processing" && (
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10">
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Sua foto"
              className="w-full h-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

          {/* Scanning animation overlay */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-scan" />
          </div>

          {/* Center message */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
            <div className="w-12 h-12 rounded-full bg-teal-400/10 border-2 border-teal-400 border-t-transparent animate-spin" />
            <p className="text-white/80 text-sm text-center font-medium">
              {TIPS[tipIndex]}
            </p>
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          {pipeline.status === "processing" && (
            <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          )}
          <h3 className="text-white font-semibold text-sm">
            {pipeline.status === "processing" && "Criando seu look com IA..."}
            {pipeline.status === "completed" && "Look pronto!"}
            {pipeline.status === "failed" && "Erro no processamento"}
          </h3>
        </div>

        <div className="space-y-2">
          {activeSteps.map((step, i) => {
            const stepNum = i + 1;
            const isDone = pipeline.currentStep > stepNum;
            const isCurrent = pipeline.currentStep === stepNum && pipeline.status === "processing";
            return (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    isDone
                      ? "bg-teal-400 text-black"
                      : isCurrent
                      ? "bg-teal-400/20 text-teal-400 border border-teal-400"
                      : "bg-white/5 text-white/20"
                  }`}
                >
                  {isDone ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>
                <p className={`text-xs ${isDone ? "text-teal-400" : isCurrent ? "text-white" : "text-white/30"}`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <div className="ml-auto flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1 h-1 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1 h-1 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-teal-300 rounded-full transition-all duration-1000 ease-out"
            style={{
              width:
                pipeline.status === "completed"
                  ? "100%"
                  : `${(pipeline.currentStep / pipeline.totalSteps) * 100}%`,
            }}
          />
        </div>

        {pipeline.error && (
          <p className="text-red-400 text-xs">{pipeline.error}</p>
        )}
      </div>
    </div>
  );
}
