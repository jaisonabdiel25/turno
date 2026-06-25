import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Usa el callback `authorized` de authConfig para proteger /e/[slug]/admin.
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  // Todo /e/* requiere sesión del admin del establecimiento: tanto el panel
  // como la pantalla del cliente (kiosco) los abre el admin en el local.
  matcher: ["/e/:path*"],
};
