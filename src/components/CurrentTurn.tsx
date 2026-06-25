"use client";

import { useEffect, useState } from "react";

type QueueState = {
  currentCode: string | null;
  nextCode: string | null;
  waitingCount: number;
};

export default function CurrentTurn({
  slug,
  initial,
  big = false,
}: {
  slug: string;
  initial: QueueState;
  big?: boolean;
}) {
  const [state, setState] = useState<QueueState>(initial);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource(`/api/e/${encodeURIComponent(slug)}/stream`);
    es.onopen = () => setConnected(true);
    es.onmessage = (e) => {
      try {
        setState(JSON.parse(e.data) as QueueState);
      } catch {
        /* ignora payloads no-JSON */
      }
    };
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, [slug]);

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm font-semibold uppercase tracking-widest text-slate-500">
        Turno en curso
      </span>
      <span
        role="status"
        aria-live="polite"
        aria-label={`Turno en curso: ${state.currentCode ?? "ninguno"}`}
        className={`font-black leading-none tabular-nums text-slate-900 ${
          big ? "text-[28vw] md:text-[20rem]" : "text-8xl md:text-9xl"
        }`}
      >
        {state.currentCode ?? "—"}
      </span>
      <div className="mt-4 flex items-center gap-4 text-slate-500">
        <span>
          En espera:{" "}
          <strong className="tabular-nums text-slate-800">
            {state.waitingCount}
          </strong>
        </span>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            connected ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              connected ? "animate-pulse bg-emerald-500" : "bg-slate-300"
            }`}
            aria-hidden
          />
          {connected ? "En vivo" : "Reconectando…"}
        </span>
      </div>
    </div>
  );
}
