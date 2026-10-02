import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Use environment variables or fallback to defaults (for initial setup only)
  const adminPass = process.env.ADMIN_DEFAULT_PASSWORD || "Admin#2024";

  // Hash passwords
  const adminPassword = await hashPassword(adminPass);

  // Create admin account
  const admin = await prisma.user.upsert({
    where: { nip: "198001012010011001" },
    update: {
      email: "admin@arindama.id",
      nama: "Drs. H. Hendra Wijaya, M.Si.",
      role: "ADMIN",
      jabatan: "Koordinator Tim Verifikasi Data Olahraga",
      instansi: "Dinas Pemuda dan Olahraga Provinsi Kalimantan Timur",
    },
    create: {
      nip: "198001012010011001",
      email: "admin@arindama.id",
      password: adminPassword,
      nama: "Drs. H. Hendra Wijaya, M.Si.",
      role: "ADMIN",
      jabatan: "Koordinator Tim Verifikasi Data Olahraga",
      instansi: "Dinas Pemuda dan Olahraga Provinsi Kalimantan Timur",
    },
  });

  console.log(`✅ Admin created: ${admin.nip} (${admin.email})`);

  console.log("🎉 Seeding completed!");
  console.log("\n⚠️  Default admin password was set via ADMIN_DEFAULT_PASSWORD env var.");
  console.log("⚠️  If not set, defaults were used. CHANGE THEM IMMEDIATELY in production!");
  console.log("⚠️  NEVER commit real passwords to git. Always use environment variables.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });