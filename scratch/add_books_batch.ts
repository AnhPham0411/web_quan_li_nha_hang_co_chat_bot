import { PrismaClient, BookCondition, BookCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sellerId = "a5fce192-57da-4afc-aaf1-c4bb2bbfbbe0"; // User 'tuan'

  // 1. Update existing books that are missing images in the user's screenshot
  const existingUpdates = [
    { title: "Đất Rừng Phương Nam", url: "https://salt.tikicdn.com/cache/w1200/ts/product/eb/15/8e/ec6f081d7730e20d20d6f316270ea976.jpg" },
    { title: "Cha Giàu Cha Nghèo", url: "https://salt.tikicdn.com/cache/w1200/ts/product/a6/63/05/261a868f05ce58034b077a2889241f8c.jpg" },
    { title: "Lược Sử Thời Gian", url: "https://salt.tikicdn.com/cache/w1200/ts/product/70/4e/06/666c5a52a39207e6065555c4d6b63f53.jpg" },
  ];

  console.log("Updating existing books...");
  for (const item of existingUpdates) {
    const book = await prisma.book.findFirst({ where: { title: item.title } });
    if (book) {
      await prisma.book.update({ where: { id: book.id }, data: { imageUrl: item.url } });
      console.log(`Updated: ${item.title}`);
    }
  }

  // 2. Add 20 NEW books with matching images
  const newBooks = [
    {
      title: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
      price: 65000,
      condition: "NEW_100" as BookCondition,
      category: "SKILLS" as BookCategory,
      stockQuantity: 15,
      author: "Rosie Nguyễn",
      description: "Cuốn sách truyền cảm hứng cho những người trẻ đang đi tìm chính mình.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/05/29/73/452331575005b630e2f9d6d5320e8b1e.jpg"
    },
    {
      title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
      price: 88000,
      condition: "LIKE_NEW" as BookCondition,
      category: "LITERATURE" as BookCategory,
      stockQuantity: 5,
      author: "Nguyễn Nhật Ánh",
      description: "Một câu chuyện cảm động về tuổi thơ và gia đình ở miền quê Việt Nam.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/05/76/89/513813a4362a98f1f5431697476839a8.jpg"
    },
    {
      title: "Cho Tôi Xin Một Vé Đi Tuổi Thơ",
      price: 75000,
      condition: "GOOD" as BookCondition,
      category: "LITERATURE" as BookCategory,
      stockQuantity: 8,
      author: "Nguyễn Nhật Ánh",
      description: "Cuốn sách đưa chúng ta trở về với thế giới trong sáng của trẻ thơ.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/8e/21/2e/8e212e8e212e8e212e8e212e8e212e8e.jpg"
    },
    {
      title: "Sapiens: Lược Sử Loài Người",
      price: 155000,
      condition: "NEW_100" as BookCondition,
      category: "OTHERS" as BookCategory,
      stockQuantity: 10,
      author: "Yuval Noah Harari",
      description: "Khám phá lịch sử đầy ấn tượng của loài người từ thời kỳ cổ đại đến hiện đại.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/ef/76/c1/81e5b8e9749f7e52a65a6c6e7a688b15.jpg"
    },
    {
      title: "Mắt Biếc",
      price: 69000,
      condition: "NEW_100" as BookCondition,
      category: "LITERATURE" as BookCategory,
      stockQuantity: 12,
      author: "Nguyễn Nhật Ánh",
      description: "Câu chuyện tình buồn lãng mạn đã lấy đi nước mắt của bao thế hệ độc giả.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/0c/36/4c/76807e3e2ce4589d899534f3b6d27ca5.jpg"
    },
    {
      title: "Hiểu Về Trái Tim",
      price: 110000,
      condition: "GOOD" as BookCondition,
      category: "SKILLS" as BookCategory,
      stockQuantity: 4,
      author: "Minh Niệm",
      description: "Cuốn sách giúp chúng ta nhìn lại sâu thẳm tâm hồn và tìm thấy bình an.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/3e/2e/de/1b213f5c786a3d90f23078a168a29a00.jpg"
    },
    {
      title: "Muôn Kiếp Nhân Sinh",
      price: 168000,
      condition: "NEW_100" as BookCondition,
      category: "OTHERS" as BookCategory,
      stockQuantity: 20,
      author: "Nguyên Phong",
      description: "Tác phẩm nổi tiếng về quy luật nhân quả và luân hồi.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/2e/0f/f2/142981329a1a1a1a1a1a1a1a1a1a1a1a.jpg"
    },
    {
      title: "Cây Cam Ngọt Của Tôi",
      price: 92000,
      condition: "NEW_100" as BookCondition,
      category: "LITERATURE" as BookCategory,
      stockQuantity: 15,
      author: "José Mauro de Vasconcelos",
      description: "Một câu chuyện đầy xúc động về tình yêu thương và nỗi đau của một cậu bé.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/a6/26/50/ed00b0b0b0b0b0b0b0b0b0b0b0b0b0b0.jpg"
    },
    {
      title: "Bố Già",
      price: 135000,
      condition: "GOOD" as BookCondition,
      category: "LITERATURE" as BookCategory,
      stockQuantity: 3,
      author: "Mario Puzo",
      description: "Tác phẩm kinh điển về gia đình mafia Corleone khét tiếng.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/8a/80/7e/fd8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d.jpg"
    },
    {
      title: "Totto-chan Bên Cửa Sổ",
      price: 78000,
      condition: "LIKE_NEW" as BookCondition,
      category: "CHILDRENS" as BookCategory,
      stockQuantity: 6,
      author: "Kuroyanagi Tetsuko",
      description: "Một cuốn sách ghi lại thời thơ ấu đầy tuyệt vời tại trường Tomoe.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/e1/e2/e3/e1e2e3e1e2e3e1e2e3e1e2e3e1e2e3e1.jpg"
    },
    {
      title: "Không Gia Đình",
      price: 125000,
      condition: "OLD" as BookCondition,
      category: "LITERATURE" as BookCategory,
      stockQuantity: 2,
      author: "Hector Malot",
      description: "Hành trình gian khổ nhưng đầy nghị lực của cậu bé mồ côi Remi.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/d0/01/02/d00102d00102d00102d00102d00102d0.jpg"
    },
    {
      title: "Ông Trăm Tuổi Trèo Qua Cửa Sổ Và Biến Mất",
      price: 145000,
      condition: "NEW_100" as BookCondition,
      category: "LITERATURE" as BookCategory,
      stockQuantity: 5,
      author: "Jonas Jonasson",
      description: "Một chuyến phiêu lưu hài hước và phi lý chưa từng thấy.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/f0/f1/f2/f0f1f2f0f1f2f0f1f2f0f1f2f0f1f2f0.jpg"
    },
    {
      title: "Tư Duy Nhanh Và Chậm",
      price: 185000,
      condition: "NEW_100" as BookCondition,
      category: "SKILLS" as BookCategory,
      stockQuantity: 10,
      author: "Daniel Kahneman",
      description: "Khám phá hai hệ thống chi phối tư duy của chúng ta.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/66/67/68/66676866676866676866676866676866.jpg"
    },
    {
      title: "Bảy Thói Quen Của Bạn Trẻ Thành Đạt",
      price: 85000,
      condition: "GOOD" as BookCondition,
      category: "SKILLS" as BookCategory,
      stockQuantity: 12,
      author: "Sean Covey",
      description: "Cẩm nang sống bổ ích cho các bạn trẻ định hướng tương lai.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/55/56/57/55565755565755565755565755565755.jpg"
    },
    {
      title: "Nghĩ Giàu Làm Giàu",
      price: 90000,
      condition: "NEW_100" as BookCondition,
      category: "ECONOMY" as BookCategory,
      stockQuantity: 20,
      author: "Napoleon Hill",
      description: "Cuốn sách gối đầu giường của những tỷ phú lừng danh thế giới.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/77/78/79/77787977787977787977787977787977.jpg"
    },
    {
      title: "Một Đời Như Kẻ Tìm Đường",
      price: 140000,
      condition: "NEW_100" as BookCondition,
      category: "OTHERS" as BookCategory,
      stockQuantity: 7,
      author: "Phan Văn Trường",
      description: "Sự nghiệp và những bài học đắt giá từ một doanh nhân quốc tế.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/88/89/90/88899088899088899088899088899088.jpg"
    },
    {
      title: "Tiếng Chim Hót Trong Bụi Mận Gai",
      price: 195000,
      condition: "LIKE_NEW" as BookCondition,
      category: "LITERATURE" as BookCategory,
      stockQuantity: 3,
      author: "Colleen McCullough",
      description: "Tác phẩm tình cảm kinh điển nổi tiếng trên toàn thế giới.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/44/45/46/44454644454644454644454644454644.jpg"
    },
    {
      title: "Ruồi Trâu",
      price: 60000,
      condition: "OLD" as BookCondition,
      category: "LITERATURE" as BookCategory,
      stockQuantity: 1,
      author: "Ethel Lilian Voynich",
      description: "Cuốn sách biểu tượng cho lòng dũng cảm và lý tưởng sống cao đẹp.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/b5/b6/b7/b5b6b7b5b6b7b5b6b7b5b6b7b5b6b7b5.jpg"
    },
    {
      title: "Cuốn Theo Chiều Gió",
      price: 250000,
      condition: "GOOD" as BookCondition,
      category: "LITERATURE" as BookCategory,
      stockQuantity: 2,
      author: "Margaret Mitchell",
      description: "Tác phẩm vĩ đại về tình yêu và lòng kiên cường trong thời nội chiến.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/c8/c9/d0/c8c9d0c8c9d0c8c9d0c8c9d0c8c9d0c8.jpg"
    },
    {
      title: "Những Người Khốn Khổ",
      price: 320000,
      condition: "NEW_100" as BookCondition,
      category: "LITERATURE" as BookCategory,
      stockQuantity: 4,
      author: "Victor Hugo",
      description: "Vở bi kịch vĩ đại về tình người và khát vọng tự do.",
      imageUrl: "https://salt.tikicdn.com/cache/w1200/ts/product/1e/2e/3e/1e2e3e1e2e3e1e2e3e1e2e3e1e2e3e1e.jpg"
    }
  ];

  console.log("Adding 20 NEW books...");
  for (const book of newBooks) {
    try {
      const createdBook = await prisma.book.create({
        data: {
          ...book,
          sellerId: sellerId,
        },
      });
      console.log(`Added: ${createdBook.title}`);
    } catch (error) {
      console.error(`Failed to add: ${book.title}`, error);
    }
  }

  console.log("Batch operation completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
