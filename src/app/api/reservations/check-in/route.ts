import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { reservationId, tableId, guestPhone } = await req.json();

    if (!tableId) {
      return NextResponse.json({ error: "Thiếu thông tin bàn" }, { status: 400 });
    }

    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      return NextResponse.json({ error: "Bàn không tồn tại" }, { status: 404 });
    }

    // Nếu không phải Admin check-in (không truyền reservationId)
    // thì bắt buộc phải có guestPhone để đối chiếu
    let finalReservationId = reservationId;

    if (!finalReservationId && guestPhone && table.status === "BOOKED") {
      const reservation = await prisma.reservation.findFirst({
        where: {
          tableId,
          guestPhone,
          status: { in: ["PENDING", "CONFIRMED"] }
        },
        orderBy: { reservedAt: "asc" }
      });

      if (!reservation) {
        return NextResponse.json({ 
          error: "Không tìm thấy thông tin đặt bàn khớp với số điện thoại này tại bàn này." 
        }, { status: 404 });
      }
      finalReservationId = reservation.id;
    }

    await prisma.$transaction(async (tx) => {
      // 1. Cập nhật trạng thái bàn sang SERVING
      await tx.table.update({
        where: { id: tableId },
        data: { status: "SERVING" },
      });

      // 2. Cập nhật trạng thái reservation (nếu có)
      if (finalReservationId) {
        await tx.reservation.update({
          where: { id: finalReservationId },
          data: { status: "CONFIRMED" }, // Đánh dấu là đã đến và xác nhận
        });
      }
    });

    return NextResponse.json({ message: "Xác nhận vào bàn thành công" });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
