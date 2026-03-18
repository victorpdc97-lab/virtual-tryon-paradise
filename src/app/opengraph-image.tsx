import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Paradise Provador Virtual - Experimente roupas com IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #111827 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)",
            marginBottom: 32,
            fontSize: 40,
            fontWeight: 800,
            color: "black",
          }}
        >
          P
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "white",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Provador Virtual
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
            maxWidth: 700,
            marginBottom: 40,
          }}
        >
          Veja como a roupa fica no seu corpo antes de comprar
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: 40,
            fontSize: 20,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ color: "#2dd4bf" }}>✓</div>
            IA de ultima geracao
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ color: "#2dd4bf" }}>✓</div>
            Resultado em 2 min
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ color: "#2dd4bf" }}>✓</div>
            100% gratuito
          </div>
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            fontSize: 18,
            color: "rgba(255,255,255,0.2)",
          }}
        >
          provador.useparadise.com.br
        </div>
      </div>
    ),
    { ...size }
  );
}
