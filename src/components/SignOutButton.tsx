"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "@/components/icons";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesión
    </button>
  );
}
