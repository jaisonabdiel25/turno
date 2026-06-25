import type { NextAuthConfig } from "next-auth";

// Configuración compartida y SIN dependencias de Node (Prisma/bcrypt), para que
// pueda importarse desde el middleware (runtime edge). Los providers reales se
// añaden en auth.ts (runtime Node).
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  session: { strategy: "jwt" },
  callbacks: {
    // Propaga establishmentId y slug al token al iniciar sesión.
    jwt({ token, user }) {
      if (user) {
        token.establishmentId = (user as { establishmentId?: string })
          .establishmentId;
        token.slug = (user as { slug?: string }).slug;
      }
      return token;
    },
    // Expone esos datos en la sesión.
    session({ session, token }) {
      if (session.user) {
        session.user.establishmentId = token.establishmentId as string;
        session.user.slug = token.slug as string;
      }
      return session;
    },
    // Protege las rutas /e/[slug]/admin: exige sesión y que el admin pertenezca
    // al establecimiento de la URL.
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      // Protege todo /e/[slug]: panel admin y pantalla del cliente (kiosco).
      const match = pathname.match(/^\/e\/([^/]+)/);
      if (!match) return true; // ruta pública

      const slug = decodeURIComponent(match[1]);
      const user = auth?.user as { slug?: string } | undefined;
      if (!user) return false; // sin sesión -> redirige a /login
      return user.slug === slug; // debe ser el admin de ESE establecimiento
    },
  },
} satisfies NextAuthConfig;
