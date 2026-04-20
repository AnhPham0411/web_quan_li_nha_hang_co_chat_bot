import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/menu — public, lấy tất cả món ăn
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const items = await prisma.menuItem.findMany({
    where: category ? { category, isAvailable: true } : { isAvailable: true },
    orderBy: [{ isFeatured: "desc" }, { category: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ items });
}

// POST /api/menu — Admin only, thêm món
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, price, imageUrl, category, stockQuantity, isAvailable, isFeatured } = body;

  if (!name || !price) {
    return NextResponse.json({ error: "Thiếu tên hoặc giá" }, { status: 400 });
  }

  const item = await prisma.menuItem.create({
    data: {
      name,
      description,
      price,
      imageUrl,
      category: category || "Món chính",
      stockQuantity: stockQuantity ?? 10,
      isAvailable: isAvailable ?? true,
      isFeatured: isFeatured ?? false,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
