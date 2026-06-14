"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { AdminButton } from "@/components/admin/ui";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onCancel,
  onConfirm,
  busy,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  const [internalBusy, setInternalBusy] = useState(false);
  const isBusy = Boolean(busy ?? internalBusy);

  async function handleConfirm() {
    try {
      if (busy == null) setInternalBusy(true);
      await onConfirm();
    } finally {
      if (busy == null) setInternalBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-ink-900/60"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-cream-300 bg-cream-50 p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-maroon-900">
              {title}
            </h3>
            {description ? (
              <p className="mt-2 text-sm text-ink-700">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onCancel}
            className="rounded-full p-1 text-ink-500 hover:bg-cream-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <AdminButton variant="ghost" onClick={onCancel} disabled={isBusy}>
            {cancelLabel}
          </AdminButton>
          <AdminButton
            onClick={() => void handleConfirm()}
            disabled={isBusy}
            className={
              tone === "danger"
                ? "bg-maroon-800 text-cream-50 hover:bg-maroon-700 disabled:opacity-60"
                : undefined
            }
          >
            {isBusy ? "Working…" : confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

