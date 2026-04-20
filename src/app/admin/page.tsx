import { prisma } from "@/lib/prisma";
import { TableProperties, UtensilsCrossed, CalendarCheck, Users } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const [tableCounts, menuCount, reservationCounts] = await Promise.all([
    prisma.table.groupBy({ by: ["status"], _count: true }),
    prisma.menuItem.count({ where: { isAvailable: true } }),
    prisma.reservation.groupBy({ by: ["status"], _count: true }),
  ]);

  const tableStatusMap = Object.fromEntries(
    tableCounts.map((t) => [t.status, t._count])
  );
  const reservationStatusMap = Object.fromEntries(
    reservationCounts.map((r) => [r.status, r._count])
  );

  const totalTables =
    (tableStatusMap["EMPTY"] ?? 0) +
    (tableStatusMap["BOOKED"] ?? 0) +
    (tableStatusMap["SERVING"] ?? 0) +
    (tableStatusMap["CLEANING"] ?? 0);

  const stats = [
    {
      label: "Bàn trống",
      value: tableStatusMap["EMPTY"] ?? 0,
      total: totalTables,
      icon: TableProperties,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      href: "/admin/tables",
    },
    {
      label: "Đang phục vụ",
      value: tableStatusMap["SERVING"] ?? 0,
      total: totalTables,
      icon: Users,
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
      href: "/admin/tables",
    },
    {
      label: "Món ăn có sẵn",
      value: menuCount,
      total: null,
      icon: UtensilsCrossed,
      color: "bg-amber-500",
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
      href: "/admin/menu",
    },
    {
      label: "Đặt bàn chờ duyệt",
      value: reservationStatusMap["PENDING"] ?? 0,
      total: null,
      icon: CalendarCheck,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/admin/reservations",
    },
  ];

  // Lấy 5 đặt bàn mới nhất PENDING
  const pendingReservations = await prisma.reservation.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { table: { select: { tableNumber: true } } },
  });

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-zinc-900">Tổng quan hôm nay</h2>
        <p className="text-zinc-500 text-sm mt-1">Cập nhật theo thời gian thực</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              {stat.total !== null && (
                <span className="text-xs font-bold text-zinc-400">/ {stat.total} bàn</span>
              )}
            </div>
            <p className="text-3xl font-black text-zinc-900">{stat.value}</p>
            <p className="text-sm text-zinc-500 mt-1 font-medium">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Table Status Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
          <h3 className="font-black text-zinc-900 mb-4 flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-amber-500" />
            Trạng thái bàn ăn
          </h3>
          <div className="space-y-3">
            {[
              { status: "EMPTY", label: "Trống", color: "bg-emerald-500", count: tableStatusMap["EMPTY"] ?? 0 },
              { status: "BOOKED", label: "Đã đặt", color: "bg-blue-500", count: tableStatusMap["BOOKED"] ?? 0 },
              { status: "SERVING", label: "Đang phục vụ", color: "bg-red-500", count: tableStatusMap["SERVING"] ?? 0 },
              { status: "CLEANING", label: "Đang dọn", color: "bg-zinc-400", count: tableStatusMap["CLEANING"] ?? 0 },
            ].map((item) => (
              <div key={item.status} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm text-zinc-600 flex-1">{item.label}</span>
                <span className="font-black text-zinc-900">{item.count}</span>
              </div>
            ))}
          </div>
          <Link
            href="/admin/tables"
            className="mt-4 block text-center text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors"
          >
            Xem sơ đồ bàn →
          </Link>
        </div>

        {/* Pending Reservations */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
          <h3 className="font-black text-zinc-900 mb-4 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-500" />
            Đặt bàn chờ xác nhận
          </h3>
          {pendingReservations.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-6">Không có đơn nào đang chờ ✅</p>
          ) : (
            <div className="space-y-3">
              {pendingReservations.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-xl"
                >
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{res.guestName}</p>
                    <p className="text-xs text-zinc-500">
                      {res.partySize} người •{" "}
                      {new Date(res.reservedAt).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      res.source === "chatbot"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {res.source === "chatbot" ? "🤖 Bot" : "🌐 Web"}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/admin/reservations"
            className="mt-4 block text-center text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Xem tất cả đặt bàn →
          </Link>
        </div>
      </div>
    </div>
  );
}
