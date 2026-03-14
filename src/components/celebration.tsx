"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
}

const COLORS = ["#0abab5", "#0eded8", "#fbbf24", "#f472b6", "#a78bfa", "#34d399"];

export function Celebration() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const items: Particle[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 6,
    }));
    setParticles(items);

    const timer = setTimeout(() => setParticles([]), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden cursor-pointer"
      onClick={() => setParticles([])}
      role="button"
      aria-label="Fechar animação"
      tabIndex={0}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`,
            top: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
