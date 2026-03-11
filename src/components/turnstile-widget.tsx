"use client";

import { useEffect, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

interface TurnstileWidgetProps {
  onToken: (token: string) => void;
}

export function TurnstileWidget({ onToken }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (!SITE_KEY) return;

    const renderWidget = () => {
      if (!containerRef.current || widgetIdRef.current !== null) return;
      const win = window as unknown as Record<string, unknown>;
      const turnstile = win.turnstile as {
        render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      } | undefined;
      if (!turnstile) return;

      widgetIdRef.current = turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        theme: "dark",
        size: "invisible",
        callback: (token: string) => {
          onToken(token);
        },
      });
    };

    if (scriptLoadedRef.current) {
      renderWidget();
      return;
    }

    // Load Turnstile script
    const existing = document.querySelector('script[src*="turnstile"]');
    if (existing) {
      scriptLoadedRef.current = true;
      renderWidget();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
      renderWidget();
    };
    document.head.appendChild(script);
  }, [onToken]);

  if (!SITE_KEY) return null;

  return <div ref={containerRef} />;
}
