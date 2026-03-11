"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-white text-xl font-semibold">Algo deu errado</h2>
        <p className="text-white/50 text-sm break-all">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-xl bg-teal-400 text-black font-medium text-sm hover:bg-teal-300 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
