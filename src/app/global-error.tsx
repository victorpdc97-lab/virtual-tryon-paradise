"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ background: "#0a0a0a", color: "#ededed", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ maxWidth: "400px", textAlign: "center" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "12px" }}>Algo deu errado</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", wordBreak: "break-all", marginBottom: "16px" }}>
              {error?.message || "Erro inesperado"}
            </p>
            <button
              onClick={reset}
              style={{
                padding: "10px 24px",
                borderRadius: "12px",
                background: "#0abab5",
                color: "black",
                fontWeight: 500,
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
