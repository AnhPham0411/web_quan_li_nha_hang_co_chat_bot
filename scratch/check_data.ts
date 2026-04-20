
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    where: {
      name: {
        contains: 'anh'
      }
    }
  })
  console.log('Users found:', JSON.stringify(users, null, 2))

  const books = await prisma.book.findMany({
    include: {
        seller: true
    }
  })
  console.log('Existing books count:', books.length)
  console.log('Books by sellers (Roles):', books.map(b => b.seller.role))
  
  // Group books by title to see what's already there
  const titles = books.map(b => b.title)
  console.log('Unique titles:', [...new Set(titles)])
}

main()
  .catch((e) => {
    console.error(e)
    process.nextTick(() => process.exit(1))
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
