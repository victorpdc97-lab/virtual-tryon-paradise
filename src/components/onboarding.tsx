"use client";

import { useState, useEffect, useRef } from "react";

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-7 h-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  );
}

function HangerIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-7 h-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-7 h-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
    </svg>
  );
}

const STEPS = [
  {
    icon: UploadIcon,
    title: "Envie sua foto",
    desc: "Foto de corpo inteiro, de frente, com fundo neutro",
  },
  {
    icon: HangerIcon,
    title: "Monte seu look",
    desc: "Escolha peças do catálogo Paradise para experimentar",
  },
  {
    icon: SparkleIcon,
    title: "Veja no seu corpo",
    desc: "Resultado realista em menos de 2 minutos",
  },
];

const STORAGE_KEY = "paradise-onboarding-done";

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setShow(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Keyboard handling + focus trap
  useEffect(() => {
    if (!show) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Auto-focus first button
    const firstBtn = modalRef.current?.querySelector<HTMLElement>("button");
    firstBtn?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn safe-area-modal">
      {/* Mobile: carousel | Desktop: all steps visible */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Como funciona o provador virtual"
        className="bg-[#111] border border-white/10 rounded-xl w-full max-w-sm lg:max-w-2xl p-8 text-center animate-scaleIn"
      >
        {/* Step indicator — mobile only */}
        <div className="flex justify-center gap-2 mb-6 lg:hidden">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-teal-400" : i < step ? "w-4 bg-teal-400/40" : "w-4 bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Desktop: grid de 3 steps simultâneos */}
        <div className="hidden lg:block mb-6">
          <h2 className="text-white font-bold text-xl mb-6">Como funciona</h2>
          <div className="grid grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={i} className="space-y-3">
                <div className="w-14 h-14 mx-auto rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-400/20 text-teal-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <h3 className="text-white font-semibold text-sm">{s.title}</h3>
                </div>
                <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: single step carousel */}
        <div className="lg:hidden space-y-4">
          <div className="w-16 h-16 mx-auto rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
            {(() => { const Icon = STEPS[step].icon; return <Icon className="w-7 h-7" />; })()}
          </div>
          <h2 className="text-white font-bold text-xl">{STEPS[step].title}</h2>
          <p className="text-white/50 text-sm leading-relaxed">{STEPS[step].desc}</p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 py-3 rounded-lg border border-white/10 text-white/40 text-sm hover:text-white/60 hover:border-white/20 transition-all"
          >
            Pular
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-lg bg-teal-400 text-black font-bold text-sm hover:bg-teal-300 transition-all"
          >
            {step < STEPS.length - 1 ? "Próximo" : "Começar!"}
          </button>
        </div>
      </div>
    </div>
  );
}
