"use client";

import { useEffect, useState, useCallback } from "react";

export interface ToastMessage {
  id: string;
  text: string;
  type?: "success" | "info" | "error";
}

let toastListeners: Array<(msg: ToastMessage) => void> = [];

export function showToast(text: string, type: ToastMessage["type"] = "success") {
  const msg: ToastMessage = { id: Date.now().toString(), text, type };
  toastListeners.forEach((fn) => fn(msg));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((msg: ToastMessage) => {
    setToasts((prev) => [...prev.slice(-2), msg]); // max 3
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== msg.id));
    }, 3000);
  }, []);

  useEffect(() => {
    toastListeners.push(addToast);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== addToast);
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm animate-slideDown flex items-center gap-2 ${
            toast.type === "error"
              ? "bg-red-500/90 text-white"
              : toast.type === "info"
              ? "bg-white/10 border border-white/20 text-white/80"
              : "bg-teal-400/90 text-black"
          }`}
        >
          {toast.type === "success" && (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === "error" && (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.text}
        </div>
      ))}
    </div>
  );
}
