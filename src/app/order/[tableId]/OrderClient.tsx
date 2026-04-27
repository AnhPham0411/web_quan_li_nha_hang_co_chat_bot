"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, ShoppingBag, Utensils, CheckCircle2, Loader2, ArrowLeft, Receipt, X, Timer, ChefHat, Send, Sparkles, Clock, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  category: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  createdAt: string;
  orderStatus: string;
}

export default function OrderClient({ table: initialTable, menuItems }: { table: any, menuItems: MenuItem[] }) {
  const [table, setTable] = useState(initialTable);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bill, setBill] = useState<{ items: BillItem[], total: number }>({ items: [], total: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [checkingInLoading, setCheckingInLoading] = useState(false);
  const [guestPhone, setGuestPhone] = useState("");
  const [checkInError, setCheckInError] = useState("");
  const [lastOrderedItems, setLastOrderedItems] = useState<CartItem[]>([]);
  const router = useRouter();

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${table.id}`);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    fetchBill();

    // Store active table info for global access
    if (table.id) {
      localStorage.setItem("activeTableId", table.id);
      localStorage.setItem("activeTableNumber", table.tableNumber.toString());
    }
  }, [table.id, table.tableNumber]);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem(`cart_${table.id}`, JSON.stringify(cart));
  }, [cart, table.id]);

  // Pusher real-time table status update
  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
    const channel = pusher.subscribe(`table-${table.id}`);

    channel.bind("status-updated", (data: { status: string }) => {
      setTable((prev: any) => ({ ...prev, status: data.status }));
      if (data.status === "SERVING") {
        setShowCheckInOverlay(false);
      }
      
      // 💡 Cleanup logic: if table is marked EMPTY or BOOKED (session over)
      if (data.status === "EMPTY") {
        localStorage.removeItem("activeTableId");
        localStorage.removeItem("activeTableNumber");
        // Optional: toast or alert user
        alert("Bàn của bạn đã được thanh toán và dọn dẹp. Cảm ơn quý khách!");
        window.location.href = "/menu";
      }
    });

    // 🍕 Listen for individual order status updates
    channel.bind("order-status-updated", () => {
      fetchBill();
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`table-${table.id}`);
    };
  }, [table.id]);

  const fetchBill = async () => {
    try {
      const res = await fetch(`/api/tables/${table.id}/bill`);
      if (res.ok) {
        const data = await res.json();
        setBill(data);
      }
    } catch (err) {
      console.error("Fetch bill failed", err);
    }
  };

  const handleCheckIn = async () => {
     if (table.status === "BOOKED" && !guestPhone) {
        setCheckInError("Vui lòng nhập số điện thoại đặt bàn.");
        return;
     }

    setCheckingInLoading(true);
    setCheckInError("");
    try {
      const res = await fetch("/api/reservations/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tableId: table.id,
          guestPhone: guestPhone || undefined
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTable({ ...table, status: "SERVING" });
        setShowCheckInOverlay(false);
      } else {
        setCheckInError(data.error || "Không thể xác nhận vào bàn.");
      }
    } catch (err) {
      setCheckInError("Lỗi kết nối máy chủ.");
    } finally {
      setCheckingInLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map((i) => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const cancelOrderItem = async (itemId: string) => {
    if (!confirm("Bạn có chắc muốn hủy món này?")) return;
    try {
      const res = await fetch(`/api/order-items/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        fetchBill();
      } else {
        const data = await res.json();
        alert(data.error || "Không thể hủy món");
      }
    } catch (err) {
      alert("Lỗi khi hủy món");
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmitOrder = async () => {
    if (cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: table.id,
          items: cart.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity
          }))
        }),
      });

      if (res.ok) {
        setLastOrderedItems([...cart]);
        setIsSuccess(true);
        setCart([]);
        localStorage.removeItem(`cart_${table.id}`);
        fetchBill();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isWithinCancelTime = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    const now = new Date().getTime();
    return now - created < 2 * 60 * 1000;
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center min-h-screen p-6 text-center bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-[48px] p-8 shadow-2xl shadow-zinc-200 mt-10 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-50 rounded-full -ml-12 -mb-12" />

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="w-24 h-24 bg-amber-500 rounded-3xl flex items-center justify-center mb-8 mx-auto rotate-6 shadow-xl shadow-amber-500/20"
          >
            <Sparkles className="w-12 h-12 text-white -rotate-6" />
          </motion.div>

          <h1 className="text-3xl font-black text-zinc-900 mb-2">Tuyệt vời!</h1>
          <p className="text-zinc-500 mb-8 font-medium">Bếp đã nhận được order của bạn.<br />Món ăn sẽ sẵn sàng trong giây lát.</p>

          {/* Timeline */}
          <div className="flex justify-between items-start mb-10 px-2">
            {[
              { icon: Send, label: "Đã gửi", active: true },
              { icon: ChefHat, label: "Nhận món", active: true },
              { icon: Clock, label: "Đang nấu", active: false },
              { icon: Utensils, label: "Phục vụ", active: false },
            ].map((step, i, arr) => (
              <div key={i} className="flex flex-col items-center gap-2 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${step.active ? "bg-amber-500 text-white shadow-lg" : "bg-zinc-100 text-zinc-400"}`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${step.active ? "text-amber-600" : "text-zinc-400"}`}>{step.label}</span>
                {i < arr.length - 1 && (
                  <div className={`absolute top-5 left-10 w-full h-[2px] -z-10 ${step.active ? "bg-amber-500" : "bg-zinc-100"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-zinc-50 rounded-3xl p-6 mb-8 text-left border border-zinc-100/50">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Món vừa đặt</h4>
            <div className="space-y-3">
              {lastOrderedItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-zinc-400 shadow-sm">
                      {item.quantity}
                    </span>
                    <span className="text-sm font-bold text-zinc-900">{item.name}</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsSuccess(false)}
              className="w-full bg-zinc-900 text-white font-black py-5 rounded-[24px] hover:bg-amber-500 transition-all active:scale-95 shadow-xl shadow-zinc-900/10 flex items-center justify-center gap-3"
            >
              TIẾP TỤC GỌI MÓN
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setIsSuccess(false); setShowBill(true); }}
              className="w-full bg-white text-zinc-900 font-black py-5 rounded-[24px] hover:bg-zinc-50 transition-all active:scale-95 border border-zinc-200"
            >
              XEM CHI TIẾT HÓA ĐƠN
            </button>
            <a
              href="/"
              className="w-full bg-slate-50 text-zinc-500 font-black py-4 rounded-[24px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs"
            >
              <Home className="w-4 h-4" />
              VỀ TRANG CHỦ
            </a>
          </div>
        </div>

        <p className="mt-8 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
          Bàn số {table.tableNumber} • Đã xác nhận • {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto min-h-screen flex flex-col relative pb-32 bg-slate-50/50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-6 border-b border-zinc-100 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-zinc-900" />
        </button>
        <div className="text-center">
            <h2 className="font-black text-zinc-900 text-lg uppercase tracking-tight">Thực đơn tại bàn</h2>
            <p className="text-[10px] font-bold text-amber-600 tracking-widest uppercase">Bàn số {table.tableNumber}</p>
        </div>
        <button 
          onClick={() => setShowBill(true)}
          className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center relative"
        >
          <Receipt className="w-5 h-5 text-white" />
          {bill.items.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>
      </header>

      {/* Menu List */}
      <main className="flex-1 p-6 space-y-6">
        {menuItems.map((item) => {
          const cartItem = cart.find(i => i.id === item.id);
          return (
            <div key={item.id} className="bg-white rounded-3xl p-4 border border-zinc-100 shadow-sm flex gap-4 ring-1 ring-zinc-100/50">
              <div className="w-24 h-24 bg-zinc-50 rounded-2xl overflow-hidden shrink-0">
                {item.imageUrl ? (
                   // eslint-disable-next-line @next/next/no-img-element
                   <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-3xl">🍜</div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h4 className="font-black text-zinc-900 text-sm leading-tight mb-1">{item.name}</h4>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.category}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-amber-600 font-black text-sm">
                    {item.price.toLocaleString("vi-VN")}đ
                  </span>
                  
                  <div className="flex items-center gap-3">
                    {cartItem ? (
                      <div className="flex items-center gap-3 bg-zinc-50 rounded-xl px-1 py-1">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 hover:text-red-500 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-black min-w-[12px] text-center">{cartItem.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center hover:bg-amber-500 transition-all active:scale-90"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Cart Summary Bar */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-6 z-50 pointer-events-none"
          >
            <div className="max-w-lg mx-auto w-full bg-zinc-900 text-white rounded-[32px] p-6 shadow-2xl flex items-center justify-between pointer-events-auto ring-4 ring-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center relative">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">Tổng cộng</p>
                  <p className="text-lg font-black text-amber-500">{totalPrice.toLocaleString("vi-VN")}đ</p>
                </div>
              </div>
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="bg-amber-500 text-zinc-900 font-black px-8 py-3 rounded-2xl flex items-center gap-2 hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                   "GỬI ORDER"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Check-in Overlay */}
      <AnimatePresence>
        {(table.status === "EMPTY" || table.status === "BOOKED") && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-zinc-900/90 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="bg-white rounded-[48px] p-8 md:p-10 w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-amber-500" />
              
              <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                <Utensils className="w-10 h-10 text-amber-600 -rotate-3" />
              </div>
              
              <h3 className="text-2xl font-black text-zinc-900 mb-2">Xin chào!</h3>
              <p className="text-zinc-500 text-sm font-medium mb-8">
                Bạn đang ở <span className="text-zinc-900 font-black">Bàn số {table.tableNumber}</span>. 
                {table.status === "BOOKED" ? " Vui lòng xác nhận thông tin để bắt đầu gọi món." : " Vui lòng đợi nhân viên hoặc bấm xác nhận để vào bàn."}
              </p>

              {table.status === "BOOKED" && (
                <div className="mb-6 space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block text-left ml-1">Số điện thoại đặt bàn</label>
                  <input
                    type="tel"
                    placeholder="09xx xxx xxx"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              )}

              {checkInError && (
                <p className="text-xs font-bold text-red-500 mb-6 bg-red-50 p-3 rounded-2xl animate-shake">
                  {checkInError}
                </p>
              )}

              <button
                onClick={handleCheckIn}
                disabled={checkingInLoading}
                className="w-full bg-zinc-900 text-white font-black py-5 rounded-2xl hover:bg-amber-500 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/20"
              >
                {checkingInLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  table.status === "BOOKED" ? "XÁC NHẬN VÀO BÀN" : "TÔI ĐANG NGỒI TẠI ĐÂY"
                )}
              </button>
              
              <p className="mt-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                Nhân viên sẽ hỗ trợ bạn ngay nếu gặp khó khăn.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bill Modal */}
      <AnimatePresence>
        {showBill && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-zinc-900/60 backdrop-blur-md flex flex-col justify-end"
            onClick={() => setShowBill(false)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white rounded-t-[48px] w-full max-h-[85vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-zinc-900">Chi tiết hóa đơn</h3>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Bàn số {table.tableNumber}</p>
                </div>
                <button 
                  onClick={() => setShowBill(false)}
                  className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center"
                >
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {bill.items.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-zinc-400 font-bold">Chưa có món nào được đặt.</p>
                  </div>
                ) : (
                  bill.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between group bg-white hover:bg-zinc-50 p-4 -mx-4 rounded-3xl transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center font-black text-zinc-600 shadow-sm">
                          {item.quantity}
                        </div>
                        <div>
                          <p className="font-black text-zinc-900 text-sm leading-tight flex items-center gap-2">
                            {item.name}
                            {item.orderStatus === "SERVED" && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                             <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${
                               item.orderStatus === "PENDING" ? "bg-zinc-50 border-zinc-200 text-zinc-400" :
                               item.orderStatus === "CONFIRMED" ? "bg-blue-50 border-blue-100 text-blue-500" :
                               item.orderStatus === "PREPARING" ? "bg-orange-50 border-orange-100 text-orange-500 animate-pulse" :
                               item.orderStatus === "SERVED" ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                               "bg-zinc-50 text-zinc-400"
                             }`}>
                                {item.orderStatus === "PENDING" ? "Đang chờ" :
                                 item.orderStatus === "CONFIRMED" ? "Đã nhận" :
                                 item.orderStatus === "PREPARING" ? "Đang nấu" :
                                 item.orderStatus === "SERVED" ? "Xong" : item.orderStatus}
                             </div>
                             <span className="text-[10px] font-bold text-zinc-300">•</span>
                             <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-tighter">
                                {new Date(item.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                             </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-zinc-900">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</span>
                        {item.orderStatus === "PENDING" && isWithinCancelTime(item.createdAt) ? (
                          <button 
                            onClick={() => cancelOrderItem(item.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="Hủy món (Trong vòng 2 phút)"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        ) : (
                           <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-200" title={item.orderStatus === "SERVED" ? "Đã phục vụ" : "Đang chuẩn bị"}>
                              {item.orderStatus === "SERVED" ? <Utensils className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
                           </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-8 bg-zinc-50 border-t border-zinc-100">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-zinc-400 font-black uppercase tracking-widest">Tổng hóa đơn</span>
                  <span className="text-3xl font-black text-amber-600">{bill.total.toLocaleString("vi-VN")}đ</span>
                </div>
                <button 
                  onClick={() => setShowBill(false)}
                  className="w-full bg-zinc-900 text-white font-black py-5 rounded-2xl hover:bg-amber-500 transition-all active:scale-95"
                >
                  OK, TIẾP TỤC
                </button>
                <p className="text-center text-[10px] font-bold text-zinc-400 mt-4 px-4 uppercase leading-relaxed tracking-wider">
                  Sau 2 phút gọi món, nếu muốn hủy vui lòng liên hệ nhân viên phục vụ hoặc nhắn tin qua Chat tự động.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
