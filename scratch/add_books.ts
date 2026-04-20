import { PrismaClient, BookCondition, BookCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sellerId = "a5fce192-57da-4afc-aaf1-c4bb2bbfbbe0"; // User 'tuan'

  const booksData = [
    {
      title: "Doraemon Tập 1",
      price: 25000,
      condition: "LIKE_NEW" as BookCondition,
      category: "COMICS" as BookCategory,
      stockQuantity: 10,
      author: "Fujiko F. Fujio",
      description: "Tập đầu tiên của bộ truyện về chú mèo máy đến từ tương lai.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/7c/4f/2e/4d8f28f8f94e1d53b92d8f94e1d53b92.jpg"
    },
    {
      title: "Nhà Giả Kim",
      price: 65000,
      condition: "NEW_100" as BookCondition,
      category: "LITERATURE" as BookCategory,
      stockQuantity: 5,
      author: "Paulo Coelho",
      description: "Một trong những cuốn sách bán chạy nhất mọi thời đại.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/45/3b/02/ec1d22f883f31d0d1e3d22f883f31d0d.jpg"
    },
    {
      title: "Đắc Nhân Tâm",
      price: 85000,
      condition: "NEW_100" as BookCondition,
      category: "SKILLS" as BookCategory,
      stockQuantity: 10,
      author: "Dale Carnegie",
      description: "Cuốn sách về giao tiếp và thu phục lòng người.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/8e/08/94/d8f8e8f8f8e8f8f8f8e8f8f8f8e8f8f8.jpg"
    },
    {
      title: "Sherlock Holmes (Toàn tập)",
      price: 120000,
      condition: "GOOD" as BookCondition,
      category: "LITERATURE" as BookCategory,
      stockQuantity: 2,
      author: "Arthur Conan Doyle",
      description: "Vị thám tử tài ba nhất trong lịch sử văn học.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/2e/4f/8d/8f8e8f8f8e8f8f8f8e8f8f8f8e8f8f8.jpg"
    },
    {
      title: "Harry Potter và Hòn Đá Phù Thủy",
      price: 110000,
      condition: "NEW_100" as BookCondition,
      category: "LITERATURE" as BookCategory,
      stockQuantity: 7,
      author: "J.K. Rowling",
      description: "Khởi đầu của cậu bé phù thủy Harry Potter.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/1d/1d/1d/1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d.jpg"
    },
    {
      title: "Thần Thoại Hy Lạp",
      price: 95000,
      condition: "GOOD" as BookCondition,
      category: "OTHERS" as BookCategory,
      stockQuantity: 3,
      author: "Nguyễn Văn Khỏa",
      description: "Tổng hợp các câu chuyện thần thoại Hy Lạp hấp dẫn.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/2d/2d/2d/2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d.jpg"
    },
    {
      title: "Naruto Volume 1",
      price: 30000,
      condition: "NEW_100" as BookCondition,
      category: "COMICS" as BookCategory,
      stockQuantity: 20,
      author: "Masashi Kishimoto",
      description: "Hành trình trở thành Hokage của cậu bé Naruto.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/3d/3d/3d/3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d.jpg"
    },
    {
      title: "Lược Sử Thời Gian",
      price: 140000,
      condition: "LIKE_NEW" as BookCondition,
      category: "OTHERS" as BookCategory,
      stockQuantity: 4,
      author: "Stephen Hawking",
      description: "Vũ trụ học cho mọi người.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/4d/4d/4d/4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d.jpg"
    },
    {
      title: "Cha Giàu Cha Nghèo",
      price: 90000,
      condition: "NEW_100" as BookCondition,
      category: "ECONOMY" as BookCategory,
      stockQuantity: 15,
      author: "Robert Kiyosaki",
      description: "Sách về tư duy tài chính.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/5d/5d/5d/5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d.jpg"
    },
    {
      title: "Đất Rừng Phương Nam",
      price: 55000,
      condition: "OLD" as BookCondition,
      category: "LITERATURE" as BookCategory,
      stockQuantity: 1,
      author: "Đoàn Giỏi",
      description: "Một tác phẩm kinh điển về thiên nhiên và con người miền Tây.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/6d/6d/6d/6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d.jpg"
    }
  ];

  console.log(`Adding books for seller ID: ${sellerId}`);

  for (const book of booksData) {
    try {
      const createdBook = await prisma.book.create({
        data: {
          ...book,
          sellerId: sellerId,
        },
      });
      console.log(`Created book: ${createdBook.title} (ID: ${createdBook.id})`);
    } catch (error) {
      console.error(`Failed to create book: ${book.title}`, error);
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
