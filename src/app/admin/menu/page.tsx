import { prisma } from "@/lib/prisma";
import { MenuClient } from "./MenuClient";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const rawItems = await prisma.menuItem.findMany({
    orderBy: [{ isFeatured: "desc" }, { category: "asc" }, { name: "asc" }],
  });

  const items = rawItems.map((item) => ({
    ...item,
    price: Number(item.price),
  }));

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-zinc-900">Quản lý Thực đơn</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Thêm, sửa, xóa món ăn. Cập nhật số suất còn để Chatbot trả lời chính xác.
        </p>
      </div>
      <MenuClient initialItems={items} />
    </div>
  );
}
