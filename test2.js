const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const allResp = await prisma.responden.findMany({ select: { nik: true, userId: true, nama: true, kabupatenKota: true } });
  console.table(allResp);
}
main();
