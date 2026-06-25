import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const slug = "demo";
  const adminEmail = "admin@demo.com";
  const adminPassword = "admin123";

  const establishment = await prisma.establishment.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      name: "Establecimiento Demo",
      timezone: "America/Panama",
    },
  });

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash, establishmentId: establishment.id },
    create: {
      email: adminEmail,
      passwordHash,
      establishmentId: establishment.id,
    },
  });

  console.log("Seed completado:");
  console.log(`  Establecimiento: ${establishment.name} (slug: ${slug})`);
  console.log(`  Pantalla cliente: /e/${slug}`);
  console.log(`  Panel admin:      /e/${slug}/admin`);
  console.log(`  Login admin:      ${adminEmail} / ${adminPassword}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
