import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

// GET /api/reservations — Admin: lấy danh sách đặt bàn | Customer: lấy lịch sử của chính mình
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  // Nếu là khách hàng, chỉ lấy reservation của chính họ
  const filter: any = {};
  if (status) filter.status = status;
  if (role === "CUSTOMER") {
    filter.userId = userId;
  }

  const reservations = await prisma.reservation.findMany({
    where: filter,
    include: { table: { select: { tableNumber: true, capacity: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ reservations });
}

// POST /api/reservations — Public (website), tạo đặt bàn mới
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { guestName, guestPhone, partySize, notes, reservedAt, userId, tableId } = body;

  if (!guestName || !guestPhone || !partySize || !reservedAt) {
    return NextResponse.json({ error: "Thiếu thông tin đặt bàn" }, { status: 400 });
  }

  // 🚨 PM FIX: Validate date range (today to 1 year in the future)
  const reservedDate = new Date(reservedAt);
  const now = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(now.getFullYear() + 1);

  if (isNaN(reservedDate.getTime())) {
    return NextResponse.json({ error: "Ngày đặt bàn không hợp lệ" }, { status: 400 });
  }

  if (reservedDate < now && reservedDate.toDateString() !== now.toDateString()) {
    return NextResponse.json({ error: "Ngày đặt bàn không thể ở quá khứ" }, { status: 400 });
  }

  if (reservedDate > oneYearFromNow) {
    return NextResponse.json({ error: "Ngày đặt bàn không thể quá 1 năm từ hiện tại" }, { status: 400 });
  }

  // 🚨 PM FIX: Booking từ website luôn PENDING, không bao giờ auto-confirm
  const reservation = await prisma.reservation.create({
    data: {
      userId: userId || undefined,
      tableId: tableId || undefined,
      guestName,
      guestPhone,
      partySize: Number(partySize),
      notes,
      source: "website",
      status: "PENDING",
      reservedAt: new Date(reservedAt),
    },
  });

  // 🚨 PM FIX: Nếu có chọn bàn cụ thể, cập nhật trạng thái bàn sang BOOKED 
  // để khách hàng thấy hiệu lực ngay lập tức trên sơ đồ gọi món
  if (tableId) {
    await prisma.table.update({
      where: { id: tableId },
      data: { status: "BOOKED" }
    });
  }

  // 🚨 PM FIX: Bắn Pusher để nhân viên thấy đơn mới ngay, không cần F5
  try {
    await pusherServer.trigger("admin-channel", "new-reservation", {
      message: `Đặt bàn mới từ ${guestName} (${partySize} người) lúc ${new Date(reservedAt).toLocaleString("vi-VN")}`,
      reservationId: reservation.id,
      guestName,
      partySize,
      reservedAt,
    });
  } catch (err) {
    console.error("Pusher error:", err);
    // Không fail request nếu Pusher lỗi
  }

  return NextResponse.json({ reservation }, { status: 201 });
}
