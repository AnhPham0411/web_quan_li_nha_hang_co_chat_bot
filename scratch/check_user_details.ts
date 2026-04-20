
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUser(email: string) {
  try {
    console.log(`Checking user info for: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallets: true }
    });

    if (user) {
      console.log("User found:");
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Has Wallet: ${!!user.wallets}`);
      if (user.wallets) {
        console.log(`Wallet Balances: ${user.wallets.availableBalance} / ${user.wallets.escrowBalance}`);
      }
    } else {
      console.log("User not found.");
    }
  } catch (error) {
    console.error("Error checking user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser("letuan040702@gmail.com");
