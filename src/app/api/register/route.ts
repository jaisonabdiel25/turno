import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // quita acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

// POST /api/register — alta self-service de establecimiento + admin.
export async function POST(request: Request) {
  let body: {
    name?: string;
    slug?: string;
    timezone?: string;
    email?: string;
    password?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.toLowerCase().trim();
  const password = body.password ?? "";
  const timezone = body.timezone?.trim() || "America/Panama";
  const slug = (body.slug?.trim() ? slugify(body.slug) : slugify(name ?? "")) || "";

  if (!name || !email || !slug) {
    return NextResponse.json(
      { error: "Faltan datos: nombre, email y slug son obligatorios" },
      { status: 400 },
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres" },
      { status: 400 },
    );
  }

  const [slugTaken, emailTaken] = await Promise.all([
    prisma.establishment.findUnique({ where: { slug }, select: { id: true } }),
    prisma.adminUser.findUnique({ where: { email }, select: { id: true } }),
  ]);
  if (slugTaken) {
    return NextResponse.json(
      { error: `El identificador "${slug}" ya está en uso` },
      { status: 409 },
    );
  }
  if (emailTaken) {
    return NextResponse.json(
      { error: "Ese email ya está registrado" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.establishment.create({
    data: {
      slug,
      name,
      timezone,
      admins: { create: { email, passwordHash } },
    },
  });

  return NextResponse.json({ slug }, { status: 201 });
}
