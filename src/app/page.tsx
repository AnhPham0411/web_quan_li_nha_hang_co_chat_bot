import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { ReservationForm } from "@/components/ReservationForm";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  UtensilsCrossed,
  Star,
} from "lucide-react";

const CATEGORIES = ["Khai vị", "Món chính", "Lẩu & Nướng", "Cơm & Bún", "Tráng miệng", "Đồ uống"];

export default async function Home() {
  const session = await auth();
  
  // RSC: fetch trực tiếp, không qua API — cực nhanh
  const menuItems = await prisma.menuItem.findMany({
    where: { isAvailable: true },
    orderBy: [{ isFeatured: "desc" }, { category: "asc" }, { name: "asc" }],
  });

  const itemsByCategory = CATEGORIES.reduce(
    (acc, cat) => {
      const items = menuItems.filter((i) => i.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    },
    {} as Record<string, typeof menuItems>
  );

  const tableStats = await prisma.table.groupBy({
    by: ["status"],
    _count: true,
  });
  const emptyTables = tableStats.find((t) => t.status === "EMPTY")?._count ?? 0;

  const tables = await prisma.table.findMany({
    orderBy: { tableNumber: "asc" },
    select: { id: true, tableNumber: true, capacity: true, status: true },
  });

  return (
    <main className="min-h-screen bg-white">
      {/* === HEADER === */}
      <header className="bg-zinc-900 text-white sticky top-0 z-40 shadow-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-lg">
              🍜
            </div>
            <span className="text-xl font-black tracking-tight">Quán Ngon</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-400">
            <a href="#menu" className="hover:text-amber-400 transition-colors">Thực đơn</a>
            <a href="#info" className="hover:text-amber-400 transition-colors">Thông tin</a>
            <a href="#reservation" className="hover:text-amber-400 transition-colors">Đặt bàn</a>
            {session?.user && (
              <Link href="/history" className="text-amber-500 font-black hover:text-amber-300 hover:border-amber-400 tracking-wide uppercase text-xs border border-amber-500/50 px-4 py-1.5 rounded-lg active:scale-95 transition-all">
                Lịch sử
              </Link>
            )}
            {session?.user ? (
              <div className="flex items-center gap-4">
                <span className="text-zinc-300">
                  Chào, <span className="text-amber-400 font-bold">{session.user.name?.split(" ")[0]}</span>
                </span>
                {session.user.role !== "CUSTOMER" && (
                  <Link href="/admin" className="text-white hover:text-amber-400 font-bold transition-colors">
                    Dashboard
                  </Link>
                )}
                <form action={async () => { "use server"; await signOut(); }}>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-all font-bold">
                    Đăng xuất
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-all"
              >
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* === HERO === */}
      <section className="relative bg-zinc-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-900/40" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative container mx-auto px-6 py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-1.5 text-amber-300 text-sm font-bold mb-6">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            {emptyTables > 0 ? `Hiện còn ${emptyTables} bàn trống` : "Đang khá đông — hỏi nhân viên nhé"}
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-black leading-tight mb-6 tracking-tight drop-shadow-lg">
            Hương Vị Đậm Đà
            <br />
            <span className="text-amber-400 font-sans tracking-normal">Từ Bếp Đến Bàn</span>
          </h1>
          <p className="text-xl text-zinc-200 mb-10 max-w-xl mx-auto drop-shadow-md">
            Ẩm thực Việt truyền thống, chế biến tươi mỗi ngày. Không gian ấm cúng, phục vụ tận tình.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="#reservation"
              className="px-8 py-4 bg-amber-500 text-zinc-950 rounded-2xl font-black text-lg hover:bg-amber-400 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/50 transition-all shadow-xl shadow-amber-500/30 active:scale-95"
            >
              Đặt bàn ngay
            </a>
            <a
              href="#menu"
              className="px-8 py-4 bg-transparent border-2 border-white/60 text-white rounded-2xl font-black text-lg hover:bg-white/10 hover:border-white hover:-translate-y-1 transition-all backdrop-blur-sm"
            >
              Xem thực đơn
            </a>
          </div>
        </div>
      </section>

      {/* === INFO BAR === */}
      <section id="info" className="bg-zinc-900 border-y border-zinc-800 relative z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-wrap justify-center gap-10">
            {[
              { icon: MapPin, label: "Địa chỉ", value: "123 Nguyễn Huệ, Q.1, TP.HCM" },
              { icon: Clock, label: "Giờ mở cửa", value: "10:00 – 22:00 (Cả tuần)" },
              { icon: Phone, label: "Điện thoại", value: "0909 123 456" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                  <Icon className="w-6 h-6 text-amber-500 group-hover:text-zinc-900 transition-colors" />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-0.5">
                    {label}
                  </p>
                  <p className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === MENU === */}
      <section id="menu" className="py-20 container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-zinc-900 mb-3">
            <UtensilsCrossed className="inline w-8 h-8 text-amber-500 mr-2 -mt-1" />
            Thực đơn hôm nay
          </h2>
          <p className="text-zinc-500">
            Chatbot để hỏi xem còn hàng không trước khi tới nha! 👇
          </p>
        </div>

        {Object.entries(itemsByCategory).map(([category, items]) => (
          <div key={category} className="mb-12">
            <h3 className="text-xl font-black text-zinc-800 mb-5 flex items-center gap-2">
              <span className="w-1 h-6 bg-amber-500 rounded-full" />
              {category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group"
                >
                  <div className="h-40 bg-zinc-100 overflow-hidden relative">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        🍜
                      </div>
                    )}
                    {item.isFeatured && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        <Star className="w-2.5 h-2.5" />
                        Đặc biệt
                      </div>
                    )}
                    {item.stockQuantity <= 3 && item.stockQuantity > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        Còn {item.stockQuantity} suất
                      </div>
                    )}
                    {item.stockQuantity === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-black text-sm bg-red-600 px-3 py-1 rounded-full">
                          Hết hàng
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-black text-zinc-900 text-sm leading-tight">{item.name}</h4>
                    {item.description && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-amber-600 font-black">
                        {Number(item.price).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(itemsByCategory).length === 0 && (
          <div className="text-center py-20 text-zinc-400">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="font-bold">Thực đơn đang được cập nhật...</p>
          </div>
        )}
      </section>

      {/* === RESERVATION FORM === */}
      <section
        id="reservation"
        className="py-20 bg-zinc-900 text-white"
      >
        <div className="container mx-auto px-6 max-w-lg text-center">
          <h2 className="text-4xl font-black mb-4">Đặt bàn trước</h2>
          <p className="text-zinc-400 mb-10">
            Điền thông tin, nhân viên sẽ gọi xác nhận trong vài phút.
          </p>
          <ReservationForm userId={session?.user?.id} defaultName={session?.user?.name || ""} tables={tables} />
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="bg-zinc-950 text-zinc-500 py-8 text-center text-sm">
        <p>© 2026 Quán Ngon. Ẩm thực Việt đậm đà.</p>
      </footer>

      {/* === CHATBOT === */}
      <ChatbotWidget />
    </main>
  );
}


