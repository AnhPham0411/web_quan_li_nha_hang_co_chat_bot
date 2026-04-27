import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

// GET /api/tables/[id] — Public/Guest: Lấy thông tin bàn
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        reservations: {
          where: { status: { in: ["PENDING", "CONFIRMED"] } },
          take: 1,
          orderBy: { reservedAt: "asc" },
        }
      }
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json(table);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/tables/[id] — Admin: đổi trạng thái bàn
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session || (role !== "ADMIN" && role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, notes } = body;

  const table = await prisma.table.update({
    where: { id },
    data: {
      status,
      notes,
      // Khi nhân viên thủ công đổi trạng thái -> nhả lock
      lockedUntil: null,
    },
  });

  // 🔔 Bắn Pusher (Bọc trong try-catch để tránh crash API nếu chưa cấu hình Pusher)
  try {
    // Thông báo cho Menu trên điện thoại khách
    await pusherServer.trigger(`table-${id}`, "status-updated", {
      status: status
    });

    // Thông báo cho Admin để cập nhật Sơ đồ bàn thời gian thực
    await pusherServer.trigger("admin-channel", "table-updated", {
      tableId: id,
      status: status
    });
  } catch (error) {
    console.error("Pusher trigger error:", error);
  }

  return NextResponse.json({ table });
}

// DELETE /api/tables/[id] — Admin: xóa bàn
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.table.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
