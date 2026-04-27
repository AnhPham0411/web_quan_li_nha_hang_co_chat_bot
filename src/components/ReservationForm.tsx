"use client";
/**
 * FORCE REBUILD - 2026-04-21 17:53
 * Fixed syntax errors and removed framer-motion dependencies.
 */

import { useState } from "react";
import { ChevronRight, Loader2, Calendar as CalendarIcon, Users, MessageSquare, Table as TableIcon, CheckCircle2, Clock, Home } from "lucide-react";

const TIME_SLOTS = [
  "11:00", "11:30", "12:00", "12:30", "13:00",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
];

export function ReservationForm({ userId, defaultName, tables }: { userId?: string, defaultName?: string, tables?: { id: string, tableNumber: number, capacity: number, status: string }[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          tableId: (data.tableId as string) || undefined,
          guestName: data.guestName,
          guestPhone: data.guestPhone,
          partySize: Number(data.partySize),
          notes: data.notes || null,
          reservedAt: `${data.date}T${data.time}:00`,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        form.reset();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Có lỗi xảy ra, vui lòng thử lại hoặc gọi 0909 123 456.");
      }
    } catch {
      alert("Mất kết nối. Vui lòng gọi trực tiếp 0909 123 456.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div 
        className="bg-white border-2 border-primary/20 rounded-[48px] p-12 text-center shadow-2xl shadow-orange-500/10 animate-fade-in font-sans"
      >
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-orange-500/20">
            <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-3xl font-black text-zinc-900 mb-4 tracking-tight">Tuyệt vời!</h3>
        <p className="text-zinc-500 text-lg font-medium leading-relaxed mb-10">
          Yêu cầu đặt bàn đã được gửi đi. Nhân viên sẽ gọi xác nhận cho bạn trong 5-10 phút tới.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setSubmitted(false)}
            className="flex-1 w-full sm:w-auto px-6 py-4 rounded-2xl bg-zinc-900 text-white text-sm font-black hover:bg-zinc-800 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            ĐẶT THÊM BÀN
          </button>
          <a
            href="/reservation/history"
            className="flex-1 w-full sm:w-auto px-6 py-4 rounded-2xl bg-primary text-white text-sm font-black hover:bg-orange-700 transition-all active:scale-95 shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
          >
            XEM LỊCH SỬ
          </a>
          <a
            href="/"
            className="flex-1 w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-100 text-zinc-900 text-sm font-black hover:bg-slate-200 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            TRANG CHỦ
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-100 rounded-[48px] p-10 text-left space-y-8 shadow-2xl shadow-stone-900/5 relative overflow-hidden font-sans"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[80px] -mr-16 -mt-16" />
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Họ và tên</label>
                <div className="relative group">
                    <input
                        name="guestName"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        defaultValue={defaultName}
                        required
                        className="w-full pl-5 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all group-hover:bg-slate-100"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Điện thoại</label>
                <div className="relative group">
                    <input
                        name="guestPhone"
                        type="tel"
                        placeholder="09xx xxx xxx"
                        required
                        className="w-full pl-5 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all group-hover:bg-slate-100"
                    />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Users className="w-3 h-3" /> Số lượng khách
                </label>
                <select
                    name="partySize"
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                    defaultValue="2"
                >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 15, 20].map((n) => (
                    <option key={n} value={n} className="bg-white text-zinc-900">
                        {n} người
                    </option>
                    ))}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <TableIcon className="w-3 h-3" /> Chọn bàn cụ thể
                </label>
                <select
                    name="tableId"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                    defaultValue=""
                >
                    <option value="" className="bg-white text-zinc-900">Ưu tiên bàn trống bất kỳ</option>
                    {tables?.map((t) => (
                    <option key={t.id} value={t.id} className="bg-white text-zinc-900" disabled={t.status !== "EMPTY"}>
                        Bàn {t.tableNumber} ({t.capacity} chỗ) {t.status !== "EMPTY" ? "— Đang bận" : ""}
                    </option>
                    ))}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <CalendarIcon className="w-3 h-3" /> Ngày đến
                </label>
                <input
                    name="date"
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Giờ đến
                </label>
                <select
                    name="time"
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                    defaultValue="18:00"
                >
                    {TIME_SLOTS.map((t) => (
                    <option key={t} value={t} className="bg-white text-zinc-900">
                        {t}
                    </option>
                    ))}
                </select>
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3" /> Yêu cầu đặc biệt
            </label>
            <textarea
                name="notes"
                rows={3}
                placeholder="Ghi chú về dị ứng, trang trí tiệc sinh nhật, v.v..."
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all hover:bg-slate-100"
            />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full group py-5 bg-primary text-white rounded-2xl font-black text-lg hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-orange-600/20 disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <>
            HOÀN TẤT ĐẶT BÀN
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      <div className="pt-4 text-center">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] leading-relaxed">
             * Chỗ sẽ được giữ tạm thời trong 15 phút sau giờ đặt.<br/>Vui lòng đến đúng giờ để có trải nghiệm tốt nhất.
          </p>
      </div>
    </form>
  );
}
