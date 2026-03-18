"use client";

import { useState, useEffect, useCallback } from "react";
import type { DashboardData, Tab } from "./types";
import { AdminLogin } from "./components/admin-login";
import { AdminHeader } from "./components/admin-header";
import { OverviewTab } from "./components/overview-tab";
import { LeadsTab } from "./components/leads-tab";
import { ProductsTab } from "./components/products-tab";
import { ConversionTab } from "./components/conversion-tab";

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: "overview", label: "Visao Geral", icon: "📊" },
  { id: "leads", label: "Clientes", icon: "👥" },
  { id: "products", label: "Produtos", icon: "👕" },
  { id: "conversion", label: "Conversao", icon: "💰" },
];

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  // Restore token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (savedToken) {
      setToken(savedToken);
      setAuthenticated(true);
    }
  }, []);

  const fetchData = useCallback(async (authToken: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setAuthenticated(false);
          setToken(null);
          localStorage.removeItem("admin_token");
          setError("Sessao expirada. Faca login novamente.");
          return;
        }
        throw new Error("Erro ao buscar dados");
      }

      const result = await res.json();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on token restore
  useEffect(() => {
    if (authenticated && token && !data) {
      fetchData(token);
    }
  }, [authenticated, token, data, fetchData]);

  // Auto-refresh every 30s
  useEffect(() => {
    if (!authenticated || !autoRefresh || !token) return;
    const interval = setInterval(() => fetchData(token), 30000);
    return () => clearInterval(interval);
  }, [authenticated, autoRefresh, token, fetchData]);

  const handleLogin = (result: DashboardData, newToken: string) => {
    setToken(newToken);
    localStorage.setItem("admin_token", newToken);
    setData(result);
    setLastUpdated(new Date());
    setAuthenticated(true);
    setError(null);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setToken(null);
    setData(null);
    setLastUpdated(null);
    localStorage.removeItem("admin_token");
  };

  // Login screen
  if (!authenticated || !data) {
    return <AdminLogin error={error} onLogin={handleLogin} />;
  }

  const { analytics, leads, credits } = data;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AdminHeader
        credits={credits}
        autoRefresh={autoRefresh}
        lastUpdated={lastUpdated}
        loading={loading}
        onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
        onRefresh={() => token && fetchData(token)}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? "bg-teal-400 text-black"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "overview" && <OverviewTab analytics={analytics} leads={leads} />}
        {tab === "leads" && <LeadsTab leads={leads} />}
        {tab === "products" && <ProductsTab analytics={analytics} />}
        {tab === "conversion" && <ConversionTab analytics={analytics} />}
      </div>
    </div>
  );
}
