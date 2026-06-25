"use client";

import { useEffect, useState } from "react";
import { ChevronRight, RotateCcw, Spinner } from "@/components/icons";
import ConfirmDialog from "@/components/ConfirmDialog";

type QueueState = {
  currentCode: string | null;
  nextCode: string | null;
  waitingCount: number;
};

export default function AdminPanel({
  slug,
  initial,
}: {
  slug: string;
  initial: QueueState;
}) {
  const [state, setState] = useState<QueueState>(initial);
  const [loading, setLoading] = useState<"next" | "reset" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Mantiene el panel sincronizado (por si hay varias pestañas / nuevas solicitudes).
  useEffect(() => {
    const es = new EventSource(`/api/e/${encodeURIComponent(slug)}/stream`);
    es.onmessage = (e) => {
      try {
        setState(JSON.parse(e.data) as QueueState);
      } catch {
        /* ignora */
      }
    };
    return () => es.close();
  }, [slug]);

  async function call(action: "next" | "reset") {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/e/${encodeURIComponent(slug)}/${action}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Acción fallida");
      setState(data as QueueState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(null);
    }
  }

  async function onConfirmReset() {
    await call("reset");
    setConfirmReset(false);
  }

  const busy = loading !== null;

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          Atendiendo ahora
        </p>
        <p
          role="status"
          aria-live="polite"
          aria-label={`Atendiendo ahora: ${state.currentCode ?? "ninguno"}`}
          className="my-2 text-7xl font-black tabular-nums text-slate-900"
        >
          {state.currentCode ?? "—"}
        </p>
        <div className="flex justify-center gap-6 text-sm text-slate-500">
          <span>
            Próximo:{" "}
            <strong className="tabular-nums text-slate-800">
              {state.nextCode ?? "—"}
            </strong>
          </span>
          <span>
            En espera:{" "}
            <strong className="tabular-nums text-slate-800">
              {state.waitingCount}
            </strong>
          </span>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <button
        onClick={() => call("next")}
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-6 text-2xl font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-safe:active:scale-[0.99]"
      >
        {loading === "next" ? (
          <Spinner className="h-6 w-6" />
        ) : (
          <ChevronRight className="h-7 w-7" />
        )}
        {loading === "next" ? "Avanzando…" : "Siguiente"}
      </button>

      <div className="border-t border-slate-200 pt-4">
        <button
          onClick={() => setConfirmReset(true)}
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === "reset" ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          {loading === "reset" ? "Reiniciando…" : "Reiniciar día"}
        </button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        variant="danger"
        title="¿Reiniciar la cola de hoy?"
        description="Se eliminarán los turnos del día y la numeración volverá a 1. Esta acción no se puede deshacer."
        confirmLabel="Sí, reiniciar"
        cancelLabel="Cancelar"
        loading={loading === "reset"}
        onConfirm={onConfirmReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
