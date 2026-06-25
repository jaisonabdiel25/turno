import { NextResponse } from "next/server";
import { requireAdminForSlug } from "@/lib/guard";
import { createTicket } from "@/lib/queue";

export const runtime = "nodejs";

// POST /api/e/[slug]/tickets — solicita un turno desde la pantalla de
// solicitud (kiosco). Solo el admin del establecimiento puede crear turnos.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const guard = await requireAdminForSlug(slug);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const establishment = guard.establishment;

  let phone: string | null = null;
  try {
    const body = await request.json();
    if (typeof body?.phone === "string" && body.phone.trim()) {
      phone = body.phone.trim().slice(0, 30);
    }
  } catch {
    // Sin cuerpo o JSON inválido: turno sin teléfono.
  }

  try {
    const { ticket, position } = await createTicket(establishment, phone);
    return NextResponse.json(
      { code: ticket.code, position },
      { status: 201 },
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo crear el turno";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
