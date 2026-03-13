"use client";

import { useState, useEffect } from "react";

const STEPS = [
  {
    icon: "📸",
    title: "Envie sua foto",
    desc: "Foto de corpo inteiro, de frente, com fundo neutro",
  },
  {
    icon: "👕",
    title: "Escolha as peças",
    desc: "Navegue pelo catálogo e monte seu look",
  },
  {
    icon: "✨",
    title: "Veja o resultado",
    desc: "A IA mostra como o look fica em você",
  },
];

const STORAGE_KEY = "paradise-onboarding-done";

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setShow(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleDismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleDismiss();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#111] border border-white/10 rounded-2xl max-w-sm w-full p-8 text-center animate-scaleIn">
        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-teal-400" : i < step ? "w-4 bg-teal-400/40" : "w-4 bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="text-5xl">{STEPS[step].icon}</div>
          <h2 className="text-white font-bold text-xl">{STEPS[step].title}</h2>
          <p className="text-white/50 text-sm leading-relaxed">{STEPS[step].desc}</p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 text-sm hover:text-white/60 hover:border-white/20 transition-all"
          >
            Pular
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-black font-bold text-sm hover:from-teal-400 hover:to-teal-300 transition-all"
          >
            {step < STEPS.length - 1 ? "Próximo" : "Começar"}
          </button>
        </div>
      </div>
    </div>
  );
}
