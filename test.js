const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.responden.count();
  console.log('Total responden in DB:', count);
}
main();
