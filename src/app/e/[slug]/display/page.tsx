import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getQueueState } from "@/lib/queue";
import CurrentTurn from "@/components/CurrentTurn";
import RequestTurnForm from "@/components/RequestTurnForm";

export const dynamic = "force-dynamic";

// Pantalla del cliente (kiosco): muestra el turno en curso y permite solicitar
// un turno nuevo desde la misma pantalla. La abre el admin en el dispositivo
// del local, por eso requiere sesión de admin del establecimiento.
export default async function DisplayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await auth();
  if (!session?.user || session.user.slug !== slug) {
    redirect("/login");
  }

  const establishment = await prisma.establishment.findUnique({
    where: { slug },
    select: { id: true, name: true, timezone: true },
  });
  if (!establishment) notFound();

  const initial = await getQueueState(establishment);

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-10 bg-white px-6 py-12">
      <h1 className="text-center text-2xl font-bold tracking-tight text-slate-600 md:text-3xl">
        {establishment.name}
      </h1>

      <CurrentTurn slug={slug} initial={initial} big />

      <RequestTurnForm slug={slug} />
    </main>
  );
}
