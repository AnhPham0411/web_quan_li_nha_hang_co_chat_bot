import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReservationHistoryClient } from "@/components/ReservationHistoryClient";
import { Calendar, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReservationHistoryPage() {
  const session = await auth();

  if (!session) {
    redirect("/login?callbackUrl=/reservation/history");
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary font-bold mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại Trang chủ
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Cá nhân</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">Lịch sử đặt bàn</h1>
                <p className="text-zinc-500 font-medium mt-2">Xem lại các yêu cầu đặt chỗ và trạng thái phục vụ của bạn.</p>
            </div>
        </div>

        <ReservationHistoryClient />
      </div>
    </div>
  );
}
