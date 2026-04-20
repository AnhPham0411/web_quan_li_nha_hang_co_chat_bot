const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { wallets: true }
  });
  console.log('--- Users & Wallets ---');
  users.forEach(u => {
    console.log(`User: ${u.name} (${u.role}), ID: ${u.id}`);
    console.log(`Wallet: ID: ${u.wallets?.id}, Available: ${u.wallets?.availableBalance}, Escrow: ${u.wallets?.escrowBalance}`);
  });

  const transactions = await prisma.walletTransaction.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: { wallet: { include: { user: true } } }
  });

  console.log('\n--- Recent Transactions ---');
  transactions.forEach(t => {
    console.log(`Type: ${t.type}, Amount: ${t.amount}, User: ${t.wallet.user.name}, Description: ${t.description}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
