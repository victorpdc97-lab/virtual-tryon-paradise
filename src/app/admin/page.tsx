"use client";

import { useState, useEffect, useCallback } from "react";

interface Lead {
  email: string;
  phone: string;
  createdAt: string;
  tryOnCount: number;
  lastTryOn: string | null;
}

interface ProductStat {
  productId: number;
  productName: string;
  tryOnCount: number;
  buyClickCount: number;
}

interface ConversionStat extends ProductStat {
  conversionRate: number;
}

interface Analytics {
  totalTryOns: number;
  totalBuyClicks: number;
  overallConversion: number;
  topTried: ProductStat[];
  topBought: ProductStat[];
  conversionRates: ConversionStat[];
  dailyStats: Record<string, number>;
}

interface DashboardData {
  analytics: Analytics;
  leads: Lead[];
}

type Tab = "overview" | "leads" | "products" | "conversion";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPhone(phone: string) {
  if (phone.length === 11) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  }
  if (phone.length === 10) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
  }
  return phone;
}

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [leadSearch, setLeadSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async (pwd: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Senha incorreta");
          setAuthenticated(false);
          return;
        }
        throw new Error("Erro ao buscar dados");
      }

      const result = await res.json();
      setData(result);
      setError(null);
    } catch {
      setError("Erro ao carregar dados");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    await fetchData(password);
    if (!error) setAuthenticated(true);
    setLoading(false);
  };

  // Auto-refresh every 30s
  useEffect(() => {
    if (!authenticated || !autoRefresh) return;
    const interval = setInterval(() => fetchData(password), 30000);
    return () => clearInterval(interval);
  }, [authenticated, autoRefresh, password, fetchData]);

  // Login screen
  if (!authenticated || !data) {
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

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

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

  const { analytics, leads } = data;

  // Filter leads
  const filteredLeads = leadSearch
    ? leads.filter(
        (l) =>
          l.email.toLowerCase().includes(leadSearch.toLowerCase()) ||
          l.phone.includes(leadSearch.replace(/\D/g, ""))
      )
    : leads;

  const tabs: Array<{ id: Tab; label: string; icon: string }> = [
    { id: "overview", label: "Visao Geral", icon: "📊" },
    { id: "leads", label: "Clientes", icon: "👥" },
    { id: "products", label: "Produtos", icon: "👕" },
    { id: "conversion", label: "Conversao", icon: "💰" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-black font-bold text-sm">
              P
            </div>
            <span className="text-white/80 font-semibold">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                autoRefresh
                  ? "border-teal-400/30 text-teal-400 bg-teal-400/10"
                  : "border-white/10 text-white/30"
              }`}
            >
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </button>
            <button
              onClick={() => fetchData(password)}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/25 transition-all"
            >
              Atualizar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((t) => (
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

        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                label="Total de Leads"
                value={leads.length}
                icon="👥"
                color="teal"
              />
              <StatCard
                label="Try-Ons Realizados"
                value={analytics.totalTryOns}
                icon="✨"
                color="purple"
              />
              <StatCard
                label="Cliques de Compra"
                value={analytics.totalBuyClicks}
                icon="🛒"
                color="amber"
              />
              <StatCard
                label="Taxa de Conversao"
                value={`${analytics.overallConversion}%`}
                icon="💰"
                color="green"
              />
            </div>

            {/* Recent leads + Daily stats side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Recent Leads */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span>👥</span> Leads Recentes
                </h3>
                {leads.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-8">Nenhum lead ainda</p>
                ) : (
                  <div className="space-y-3">
                    {leads.slice(0, 5).map((lead) => (
                      <div
                        key={lead.email}
                        className="flex items-center justify-between gap-3 bg-white/[0.02] rounded-xl p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-white/80 text-sm truncate">{lead.email}</p>
                          <p className="text-white/30 text-xs">{formatPhone(lead.phone)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-teal-400 text-xs font-medium">
                            {lead.tryOnCount} {lead.tryOnCount === 1 ? "uso" : "usos"}
                          </p>
                          <p className="text-white/20 text-xs">
                            {formatDate(lead.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Daily Stats */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span>📈</span> Try-Ons por Dia
                </h3>
                {Object.keys(analytics.dailyStats).length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-8">Sem dados ainda</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(analytics.dailyStats)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .slice(0, 10)
                      .map(([date, count]) => {
                        const maxCount = Math.max(...Object.values(analytics.dailyStats));
                        const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        return (
                          <div key={date} className="flex items-center gap-3">
                            <span className="text-white/40 text-xs w-24 shrink-0">
                              {new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                              })}
                            </span>
                            <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                                style={{ width: `${Math.max(width, 8)}%` }}
                              >
                                <span className="text-black text-xs font-bold">{count}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* Top Products Quick View */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>🔥</span> Top 5 Produtos Experimentados
              </h3>
              {analytics.topTried.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-8">Sem dados ainda</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {analytics.topTried.slice(0, 5).map((product, i) => (
                    <div
                      key={product.productId}
                      className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center"
                    >
                      <div className="text-2xl mb-2">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </div>
                      <p className="text-white/70 text-xs truncate mb-1">{product.productName}</p>
                      <p className="text-teal-400 text-sm font-bold">{product.tryOnCount}x</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {tab === "leads" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por email ou telefone..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-teal-400/50 transition-all"
                />
              </div>
              <span className="text-white/30 text-sm">
                {filteredLeads.length} {filteredLeads.length === 1 ? "lead" : "leads"}
              </span>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5 text-white/40 text-xs font-medium uppercase tracking-wider">
                <div className="col-span-4">Email</div>
                <div className="col-span-2">Telefone</div>
                <div className="col-span-2">Cadastro</div>
                <div className="col-span-2">Try-Ons</div>
                <div className="col-span-2">Ultimo Uso</div>
              </div>

              {filteredLeads.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-12">Nenhum lead encontrado</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.email}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="sm:col-span-4">
                        <p className="text-white/80 text-sm">{lead.email}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <a
                          href={`https://wa.me/55${lead.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-400 text-sm hover:underline"
                        >
                          {formatPhone(lead.phone)}
                        </a>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-white/40 text-sm">{formatDate(lead.createdAt)}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            lead.tryOnCount > 0
                              ? "bg-teal-400/10 text-teal-400"
                              : "bg-white/5 text-white/30"
                          }`}
                        >
                          {lead.tryOnCount} {lead.tryOnCount === 1 ? "uso" : "usos"}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-white/30 text-sm">
                          {lead.lastTryOn ? formatDate(lead.lastTryOn) : "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {tab === "products" && (
          <div className="space-y-6">
            {/* Top Tried */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>🔥</span> Mais Experimentados
              </h3>
              {analytics.topTried.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-8">Sem dados ainda</p>
              ) : (
                <div className="space-y-2">
                  {analytics.topTried.map((product, i) => {
                    const maxCount = analytics.topTried[0]?.tryOnCount || 1;
                    const width = (product.tryOnCount / maxCount) * 100;
                    return (
                      <div key={product.productId} className="flex items-center gap-3">
                        <span className="text-white/30 text-xs w-6 text-right shrink-0">
                          {i + 1}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white/70 text-sm truncate">
                              {product.productName}
                            </span>
                          </div>
                          <div className="h-5 bg-white/5 rounded-lg overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-lg flex items-center justify-end pr-2"
                              style={{ width: `${Math.max(width, 10)}%` }}
                            >
                              <span className="text-black text-xs font-bold">
                                {product.tryOnCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Bought */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>🛒</span> Mais Clicados para Comprar
              </h3>
              {analytics.topBought.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-8">Sem dados ainda</p>
              ) : (
                <div className="space-y-2">
                  {analytics.topBought.map((product, i) => {
                    const maxCount = analytics.topBought[0]?.buyClickCount || 1;
                    const width = (product.buyClickCount / maxCount) * 100;
                    return (
                      <div key={product.productId} className="flex items-center gap-3">
                        <span className="text-white/30 text-xs w-6 text-right shrink-0">
                          {i + 1}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white/70 text-sm truncate">
                              {product.productName}
                            </span>
                          </div>
                          <div className="h-5 bg-white/5 rounded-lg overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-lg flex items-center justify-end pr-2"
                              style={{ width: `${Math.max(width, 10)}%` }}
                            >
                              <span className="text-black text-xs font-bold">
                                {product.buyClickCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conversion Tab */}
        {tab === "conversion" && (
          <div className="space-y-6">
            {/* Overall stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label="Try-Ons"
                value={analytics.totalTryOns}
                icon="✨"
                color="teal"
              />
              <StatCard
                label="Cliques Compra"
                value={analytics.totalBuyClicks}
                icon="🛒"
                color="amber"
              />
              <StatCard
                label="Conversao Geral"
                value={`${analytics.overallConversion}%`}
                icon="📈"
                color="green"
              />
            </div>

            {/* Per-product conversion */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>💰</span> Conversao por Produto
              </h3>
              {analytics.conversionRates.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-8">
                  Sem dados de conversao ainda (precisa de try-ons + cliques de compra)
                </p>
              ) : (
                <div className="space-y-3">
                  {analytics.conversionRates.map((product) => (
                    <div
                      key={product.productId}
                      className="flex items-center gap-4 bg-white/[0.02] rounded-xl p-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white/70 text-sm truncate">{product.productName}</p>
                        <div className="flex gap-4 mt-1">
                          <span className="text-white/30 text-xs">
                            {product.tryOnCount} try-ons
                          </span>
                          <span className="text-white/30 text-xs">
                            {product.buyClickCount} cliques
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`text-lg font-bold ${
                            product.conversionRate >= 50
                              ? "text-green-400"
                              : product.conversionRate >= 25
                              ? "text-amber-400"
                              : "text-white/50"
                          }`}
                        >
                          {product.conversionRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: "teal" | "purple" | "amber" | "green";
}) {
  const colorMap = {
    teal: "from-teal-400/10 to-teal-600/5 border-teal-400/20",
    purple: "from-purple-400/10 to-purple-600/5 border-purple-400/20",
    amber: "from-amber-400/10 to-amber-600/5 border-amber-400/20",
    green: "from-green-400/10 to-green-600/5 border-green-400/20",
  };
  const textColorMap = {
    teal: "text-teal-400",
    purple: "text-purple-400",
    amber: "text-amber-400",
    green: "text-green-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-4 sm:p-5`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${textColorMap[color]}`}>{value}</p>
      <p className="text-white/40 text-xs sm:text-sm mt-1">{label}</p>
    </div>
  );
}
