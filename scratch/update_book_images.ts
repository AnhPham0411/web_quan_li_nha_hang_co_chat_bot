import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const updates = [
    { title: "Doraemon Tập 1", url: "https://salt.tikicdn.com/cache/w1200/ts/product/45/ea/09/cc307842c56a3500c878d264f33fd35e.jpg" },
    { title: "Nhà Giả Kim", url: "https://salt.tikicdn.com/cache/w1200/ts/product/3d/8c/99/ff7cb6259c6b840ca8400030589a1945.jpg" },
    { title: "Đắc Nhân Tâm", url: "https://salt.tikicdn.com/cache/w1200/ts/product/2e/de/7c/754388484196167c13ac474f762db485.jpg" },
    { title: "Sherlock Holmes (Toàn tập)", url: "https://salt.tikicdn.com/cache/w1200/ts/product/f3/f1/45/9c42023a85b991bd603347f26d6a2f4c.jpg" },
    { title: "Harry Potter và Hòn Đá Phù Thủy", url: "https://salt.tikicdn.com/cache/w1200/ts/product/d7/37/ee/fbf1f62b66d482937397b98d1d866a01.jpg" },
    { title: "Thần Thoại Hy Lạp", url: "https://salt.tikicdn.com/cache/w1200/ts/product/a6/50/de/58e2392728d195c6c8e3189d2822a944.jpg" },
    { title: "Naruto Volume 1", url: "https://salt.tikicdn.com/cache/w1200/ts/product/67/a9/48/433e70d4c82c611488c005b87968511e.jpg" },
    { title: "Lược Sử Thời Gian", url: "https://salt.tikicdn.com/cache/w1200/ts/product/70/4e/06/666c5a52a39207e6065555c4d6b63f53.jpg" },
    { title: "Cha Giàu Cha Nghèo", url: "https://salt.tikicdn.com/cache/w1200/ts/product/a6/63/05/261a868f05ce58034b077a2889241f8c.jpg" },
    { title: "Đất Rừng Phương Nam", url: "https://salt.tikicdn.com/cache/w1200/ts/product/eb/15/8e/ec6f081d7730e20d20d6f316270ea976.jpg" }
  ];

  console.log("Updating book images...");

  for (const item of updates) {
    const book = await prisma.book.findFirst({
      where: { title: item.title }
    });

    if (book) {
      await prisma.book.update({
        where: { id: book.id },
        data: { imageUrl: item.url }
      });
      console.log(`Updated image for: ${item.title}`);
    } else {
      console.log(`Book not found: ${item.title}`);
    }
  }

  console.log("Update completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
