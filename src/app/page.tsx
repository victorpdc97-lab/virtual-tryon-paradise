"use client";

import { PhotoUpload } from "@/components/photo-upload";
import { useTryOnStore } from "@/store/use-tryon-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { photoUrl } = useTryOnStore();
  const router = useRouter();

  useEffect(() => {
    if (photoUrl) {
      router.push("/studio");
    }
  }, [photoUrl, router]);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-black font-bold text-sm">
              P
            </div>
            <span className="text-white/80 font-semibold">Paradise</span>
            <span className="text-white/20 text-sm">Provador Virtual</span>
          </div>
          <a
            href="https://paradisemultimarcas.lojavirtualnuvem.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/40 hover:text-teal-400 transition-colors"
          >
            Ir para a loja
          </a>
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/10 text-teal-400 text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Powered by AI
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Experimente antes
              <br />
              <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
                de comprar
              </span>
            </h1>
            <p className="text-white/50 text-lg max-w-md mx-auto">
              Envie uma foto de corpo inteiro e veja como as roupas da Paradise
              ficam em você. Tudo com inteligência artificial.
            </p>
          </div>

          <PhotoUpload />

          <div className="flex items-center justify-center gap-8 text-white/20 text-xs">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Sua foto é privada
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Resultado em ~2 min
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
