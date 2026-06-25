import { prisma } from "./db";
import { auth } from "./auth";

type GuardResult =
  | { ok: true; establishment: { id: string; timezone: string } }
  | { ok: false; status: number; error: string };

/**
 * Verifica que haya una sesión de admin y que pertenezca al establecimiento
 * del slug indicado. Devuelve el establecimiento si todo está bien.
 */
export async function requireAdminForSlug(slug: string): Promise<GuardResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, status: 401, error: "No autenticado" };
  }
  if (session.user.slug !== slug) {
    return { ok: false, status: 403, error: "No autorizado para este establecimiento" };
  }

  const establishment = await prisma.establishment.findUnique({
    where: { slug },
    select: { id: true, timezone: true },
  });
  if (!establishment) {
    return { ok: false, status: 404, error: "Establecimiento no encontrado" };
  }

  return { ok: true, establishment };
}
