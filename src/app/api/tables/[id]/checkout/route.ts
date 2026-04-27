import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

// POST /api/tables/[id]/checkout — Admin: Thanh toán toàn bộ đơn và trả bàn
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (!session || (role !== "ADMIN" && role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Cập nhật tất cả các order đang hoạt động của bàn sang trạng thái PAID
      await tx.order.updateMany({
        where: {
          tableId: id,
          status: { in: ["PENDING", "CONFIRMED", "PREPARING", "SERVED"] },
        },
        data: { status: "PAID" },
      });

      // 2. Cập nhật trạng thái bàn sang EMPTY
      const table = await tx.table.update({
        where: { id },
        data: { 
          status: "EMPTY",
          lockedUntil: null 
        },
      });

      return table;
    });

    // 🔔 Bắn Pusher thông báo cho cả khách và admin
    try {
      // Thông báo cho khách: Xóa session và quay về menu
      await pusherServer.trigger(`table-${id}`, "status-updated", {
        status: "EMPTY",
      });

      // Thông báo cho Admin: Cập nhật sơ đồ bàn
      await pusherServer.trigger("admin-channel", "table-updated", {
        tableId: id,
        status: "EMPTY",
      });
    } catch (pusherErr) {
      console.error("Pusher trigger failed:", pusherErr);
    }

    return NextResponse.json({ success: true, table: result });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
