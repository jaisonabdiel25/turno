"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Spinner } from "@/components/icons";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

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
      nameRef.current?.focus();
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="mb-6 text-center text-3xl font-black tracking-tight text-slate-900">
        Crear establecimiento
      </h1>
      <form
        onSubmit={submit}
        noValidate
        className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <label className="block text-sm font-medium text-slate-700">
          Nombre del establecimiento{" "}
          <span className="text-red-500" aria-hidden>
            *
          </span>
          <input
            ref={nameRef}
            required
            autoComplete="organization"
            value={form.name}
            onChange={set("name")}
            className={inputClass}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Identificador en la URL{" "}
          <span className="font-normal text-slate-400">(opcional)</span>
          <input
            value={form.slug}
            onChange={set("slug")}
            autoComplete="off"
            placeholder="se genera del nombre si lo dejas vacío"
            className={inputClass}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Email del admin{" "}
          <span className="text-red-500" aria-hidden>
            *
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={form.email}
            onChange={set("email")}
            className={inputClass}
          />
        </label>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Contraseña{" "}
            <span className="text-red-500" aria-hidden>
              *
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                value={form.password}
                onChange={set("password")}
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 mt-1.5 mb-0 flex items-center px-3 text-slate-400 transition hover:text-slate-600 focus-visible:outline-none focus-visible:text-emerald-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </label>
          <p className="mt-1 text-xs text-slate-400">Mínimo 6 caracteres.</p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Spinner className="h-4 w-4" />}
          {loading ? "Creando…" : "Crear y continuar"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-700 underline-offset-2 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </main>
  );
}
