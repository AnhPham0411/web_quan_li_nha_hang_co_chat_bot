import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.book.update({
    where: { id: '2f27268b-3976-416f-90f5-970e52c79ce8' },
    data: {
      title: 'Thanh Gươm Diệt Quỷ - Tập 2',
      category: 'COMICS',
      author: 'Koyoharu Gotouge',
      imageUrl: '/demon_slayer_v2.png'
    }
  });
  console.log('UPDATE_SUCCESS:', JSON.stringify(result, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
