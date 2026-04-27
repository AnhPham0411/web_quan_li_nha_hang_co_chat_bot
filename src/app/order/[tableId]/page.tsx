import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import OrderClient from "./OrderClient";

export default async function OrderPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = await params;

  const table = await prisma.table.findUnique({
    where: { id: tableId },
  });

  if (!table) {
    return notFound();
  }

  // Lấy các món ăn đang có sẵn
  const menuItems = await prisma.menuItem.findMany({
    where: { isAvailable: true },
    orderBy: { category: "asc" },
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <OrderClient table={table} menuItems={JSON.parse(JSON.stringify(menuItems))} />
    </div>
  );
}
