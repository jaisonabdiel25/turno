"use client";

import { useEffect, useState } from "react";

type Result = { code: string; position: number };

// Segundos que se muestra el turno asignado antes de reiniciar la pantalla,
// para que el siguiente cliente no vea el número del anterior.
const AUTO_RESET_SECONDS = 12;

export default function RequestTurnForm({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RESET_SECONDS);
  const [error, setError] = useState<string | null>(null);

  // Al mostrar un turno, cuenta atrás y reinicia la pantalla solo.
  useEffect(() => {
    if (!result) return;
    setSecondsLeft(AUTO_RESET_SECONDS);
    const tick = setInterval(() => {
      setSecondsLeft((s) => Math.max(s - 1, 0));
    }, 1000);
    const done = setTimeout(() => setResult(null), AUTO_RESET_SECONDS * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [result]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/e/${encodeURIComponent(slug)}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo solicitar el turno");
      setResult(data as Result);
      setOpen(false);
      setPhone("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg ring-1 ring-slate-200">
        <p className="text-slate-500">Tu turno es</p>
        <p className="my-2 text-7xl font-black tabular-nums text-emerald-600">
          {result.code}
        </p>
        <p className="text-slate-600">
          Hay <strong>{Math.max(result.position - 1, 0)}</strong> persona(s)
          delante de ti.
        </p>
        <button
          onClick={() => setResult(null)}
          className="mt-5 w-full rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-200"
        >
          Listo
        </button>
        <p className="mt-3 text-xs text-slate-400">
          Esta pantalla se reiniciará en {secondsLeft} s
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="w-full max-w-sm">
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-2xl bg-emerald-600 px-6 py-5 text-xl font-bold text-white shadow-lg transition hover:bg-emerald-700 active:scale-[0.99]"
        >
          Solicitar turno
        </button>
        {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200"
    >
      <label className="block text-sm font-medium text-slate-700">
        Teléfono (opcional)
        <input
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Para avisarte cuando se acerque tu turno"
          className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
      </label>
      <p className="mt-1 text-xs text-slate-400">
        Si lo dejas vacío, igual obtienes tu turno; solo no te avisaremos.
      </p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Solicitando…" : "Confirmar"}
        </button>
      </div>
    </form>
  );
}
