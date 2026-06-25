import { redirect } from "next/navigation";

// La pantalla del cliente es /e/[slug]/display (muestra el turno en curso y
// permite solicitar). El slug "pelado" redirige allí.
export default async function EstablishmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/e/${encodeURIComponent(slug)}/display`);
}
