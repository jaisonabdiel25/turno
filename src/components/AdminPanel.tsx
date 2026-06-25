"use client";

import { useEffect, useState } from "react";

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

  async function onReset() {
    if (
      !confirm(
        "¿Reiniciar la cola de hoy? Se eliminarán los turnos del día y la numeración volverá a 1.",
      )
    ) {
      return;
    }
    await call("reset");
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="rounded-2xl bg-white p-6 text-center shadow ring-1 ring-slate-200">
        <p className="text-sm uppercase tracking-widest text-slate-500">
          Atendiendo ahora
        </p>
        <p className="my-2 text-7xl font-black tabular-nums text-slate-900">
          {state.currentCode ?? "—"}
        </p>
        <div className="flex justify-center gap-6 text-sm text-slate-500">
          <span>
            Próximo:{" "}
            <strong className="text-slate-800">{state.nextCode ?? "—"}</strong>
          </span>
          <span>
            En espera:{" "}
            <strong className="text-slate-800">{state.waitingCount}</strong>
          </span>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        onClick={() => call("next")}
        disabled={loading !== null}
        className="w-full rounded-2xl bg-emerald-600 px-6 py-6 text-2xl font-bold text-white shadow-lg transition hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60"
      >
        {loading === "next" ? "Avanzando…" : "Siguiente ▶"}
      </button>

      <button
        onClick={onReset}
        disabled={loading !== null}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
      >
        {loading === "reset" ? "Reiniciando…" : "Reiniciar día"}
      </button>
    </div>
  );
}
