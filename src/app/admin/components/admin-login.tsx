"use client";

import { useState } from "react";
import type { DashboardData } from "../types";

interface AdminLoginProps {
  error: string | null;
  onLogin: (data: DashboardData, token: string) => void;
}

export function AdminLogin({ error: externalError, onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(externalError);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError(res.status === 401 ? "Senha incorreta" : "Erro ao fazer login");
        setLoading(false);
        return;
      }

      const result: DashboardData = await res.json();
      onLogin(result, result.token!);
    } catch {
      setError("Erro de conexao");
    }

    setLoading(false);
  };

  const displayError = error || externalError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <form onSubmit={handleLogin} className="max-w-sm w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-black font-bold text-lg">
            P
          </div>
          <h1 className="text-white font-bold text-xl">Admin Dashboard</h1>
          <p className="text-white/40 text-sm">Paradise Provador Virtual</p>
        </div>

        <div>
          <input
            type="password"
            placeholder="Senha de administrador"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-teal-400/50 transition-all"
            autoFocus
          />
        </div>

        {displayError && (
          <p className="text-red-400 text-sm text-center">{displayError}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-black font-bold text-sm disabled:opacity-50 transition-all"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
