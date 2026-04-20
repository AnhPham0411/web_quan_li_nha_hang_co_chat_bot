
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testRegister() {
  try {
    const email = "letuan040702@gmail.com";
    const name = "Lê";
    const passwordHash = "placeholder_hash";

    console.log("Checking if user exists...");
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("User already exists:", existingUser.id);
      return;
    }

    console.log("Attempting to create user...");
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "USER",
        wallets: {
          create: {
            availableBalance: 0,
            escrowBalance: 0,
          },
        },
      },
    });

    console.log("User created successfully:", user.id);
  } catch (error) {
    console.error("Registration failed with error:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testRegister();
