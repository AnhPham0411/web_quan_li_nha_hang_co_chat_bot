import { prisma } from "@/lib/prisma";
import OrdersClient from "./OrdersClient";
import { Package } from "lucide-react";
import { Suspense } from "react";
import { serializePrisma } from "@/lib/utils";

export const metadata = {
  title: "Quản lý Đơn gọi món - Quán Ngon",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      table: true,
      items: {
        include: {
          menuItem: true,
        },
      },
    },
    take: 50, // Lấy 50 đơn gần nhất
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      <Suspense fallback={<div className="h-64 flex items-center justify-center font-bold text-zinc-400">Đang tải danh sách...</div>}>
        <OrdersClient initialOrders={serializePrisma(orders)} />
      </Suspense>
    </div>
  );
}
