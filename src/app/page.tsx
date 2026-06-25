import Link from "next/link";
import { ArrowRight, LogIn } from "@/components/icons";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-10 px-6 py-12 text-center">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
          Turnos en tiempo real
        </span>
        <h1 className="text-5xl font-black tracking-tight text-slate-900">
          Turno
        </h1>
        <p className="mx-auto max-w-md text-lg text-slate-600">
          Gestión sencilla de turnos por orden de llegada para cualquier
          establecimiento.
        </p>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-2">
        <Link
          href="/register"
          className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-5 text-lg font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          Crear establecimiento
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-5 text-lg font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          <LogIn className="h-5 w-5" />
          Entrar como admin
        </Link>
      </div>

      <p className="max-w-sm text-sm text-slate-500">
        ¿Eres cliente? Acércate al establecimiento y solicita tu turno en la
        pantalla del local.
      </p>
    </main>
  );
}
