import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkBalances() {
  const wallets = await prisma.wallet.findMany({
    include: {
      user: true,
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 20
      }
    }
  });

  for (const w of wallets) {
    console.log(`User: ${w.user.name} (${w.user.email})`);
    console.log(`Available: ${w.availableBalance}`);
    console.log(`Escrow: ${w.escrowBalance}`);
    console.log("Recent Transactions:");
    w.transactions.forEach(t => {
      console.log(`- [${t.type}] ${t.amount} : ${t.description}`);
    });
    console.log("-------------------");
  }
}

checkBalances().finally(() => prisma.$disconnect());
