import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.voucher.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi khi xóa voucher" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isActive } = await req.json();
    const voucher = await prisma.voucher.update({
      where: { id },
      data: { isActive },
    });
    return NextResponse.json(voucher);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi khi cập nhật voucher" }, { status: 500 });
  }
}
