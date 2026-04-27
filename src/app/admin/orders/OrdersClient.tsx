"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  Check, 
  X, 
  MoreHorizontal,
  ChevronDown,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Order {
  id: string;
  tableId: string;
  status: string;
  notes: string | null;
  createdAt: string;
  table: {
    tableNumber: number;
  };
  items: {
    id: string;
    quantity: number;
    menuItem: {
      name: string;
      price: number;
    };
  }[];
}

export default function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "PAID">(
    searchParams.get("view") === "paid" ? "PAID" : "ACTIVE"
  );
  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    if (searchParams.get("view") === "paid") {
      setActiveTab("PAID");
    } else {
      setActiveTab("ACTIVE");
    }
  }, [searchParams]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cancelItem = async (orderId: string, itemId: string) => {
    if (!confirm("Hủy món ăn này khỏi đơn hàng?")) return;
    try {
      const res = await fetch(`/api/order-items/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => 
          prev.map(o => o.id === orderId ? {
            ...o,
            items: o.items.filter(i => i.id !== itemId)
          } : o)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async (order: Order) => {
    if (!confirm(`Xác nhận thanh toán hóa đơn bàn ${order.table.tableNumber}?`)) return;
    try {
      const res = await fetch(`/api/tables/${order.tableId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        // Xóa tất cả order của bàn này khỏi danh sách hiển thị
        setOrders((prev) => prev.filter((o) => o.tableId !== order.tableId));
      } else {
        const data = await res.json();
        alert(data.error || "Thanh toán thất bại, vui lòng thử lại");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi kết nối với máy chủ");
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "PREPARING":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "SERVED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "CANCELLED":
        return "bg-zinc-100 text-zinc-500 border-zinc-200";
      case "PAID":
        return "bg-zinc-900 text-white border-zinc-900";
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="w-3.5 h-3.5" />;
      case "PREPARING": return <ChefHat className="w-3.5 h-3.5" />;
      case "SERVED": return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "PAID": return <Check className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const calculateTotal = (order: Order) => {
    return order.items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  };

  const range = searchParams.get("range");

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "ACTIVE") {
      return o.status !== "PAID" && o.status !== "CANCELLED";
    }
    
    // For PAID tab, apply range filter if it exists
    if (o.status !== "PAID") return false;
    
    const orderDate = new Date(o.createdAt);
    const now = new Date();
    
    if (range === "today") {
      return orderDate.toDateString() === now.toDateString();
    }
    if (range === "month") {
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    }
    return true; 
  });

  const totalRevenue = filteredOrders
    .filter(o => o.status === "PAID")
    .reduce((sum, order) => sum + calculateTotal(order), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            activeTab === "ACTIVE" ? "bg-amber-50" : "bg-emerald-50"
          }`}>
            <Package className={`w-6 h-6 ${
              activeTab === "ACTIVE" ? "text-amber-600" : "text-emerald-600"
            }`} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight">
              {activeTab === "ACTIVE" ? "Quản lý Gọi món" : "Lịch sử Thanh toán"}
            </h2>
            <p className="text-zinc-500 font-medium mt-0.5">
              {activeTab === "ACTIVE" 
                ? "Xử lý các món ăn khách gọi từ mã QR tại bàn." 
                : range === "today" 
                  ? "Danh sách các hóa đơn đã thanh toán trong hôm nay."
                  : range === "month"
                    ? "Danh sách các hóa đơn đã thanh toán trong tháng này."
                    : "Danh sách các hóa đơn đã hoàn tất thanh toán."}
            </p>
          </div>
        </div>

        {activeTab === "PAID" && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-[24px] px-8 py-4">
             <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
               {range === "today" ? "Doanh thu hôm nay" : range === "month" ? "Doanh thu tháng này" : "Tổng doanh thu"}
             </p>
             <p className="text-2xl font-black text-emerald-700">{totalRevenue.toLocaleString("vi-VN")}đ</p>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1.5 bg-zinc-100 rounded-2xl w-fit mb-8">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === "ACTIVE"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          ĐANG PHỤC VỤ ({orders.filter(o => o.status !== "PAID" && o.status !== "CANCELLED").length})
        </button>
        <button
          onClick={() => setActiveTab("PAID")}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === "PAID"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          LỊCH SỬ THANH TOÁN ({orders.filter(o => o.status === "PAID").length})
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === "ACTIVE" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredOrders
                .map((order) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={order.id}
                    className={`bg-white rounded-[32px] border-2 transition-all p-6 ${
                      order.status === "PENDING" ? "border-amber-200 shadow-lg shadow-amber-500/5" : "border-zinc-50 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg ${
                          order.status === "PENDING" ? "bg-amber-500" : "bg-zinc-900"
                        }`}>
                          {order.table.tableNumber}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">BÀN ĂN</p>
                          <p className="text-xs font-bold text-zinc-600">
                            {new Date(order.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                             <span className="w-6 h-6 rounded-lg bg-zinc-50 flex items-center justify-center text-[10px] font-black text-zinc-400 group-hover:bg-zinc-100 transition-colors">
                                {item.quantity}
                             </span>
                             <span className="text-sm font-black text-zinc-900">{item.menuItem.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-zinc-400">
                              {(item.menuItem.price * item.quantity).toLocaleString("vi-VN")}đ
                            </span>
                            <button 
                              onClick={() => cancelItem(order.id, item.id)}
                              className="w-6 h-6 rounded-lg bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between py-4 mb-4 border-t border-zinc-50">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tổng cộng</span>
                        <span className="text-lg font-black text-amber-600">{calculateTotal(order).toLocaleString("vi-VN")}đ</span>
                    </div>

                    {order.notes && (
                        <div className="mb-8 p-3 bg-zinc-50 rounded-2xl text-[11px] font-medium text-zinc-500 italic">
                            "{order.notes}"
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-2 pt-4 border-t border-zinc-50">
                       {order.status === "PENDING" && (
                         <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus(order.id, "CONFIRMED")}
                              className="flex-1 bg-zinc-900 text-white font-black py-4 rounded-2xl text-xs hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                              XÁC NHẬN
                            </button>
                            <button
                              onClick={() => updateStatus(order.id, "CANCELLED")}
                              className="w-14 h-14 bg-zinc-50 text-zinc-400 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all"
                            >
                              <X className="w-5 h-5" />
                            </button>
                         </div>
                       )}

                       {order.status === "CONFIRMED" && (
                         <button
                           onClick={() => updateStatus(order.id, "PREPARING")}
                           className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl text-xs hover:bg-purple-600 transition-all flex items-center justify-center gap-2"
                         >
                           BẮT ĐẦU CHẾ BIẾN
                         </button>
                       )}

                       {order.status === "PREPARING" && (
                         <button
                           onClick={() => updateStatus(order.id, "SERVED")}
                           className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl text-xs hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                         >
                           ĐÃ RA MÓN
                         </button>
                       )}

                       {order.status === "SERVED" && (
                          <button
                            onClick={() => handleCheckout(order)}
                            className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl text-xs hover:bg-zinc-900 transition-all shadow-lg shadow-emerald-500/20"
                          >
                            THANH TOÁN HÓA ĐƠN
                          </button>
                       )}
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
            {filteredOrders.length === 0 && (
              <div className="col-span-full py-20 text-center bg-zinc-50 rounded-[32px] border-2 border-dashed border-zinc-100">
                <p className="text-zinc-400 font-bold">Không có đơn hàng nào đang phục vụ</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100">
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Thời gian</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Bàn</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Chi tiết món</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Tổng tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders
                    .map((order) => (
                      <tr key={order.id} className="border-b border-zinc-50 hover:bg-zinc-50/30 transition-colors group">
                        <td className="px-6 py-5">
                          <p className="text-sm font-black text-zinc-900">
                            {new Date(order.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase">
                            {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-black text-sm">
                            {order.table.tableNumber}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-1.5">
                            {order.items.map((item) => (
                              <span key={item.id} className="inline-flex items-center gap-1.5 bg-zinc-100 px-2.5 py-1 rounded-lg text-[11px] font-bold text-zinc-600">
                                <span className="text-zinc-400">{item.quantity}x</span>
                                {item.menuItem.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="text-sm font-black text-emerald-600">
                            {calculateTotal(order).toLocaleString("vi-VN")}đ
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {filteredOrders.length === 0 && (
              <div className="py-20 text-center text-zinc-400 font-bold">
                Chưa có lịch sử thanh toán {range === "today" ? "trong hôm nay" : range === "month" ? "trong tháng này" : ""}
              </div>
            )}
          </div>
        )}
      </div>
  </div>
  );
}

