import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH /api/tables/[id] — Admin: đổi trạng thái bàn
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
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

  return NextResponse.json({ table });
}

// DELETE /api/tables/[id] — Admin: xóa bàn
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.table.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
