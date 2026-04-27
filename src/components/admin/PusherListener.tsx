"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import toast, { Toaster } from "react-hot-toast";
import { Bell, User } from "lucide-react";

interface AlertData {
  message: string;
  guestName?: string;
  partySize?: number;
  tableNumber?: number;
  source?: string;
  reservationId?: string;
  queryText?: string;
}

/**
 * PusherListener Component
 * 
 * 🚨 PM FIX: Tích hợp Pusher để Admin KHÔNG cần ấn F5.
 * Khi có đặt bàn mới (từ website hoặc chatbot) → Popup + âm thanh "Ting".
 * 
 * Đặt ở layout admin để luôn active khi nhân viên mở màn hình.
 */
export function PusherListener() {
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) {
      console.warn("[PusherListener] Pusher keys not configured");
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    const channel = pusher.subscribe("admin-channel");

    // 🔔 Đơn đặt bàn mới
    channel.bind("new-reservation", (data: AlertData) => {
      setNotifCount((prev) => prev + 1);

      // Phát âm thanh ting
      try {
        const audio = new Audio("/ting.mp3");
        audio.play().catch(() => {
          // Browser cần user interaction trước khi play audio — bình thường
        });
      } catch {}

      const isFromBot = data.source === "chatbot";
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 ${
              isFromBot ? "border-purple-500" : "border-emerald-500"
            }`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isFromBot ? "bg-purple-100" : "bg-emerald-100"
                  }`}
                >
                  {isFromBot ? (
                    <span className="text-lg">🤖</span>
                  ) : (
                    <User className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-zinc-900">
                    {isFromBot ? "Chatbot — Đặt bàn mới" : "Website — Đặt bàn mới"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">{data.message}</p>
                  {data.tableNumber && (
                    <p className="mt-1 text-xs font-semibold text-zinc-400">
                      Bàn tạm giữ: Bàn #{data.tableNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex border-l border-zinc-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-zinc-600 hover:text-zinc-500 focus:outline-none"
              >
                Đóng
              </button>
            </div>
          </div>
        ),
        { duration: 10000 }
      );
    });

    // ⚠️ Human Handoff — khách cần hỗ trợ
    channel.bind("human-handoff", (data: AlertData) => {
      setNotifCount((prev) => prev + 1);

      try {
        const audio = new Audio("/ting.mp3");
        audio.volume = 1.0;
        // Phát 3 lần liên tiếp để gây sự chú ý
        audio.play();
        setTimeout(() => audio.play(), 700);
        setTimeout(() => audio.play(), 1400);
      } catch {}

      toast.error(
        <div>
          <p className="font-bold">⚠️ Khách cần nhân viên hỗ trợ!</p>
          <p className="text-sm mt-1">{data.message}</p>
          {data.queryText && (
            <p className="text-xs text-zinc-400 mt-1">Câu hỏi: "{data.queryText}"</p>
          )}
        </div>,
        { duration: 15000, style: { maxWidth: "400px" } }
      );
    });

    // 🍴 Đơn gọi món mới
    channel.bind("new-order", (data: any) => {
      setNotifCount((prev) => prev + 1);

      try {
        const audio = new Audio("/ting.mp3");
        audio.play();
      } catch {}

      toast(
        (t) => (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white font-black">
              {data.tableNumber}
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-zinc-900 leading-none">Bàn #{data.tableNumber} - Gọi món mới</p>
              <div className="mt-2 space-y-1">
                {data.items?.map((item: any, i: number) => (
                  <p key={i} className="text-xs text-zinc-500">
                    <span className="font-bold text-zinc-900">{item.quantity}x</span> {item.name}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ),
        { 
          duration: 8000,
          style: { borderRadius: "24px", padding: "16px", minWidth: "300px" },
          icon: <span className="text-xl">🍲</span>
        }
      );
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("admin-channel");
      pusher.disconnect();
    };
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      {notifCount > 0 && (
        <div className="relative inline-flex items-center">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
            {notifCount > 9 ? "9+" : notifCount}
          </span>
        </div>
      )}
    </>
  );
}
