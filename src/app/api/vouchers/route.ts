import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(vouchers);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi khi lấy danh sách voucher" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { code, discountType, value, minOrderAmount, endDate } = await req.json();

    if (!code || !value) {
      return NextResponse.json({ error: "Thiếu thông tin mã hoặc giá trị" }, { status: 400 });
    }

    if (Number(value) < 0) {
      return NextResponse.json({ error: "Giá trị giảm không được âm" }, { status: 400 });
    }

    if (minOrderAmount && Number(minOrderAmount) < 0) {
      return NextResponse.json({ error: "Đơn tối thiểu không được âm" }, { status: 400 });
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        value: Number(value),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: true,
      },
    });

    return NextResponse.json(voucher);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Mã giảm giá này đã tồn tại" }, { status: 400 });
    }
    return NextResponse.json({ error: "Lỗi hệ thống khi tạo voucher" }, { status: 500 });
  }
}
