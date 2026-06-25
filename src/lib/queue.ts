import type { Establishment, Ticket } from "@/generated/prisma/client";
import { prisma } from "./db";
import { serviceDateFor } from "./establishment";
import { sequenceToCode } from "./turno";
import { notifyTicketSoon } from "./notify";

export type QueueState = {
  // Código del turno en curso, o null si no hay ninguno en atención.
  currentCode: string | null;
  // Personas esperando (status = waiting) para hoy.
  waitingCount: number;
  // Próximo código en la fila (el primero en espera), si existe.
  nextCode: string | null;
};

/** Estado actual de la cola del día para un establecimiento. */
export async function getQueueState(
  establishment: Pick<Establishment, "id" | "timezone">,
): Promise<QueueState> {
  const serviceDate = serviceDateFor(establishment.timezone);

  const [serving, nextWaiting, waitingCount] = await Promise.all([
    prisma.ticket.findFirst({
      where: { establishmentId: establishment.id, serviceDate, status: "serving" },
    }),
    prisma.ticket.findFirst({
      where: { establishmentId: establishment.id, serviceDate, status: "waiting" },
      orderBy: { sequence: "asc" },
    }),
    prisma.ticket.count({
      where: { establishmentId: establishment.id, serviceDate, status: "waiting" },
    }),
  ]);

  return {
    currentCode: serving?.code ?? null,
    nextCode: nextWaiting?.code ?? null,
    waitingCount,
  };
}

/** Crea un nuevo turno (solicitud del cliente). Devuelve el ticket y su posición. */
export async function createTicket(
  establishment: Pick<Establishment, "id" | "timezone">,
  phone: string | null,
): Promise<{ ticket: Ticket; position: number }> {
  const serviceDate = serviceDateFor(establishment.timezone);

  // Pequeño reintento ante colisiones del índice único (estab + fecha + sequence).
  for (let attempt = 0; attempt < 5; attempt++) {
    const last = await prisma.ticket.findFirst({
      where: { establishmentId: establishment.id, serviceDate },
      orderBy: { sequence: "desc" },
      select: { sequence: true },
    });
    const sequence = (last?.sequence ?? 0) + 1;
    const code = sequenceToCode(sequence);

    try {
      const ticket = await prisma.ticket.create({
        data: {
          establishmentId: establishment.id,
          serviceDate,
          sequence,
          code,
          phone: phone || null,
          status: "waiting",
        },
      });

      // Posición en la fila = personas esperando por delante (incluyéndolo).
      const position = await prisma.ticket.count({
        where: {
          establishmentId: establishment.id,
          serviceDate,
          status: "waiting",
          sequence: { lte: sequence },
        },
      });

      return { ticket, position };
    } catch (err) {
      // Si fue colisión de unicidad, reintenta con el nuevo máximo.
      if (isUniqueViolation(err)) continue;
      throw err;
    }
  }
  throw new Error("No se pudo asignar el turno, inténtalo de nuevo.");
}

/**
 * Avanza la cola: cierra el turno en curso y promueve el siguiente en espera.
 * Notifica (stub) al que pasa a ser el próximo en la fila.
 */
export async function advanceQueue(
  establishment: Pick<Establishment, "id" | "timezone">,
): Promise<QueueState> {
  const serviceDate = serviceDateFor(establishment.timezone);

  await prisma.$transaction(async (tx) => {
    // Cierra el turno en curso.
    await tx.ticket.updateMany({
      where: { establishmentId: establishment.id, serviceDate, status: "serving" },
      data: { status: "done", servedAt: new Date() },
    });

    // Promueve el primero en espera.
    const next = await tx.ticket.findFirst({
      where: { establishmentId: establishment.id, serviceDate, status: "waiting" },
      orderBy: { sequence: "asc" },
    });
    if (next) {
      await tx.ticket.update({
        where: { id: next.id },
        data: { status: "serving" },
      });
    }
  });

  // Tras promover, avisa al que ahora es el próximo en la fila.
  const upcoming = await prisma.ticket.findFirst({
    where: { establishmentId: establishment.id, serviceDate, status: "waiting" },
    orderBy: { sequence: "asc" },
  });
  if (upcoming) {
    await notifyTicketSoon(upcoming);
  }

  return getQueueState(establishment);
}

/**
 * Reinicia la cola del día: elimina los turnos de hoy para que la numeración
 * vuelva a empezar en 1 y la pantalla quede sin turno en curso.
 */
export async function resetDay(
  establishment: Pick<Establishment, "id" | "timezone">,
): Promise<QueueState> {
  const serviceDate = serviceDateFor(establishment.timezone);
  await prisma.ticket.deleteMany({
    where: { establishmentId: establishment.id, serviceDate },
  });
  return getQueueState(establishment);
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}
