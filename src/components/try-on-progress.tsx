"use client";

import { useTryOnStore } from "@/store/use-tryon-store";

export function TryOnProgress() {
  const { pipeline } = useTryOnStore();

  if (pipeline.status === "idle") return null;

  const steps = [
    { label: "Vestindo parte de cima...", icon: "👕" },
    { label: "Vestindo parte de baixo...", icon: "👖" },
    { label: "Calçando...", icon: "👟" },
  ];

  const activeSteps = steps.slice(0, pipeline.totalSteps);

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        {pipeline.status === "processing" && (
          <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
        )}
        <h3 className="text-white font-semibold">
          {pipeline.status === "processing" && "Criando seu look com IA..."}
          {pipeline.status === "completed" && "Look pronto!"}
          {pipeline.status === "failed" && "Erro no processamento"}
        </h3>
      </div>

      <div className="space-y-3">
        {activeSteps.map((step, i) => {
          const stepNum = i + 1;
          const isDone = pipeline.currentStep > stepNum;
          const isCurrent = pipeline.currentStep === stepNum && pipeline.status === "processing";
          const isPending = pipeline.currentStep < stepNum;

          return (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  isDone
                    ? "bg-teal-400 text-black"
                    : isCurrent
                    ? "bg-teal-400/20 text-teal-400 border border-teal-400"
                    : "bg-white/5 text-white/20"
                }`}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.icon
                )}
              </div>

              <div className="flex-1">
                <p className={`text-sm ${isDone ? "text-teal-400" : isCurrent ? "text-white" : "text-white/30"}`}>
                  {step.label}
                </p>
              </div>

              {isCurrent && (
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
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
        <p className="text-red-400 text-sm">{pipeline.error}</p>
      )}
    </div>
  );
}
