import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Use environment variables or fallback to defaults (for initial setup only)
  const adminPass = process.env.ADMIN_DEFAULT_PASSWORD || "Admin#2024";
  const userPass = process.env.USER_DEFAULT_PASSWORD || "User#2024";

  // Hash passwords
  const adminPassword = await hashPassword(adminPass);
  const userPassword = await hashPassword(userPass);

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

  // Create default responden account
  const responden = await prisma.user.upsert({
    where: { nip: "198502022015021002" },
    update: {},
    create: {
      nip: "198502022015021002",
      email: "responden@arindama.id",
      password: userPassword,
      nama: "Bambang Pamungkas, S.Pd.",
      role: "OPERATOR",
      jabatan: "Pelatih & Pengurus Cabang Atletik",
      instansi: "Pengcab PASI Kabupaten Kutai Kartanegara",
    },
  });

  console.log(`✅ Responden created: ${responden.nip} (${responden.email})`);

  console.log("🎉 Seeding completed!");
  console.log("\n⚠️  Default passwords were set via ADMIN_DEFAULT_PASSWORD / USER_DEFAULT_PASSWORD env vars.");
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