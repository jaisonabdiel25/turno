"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo registrar");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="mb-6 text-center text-3xl font-black text-slate-900">
        Crear establecimiento
      </h1>
      <form
        onSubmit={submit}
        className="space-y-4 rounded-2xl bg-white p-6 shadow ring-1 ring-slate-200"
      >
        <label className="block text-sm font-medium text-slate-700">
          Nombre del establecimiento
          <input
            required
            value={form.name}
            onChange={set("name")}
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Identificador en la URL (opcional)
          <input
            value={form.slug}
            onChange={set("slug")}
            placeholder="se genera del nombre si lo dejas vacío"
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Email del admin
          <input
            type="email"
            required
            value={form.email}
            onChange={set("email")}
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Contraseña (mín. 6 caracteres)
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={set("password")}
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Creando…" : "Crear y continuar"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <a href="/login" className="text-emerald-700 underline">
          Entrar
        </a>
      </p>
    </main>
  );
}
