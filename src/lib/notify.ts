import type { Ticket } from "@/generated/prisma/client";

// Hook de notificación al cliente.
//
// Por ahora es un STUB: solo registra en consola que se "avisaría" al cliente.
// La lógica de la cola ya invoca esta función en el momento correcto, así que
// integrar un proveedor real (Twilio SMS / WhatsApp) solo requiere implementar
// el envío aquí, sin tocar el resto del sistema.
//
// TODO: Integrar proveedor real de notificaciones (Twilio SMS o WhatsApp).
//   1. Añadir credenciales (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM)
//      al entorno.
//   2. Reemplazar el console.log por la llamada al SDK del proveedor.
export async function notifyTicketSoon(ticket: Ticket): Promise<void> {
  if (!ticket.phone) {
    return; // El cliente no dejó teléfono.
  }

  // eslint-disable-next-line no-console
  console.log(
    `[notify] (stub) Avisaría al ${ticket.phone}: tu turno ${ticket.code} está por llegar.`,
  );
}
