import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getQueueState } from "@/lib/queue";
import AdminPanel from "@/components/AdminPanel";
import SignOutButton from "@/components/SignOutButton";
import { ExternalLink } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // El middleware ya protege esta ruta; doble verificación por seguridad.
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
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="flex w-full items-center justify-between gap-3">
        <h1 className="truncate text-xl font-bold tracking-tight text-slate-800">
          {establishment.name}
        </h1>
        <SignOutButton />
      </div>

      <AdminPanel slug={slug} initial={initial} />

      <Link
        href={`/e/${encodeURIComponent(slug)}/display`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-emerald-700 underline-offset-2 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <ExternalLink className="h-4 w-4" />
        Abrir pantalla del cliente
      </Link>
    </main>
  );
}
