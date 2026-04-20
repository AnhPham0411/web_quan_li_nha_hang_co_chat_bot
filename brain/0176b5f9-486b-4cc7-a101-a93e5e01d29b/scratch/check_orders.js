const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const subOrders = await prisma.subOrder.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log('--- SubOrders ---');
  subOrders.forEach(so => {
    console.log(`ID: ${so.id.slice(0,8)}, SubTotal: ${so.subTotal}, Fee: ${so.platformFee}, Net: ${so.netAmount}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
