"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Phone, Users, Clock, MapPin } from "lucide-react";

type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "NO_SHOW";

interface Reservation {
  id: string;
  guestName: string;
  guestPhone: string;
  partySize: number;
  notes: string | null;
  source: string;
  status: ReservationStatus;
  reservedAt: string;
  createdAt: string;
  table: { tableNumber: number; capacity: number } | null;
}

interface TableOption {
  id: string;
  tableNumber: number;
  capacity: number;
  status: string;
}

const STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; bg: string; text: string }
> = {
  PENDING: { label: "Chờ xác nhận", bg: "bg-amber-100", text: "text-amber-700" },
  CONFIRMED: { label: "Đã xác nhận", bg: "bg-emerald-100", text: "text-emerald-700" },
  CANCELLED: { label: "Đã hủy", bg: "bg-red-100", text: "text-red-700" },
  NO_SHOW: { label: "Không đến", bg: "bg-zinc-100", text: "text-zinc-600" },
};

const FILTER_TABS: { key: ReservationStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "⏳ Chờ duyệt" },
  { key: "CONFIRMED", label: "✅ Đã xác nhận" },
  { key: "CANCELLED", label: "❌ Đã hủy" },
];

export function ReservationsClient({
  initialReservations,
  tables,
}: {
  initialReservations: Reservation[];
  tables: TableOption[];
}) {
  const [reservations, setReservations] = useState(initialReservations);
  const [filter, setFilter] = useState<ReservationStatus | "ALL">("PENDING");
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string>("");

  const filtered =
    filter === "ALL" ? reservations : reservations.filter((r) => r.status === filter);

  const updateStatus = async (id: string, status: ReservationStatus, tableId?: string) => {
    const res = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, tableId: tableId || undefined }),
    });

    if (res.ok) {
      const { reservation } = await res.json();
      setReservations((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                table: reservation.table
                  ? { tableNumber: reservation.table.tableNumber, capacity: reservation.table.capacity ?? 4 }
                  : r.table,
              }
            : r
        )
      );
      setSelectedRes(null);
    }
  };

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-zinc-200">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all -mb-px ${
              filter === key
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            {label}
            <span className="ml-2 text-xs">
              ({key === "ALL" ? reservations.length : reservations.filter((r) => r.status === key).length})
            </span>
          </button>
        ))}
      </div>

      {/* Reservation List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-zinc-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-bold">Không có đơn nào</p>
          </div>
        )}

        {filtered.map((res) => {
          const cfg = STATUS_CONFIG[res.status];
          const reservedDate = new Date(res.reservedAt);

          return (
            <div
              key={res.id}
              className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all"
            >
              {/* Source badge */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${
                  res.source === "chatbot" ? "bg-purple-50" : "bg-blue-50"
                }`}
              >
                {res.source === "chatbot" ? "🤖" : "🌐"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-zinc-900">{res.guestName}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                    <Phone className="w-3.5 h-3.5" />
                    {res.guestPhone}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                    <Users className="w-3.5 h-3.5" />
                    {res.partySize} người
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    {reservedDate.toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                  {res.table && (
                    <span className="flex items-center gap-1.5 text-sm font-bold text-amber-600">
                      <MapPin className="w-3.5 h-3.5" />
                      Bàn #{res.table.tableNumber}
                    </span>
                  )}
                </div>

                {res.notes && (
                  <p className="text-xs text-zinc-400 mt-1 italic">"{res.notes}"</p>
                )}
              </div>

              {/* Actions — chỉ hiện với PENDING */}
              {res.status === "PENDING" && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setSelectedRes(res); setSelectedTableId(""); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-200 hover:bg-emerald-100 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Xác nhận
                  </button>
                  <button
                    onClick={() => updateStatus(res.id, "CANCELLED")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-200 hover:bg-red-100 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Hủy
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm Modal — chọn bàn khi xác nhận */}
      {selectedRes && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedRes(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-zinc-900 mb-1">Xác nhận đặt bàn</h3>
            <p className="text-sm text-zinc-500 mb-5">
              {selectedRes.guestName} — {selectedRes.partySize} người
            </p>

            <label className="text-sm font-bold text-zinc-700 block mb-2">
              Gán bàn (tuỳ chọn)
            </label>
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 mb-4"
            >
              <option value="">-- Không gán bàn cụ thể --</option>
              {tables
                .filter((t) => t.capacity >= selectedRes.partySize)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    Bàn #{t.tableNumber} ({t.capacity} người) — {t.status === "EMPTY" ? "Trống" : "Đã đặt"}
                  </option>
                ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedRes(null)}
                className="flex-1 py-3 rounded-xl text-sm font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => updateStatus(selectedRes.id, "CONFIRMED", selectedTableId || undefined)}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
