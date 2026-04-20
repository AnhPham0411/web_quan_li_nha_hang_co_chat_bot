const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const books = await prisma.book.findMany({
    include: {
      seller: true
    }
  });
  console.log(JSON.stringify(books, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
