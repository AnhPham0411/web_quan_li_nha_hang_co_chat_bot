import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendReservationConfirmation } from "@/lib/email";

// PATCH /api/reservations/[id] — Admin: đổi trạng thái đặt bàn
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session || (role !== "ADMIN" && role !== "STAFF")) {
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

  // Gửi email xác nhận nếu chuyển sang CONFIRMED
  if (status === "CONFIRMED") {
    const user = reservation.userId ? await prisma.user.findUnique({ where: { id: reservation.userId } }) : null;
    const email = user?.email || ""; // Nếu không có user account, có thể lấy từ trường guestEmail (nếu có bổ sung sau)
    
    // Hiện tại giả định email đăng ký là email nhận thông báo
    if (email) {
      await sendReservationConfirmation({
        email,
        guestName: reservation.guestName,
        reservedAt: reservation.reservedAt,
        partySize: reservation.partySize,
        tableNumber: reservation.table?.tableNumber,
      });
    }
  }

  return NextResponse.json({ reservation });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  // Chỉ ADMIN mới được xóa đặt chỗ
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Only Admin can delete reservations" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.reservation.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
