const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  console.log(`Admin ID from DB: "${admin?.id}"`);

  const books = await prisma.book.findMany({
    take: 5,
    include: { seller: true }
  });
  console.log('\n--- Books ---');
  books.forEach(b => {
    console.log(`Book: ${b.title}, SellerID: "${b.sellerId}", SellerName: ${b.seller.name}`);
    console.log(`Match? ${b.sellerId === admin?.id}`);
  });

  const txTypes = await prisma.walletTransaction.groupBy({
    by: ['type'],
    _count: { id: true },
    _sum: { amount: true }
  });
  console.log('\n--- Transaction Summary ---');
  console.log(txTypes);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
