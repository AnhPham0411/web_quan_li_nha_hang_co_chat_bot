import React from "react";

export function Footer() {
  return (
    <footer className="bg-orange-50 text-zinc-500 py-12 text-center text-sm border-t border-orange-100 mt-auto">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-base text-white">
              🍜
            </div>
            <span className="text-xl font-black text-zinc-900 tracking-tight">Quán Ngon</span>
          </div>
          <div className="flex gap-8 text-zinc-500 font-medium">
            <a href="/" className="hover:text-primary transition-colors">Trang chủ</a>
            <a href="/menu" className="hover:text-primary transition-colors">Thực đơn</a>
            <a href="/reservation" className="hover:text-primary transition-colors">Đặt bàn</a>
          </div>
        </div>
        <div className="pt-8 border-t border-orange-100 text-zinc-400">
          <p>© 2026 Quán Ngon. Ẩm thực Việt truyền thống đậm đà bản sắc.</p>
          <p className="mt-2 text-xs opacity-50">Dự án Đồ án Tốt nghiệp</p>
        </div>
      </div>
    </footer>
  );
}
