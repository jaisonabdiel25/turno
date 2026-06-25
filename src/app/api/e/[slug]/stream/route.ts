import { prisma } from "@/lib/db";
import { getQueueState } from "@/lib/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/e/[slug]/stream — Server-Sent Events con el estado de la cola.
// El handler consulta el estado periódicamente y solo emite un evento cuando
// algo cambia. Sin dependencias externas (broker/pubsub).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const establishment = await prisma.establishment.findUnique({
    where: { slug },
    select: { id: true, timezone: true },
  });
  if (!establishment) {
    return new Response("Establecimiento no encontrado", { status: 404 });
  }

  const encoder = new TextEncoder();
  let closed = false;
  let timer: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Estado inicial.
      let last = await getQueueState(establishment);
      send(last);

      // Sondeo cada 2s; emite solo si cambió.
      timer = setInterval(async () => {
        if (closed) return;
        try {
          const next = await getQueueState(establishment);
          if (JSON.stringify(next) !== JSON.stringify(last)) {
            last = next;
            send(next);
          } else {
            // Comentario keep-alive para mantener viva la conexión.
            controller.enqueue(encoder.encode(": keep-alive\n\n"));
          }
        } catch {
          // Ignora errores transitorios de BD; el siguiente tick reintenta.
        }
      }, 2000);
    },
    cancel() {
      closed = true;
      if (timer) clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
