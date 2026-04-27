import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Clock, History, CalendarDays, Phone, Users, CheckCircle2, XCircle } from "lucide-react";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { table: true },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "CANCELLED":
      case "NO_SHOW":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Đang chờ";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "CANCELLED":
        return "Đã huỷ";
      case "NO_SHOW":
        return "Không đến";
      default:
        return status;
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 pt-8 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-blue-500 font-bold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Quay lại Trang chủ
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Lịch sử đặt bàn</h1>
            <p className="text-zinc-500 font-medium">Theo dõi trạng thái các đơn đặt bàn của bạn</p>
          </div>
        </div>

        {reservations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl shadow-zinc-200/50 border border-zinc-100">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="w-10 h-10 text-zinc-400" />
            </div>
            <h2 className="text-xl font-black text-zinc-900 mb-2">Chưa có mã đặt bàn nào</h2>
            <p className="text-zinc-500 mb-8 max-w-sm mx-auto">Bạn chưa đặt bàn lần nào tại Quán Ngon. Hãy đặt bàn để trải nghiệm ẩm thực bạn nhé!</p>
            <Link href="/#reservation" className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-blue-500/30">
              Đặt bàn ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((res) => (
              <div key={res.id} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-100 hover:shadow-xl hover:shadow-zinc-200/50 transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-100">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black border ${getStatusColor(res.status)}`}>
                        {getStatusText(res.status)}
                      </span>
                      <span className="text-zinc-400 text-sm font-medium">
                        Mã: #{res.id.split("-")[0].toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-zinc-900">
                      Thời gian: {res.reservedAt.toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </h3>
                  </div>
                  {res.status === "PENDING" && (
                    <div className="bg-blue-50 rounded-xl p-3 text-blue-800 text-xs font-bold ring-1 ring-blue-200/50">
                      Nhân viên sắp gọi xác nhận 📞
                    </div>
                  )}
                  {res.status === "CONFIRMED" && (
                    <div className="bg-emerald-50 rounded-xl p-3 text-emerald-800 text-xs font-bold ring-1 ring-emerald-200/50 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Đã xác nhận giữ bàn
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Họ tên</p>
                    <p className="font-bold text-zinc-900">{res.guestName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Số điện thoại</p>
                    <div className="flex items-center gap-2 text-zinc-900 font-bold">
                      <Phone className="w-4 h-4 text-zinc-400" />
                      {res.guestPhone}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Số người</p>
                    <div className="flex items-center gap-2 text-zinc-900 font-bold">
                      <Users className="w-4 h-4 text-zinc-400" />
                      {res.partySize} người
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Vị trí bàn</p>
                    <p className="font-bold text-zinc-900">
                      {res.table ? `Bàn số ${res.table.tableNumber}` : "Chưa xếp bàn"}
                    </p>
                  </div>
                </div>

                {res.notes && (
                  <div className="mt-6 pt-6 border-t border-zinc-100">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Ghi chú của bạn</p>
                    <p className="text-sm bg-zinc-50 rounded-xl p-4 text-zinc-700 italic border border-zinc-100">"{res.notes}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
