
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    where: {
      name: {
        contains: 'anh'
      }
    }
  })
  console.log('---USERS---')
  console.log(JSON.stringify(users, null, 2))

  const books = await prisma.book.findMany({
    select: { title: true }
  })
  console.log('---BOOKS---')
  console.log(JSON.stringify(books, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
