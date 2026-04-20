import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH /api/reservations/[id] — Admin: đổi trạng thái đặt bàn
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, tableId } = body;

  const data: Record<string, any> = { status };
  if (tableId !== undefined) data.tableId = tableId;
  if (status === "CONFIRMED") {
    data.confirmedAt = new Date();
    // Khi xác nhận -> cập nhật trạng thái bàn sang BOOKED
    if (tableId) {
      await prisma.table.update({
        where: { id: tableId },
        data: { status: "BOOKED", lockedUntil: null },
      });
    }
  }
  if (status === "CANCELLED") {
    // Khi hủy -> nhả bàn nếu đã gán
    const existing = await prisma.reservation.findUnique({ where: { id } });
    if (existing?.tableId) {
      await prisma.table.update({
        where: { id: existing.tableId },
        data: { status: "EMPTY", lockedUntil: null },
      });
    }
  }

  const reservation = await prisma.reservation.update({
    where: { id },
    data,
    include: { table: { select: { tableNumber: true } } },
  });

  return NextResponse.json({ reservation });
}
