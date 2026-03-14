"use client";

import { PhotoUpload } from "@/components/photo-upload";
import { LeadForm } from "@/components/lead-form";
import { useTryOnStore } from "@/store/use-tryon-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { photoUrl, lead } = useTryOnStore();
  const router = useRouter();

  useEffect(() => {
    if (photoUrl) {
      router.push("/studio");
    }
  }, [photoUrl, router]);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-4 sm:px-6 py-4" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-black font-bold text-sm">
              P
            </div>
            <span className="text-white/80 font-semibold">Paradise</span>
            <span className="text-white/20 text-sm">Provador Virtual</span>
          </div>
          <a
            href="https://www.useparadise.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/40 hover:text-teal-400 transition-colors"
          >
            Ir para a loja
          </a>
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-16">
        <div className="max-w-2xl xl:max-w-3xl mx-auto space-y-10">
          <div className="space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Paradise
            </div>
            <h1 className="text-3xl sm:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.1]">
              Veja como fica
              <br />
              <span className="text-white/40">
                no seu corpo
              </span>
            </h1>
            <p className="text-white/40 text-base sm:text-lg max-w-md">
              Escolha peças do catálogo Paradise, envie sua foto e receba
              o resultado em menos de 2 minutos.
            </p>
          </div>

          {/* Step 1: Lead form, Step 2: Photo upload */}
          <div className="max-w-sm mx-auto lg:mx-0">
            {!lead ? (
              <LeadForm />
            ) : (
              <PhotoUpload />
            )}
          </div>

          <div className="flex items-center gap-6 text-white/25 text-xs lg:text-sm justify-center lg:justify-start">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Foto privada
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Resultado em ~2 min
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              100% gratuito
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
