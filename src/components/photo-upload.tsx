"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { useTryOnStore } from "@/store/use-tryon-store";

export function PhotoUpload() {
  const { photoUrl, setPhoto, clearPhoto } = useTryOnStore();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);
      setUploading(true);

      try {
        // Compress for Fashn API (max ~4MB for base64)
        const processedFile = await imageCompression(file, {
          maxSizeMB: 3,
          maxWidthOrHeight: 2048,
          useWebWorker: true,
        });

        // Create local preview URL + base64 for API
        const previewUrl = URL.createObjectURL(processedFile);
        const buffer = await processedFile.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
        const dataUrl = `data:${processedFile.type};base64,${base64}`;

        // Store preview URL for display, dataUrl for API calls
        setPhoto(previewUrl, processedFile, dataUrl);
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
          className="w-full max-h-[500px] object-contain rounded-2xl border border-white/10"
        />
        <button
          onClick={clearPhoto}
          className="absolute top-3 right-3 bg-black/70 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors opacity-0 group-hover:opacity-100"
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
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-teal-400 bg-teal-400/5"
            : "border-white/20 hover:border-teal-400/50 hover:bg-white/[0.02]"
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

      <div className="flex items-center gap-2 text-white/30 text-xs justify-center">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <span>Dica: use foto com fundo neutro e corpo inteiro visível</span>
      </div>
    </div>
  );
}
