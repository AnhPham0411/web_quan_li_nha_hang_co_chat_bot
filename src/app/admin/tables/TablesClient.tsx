"use client";

import { useState, useTransition, useEffect } from "react";
import { Users, Clock, CheckCircle, Loader2, Plus, Trash2, Receipt, ChevronRight, SquareMenu, ExternalLink } from "lucide-react";
import Pusher from "pusher-js";

type TableStatus = "EMPTY" | "BOOKED" | "SERVING";


interface TableData {
  id: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  lockedUntil: string | null;
  currentBill: number;
  reservations: Array<{
    guestName: string;
    partySize: number;
    reservedAt: string;
    status: string;
  }>;
  orders: Array<{
    id: string;
    status: string;
    items: Array<{
      id: string;
      quantity: number;
      menuItem: {
        name: string;
        price: number;
      };
    }>;
  }>;
}

const STATUS_CONFIG: Record<
  TableStatus,
  { label: string; color: string; bg: string; border: string; dot: string; next: TableStatus }
> = {
  EMPTY: {
    label: "Trống",
    color: "text-emerald-700",
    bg: "bg-emerald-50 hover:bg-emerald-100",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    next: "SERVING",
  },
  BOOKED: {
    label: "Đã đặt",
    color: "text-blue-700",
    bg: "bg-blue-50 hover:bg-blue-100",
    border: "border-blue-200",
    dot: "bg-blue-500",
    next: "SERVING",
  },
  SERVING: {
    label: "Đang phục vụ",
    color: "text-red-700",
    bg: "bg-red-50 hover:bg-red-100",
    border: "border-red-200",
    dot: "bg-red-500",
    next: "EMPTY",
  },
};

const ALL_STATUSES: TableStatus[] = ["EMPTY", "BOOKED", "SERVING"];

export function TablesClient({ initialTables }: { initialTables: TableData[] }) {
  const [tables, setTables] = useState<TableData[]>(initialTables);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTable, setNewTable] = useState({ tableNumber: "", capacity: "4" });

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
    const channel = pusher.subscribe("admin-channel");

    channel.bind("table-updated", (data: { tableId: string; status: TableStatus }) => {
      setTables((prev) =>
        prev.map((t) =>
          t.id === data.tableId 
            ? { 
                ...t, 
                status: data.status,
                // Nếu bàn trống thì xóa luôn bill hiện tại để tránh hiển thị sai
                currentBill: data.status === "EMPTY" ? 0 : t.currentBill,
                orders: data.status === "EMPTY" ? [] : t.orders,
                lockedUntil: data.status === "EMPTY" ? null : t.lockedUntil
              } 
            : t
        )
      );
    });

    // 🍕 Listen for new orders to update bill in real-time
    channel.bind("new-order", (data: { 
      tableId: string; 
      orderId: string; 
      items: Array<{ name: string; quantity: number; price: number }> 
    }) => {
      const newItemsTotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      setTables((prev) =>
        prev.map((t) =>
          t.id === data.tableId 
            ? { 
                ...t, 
                status: "SERVING", // Chắc chắn là đang phục vụ
                currentBill: t.currentBill + newItemsTotal,
                orders: [
                  ...t.orders,
                  {
                    id: data.orderId,
                    status: "PENDING",
                    items: data.items.map((item, idx) => ({
                      id: `${data.orderId}-${idx}`,
                      quantity: item.quantity,
                      menuItem: {
                        name: item.name,
                        price: item.price
                      }
                    }))
                  }
                ]
              } 
            : t
        )
      );
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("admin-channel");
      pusher.disconnect();
    };
  }, []);

  const updateStatus = async (table: TableData, newStatus: TableStatus) => {
    // Optimistic update
    setTables((prev) =>
      prev.map((t) => (t.id === table.id ? { ...t, status: newStatus } : t))
    );
    setSelectedTable(null);

    const res = await fetch(`/api/tables/${table.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      // Revert on error
      setTables((prev) =>
        prev.map((t) => (t.id === table.id ? { ...t, status: table.status } : t))
      );
      alert("Cập nhật thất bại, vui lòng thử lại");
    }
  };

  const addTable = async () => {
    if (!newTable.tableNumber) return;
    startTransition(async () => {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: Number(newTable.tableNumber),
          capacity: Number(newTable.capacity),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTables((prev) => [...prev, { ...data.table, reservations: [] }]);
        setNewTable({ tableNumber: "", capacity: "4" });
        setShowAddForm(false);
      }
    });
  };



  const refreshData = async () => {
    try {
      const res = await fetch("/api/tables");
      if (res.ok) {
        const data = await res.json();
        // Cần format lại dữ liệu tương tự như page.tsx nếu API /api/tables chưa format
        // Tuy nhiên thường API này trả về list table thô.
        // Để đơn giản, ta reload trang hoặc fetch lại.
        window.location.reload(); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  const countByStatus = (status: TableStatus) =>
    tables.filter((t) => t.status === status).length;

  return (
    <div>
      {/* Status Legend + Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-3">
          {ALL_STATUSES.map((s) => (
            <div
              key={s}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].border}`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
              <span className={`text-sm font-bold ${STATUS_CONFIG[s].color}`}>
                {STATUS_CONFIG[s].label}
              </span>
              <span className={`text-sm font-black ${STATUS_CONFIG[s].color}`}>
                ({countByStatus(s)})
              </span>
            </div>
          ))}
        </div>
        
        <button 
          onClick={refreshData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all text-sm font-bold shadow-sm"
        >
          <Clock className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 mb-8">
        {tables.map((table) => {
          const cfg = STATUS_CONFIG[table.status];
          const isLocked =
            table.lockedUntil && new Date(table.lockedUntil) > new Date();
          const upcoming = table.reservations[0];

          return (
            <button
              key={table.id}
              onClick={() => setSelectedTable(selectedTable?.id === table.id ? null : table)}
              className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-95 ${cfg.bg} ${cfg.border} ${
                selectedTable?.id === table.id ? "ring-2 ring-offset-2 ring-zinc-900" : ""
              }`}
            >
              {isLocked && (
                <div className="absolute top-2 right-2">
                  <Clock className="w-3 h-3 text-amber-500" />
                </div>
              )}
              <div className={`w-3 h-3 rounded-full ${cfg.dot} mb-2 mx-auto`} />
              <p className="text-xl font-black text-zinc-900 text-center">
                #{table.tableNumber}
              </p>
              <div className={`flex items-center justify-center gap-1 mt-1 ${cfg.color}`}>
                <Users className="w-3 h-3" />
                <span className="text-xs font-bold">{table.capacity}</span>
              </div>
              {table.status === "SERVING" && table.currentBill > 0 && (
                <p className="text-[10px] font-black mt-2 text-red-600 bg-red-100 rounded px-1.5 py-0.5 inline-block">
                  {table.currentBill.toLocaleString("vi-VN")}đ
                </p>
              )}
              <p className={`text-[10px] font-bold mt-1 text-center ${cfg.color}`}>
                {cfg.label}
              </p>
              {upcoming && (
                <p className="text-[9px] text-center text-zinc-500 mt-1 truncate">
                  {upcoming.guestName}
                </p>
              )}
            </button>
          );
        })}

        {/* Add Table Button */}
        <button
          onClick={() => setShowAddForm(true)}
          className="p-4 rounded-2xl border-2 border-dashed border-zinc-300 hover:border-amber-400 hover:bg-amber-50 transition-all flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-amber-600"
        >
          <Plus className="w-6 h-6" />
          <span className="text-xs font-bold">Thêm bàn</span>
        </button>
      </div>

      {/* Popup: Đổi trạng thái */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTable(null)}>
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-zinc-900">
                  Bàn #{selectedTable.tableNumber}
                </h3>
                <p className="text-sm text-zinc-500">
                  Sức chứa: {selectedTable.capacity} người
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_CONFIG[selectedTable.status].bg} ${STATUS_CONFIG[selectedTable.status].color}`}
              >
                {STATUS_CONFIG[selectedTable.status].label}
              </span>
            </div>

            <p className="text-sm font-bold text-zinc-600 mb-3">Chuyển sang:</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {ALL_STATUSES.filter((s) => s !== selectedTable.status).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(selectedTable, s)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-bold border-2 transition-all ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].border} ${STATUS_CONFIG[s].color} hover:opacity-80`}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>

            <a
              href={`/order/${selectedTable.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mb-6 py-3 rounded-2xl text-xs font-black bg-zinc-50 text-zinc-500 border border-zinc-200 hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 group"
            >
              <ExternalLink className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
              MỞ TRANG GỌI MÓN (GIAO DIỆN KHÁCH)
            </a>

            {selectedTable.status !== "SERVING" && (
              <button
                onClick={() => updateStatus(selectedTable, "SERVING")}
                className="w-full mb-6 py-4 rounded-2xl text-sm font-black bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 border-b-4 border-amber-700"
              >
                <CheckCircle className="w-5 h-5" />
                NHẬN KHÁCH VÀO BÀN
              </button>
            )}

            {selectedTable.status === "SERVING" && selectedTable.orders.length > 0 && (
              <div className="mb-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 mb-3">
                  <SquareMenu className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-black text-zinc-900 uppercase tracking-tight">Món đã gọi</span>
                </div>
                <div className="bg-zinc-50 rounded-2xl p-4 space-y-3 max-h-48 overflow-y-auto border border-zinc-100">
                  {selectedTable.orders.flatMap(o => o.items).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-zinc-400 w-4">{item.quantity}x</span>
                        <span className="text-sm font-bold text-zinc-700">{item.menuItem.name}</span>
                      </div>
                      <span className="text-xs font-black text-zinc-900">
                        {(item.quantity * item.menuItem.price).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-dashed border-zinc-200 flex justify-between items-center">
                    <span className="text-xs font-black text-zinc-400 uppercase">Tổng cộng</span>
                    <span className="text-sm font-black text-amber-600">
                      {selectedTable.currentBill.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedTable.status === "SERVING" && (
              <button
                onClick={async () => {
                   const total = selectedTable.currentBill;
                   if(confirm(`Xác nhận thanh toán ${total.toLocaleString("vi-VN")}đ và giải phóng bàn ${selectedTable.tableNumber}?`)) {
                      // Sử dụng API checkout nguyên tử
                      const res = await fetch(`/api/tables/${selectedTable.id}/checkout`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                      });

                      if (res.ok) {
                        // Cập nhật local state ngay lập tức
                        setTables(prev => prev.map(t => 
                          t.id === selectedTable.id 
                            ? { ...t, status: "EMPTY", currentBill: 0, orders: [] } 
                            : t
                        ));
                        setSelectedTable(null);
                      } else {
                        alert("Thanh toán thất bại, vui lòng thử lại");
                      }
                   }
                }}
                className="w-full mb-3 py-4 rounded-2xl text-sm font-black bg-zinc-900 text-white hover:bg-amber-500 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                <Receipt className="w-4 h-4" />
                THANH TOÁN & TRẢ BÀN
              </button>
            )}



          </div>
        </div>
      )}

      {/* Modal: Thêm bàn */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddForm(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-black text-zinc-900 mb-4">Thêm bàn mới</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold text-zinc-700 block mb-1">Số bàn</label>
                <input
                  type="number"
                  value={newTable.tableNumber}
                  onChange={(e) => setNewTable((p) => ({ ...p, tableNumber: e.target.value }))}
                  placeholder="VD: 5"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-zinc-700 block mb-1">Sức chứa (người)</label>
                <input
                  type="number"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable((p) => ({ ...p, capacity: e.target.value }))}
                  placeholder="VD: 4"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              >
                Hủy
              </button>
              <button
                onClick={addTable}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Thêm bàn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
