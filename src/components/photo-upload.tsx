"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTryOnStore } from "@/store/use-tryon-store";

export function PhotoUpload() {
  const { photoUrl, setPhoto, clearPhoto } = useTryOnStore();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);
      setWarning(null);
      setUploading(true);

      try {
        // Compress image client-side before uploading
        const imageCompression = (await import("browser-image-compression")).default;
        const processedFile = await imageCompression(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });

        // Create local preview URL
        const previewUrl = URL.createObjectURL(processedFile);

        let apiUrl: string;

        try {
          // Try uploading to Vercel Blob for a public URL
          const formData = new FormData();
          formData.append("photo", processedFile);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Upload falhou");
          }

          apiUrl = data.url;
        } catch {
          // Fallback: convert to base64 data URL if Blob upload fails
          setWarning("Upload lento — usando modo alternativo. O processamento pode demorar mais.");
          const buffer = await processedFile.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
          );
          apiUrl = `data:${processedFile.type};base64,${base64}`;
        }

        // Store preview URL for display, API URL (blob or base64) for try-on calls
        setPhoto(previewUrl, processedFile, apiUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao processar foto");
      } finally {
        setUploading(false);
      }
    },
    [setPhoto]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
    disabled: uploading,
  });

  if (photoUrl) {
    return (
      <div className="relative group">
        <img
          src={photoUrl}
          alt="Sua foto"
          className="w-full max-h-[500px] lg:max-h-[600px] object-contain rounded-2xl border border-white/10"
        />
        <button
          onClick={clearPhoto}
          className="absolute top-3 right-3 bg-black/70 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
        >
          Trocar foto
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 sm:p-10 lg:p-14 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? "border-teal-400 bg-teal-400/5"
            : "border-white/20 hover:border-white/30 hover:bg-white/[0.02]"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-teal-400/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-teal-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 16v-8m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 3 3 0 013.898 3.723A3.75 3.75 0 0118 19.5H6.75z"
              />
            </svg>
          </div>

          {uploading ? (
            <div>
              <div className="w-8 h-8 mx-auto border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/60 mt-3">Enviando foto...</p>
            </div>
          ) : isDragActive ? (
            <p className="text-teal-400 text-lg font-medium">Solte a foto aqui</p>
          ) : (
            <>
              <p className="text-white/80 text-lg font-medium">
                Arraste sua foto de corpo inteiro
              </p>
              <p className="text-white/40 text-sm">
                ou clique para selecionar - JPG, PNG ou WebP (max 10MB)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      {warning && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-amber-400 text-xs">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
          </svg>
          {warning}
        </div>
      )}

      <div className="flex items-center gap-2 text-white/30 text-xs justify-center">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <span>Dica: use foto com fundo neutro e corpo inteiro visível</span>
      </div>
    </div>
  );
}
