"use client";

import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useState } from "react";

type AlertTone = "error" | "success" | "info";

const TONE_STYLES: Record<
  AlertTone,
  { container: string; icon: string; Icon: typeof AlertCircle }
> = {
  error: {
    container: "border-maroon-200 bg-maroon-50 text-maroon-900",
    icon: "text-maroon-600",
    Icon: AlertCircle,
  },
  success: {
    container: "border-leaf-200 bg-leaf-50 text-leaf-900",
    icon: "text-leaf-600",
    Icon: CheckCircle2,
  },
  info: {
    container: "border-cream-300 bg-cream-50 text-ink-700",
    icon: "text-saffron-600",
    Icon: Info,
  },
};

export function Alert({
  tone = "error",
  title,
  children,
  className = "",
}: {
  tone?: AlertTone;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(true);
  const styles = TONE_STYLES[tone];
  const Icon = styles.Icon;

  if (!open) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed right-4 top-4 z-[80] flex w-[calc(100vw-2rem)] max-w-md items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-card sm:right-6 sm:top-6 ${styles.container} ${className}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${styles.icon}`} aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? "mt-0.5 leading-relaxed" : "leading-relaxed"}>{children}</div>
      </div>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close message"
        className="ml-1 shrink-0 rounded-full px-1 text-lg leading-none opacity-70 hover:opacity-100"
      >
        &times;
      </button>
    </div>
  );
}
