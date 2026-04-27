
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const reservation = await prisma.reservation.create({
      data: {
        guestName: "Test",
        guestPhone: "0123456789",
        partySize: 2,
        reservedAt: new Date("32026-02-04T19:30:00"),
        status: "PENDING",
      }
    });
    console.log("Success:", reservation);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
