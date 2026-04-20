import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.book.count();
  const books = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      imageUrl: true,
    },
    take: 20,
  });
  console.log(`Total books: ${count}`);
  console.log("Books:", JSON.stringify(books, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
