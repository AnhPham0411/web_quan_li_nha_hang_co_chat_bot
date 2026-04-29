import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Clock, History, CalendarDays, Phone, Users, CheckCircle2, XCircle, ShoppingBag, Receipt, Star, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReservationHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/reservation/history");
  }

  const userId = session.user.id;

  // Lấy dữ liệu Đặt bàn
  const reservations = await prisma.reservation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { table: true },
  });

  // Lấy dữ liệu Đơn hàng (Gọi món)
  const orders = await prisma.order.findMany({
    where: { userId },
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
    <main className="min-h-screen bg-slate-50/50 pt-12 pb-24">
      <div className="container mx-auto px-6 max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary font-bold mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại Trang chủ
        </Link>

        <div className="flex items-center gap-5 mb-16">
          <div className="w-16 h-16 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-orange-500/30 rotate-3">
            <History className="w-8 h-8 -rotate-3" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Cá nhân</span>
              <div className="h-px w-8 bg-orange-200" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">Lịch sử & Đánh giá</h1>
            <p className="text-zinc-500 font-medium mt-1">Xem lại các yêu cầu đặt chỗ và trải nghiệm ẩm thực của bạn.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* CỘT 1: LỊCH SỬ ĐẶT BÀN */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-zinc-100">
                  <CalendarDays className="w-5 h-5 text-zinc-400" />
                </div>
                <h2 className="text-xl font-black text-zinc-800 tracking-tight">Đặt bàn của bạn</h2>
              </div>
              <span className="bg-zinc-100 text-zinc-500 text-[10px] font-black px-2 py-1 rounded-lg uppercase">{reservations.length} lượt</span>
            </div>

            <div className="space-y-4">
              {reservations.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-12 text-center border border-zinc-100 border-dashed">
                  <p className="text-zinc-400 font-bold text-sm">Chưa có lịch sử đặt bàn nào.</p>
                </div>
              ) : (
                reservations.map((res) => (
                  <div key={res.id} className="bg-white rounded-[2rem] p-7 shadow-sm border border-zinc-100 hover:shadow-xl hover:border-orange-100 transition-all group">
                    <div className="flex items-center justify-between mb-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${getResStatusColor(res.status)}`}>
                        {res.status === "CONFIRMED" ? "Đã xác nhận" : res.status}
                      </span>
                      <span className="text-[10px] text-zinc-300 font-bold tracking-widest uppercase">#{res.id.split("-")[0]}</span>
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 mb-2">Ngày {new Date(res.reservedAt).toLocaleDateString("vi-VN")}</h3>
                    <div className="flex flex-wrap gap-4 text-sm font-medium text-zinc-500">
                      <p className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-xl">
                        <Clock className="w-4 h-4 text-zinc-400" /> {new Date(res.reservedAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-xl">
                        <Users className="w-4 h-4 text-zinc-400" /> {res.partySize} khách
                      </p>
                      {res.table && (
                        <p className="flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl border border-orange-100">
                          <CheckCircle2 className="w-4 h-4" /> Bàn số {res.table.tableNumber}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CỘT 2: LỊCH SỬ GỌI MÓN & ĐÁNH GIÁ */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-zinc-100">
                  <ShoppingBag className="w-5 h-5 text-zinc-400" />
                </div>
                <h2 className="text-xl font-black text-zinc-800 tracking-tight">Bữa ăn của bạn</h2>
              </div>
              <span className="bg-zinc-100 text-zinc-500 text-[10px] font-black px-2 py-1 rounded-lg uppercase">{orders.length} đơn</span>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-12 text-center border border-zinc-100 border-dashed">
                  <p className="text-zinc-400 font-bold text-sm">Chưa có lịch sử gọi món nào.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-[2rem] p-7 shadow-sm border border-zinc-100 hover:shadow-xl hover:border-orange-100 transition-all group">
                    <div className="flex items-center justify-between mb-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${getOrderStatusColor(order.status)}`}>
                        {order.status === "PAID" ? "Đã thanh toán" : "Đang phục vụ"}
                      </span>
                      <span className="text-[10px] text-zinc-300 font-bold tracking-widest uppercase">#{order.id.split("-")[0]}</span>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-black text-zinc-900">Bàn số {order.table.tableNumber}</h3>
                        <div className="h-4 w-px bg-zinc-200" />
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                          {new Date(order.createdAt).toLocaleString("vi-VN", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="text-[10px] font-bold bg-zinc-50 px-2.5 py-1.5 rounded-xl text-zinc-600 border border-zinc-100">
                            {item.quantity}x {item.menuItem.name}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-[10px] font-bold bg-zinc-50 px-2.5 py-1.5 rounded-xl text-zinc-400">
                            +{order.items.length - 3} món khác
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-5 border-t border-dashed border-zinc-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Tổng bill</p>
                        <p className="text-xl font-black text-primary tracking-tight">{Number(order.totalPrice || 0).toLocaleString("vi-VN")}đ</p>
                      </div>

                      {order.review ? (
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100">
                          <Star className="w-3.5 h-3.5 fill-emerald-600" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Đã đánh giá</span>
                        </div>
                      ) : (
                        <Link
                          href={`/review/${order.id}`}
                          className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-2xl hover:bg-primary transition-all group-hover:scale-105 shadow-xl shadow-zinc-900/10 active:scale-95"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Viết đánh giá</span>
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
