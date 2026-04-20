
import { prisma } from "./src/lib/prisma.ts";

async function testUpdate() {
  const book = await prisma.book.findFirst();
  if (!book) {
    console.log("No books found");
    return;
  }
  console.log("Found book:", book.id, book.title);
  
  try {
    const updated = await prisma.book.update({
      where: { id: book.id },
      data: {
        title: book.title + " (Edited)",
      }
    });
    console.log("Successfully updated:", updated.title);
    
    // Revert back
    await prisma.book.update({
      where: { id: book.id },
      data: {
        title: book.title,
      }
    });
    console.log("Reverted successfully");
  } catch (error) {
    console.error("Update failed:", error);
  }
}

testUpdate();
