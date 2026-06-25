"use client";

import { useEffect, useId, useRef } from "react";
import { AlertTriangle, Spinner, X } from "@/components/icons";

type Variant = "danger" | "default";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  // Recuerda el elemento que tenía el foco para devolvérselo al cerrar.
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    triggerRef.current = document.activeElement as HTMLElement | null;
    // Bloquea el scroll del fondo mientras el modal está abierto.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Foco inicial en "Cancelar" (acción segura por defecto).
    cancelRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) {
        e.preventDefault();
        onCancel();
        return;
      }
      // Trampa de foco básica: mantiene el Tab dentro del modal.
      if (e.key === "Tab") {
        const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      triggerRef.current?.focus();
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Scrim: aísla el contenido y cierra al pulsar fuera. */}
      <div
        className="absolute inset-0 bg-slate-900/50 motion-safe:animate-[fadeIn_150ms_ease-out]"
        onClick={() => !loading && onCancel()}
        aria-hidden
      />

      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 motion-safe:animate-[dialogIn_180ms_ease-out]"
      >
        <button
          type="button"
          onClick={() => !loading && onCancel()}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
          disabled={loading}
        >
          <X className="h-5 w-5" />
        </button>

        <div
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
            isDanger ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
          }`}
        >
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h2
          id={titleId}
          className="mt-4 text-center text-lg font-bold text-slate-900"
        >
          {title}
        </h2>
        {description && (
          <p id={descId} className="mt-2 text-center text-sm text-slate-600">
            {description}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
              isDanger
                ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
                : "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500"
            }`}
          >
            {loading && <Spinner className="h-4 w-4" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
