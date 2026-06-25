import { NextResponse } from "next/server";
import { requireAdminForSlug } from "@/lib/guard";
import { resetDay } from "@/lib/queue";

export const runtime = "nodejs";

// POST /api/e/[slug]/reset — (admin) reinicia la cola del día.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const guard = await requireAdminForSlug(slug);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const state = await resetDay(guard.establishment);
  return NextResponse.json(state);
}
