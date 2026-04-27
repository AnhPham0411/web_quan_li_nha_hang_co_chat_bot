import { prisma } from "@/lib/prisma";
import { TableProperties, UtensilsCrossed, CalendarCheck, Users, Calendar, Banknote, BarChart3 } from "lucide-react";
import Link from "next/link";
import { AdminDashboard as DashboardCharts } from "@/components/admin/AdminDashboard";

export default async function AdminDashboard() {
  const [tableCounts, menuCount, reservationCounts, recentReservations, paidOrders] = await Promise.all([
    prisma.table.groupBy({ by: ["status"], _count: true }),
    prisma.menuItem.count({ where: { isAvailable: true } }),
    prisma.reservation.groupBy({ by: ["status"], _count: true }),
    prisma.reservation.findMany({
      where: {
        status: "CONFIRMED",
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true },
    }),
    prisma.order.findMany({
      where: {
        status: "PAID",
        updatedAt: { gte: new Date(new Date().setDate(1)) }, // Lấy từ đầu tháng
      },
      include: {
        items: {
          include: {
            menuItem: { select: { price: true } }
          }
        }
      }
    })
  ]);

  const tableStatusMap = Object.fromEntries(tableCounts.map((t) => [t.status, t._count]));
  const reservationStatusMap = Object.fromEntries(reservationCounts.map((r) => [r.status, r._count]));

  // Tính toán doanh thu
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  let todayRevenue = 0;
  let monthRevenue = 0;
  const dailyRevenueMap: Record<string, number> = {};

  paidOrders.forEach(order => {
    const orderTotal = order.items.reduce((sum, item) => {
      return sum + (Number(item.menuItem.price) * item.quantity);
    }, 0);

    const orderDate = order.updatedAt;
    
    // Doanh thu tháng
    monthRevenue += orderTotal;

    // Doanh thu hôm nay
    if (orderDate >= startOfToday) {
      todayRevenue += orderTotal;
    }

    // Doanh thu 7 ngày qua
    const dateKey = orderDate.toDateString();
    dailyRevenueMap[dateKey] = (dailyRevenueMap[dateKey] || 0) + orderTotal;
  });

  // Chuẩn bị dữ liệu cho biểu đồ 7 ngày
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("vi-VN", { weekday: "short" });
    const resCount = recentReservations.filter((r) => r.createdAt.toDateString() === d.toDateString()).length;
    const revAmount = dailyRevenueMap[d.toDateString()] ?? 0;
    
    return { 
      date: label, 
      count: resCount,
      revenue: revAmount 
    };
  });

  const tablePieData = [
    { name: "TRỐNG", value: tableStatusMap["EMPTY"] ?? 0, color: "#10b981" },
    { name: "ĐÃ ĐẶT", value: tableStatusMap["BOOKED"] ?? 0, color: "#3b82f6" },
    { name: "ĐANG ĂN", value: tableStatusMap["SERVING"] ?? 0, color: "#ef4444" },

  ];

  const totalTables = tablePieData.reduce((acc, curr) => acc + curr.value, 0);

  const stats = [
    {
      label: "Doanh thu hôm nay",
      value: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(todayRevenue),
      total: null,
      icon: Banknote,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/admin/orders?view=paid&range=today",
    },
    {
      label: "Doanh thu tháng này",
      value: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(monthRevenue),
      total: null,
      icon: BarChart3,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/admin/orders?view=paid&range=month",
    },
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

  const pendingReservations = await prisma.reservation.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { table: { select: { tableNumber: true } } },
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Chào buổi sáng, Admin!</h2>
          <p className="text-zinc-500 font-medium mt-1">Dưới đây là tình hình kinh doanh của quán bạn hôm nay.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString("vi-VN", { dateStyle: "long" })}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 translate-x-8 -translate-y-8 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500 ${stat.color}`} />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              {stat.total !== null && (
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-100">
                  /{stat.total} Bàn
                </span>
              )}
            </div>
            <p className="text-4xl font-black text-zinc-900 tracking-tight">{stat.value}</p>
            <p className="text-xs text-zinc-400 mt-1 font-black uppercase tracking-widest">{stat.label}</p>
          </Link>
        ))}
      </div>

      <DashboardCharts 
        reservationStats={last7Days} 
        tableStats={tablePieData} 
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-[40px] border border-zinc-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-zinc-900 text-xl flex items-center gap-3">
              <CalendarCheck className="w-6 h-6 text-blue-500" />
              Đặt bàn chờ duyệt
            </h3>
            <Link href="/admin/reservations" className="text-xs font-black text-blue-600 hover:underline tracking-widest uppercase bg-blue-50 px-4 py-2 rounded-xl">
              XEM TẤT CẢ
            </Link>
          </div>
          
          {pendingReservations.length === 0 ? (
            <div className="text-center py-12 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-100">
              <p className="text-xl mb-2">✨</p>
              <p className="text-sm font-bold text-zinc-400">Yên bình quá, chưa có đơn mới!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReservations.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between p-5 bg-white border border-zinc-50 rounded-[28px] hover:border-blue-100 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-black text-lg group-hover:bg-blue-600 transition-colors">
                      {res.guestName[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-zinc-900 leading-none mb-1">{res.guestName}</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        {res.partySize} khách • {new Date(res.reservedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • {new Date(res.reservedAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tight ${
                        res.source === "chatbot" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {res.source === "chatbot" ? "🤖 Bot" : "🌐 Web"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick View Stats or Heatmap Placeholder */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] shadow-lg p-10 text-white relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
           <div className="relative z-10">
             <h3 className="text-3xl font-black mb-4 leading-tight">Hướng Dẫn<br />Quản Lý Nhanh</h3>
             <ul className="space-y-3 opacity-90 text-sm font-medium">
               <li className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-white rounded-full" />
                 Bấm "Đặt bàn" để confirm các đơn mới.
               </li>
               <li className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-white rounded-full" />
                 Cập nhật món hết hàng trong "Thực đơn".
               </li>
               <li className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-white rounded-full" />
                 Đổi trạng thái bàn khi khách tới ăn.
               </li>
             </ul>
           </div>
           
           <div className="relative z-10 pt-10">
              <button className="bg-white text-blue-600 font-black px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl">
                 Tải báo cáo tháng này
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
