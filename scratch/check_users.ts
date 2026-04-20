
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          masterOrders: true, // Orders where user is buyer
          subOrders: true,    // Orders where user is seller
          books: true,        // Books listed by user
        }
      }
    }
  });

  console.log('User status:');
  users.forEach(u => {
    console.log(`- ${u.name} (${u.email}) [Role: ${u.role}]:`);
    console.log(`  * Bought: ${u._count.masterOrders} orders`);
    console.log(`  * Sold: ${u._count.subOrders} sub-orders`);
    console.log(`  * Listed: ${u._count.books} books`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
