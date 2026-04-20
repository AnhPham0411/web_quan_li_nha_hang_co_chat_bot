import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const subOrders = await prisma.subOrder.findMany({
    select: { id: true, status: true }
  });
  console.log(JSON.stringify(subOrders, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
