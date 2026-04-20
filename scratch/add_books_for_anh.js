
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const SELLER_ID = '74ac3a07-7ffb-43ea-a0c0-68e09c6e45fd'

const booksToAdd = [
  {
    title: 'Rừng Na Uy (Haruki Murakami)',
    author: 'Haruki Murakami',
    category: 'LITERATURE',
    condition: 'LIKE_NEW',
    price: 125000,
    description: 'Bản dịch kinh điển của Trịnh Lữ. Sách còn rất mới, không gãy gáy, không quăn mép. Một tác phẩm không thể thiếu cho những ai yêu thích văn học Nhật Bản.',
    stockQuantity: 1
  },
  {
    title: 'Nỗi Buồn Chiến Tranh',
    author: 'Bảo Ninh',
    category: 'LITERATURE',
    condition: 'GOOD',
    price: 150000,
    description: 'Cuốn tiểu thuyết về chiến tranh Việt Nam hay nhất mọi thời đại. Tình trạng sách tốt, giấy hơi ngả vàng theo thời gian tạo cảm giác hoài cổ.',
    stockQuantity: 1
  },
  {
    title: 'Quốc Gia Khởi Nghiệp',
    author: 'Dan Senor & Saul Singer',
    category: 'ECONOMY',
    condition: 'NEW_100',
    price: 185000,
    description: 'Sách mới nguyên seal. Câu chuyện về nền kinh tế thần kỳ của Israel, nguồn cảm hứng bất tận cho các startup tại Việt Nam.',
    stockQuantity: 3
  },
  {
    title: 'Tư Duy Nhanh Và Chậm',
    author: 'Daniel Kahneman',
    category: 'ECONOMY',
    condition: 'LIKE_NEW',
    price: 210000,
    description: 'Tác phẩm đạt giải Nobel Kinh tế. Sách bìa cứng, giữ gìn cẩn thận. Giúp bạn hiểu sâu về cách trí não chúng ta vận hành.',
    stockQuantity: 1
  },
  {
    title: '7 Thói Quen Để Thành Đạt',
    author: 'Stephen Covey',
    category: 'SKILLS',
    condition: 'GOOD',
    price: 140000,
    description: 'Cuốn sách thay đổi cuộc đời của hàng triệu người. Bản in đời đầu, chất lượng giấy tốt, dễ đọc.',
    stockQuantity: 2
  },
  {
    title: 'Sapiens: Lược Sử Loài Người',
    author: 'Yuval Noah Harari',
    category: 'OTHERS',
    condition: 'LIKE_NEW',
    price: 250000,
    description: 'Khám phá lịch sử loài người qua góc nhìn mới lạ. Sách sạch đẹp, không gạch xóa, thích hợp để sưu tầm.',
    stockQuantity: 1
  },
  {
    title: 'One Piece - Tập 100',
    author: 'Eiichiro Oda',
    category: 'COMICS',
    condition: 'NEW_100',
    price: 25000,
    description: 'Cột mốc lịch sử của bộ truyện. Bản tiếng Việt chính hãng nxb Kim Đồng, mới 100%.',
    stockQuantity: 5
  },
  {
    title: 'Thanh Gươm Diệt Quỷ - Tập 1',
    author: 'Koyoharu Gotouge',
    category: 'COMICS',
    condition: 'LIKE_NEW',
    price: 30000,
    description: 'Bản in đầu, kèm postcard. Sách được bọc cẩn thận, không tì vết.',
    stockQuantity: 1
  },
  {
    title: 'Tôi Tự Học',
    author: 'Thu Giang Nguyễn Duy Cần',
    category: 'SKILLS',
    condition: 'GOOD',
    price: 85000,
    description: 'Tinh hoa tri thức của cụ Thu Giang. Sách cũ nhưng giá trị vượt thời gian, là kim chỉ nam cho việc tự rèn luyện.',
    stockQuantity: 1
  },
  {
    title: 'Hoàng Tử Bé (Bản kỷ niệm)',
    author: 'Antoine de Saint-Exupéry',
    category: 'LITERATURE',
    condition: 'NEW_100',
    price: 110000,
    description: 'Bản in màu đẹp mắt, bìa cứng sang trọng. Thích hợp làm quà tặng hoặc lưu giữ.',
    stockQuantity: 2
  }
]

async function main() {
  console.log(`Starting to add ${booksToAdd.length} books for seller ID: ${SELLER_ID}...`)
  
  for (const bookData of booksToAdd) {
    await prisma.book.create({
      data: {
        ...bookData,
        sellerId: SELLER_ID,
        imageUrl: `https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop` // Default placeholder
      }
    })
    console.log(`Added: ${bookData.title}`)
  }
  
  console.log('All books added successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
