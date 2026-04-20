import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/tables — lấy danh sách bàn (Admin + Chatbot)
export async function GET() {
  const tables = await prisma.table.findMany({
    orderBy: { tableNumber: "asc" },
    include: {
      reservations: {
        where: { status: { in: ["PENDING", "CONFIRMED"] } },
        select: { guestName: true, partySize: true, reservedAt: true, status: true },
        take: 1,
        orderBy: { reservedAt: "asc" },
      },
    },
  });
  return NextResponse.json({ tables });
}

// POST /api/tables — Admin: thêm bàn
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { tableNumber, capacity, notes } = body;

  if (!tableNumber || !capacity) {
    return NextResponse.json({ error: "Thiếu số bàn hoặc sức chứa" }, { status: 400 });
  }

  const table = await prisma.table.create({
    data: { tableNumber: Number(tableNumber), capacity: Number(capacity), notes },
  });

  return NextResponse.json({ table }, { status: 201 });
}
