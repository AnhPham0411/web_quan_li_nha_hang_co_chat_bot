import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cron/release-tables
// Vercel Cron gọi API này mỗi 2 phút để tự động nhả bàn bị soft-lock quá hạn.
// Bảo vệ bằng CRON_SECRET header — chỉ Vercel được gọi.
// Config trong vercel.json: schedule "every 2 minutes"
export async function GET(req: NextRequest) {
  // Bảo vệ endpoint — chỉ Vercel Cron mới được gọi
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 1. Nhả lock bàn đã hết hạn
  const releasedTables = await prisma.table.updateMany({
    where: {
      AND: [
        { lockedUntil: { lt: now } },
        { lockedUntil: { not: null } },
      ],
    },
    data: { lockedUntil: null },
  });

  // 2. Hủy reservation PENDING có lockedUntil quá hạn mà chưa confirm
  // Chỉ hủy auto reservation từ chatbot, không hủy từ website
  const expiredReservations = await prisma.reservation.updateMany({
    where: {
      status: "PENDING",
      source: "chatbot",
      AND: [
        { lockedUntil: { lt: now } },
        { lockedUntil: { not: null } },
      ],
    },
    data: { status: "CANCELLED" },
  });

  console.log(
    `[Cron] Released ${releasedTables.count} table locks, ` +
    `expired ${expiredReservations.count} chatbot reservations`
  );

  return NextResponse.json({
    success: true,
    releasedTableLocks: releasedTables.count,
    expiredReservations: expiredReservations.count,
    timestamp: now.toISOString(),
  });
}
