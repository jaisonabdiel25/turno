import { NextResponse } from "next/server";
import { requireAdminForSlug } from "@/lib/guard";
import { advanceQueue } from "@/lib/queue";

export const runtime = "nodejs";

// POST /api/e/[slug]/next — (admin) avanza al siguiente turno.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const guard = await requireAdminForSlug(slug);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const state = await advanceQueue(guard.establishment);
  return NextResponse.json(state);
}
