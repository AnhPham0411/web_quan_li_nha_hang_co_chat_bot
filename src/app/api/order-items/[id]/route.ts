import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const orderItem = await prisma.orderItem.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!orderItem) {
      return NextResponse.json({ error: "Món ăn không tồn tại" }, { status: 404 });
    }

    // Kiểm tra thời gian: 2 phút = 120000ms
    const now = new Date();
    const created = new Date(orderItem.createdAt);
    const diff = now.getTime() - created.getTime();

    // Check auth
    const session = await auth();
    const role = (session?.user as any)?.role;
    const isAdmin = role === "ADMIN" || role === "STAFF";

    if (!isAdmin && diff > 2 * 60 * 1000) {
      return NextResponse.json(
        { error: "Đã quá 2 phút, không thể tự hủy. Vui lòng liên hệ quản lý." },
        { status: 400 }
      );
    }

    // Nếu ok thì xóa (hoặc cập nhật trạng thái nếu muốn giữ log, nhưng user bảo 'hủy')
    // Để giữ log và khớp số tiền, có lẽ nên xóa item và cập nhật lại stock?
    await prisma.$transaction([
      prisma.orderItem.delete({
        where: { id },
      }),
      // Trả lại tồn kho
      prisma.menuItem.update({
        where: { id: orderItem.menuItemId },
        data: { stockQuantity: { increment: orderItem.quantity } },
      }),
    ]);

    return NextResponse.json({ message: "Hủy món thành công" });
  } catch (error) {
    console.error("Cancel order item error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
