import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const pending = await prisma.subOrder.findFirst({
    where: { status: "PENDING" }
  });

  if (!pending) {
    console.log("No pending orders found.");
    return;
  }

  console.log(`Found pending order: ${pending.id}`);
  
  try {
    const updated = await prisma.subOrder.update({
      where: { id: pending.id },
      data: { status: "CONFIRMED" }
    });
    console.log(`Successfully updated to CONFIRMED: ${updated.status}`);
  } catch (e: any) {
    console.error("FAILED TO UPDATE:");
    console.error(e.message);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
