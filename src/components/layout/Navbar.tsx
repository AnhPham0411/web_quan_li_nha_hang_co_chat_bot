"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Kiểm tra xem có đang ở trang admin không để tránh hiển thị Navbar của khách
  if (pathname.startsWith("/admin")) return null;

  const handleLogout = () => {
    localStorage.removeItem("activeTableId");
    localStorage.removeItem("activeTableNumber");
    signOut();
  };

  return (
    <header className="bg-white/80 text-zinc-900 sticky top-0 z-40 shadow-sm border-b border-orange-100 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-lg group-hover:scale-110 transition-transform text-white shadow-lg shadow-orange-200">
            🍜
          </div>
          <span className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">Quán Ngon</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
          <Link 
            href="/" 
            className={`transition-colors ${pathname === "/" ? "text-primary" : "text-zinc-500 hover:text-secondary"}`}
          >
            Trang chủ
          </Link>
          <Link 
            href="/menu" 
            className={`transition-colors ${pathname === "/menu" ? "text-primary" : "text-zinc-500 hover:text-secondary"}`}
          >
            Thực đơn
          </Link>
          <Link 
            href="/reservation" 
            className={`transition-colors ${pathname === "/reservation" ? "text-primary" : "text-zinc-500 hover:text-secondary"}`}
          >
            Đặt bàn
          </Link>
          <Link 
            href="/reservation/history" 
            className={`transition-colors ${pathname === "/reservation/history" || pathname.includes("/review") ? "text-primary" : "text-zinc-500 hover:text-secondary"}`}
          >
            Lịch sử & Đánh giá
          </Link>
          
          <div className="h-4 w-px bg-zinc-200 mx-2" />
          {session?.user ? (
            <div className="flex items-center gap-6 pl-2">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">Xin chào</span>
                <span className="text-primary font-black">{session.user.name?.split(" ")[0]}</span>
              </div>
              
              <div className="flex items-center gap-3">
                {session.user.role !== "CUSTOMER" && (
                  <Link 
                    href="/admin" 
                    className="px-4 py-1.5 rounded-lg border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all text-xs font-black"
                  >
                    QUẢN LÝ
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="px-4 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all font-bold text-xs"
                >
                  ĐĂNG XUẤT
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2 rounded-xl bg-primary text-white font-black hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 active:scale-95"
            >
              ĐĂNG NHẬP
            </Link>
          )}
        </nav>

        {/* Mobile menu logic could go here, but focusing on structure first */}
      </div>
    </header>
  );
}
