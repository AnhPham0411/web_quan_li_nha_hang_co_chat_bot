
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkRoles() {
  try {
    console.log("Checking roles in database...");
    const result = await prisma.$queryRaw`SELECT DISTINCT role FROM user`;
    console.log("Distinct roles found:", result);
  } catch (error) {
    console.error("Failed to query roles:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRoles();
