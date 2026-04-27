"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Users, Clock, MessageSquare, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Reservation {
  id: string;
  guestName: string;
  partySize: number;
  status: string;
  reservedAt: string;
  notes: string | null;
  table?: {
    tableNumber: number;
    capacity: number;
  };
}

export function ReservationHistoryClient() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reservations");
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return { label: "Đang chờ duyệt", color: "text-amber-600 bg-amber-50", icon: <Clock className="w-4 h-4" /> };
      case "CONFIRMED":
        return { label: "Đã xác nhận", color: "text-emerald-600 bg-emerald-50", icon: <CheckCircle2 className="w-4 h-4" /> };
      case "CANCELLED":
        return { label: "Đã hủy", color: "text-red-600 bg-red-50", icon: <XCircle className="w-4 h-4" /> };
      case "NO_SHOW":
        return { label: "Vắng mặt", color: "text-zinc-500 bg-zinc-50", icon: <AlertCircle className="w-4 h-4" /> };
      default:
        return { label: status, color: "text-zinc-600 bg-zinc-100", icon: null };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="font-bold text-zinc-400 uppercase tracking-widest text-xs">Đang tải lịch sử...</p>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-zinc-100 p-12">
        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-zinc-200" />
        </div>
        <h3 className="text-xl font-black text-zinc-900 mb-2">Chưa có lịch sử đặt bàn</h3>
        <p className="text-zinc-500 font-medium max-w-xs mx-auto mb-8">Bạn chưa thực hiện cuộc hẹn nào tại Quán Ngon. Hãy đặt bàn ngay nhé!</p>
        <a href="/reservation" className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-primary text-white font-black text-sm hover:translate-y-[-2px] transition-all shadow-lg shadow-orange-500/20">
            ĐẶT BÀN NGAY
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {reservations.map((res, index) => {
          const config = getStatusConfig(res.status);
          const date = new Date(res.reservedAt);
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={res.id}
              className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex flex-col items-center justify-center border border-zinc-100 group-hover:bg-primary group-hover:border-primary transition-colors">
                    <span className="text-[10px] font-black uppercase text-zinc-400 group-hover:text-white/70">Tháng</span>
                    <span className="text-xl font-black text-zinc-900 group-hover:text-white leading-tight">
                        {date.getMonth() + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-zinc-900 mb-1">
                        Ngày {date.getDate()} - lúc {date.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                    </h4>
                    <div className="flex items-center gap-4 text-xs font-bold text-zinc-400">
                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {res.partySize} người</span>
                        {res.table && (
                            <span className="flex items-center gap-1.5 text-primary"><Calendar className="w-3.5 h-3.5" /> Bàn {res.table.tableNumber}</span>
                        )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${config.color}`}>
                    {config.icon}
                    {config.label}
                  </div>
                </div>
              </div>

              {res.notes && (
                <div className="mt-6 pt-6 border-t border-zinc-50 flex gap-3 text-sm text-zinc-500 font-medium italic">
                    <MessageSquare className="w-4 h-4 shrink-0 text-zinc-300" />
                    "{res.notes}"
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
