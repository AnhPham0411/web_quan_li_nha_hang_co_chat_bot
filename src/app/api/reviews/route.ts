import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { orderId, rating, comment } = await req.json();

    if (!orderId || !rating) {
      return NextResponse.json({ error: "Thiếu thông tin đánh giá" }, { status: 400 });
    }

    // Kiểm tra đơn hàng có tồn tại và đã thanh toán chưa
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    const allowedStatuses = ["SERVED", "PAID"];
    if (!allowedStatuses.includes(order.status)) {
      return NextResponse.json({ error: "Chỉ đơn hàng đã phục vụ hoặc đã thanh toán mới có thể đánh giá" }, { status: 400 });
    }

    // Kiểm tra đã có review chưa (unique constraint sẽ tự check nhưng check trước cho thân thiện)
    const existingReview = await prisma.review.findUnique({
      where: { orderId },
    });

    if (existingReview) {
      return NextResponse.json({ error: "Đơn hàng này đã được đánh giá rồi" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        orderId,
        rating: Number(rating),
        comment,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi lưu đánh giá" }, { status: 500 });
  }
}
