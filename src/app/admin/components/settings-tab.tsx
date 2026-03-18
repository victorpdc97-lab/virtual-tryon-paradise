"use client";

import { useState } from "react";
import { cardBg, textPrimary, textSecondary, textMuted, inputBg } from "../utils";

interface Props {
  isDark: boolean;
}

// Settings are read-only display for now — shows current server config
export function SettingsTab({ isDark }: Props) {
  const [copied, setCopied] = useState(false);

  const copyShareLink = () => {
    navigator.clipboard.writeText("https://provador.useparadise.com.br").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Config */}
      <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>⚙️</span> Configuracao Atual
        </h3>
        <div className="space-y-4">
          <ConfigRow label="Rate limit diario" value="5 try-ons / IP / dia" isDark={isDark} />
          <ConfigRow label="Rate limit por minuto" value="3 requisicoes / IP / min" isDark={isDark} />
          <ConfigRow label="Modelo Fashn.AI" value="tryon-max (4 creditos/geracao)" isDark={isDark} />
          <ConfigRow label="Custo por try-on" value="~R$ 1,50" isDark={isDark} />
          <ConfigRow label="Compressao de foto" value="WebP, 768px max, quality 0.8" isDark={isDark} />
          <ConfigRow label="Cache catalogo" value="30min + stale-while-revalidate 1h" isDark={isDark} />
          <ConfigRow label="CAPTCHA (Turnstile)" value={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? "Ativo" : "Desativado"} isDark={isDark} />
          <ConfigRow label="Persistencia" value="Vercel Blob (sobrevive redeploys)" isDark={isDark} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>🔗</span> Links Rapidos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionButton
            label="Copiar link do provador"
            sublabel="provador.useparadise.com.br"
            onClick={copyShareLink}
            isDark={isDark}
            badge={copied ? "Copiado!" : undefined}
          />
          <ActionButton
            label="Abrir loja Paradise"
            sublabel="useparadise.com.br"
            onClick={() => window.open("https://www.useparadise.com.br", "_blank")}
            isDark={isDark}
          />
          <ActionButton
            label="Recarregar creditos Fashn"
            sublabel="fashn.ai/dashboard"
            onClick={() => window.open("https://fashn.ai/dashboard", "_blank")}
            isDark={isDark}
          />
          <ActionButton
            label="Vercel Dashboard"
            sublabel="vercel.com/dashboard"
            onClick={() => window.open("https://vercel.com/dashboard", "_blank")}
            isDark={isDark}
          />
        </div>
      </div>

      {/* Environment Info */}
      <div className={`border rounded-2xl p-5 ${cardBg(isDark)}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>📦</span> Ambiente
        </h3>
        <div className="space-y-4">
          <ConfigRow label="URL" value="provador.useparadise.com.br" isDark={isDark} />
          <ConfigRow label="Plataforma" value="Vercel (Hobby)" isDark={isDark} />
          <ConfigRow label="Framework" value="Next.js 16 + React 19" isDark={isDark} />
          <ConfigRow label="Nuvemshop Store ID" value="112162" isDark={isDark} />
        </div>
      </div>

      {/* Pro tips */}
      <div className={`border rounded-2xl p-5 ${isDark ? "bg-teal-400/5 border-teal-400/20" : "bg-teal-50 border-teal-200"}`}>
        <h3 className={`font-semibold mb-3 flex items-center gap-2 ${textPrimary(isDark)}`}>
          <span>💡</span> Dicas
        </h3>
        <ul className={`text-sm space-y-2 ${textSecondary(isDark)}`}>
          <li>• Para alterar rate limit ou blacklist, edite as env vars na Vercel e redeploy</li>
          <li>• Creditos Fashn abaixo de 50 exibem banner de alerta automaticamente</li>
          <li>• O dashboard atualiza automaticamente a cada 30s quando "Auto ON"</li>
          <li>• Notificacoes de novos leads funcionam quando o browser permite</li>
          <li>• Use Ctrl+P para imprimir/exportar o dashboard como PDF</li>
        </ul>
      </div>
    </div>
  );
}

function ConfigRow({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={`text-sm ${textMuted(isDark)}`}>{label}</span>
      <span className={`text-sm font-medium ${textSecondary(isDark)}`}>{value}</span>
    </div>
  );
}

function ActionButton({
  label,
  sublabel,
  onClick,
  isDark,
  badge,
}: {
  label: string;
  sublabel: string;
  onClick: () => void;
  isDark: boolean;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-xl border transition-all ${
        isDark
          ? "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20"
          : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${textPrimary(isDark)}`}>{label}</span>
        {badge && (
          <span className="text-[10px] font-bold bg-green-400/10 text-green-400 px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <span className={`text-xs ${textMuted(isDark)}`}>{sublabel}</span>
    </button>
  );
}
