import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Tìm các order đang hoạt động của bàn này
    const orders = await prisma.order.findMany({
      where: {
        tableId: id,
        status: { in: ["PENDING", "CONFIRMED", "PREPARING", "SERVED"] }
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (orders.length === 0) {
      return NextResponse.json({ items: [], total: 0 });
    }

    // Gộp tất cả các item từ nhiều order (vì logic gộp đã có ở POST, thường sẽ chỉ có 1 order, nhưng để chắc chắn ta cứ gộp)
    const allItems = orders.flatMap(o => o.items.map(item => ({
      id: item.id,
      name: item.menuItem.name,
      price: Number(item.menuItem.price),
      quantity: item.quantity,
      total: Number(item.menuItem.price) * item.quantity,
      createdAt: item.createdAt,
      orderStatus: o.status
    })));

    const grandTotal = allItems.reduce((sum, item) => sum + item.total, 0);

    return NextResponse.json({
      items: allItems,
      total: grandTotal,
      tableId: id,
    });
  } catch (error) {
    console.error("Fetch bill error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
