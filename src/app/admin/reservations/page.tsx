import { prisma } from "@/lib/prisma";
import { ReservationsClient } from "./ReservationsClient";

export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      table: { select: { tableNumber: true, capacity: true } },
    },
  });

  const tables = await prisma.table.findMany({
    where: { status: { in: ["EMPTY", "BOOKED"] } },
    orderBy: { tableNumber: "asc" },
    select: { id: true, tableNumber: true, capacity: true, status: true },
  });

  const serialized = reservations.map((r) => ({
    ...r,
    reservedAt: r.reservedAt.toISOString(),
    confirmedAt: r.confirmedAt?.toISOString() ?? null,
    lockedUntil: r.lockedUntil?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-zinc-900">Quản lý Đặt bàn</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Xác nhận, hủy, hoặc gán bàn cho đơn đặt từ Website và Chatbot.
        </p>
      </div>
      <ReservationsClient initialReservations={serialized as any} tables={tables} />
    </div>
  );
}
