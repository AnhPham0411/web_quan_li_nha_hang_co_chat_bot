
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function countInvalidUsers() {
  try {
    const result: any[] = await prisma.$queryRaw`SELECT role, count(*) as count FROM user GROUP BY role`;
    console.log("User counts by role:", result);
  } catch (error) {
    console.error("Failed to query user counts:", error);
  } finally {
    await prisma.$disconnect();
  }
}

countInvalidUsers();
