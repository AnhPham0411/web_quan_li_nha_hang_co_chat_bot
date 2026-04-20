import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.log('RECENT_BOOKS:', JSON.stringify(books, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
