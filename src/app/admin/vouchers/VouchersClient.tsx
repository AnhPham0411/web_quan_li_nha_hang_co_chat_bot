"use client";

import { useState, useEffect } from "react";
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Power, 
  Clock, 
  Tag, 
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar
} from "lucide-react";

interface Voucher {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderAmount: number | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function VouchersClient({ initialVouchers }: { initialVouchers: Voucher[] }) {
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [newVoucher, setNewVoucher] = useState({
    code: "",
    discountType: "PERCENTAGE" as const,
    value: "",
    minOrderAmount: "",
    endDate: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVoucher),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi khi tạo voucher");

      setVouchers([data, ...vouchers]);
      setIsAdding(false);
      setNewVoucher({
        code: "",
        discountType: "PERCENTAGE",
        value: "",
        minOrderAmount: "",
        endDate: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/vouchers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setVouchers(vouchers.map(v => v.id === id ? { ...v, isActive: !currentStatus } : v));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa mã giảm giá này?")) return;
    try {
      const res = await fetch(`/api/vouchers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setVouchers(vouchers.filter(v => v.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredVouchers = vouchers.filter(v => 
    v.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-amber-50 flex items-center justify-center">
            <Ticket className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Mã giảm giá</h2>
            <p className="text-zinc-500 font-medium">Tạo và quản lý các chương trình khuyến mãi của quán.</p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-zinc-900 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-amber-600 transition-all active:scale-95 shadow-xl shadow-zinc-900/10"
        >
          {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          {isAdding ? "ĐANG TẠO..." : "TẠO MÃ MỚI"}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-[40px] p-10 border-2 border-amber-100 shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 opacity-50" />
          <h3 className="text-xl font-black text-zinc-900 mb-8 flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-500" />
            Thiết lập Voucher mới
          </h3>

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Mã Voucher (VD: GIAMGIA10)</label>
              <input
                required
                type="text"
                value={newVoucher.code}
                onChange={e => setNewVoucher({...newVoucher, code: e.target.value})}
                className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="GIAMGIA10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Loại giảm giá</label>
              <select
                value={newVoucher.discountType}
                onChange={e => setNewVoucher({...newVoucher, discountType: e.target.value as any})}
                className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none appearance-none"
              >
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED_AMOUNT">Số tiền cố định (đ)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Giá trị giảm</label>
              <input
                required
                type="number"
                min="0"
                value={newVoucher.value}
                onChange={e => setNewVoucher({...newVoucher, value: e.target.value})}
                className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder={newVoucher.discountType === "PERCENTAGE" ? "Ví dụ: 10" : "Ví dụ: 50000"}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Đơn tối thiểu (Không bắt buộc)</label>
              <input
                type="number"
                min="0"
                value={newVoucher.minOrderAmount}
                onChange={e => setNewVoucher({...newVoucher, minOrderAmount: e.target.value})}
                className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="Ví dụ: 200000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Ngày hết hạn (Không bắt buộc)</label>
              <input
                type="date"
                value={newVoucher.endDate}
                onChange={e => setNewVoucher({...newVoucher, endDate: e.target.value})}
                className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="flex items-end gap-3 lg:col-span-1">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-amber-500 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-zinc-900 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
              >
                XÁC NHẬN TẠO MÃ
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="w-14 h-14 bg-zinc-100 text-zinc-400 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold animate-shake">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* Search & List */}
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-zinc-100 rounded-3xl py-5 pl-16 pr-6 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVouchers.map((v) => (
            <div 
              key={v.id} 
              className={`bg-white rounded-[32px] border-2 transition-all p-6 group ${
                v.isActive ? "border-zinc-50 shadow-sm" : "border-red-50 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                    v.isActive ? "bg-amber-500" : "bg-zinc-400"
                  }`}>
                    <Tag className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-zinc-900 tracking-tight">{v.code}</p>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      {v.discountType === "PERCENTAGE" ? "Giảm %" : "Giảm tiền mặt"}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  v.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {v.isActive ? "Đang chạy" : "Tạm ngắt"}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Giá trị</span>
                  <span className="text-xl font-black text-zinc-900">
                    {v.discountType === "PERCENTAGE" ? `${v.value}%` : `${Number(v.value).toLocaleString("vi-VN")}đ`}
                  </span>
                </div>
                
                {v.minOrderAmount && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Đơn tối thiểu</span>
                    <span className="text-xs font-bold text-zinc-600">{Number(v.minOrderAmount).toLocaleString("vi-VN")}đ</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Hết hạn</span>
                  <span className="text-xs font-bold text-zinc-600 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {v.endDate ? new Date(v.endDate).toLocaleDateString("vi-VN") : "Không giới hạn"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-6 border-t border-zinc-50">
                <button
                  onClick={() => toggleStatus(v.id, v.isActive)}
                  className={`flex-1 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    v.isActive 
                      ? "bg-zinc-100 text-zinc-500 hover:bg-zinc-900 hover:text-white" 
                      : "bg-green-500 text-white"
                  }`}
                >
                  <Power className="w-3 h-3" />
                  {v.isActive ? "TẠM NGẮT" : "KÍCH HOẠT"}
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="w-14 h-14 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl flex items-center justify-center transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredVouchers.length === 0 && (
          <div className="py-20 text-center bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-100">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Ticket className="w-10 h-10 text-zinc-200" />
            </div>
            <p className="text-zinc-400 font-bold">Chưa có mã giảm giá nào được tạo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
