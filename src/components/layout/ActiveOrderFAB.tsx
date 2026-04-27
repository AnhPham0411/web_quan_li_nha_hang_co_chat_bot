"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";

export function ActiveOrderFAB() {
  const { data: session } = useSession();
  const [activeTable, setActiveTable] = useState<{ id: string; number: string } | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const checkActiveOrder = async () => {
      const id = localStorage.getItem("activeTableId");
      const number = localStorage.getItem("activeTableNumber");
      
      if (id && number) {
        // Verify with server if table is still active
        try {
          const res = await fetch(`/api/tables/${id}`);
          if (res.ok) {
             const table = await res.json();
             // Only keep FAB if table is SERVING
             if (table.status === "SERVING") {
               setActiveTable({ id, number });
             } else {
               localStorage.removeItem("activeTableId");
               localStorage.removeItem("activeTableNumber");
               setActiveTable(null);
             }
          } else {
             localStorage.removeItem("activeTableId");
             localStorage.removeItem("activeTableNumber");
             setActiveTable(null);
          }
        } catch (e) {
          setActiveTable({ id, number });
        }
      } else {
        setActiveTable(null);
      }
    };

    checkActiveOrder();
    
    // Listen for storage changes
    window.addEventListener("storage", checkActiveOrder);
    
    return () => {
      window.removeEventListener("storage", checkActiveOrder);
    };
  }, []);

  // 🚪 Force hide if no session (Optional: depending on if guest ordering is allowed)
  // For this app, it seems ordering is often authenticated for history, 
  // but if session disappears, we should at least check if we should keep the FAB.
  useEffect(() => {
    if (!session && activeTable) {
      // If user logs out, we clear the table too
       setActiveTable(null);
    }
  }, [session, activeTable]);

  // 🔔 Real-time cleanup listener
  useEffect(() => {
    if (!activeTable?.id) return;

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
    const channel = pusher.subscribe(`table-${activeTable.id}`);

    channel.bind("status-updated", (data: { status: string }) => {
      // 💡 Cleanup logic: if table is marked EMPTY or BOOKED or anything NOT SERVING
      if (data.status !== "SERVING") {
        localStorage.removeItem("activeTableId");
        localStorage.removeItem("activeTableNumber");
        setActiveTable(null);
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`table-${activeTable.id}`);
    };
  }, [activeTable?.id]);

  // Don't show if on the order page or admin page
  if (pathname.includes("/order/") || pathname.startsWith("/admin")) return null;
  if (!activeTable || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.8 }}
        className="fixed bottom-6 left-6 right-6 md:right-auto md:w-80 z-50"
      >
        <div className="bg-white/95 backdrop-blur-xl border border-amber-200 rounded-3xl p-4 shadow-2xl shadow-orange-900/20 flex items-center justify-between group animate-in fade-in slide-in-from-bottom-5 duration-500">
          <Link 
            href={`/order/${activeTable.id}`}
            className="flex items-center gap-4 flex-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Bàn đang mở</p>
              <h4 className="text-zinc-900 font-black flex items-center gap-2">
                Bàn số #{activeTable.number}
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </h4>
            </div>
          </Link>
          
          <button 
            onClick={() => setIsVisible(false)}
            className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors ml-2"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
