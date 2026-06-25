import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <h1 className="text-5xl font-black text-slate-900">Turno</h1>
        <p className="mt-3 text-lg text-slate-600">
          Gestión sencilla de turnos por orden de llegada para cualquier
          establecimiento.
        </p>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-2">
        <Link
          href="/register"
          className="rounded-2xl bg-emerald-600 px-6 py-5 text-lg font-semibold text-white shadow-lg transition hover:bg-emerald-700"
        >
          Crear establecimiento
        </Link>
        <Link
          href="/login"
          className="rounded-2xl border border-slate-300 bg-white px-6 py-5 text-lg font-semibold text-slate-700 shadow transition hover:bg-slate-50"
        >
          Entrar como admin
        </Link>
      </div>

      <p className="text-sm text-slate-400">
        ¿Eres cliente? Acércate al establecimiento y solicita tu turno en la
        pantalla del local.
      </p>
    </main>
  );
}
