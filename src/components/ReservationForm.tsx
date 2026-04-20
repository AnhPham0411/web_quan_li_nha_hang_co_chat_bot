"use client";

import { useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";

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
        alert("Có lỗi xảy ra, vui lòng thử lại hoặc gọi 0909 123 456.");
      }
    } catch {
      alert("Mất kết nối. Vui lòng gọi trực tiếp 0909 123 456.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-10 text-center">
        <p className="text-5xl mb-4">✅</p>
        <h3 className="text-2xl font-black text-white mb-2">Đã ghi nhận!</h3>
        <p className="text-zinc-300">
          Nhân viên sẽ gọi xác nhận cho bạn trong vài phút. Chú ý nghe máy nhé!
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 px-6 py-2.5 rounded-xl border border-white/20 text-zinc-300 text-sm font-bold hover:bg-white/10 transition-all"
        >
          Đặt thêm
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/5 border border-white/10 rounded-3xl p-8 text-left space-y-4"
    >
      <div>
        <label className="text-xs font-bold text-zinc-400 block mb-1.5">Họ tên</label>
        <input
          name="guestName"
          type="text"
          placeholder="Nguyễn Văn A"
          defaultValue={defaultName}
          required
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-zinc-400 block mb-1.5">Số điện thoại</label>
        <input
          name="guestPhone"
          type="tel"
          placeholder="0909 123 456"
          required
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs font-bold text-zinc-400 block mb-1.5">Số người</label>
          <select
            name="partySize"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            defaultValue="2"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((n) => (
              <option key={n} value={n} className="text-zinc-900 bg-white">
                {n} người
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-zinc-400 block mb-1.5">Chọn bàn (không bắt buộc)</label>
          <select
            name="tableId"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            defaultValue=""
          >
            <option value="" className="text-zinc-900 bg-white">Bất kỳ bàn nào</option>
            {tables?.map((t) => (
              <option key={t.id} value={t.id} className="text-zinc-900 bg-white" disabled={t.status !== "EMPTY"}>
                Bàn {t.tableNumber} - {t.capacity} người {t.status !== "EMPTY" ? "(Không trống)" : "(Trống)"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs font-bold text-zinc-400 block mb-1.5">Ngày</label>
          <input
            name="date"
            type="date"
            required
            min={new Date().toISOString().slice(0, 10)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-zinc-400 block mb-1.5">Giờ</label>
          <select
            name="time"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            defaultValue="18:00"
          >
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t} className="text-zinc-900 bg-white">
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-zinc-400 block mb-1.5">
          Ghi chú (tuỳ chọn)
        </label>
        <textarea
          name="notes"
          rows={2}
          placeholder="VD: 1 ghế ăn dặm cho bé, góc yên tĩnh, dị ứng hải sản..."
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-amber-500 rounded-xl font-black text-white hover:bg-amber-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Gửi yêu cầu đặt bàn
            <ChevronRight className="w-5 h-5" />
          </>
        )}
      </button>
      <p className="text-xs text-zinc-500 text-center">
        * Nhân viên sẽ gọi xác nhận trong vài phút. Chỗ chưa được giữ cho đến khi xác nhận.
      </p>
    </form>
  );
}
