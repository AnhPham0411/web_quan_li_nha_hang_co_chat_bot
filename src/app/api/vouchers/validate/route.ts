import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code, amount } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Vui lòng nhập mã giảm giá" }, { status: 400 });
    }

    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!voucher || !voucher.isActive) {
      return NextResponse.json({ error: "Mã giảm giá không hợp lệ hoặc đã hết hạn" }, { status: 404 });
    }

    const now = new Date();
    if (voucher.startDate > now || (voucher.endDate && voucher.endDate < now)) {
      return NextResponse.json({ error: "Mã giảm giá đã hết hạn sử dụng" }, { status: 400 });
    }

    if (voucher.minOrderAmount && Number(amount) < Number(voucher.minOrderAmount)) {
      return NextResponse.json({ 
        error: `Mã này chỉ áp dụng cho đơn hàng từ ${Number(voucher.minOrderAmount).toLocaleString("vi-VN")}đ` 
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (voucher.discountType === "PERCENTAGE") {
      discountAmount = (Number(amount) * Number(voucher.value)) / 100;
    } else {
      discountAmount = Number(voucher.value);
    }

    return NextResponse.json({
      voucherId: voucher.id,
      code: voucher.code,
      discountAmount,
      finalPrice: Math.max(0, Number(amount) - discountAmount),
    });
  } catch (error) {
    console.error("Voucher validation error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi kiểm tra mã" }, { status: 500 });
  }
}
