import { prisma } from "@/lib/prisma";
import { TablesClient } from "./TablesClient";

export const dynamic = "force-dynamic";

export default async function TablesPage() {
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

  // Serialize dates to strings for client component
  const serialized = tables.map((t) => ({
    ...t,
    lockedUntil: t.lockedUntil?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    reservations: t.reservations.map((r) => ({
      ...r,
      reservedAt: r.reservedAt.toISOString(),
    })),
  }));

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-zinc-900">Sơ đồ bàn ăn</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Click vào bàn để đổi trạng thái. Biểu tượng 🕐 = đang giữ chỗ tạm thời.
        </p>
      </div>
      <TablesClient initialTables={serialized as any} />
    </div>
  );
}
