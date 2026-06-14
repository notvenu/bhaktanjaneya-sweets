"use client";

import { CheckCircle2, Info, XCircle, AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type ToastTone = "success" | "error" | "info" | "warning";

export type ToastPayload = {
  tone: ToastTone;
  title?: string;
  message: string;
  durationMs?: number;
};

type ToastInternal = ToastPayload & {
  id: string;
};

const TONE_META: Record<ToastTone, { Icon: typeof Info; className: string; iconClass: string }> = {
  success: { Icon: CheckCircle2, className: "border-leaf-200 bg-leaf-50 text-leaf-900", iconClass: "text-leaf-600" },
  error: { Icon: XCircle, className: "border-maroon-200 bg-maroon-50 text-maroon-900", iconClass: "text-maroon-600" },
  info: { Icon: Info, className: "border-cream-300 bg-cream-50 text-ink-700", iconClass: "text-saffron-600" },
  warning: { Icon: AlertTriangle, className: "border-saffron-300 bg-saffron-50 text-ink-800", iconClass: "text-saffron-600" },
};

let listeners: Array<(t: ToastInternal[]) => void> = [];
let state: ToastInternal[] = [];
let counter = 1;

function notify() {
  for (const l of listeners) l(state);
}

function dismiss(id: string) {
  state = state.filter((t) => t.id !== id);
  notify();
}

export function toast(payload: Omit<ToastPayload, "tone"> & { tone: ToastTone }) {
  const id = `toast_${Date.now()}_${counter++}`;
  const durationMs = payload.durationMs ?? 3500;

  const next: ToastInternal = { ...payload, id, durationMs };
  state = [next, ...state].slice(0, 4);
  notify();

  if (durationMs > 0) {
    window.setTimeout(() => dismiss(id), durationMs);
  }
}

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastInternal[]>(state);

  useEffect(() => {
    const l = (t: ToastInternal[]) => setToasts(t);
    listeners.push(l);

    return () => {
      listeners = listeners.filter((x) => x !== l);
    };
  }, []);




  const rendered = useMemo(() => toasts, [toasts]);

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[90] flex w-[calc(100vw-2rem)] max-w-md flex-col gap-2 sm:right-6 sm:bottom-6">
      {rendered.map((t) => {
        const meta = TONE_META[t.tone];
        const Icon = meta.Icon;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-card opacity-100 ${meta.className}`}

            role="status"

            aria-live="polite"
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${meta.iconClass}`} aria-hidden />
            <div className="min-w-0 flex-1">
              {t.title ? <p className="font-semibold">{t.title}</p> : null}
              <div className={t.title ? "mt-0.5 leading-relaxed" : "leading-relaxed"}>{t.message}</div>
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="ml-1 shrink-0 rounded-full px-1 text-lg leading-none opacity-70 hover:opacity-100"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}

