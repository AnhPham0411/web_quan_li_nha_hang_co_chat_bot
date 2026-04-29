import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { tableId, items, notes, voucherId, discountAmount, totalPrice } = await req.json();

    if (!tableId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    // 🚨 PM FIX: Kiểm tra trạng thái bàn trước khi order
    const table = await prisma.table.findUnique({
        where: { id: tableId }
    });
    
    if (!table) {
        return NextResponse.json({ error: "Bàn không tồn tại" }, { status: 404 });
    }

    if (table.status !== "SERVING") {
        return NextResponse.json({ 
          error: "Bàn chưa được kích hoạt để gọi món. Vui lòng xác nhận vào bàn trước." 
        }, { status: 403 });
    }

    // Tạo hoặc Cập nhật Order trong Database
    const order = await prisma.$transaction(async (tx) => {
      // 1. Tìm order đang hoạt động (chưa hoàn thành/hủy) của bàn này
      const existingOrder = await tx.order.findFirst({
        where: {
          tableId,
          status: { in: ["PENDING", "CONFIRMED", "PREPARING"] }
        },
        include: { items: true }
      });

      let currentOrder;

      if (existingOrder) {
        // Cập nhật order cũ: thêm items mới
        currentOrder = await tx.order.update({
          where: { id: existingOrder.id },
          data: {
            userId: userId || existingOrder.userId, // Giữ userId cũ hoặc cập nhật nếu mới log in
            items: {
              create: items.map((item: any) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                notes: item.notes,
              })),
            },
            // Update pricing if provided
            voucherId: voucherId || undefined,
            discountAmount: discountAmount || undefined,
            totalPrice: totalPrice || undefined,
          },
          include: {
            items: { include: { menuItem: true } },
            table: true,
          },
        });
      } else {
        // Tạo order mới hoàn toàn
        currentOrder = await tx.order.create({
          data: {
            tableId,
            userId,
            status: "PENDING",
            notes,
            voucherId,
            discountAmount,
            totalPrice,
            items: {
              create: items.map((item: any) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                notes: item.notes,
              })),
            },
          },
          include: {
            items: { include: { menuItem: true } },
            table: true,
          },
        });
      }

      // 2. Cập nhật trạng thái bàn sang SERVING nếu đang EMPTY hoặc BOOKED
      if (table.status !== "SERVING") {
          await tx.table.update({
              where: { id: tableId },
              data: { status: "SERVING" }
          });
      }

      // 3. Giảm tồn kho (stockQuantity)
      for (const item of items) {
          await tx.menuItem.update({
              where: { id: item.menuItemId },
              data: {
                  stockQuantity: {
                      decrement: item.quantity
                  }
              }
          });
      }

      return currentOrder;
    });

    // 3. Bắn Pusher thông báo cho bếp/admin
    try {
      await pusherServer.trigger("admin-channel", "new-order", {
        message: `🔔 Bàn ${order.table.tableNumber} vừa gọi món mới!`,
        orderId: order.id,
        tableId: tableId,
        tableNumber: order.table.tableNumber,
        items: order.items.map(i => ({
            name: i.menuItem.name,
            quantity: i.quantity,
            price: Number(i.menuItem.price)
        }))
      });
    } catch (pusherErr) {
      console.error("Pusher trigger failed:", pusherErr);
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        const { searchParams } = new URL(req.url);
        const filterUserId = searchParams.get("userId");
        
        // Logic lọc: nếu là Customer thì chỉ lấy của họ, nếu là Admin thì lấy hết (hoặc theo filter)
        const where: any = {};
        if (session?.user && (session.user as any).role === "CUSTOMER") {
            where.userId = session.user.id;
        } else if (filterUserId) {
            where.userId = filterUserId;
        }

        const orders = await prisma.order.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                table: true,
                items: {
                    include: {
                        menuItem: true
                    }
                },
                review: true
            }
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
