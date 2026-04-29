import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Clock, History, CalendarDays, Phone, Users, CheckCircle2, XCircle, ShoppingBag, Receipt, Star, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Lấy dữ liệu Đặt bàn
  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { table: true },
  });

  // Lấy dữ liệu Đơn hàng (Gọi món)
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { 
      table: true,
      items: { include: { menuItem: true } },
      review: true
    },
  });

  const getResStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-blue-100 text-blue-700 border-blue-200";
      case "CONFIRMED": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "CANCELLED":
      case "NO_SHOW": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-orange-100 text-orange-700 border-orange-200";
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 pt-8 pb-20">
      <div className="container mx-auto px-6 max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary font-bold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Quay lại Trang chủ
        </Link>

        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-orange-500/20 rotate-3">
            <History className="w-8 h-8 -rotate-3" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Lịch sử & Đánh giá</h1>
            <p className="text-zinc-500 font-medium">Xem lại các yêu cầu đặt chỗ và trải nghiệm ẩm thực của bạn.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* CỘT 1: LỊCH SỬ ĐẶT BÀN */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <CalendarDays className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-black text-zinc-800">Đặt bàn của bạn</h2>
            </div>

            <div className="space-y-4">
              {reservations.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-zinc-100">
                  <p className="text-zinc-400 font-bold text-sm">Chưa có mã đặt bàn nào.</p>
                </div>
              ) : (
                reservations.map((res) => (
                  <div key={res.id} className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getResStatusColor(res.status)}`}>
                         {res.status}
                       </span>
                       <span className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">#{res.id.split("-")[0]}</span>
                    </div>
                    <h3 className="font-black text-zinc-900 mb-1">Ngày {new Date(res.reservedAt).toLocaleDateString("vi-VN")} - lúc {new Date(res.reservedAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</h3>
                    <p className="text-sm text-zinc-500 font-medium flex items-center gap-2">
                       <Users className="w-3 h-3" /> {res.partySize} người {res.table && `| Bàn ${res.table.tableNumber}`}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* CỘT 2: LỊCH SỬ GỌI MÓN & ĐÁNH GIÁ */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-black text-zinc-800">Bữa ăn của bạn</h2>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-zinc-100">
                  <p className="text-zinc-400 font-bold text-sm">Chưa có lịch sử gọi món nào.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between mb-4">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getOrderStatusColor(order.status)}`}>
                         {order.status === "PAID" ? "ĐÃ THANH TOÁN" : order.status}
                       </span>
                       <span className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">#{order.id.split("-")[0]}</span>
                    </div>
                    
                    <div className="mb-4">
                       <h3 className="font-black text-zinc-900 mb-1">Bàn số {order.table.tableNumber}</h3>
                       <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-3">
                         {new Date(order.createdAt).toLocaleString("vi-VN")}
                       </p>
                       <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <span key={idx} className="text-[10px] font-bold bg-zinc-50 px-2 py-1 rounded-lg text-zinc-600 border border-zinc-100">
                              {item.quantity}x {item.menuItem.name}
                            </span>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-[10px] font-bold bg-zinc-50 px-2 py-1 rounded-lg text-zinc-400">
                              +{order.items.length - 2} món khác
                            </span>
                          )}
                       </div>
                    </div>

                    <div className="pt-4 border-t border-dashed border-zinc-100 flex items-center justify-between">
                       <div>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Tổng cộng</p>
                          <p className="font-black text-primary">{Number(order.totalPrice || 0).toLocaleString("vi-VN")}đ</p>
                       </div>
                       
                       {order.review ? (
                         <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100">
                            <Star className="w-3 h-3 fill-emerald-600" />
                            <span className="text-[10px] font-black uppercase">Đã đánh giá</span>
                         </div>
                       ) : (
                         <Link 
                           href={`/review/${order.id}`}
                           className="flex items-center gap-1.5 bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-primary transition-all group-hover:scale-105 shadow-lg shadow-zinc-900/10"
                         >
                            <Star className="w-3 h-3 fill-white" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Viết đánh giá</span>
                         </Link>
                       )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
