// Helpers para calcular la "fecha de servicio" según la zona horaria del
// establecimiento. La fecha de servicio se guarda como un DateTime @db.Date
// a medianoche UTC, de modo que el reinicio diario coincide con el día local
// del establecimiento.

/**
 * Devuelve la fecha de servicio actual (a medianoche UTC) para una zona horaria.
 * Ej.: si en la zona del establecimiento son las 23:30 del 20/06, devuelve
 * 2026-06-20T00:00:00.000Z independientemente de la hora UTC real.
 */
export function serviceDateFor(timezone: string, now: Date = new Date()): Date {
  // Formatea "now" en la zona del establecimiento como YYYY-MM-DD.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // en-CA produce "YYYY-MM-DD"

  // Construye la fecha a medianoche UTC.
  return new Date(`${parts}T00:00:00.000Z`);
}
