import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Update books that do not have "Thanh gươm diệt quỷ" in their title
  // Prisma's `contains` is case-sensitive or insensitive depending on collation, 
  // so we'll fetch all books and filter in JS to be safe, or just use Prisma if it relies on MySQL's default case-insensitive collation.
  // MySQL is usually case-insensitive by default.
  
  const books = await prisma.book.findMany();
  let updatedCount = 0;
  
  for (const book of books) {
    const isDemonSlayer = book.title.toLowerCase().includes("thanh gươm diệt quỷ") || 
                          book.title.toLowerCase().includes("thanh guom diet quy");
    
    if (!isDemonSlayer && book.imageUrl !== null) {
      await prisma.book.update({
        where: { id: book.id },
        data: { imageUrl: null }
      });
      updatedCount++;
    }
  }

  console.log(`Successfully removed image URLs from ${updatedCount} books.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
