import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({
    where: {
      title: {
        contains: 'Thanh gươm',
      },
    },
  });
  console.log('BOOKS_FOUND:', JSON.stringify(books, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
