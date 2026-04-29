import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatbotWidget } from "@/components/ChatbotWidget";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  UtensilsCrossed,
  Star,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default async function Home() {
  const session = await auth();
  
  // Lấy các món nổi bật (isFeatured = true)
  const featuredItems = await prisma.menuItem.findMany({
    where: { isAvailable: true, isFeatured: true },
    take: 4,
    orderBy: { name: "asc" },
  });

  const tableStats = await prisma.table.groupBy({
    by: ["status"],
    _count: true,
  });
  const emptyTables = tableStats.find((t) => t.status === "EMPTY")?._count ?? 0;

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* === HERO === */}
      <section className="relative bg-white text-zinc-900 overflow-hidden min-h-[85vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-100/50" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative container mx-auto px-6 text-center py-20">
          <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-5 py-2 text-primary text-sm font-black mb-8 tracking-wide">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            {emptyTables > 0 ? `Hiện còn ${emptyTables} bàn trống` : "Đang khá đông — vui lòng đặt trước"}
          </div>
          <h1 className="text-5xl md:text-8xl font-serif font-black leading-tight mb-8 tracking-tight text-zinc-900">
            Hương Vị Đậm Đà
            <br />
            <span className="text-primary font-sans tracking-normal block mt-2">Từ Bếp Đến Bàn</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Ẩm thực Việt truyền thống, chế biến tươi mới mỗi ngày từ nguyên liệu thuần khiết nhất.
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link
              href="/reservation"
              className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-xl hover:bg-orange-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/50 transition-all shadow-xl shadow-orange-500/30 active:scale-95 flex items-center gap-2"
            >
              Đặt bàn trước
              <ArrowRight className="w-6 h-6" />
            </Link>
            <Link
              href="/menu"
              className="px-10 py-5 bg-zinc-900 text-white rounded-2xl font-black text-xl hover:bg-orange-500 hover:-translate-y-1 hover:shadow-2xl transition-all shadow-xl active:scale-95 flex items-center gap-2"
            >
              Gọi món tại bàn
              <UtensilsCrossed className="w-6 h-6 text-orange-400" />
            </Link>
            <Link
              href="/menu"
              className="px-10 py-5 bg-white/50 backdrop-blur-sm border-2 border-primary text-primary rounded-2xl font-black text-xl hover:bg-primary hover:text-white hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/20 transition-all active:scale-95"
            >
              Xem thực đơn
            </Link>
          </div>
        </div>
      </section>

      {/* === INFO BAR === */}
      <section className="bg-white border-y border-zinc-100 relative z-10">
        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-wrap justify-center gap-10 md:gap-20">
            {[
              { icon: MapPin, label: "Địa chỉ", value: "123 Nguyễn Huệ, Q.1, TP.HCM" },
              { icon: Clock, label: "Giờ mở cửa", value: "10:00 – 22:00 (Cả tuần)" },
              { icon: Phone, label: "Điện thoại", value: "0909 123 456" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-5 group">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                  <Icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-400 font-black uppercase tracking-widest mb-1">
                    {label}
                  </p>
                  <p className="text-lg font-black text-zinc-900 group-hover:text-primary transition-colors">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURED MENU === */}
      <section className="py-32 container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.2em] mb-4">
              <TrendingUp className="w-4 h-4" />
              Món ngon nổi bật
            </div>
            <h2 className="text-5xl font-black text-zinc-900 leading-tight">
              Tuyệt phẩm <br/>
              <span className="text-primary">Gợi ý từ đầu bếp</span>
            </h2>
            <p className="text-zinc-500 mt-6 text-lg font-medium">
              Những món ăn đặc trưng được yêu thích nhất tại Quán Ngon, mang trọn tinh hoa của ẩm thực Việt.
            </p>
          </div>
          <Link href="/menu" className="group flex items-center gap-3 font-black text-zinc-900 hover:text-primary transition-colors text-lg border-b-4 border-orange-500 pb-1">
            Xem toàn bộ thực đơn
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredItems.map((item) => (
            <Link
              key={item.id}
              href={`/menu?itemId=${item.id}`}
              className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden group block cursor-pointer"
            >
              <div className="h-64 bg-zinc-100 overflow-hidden relative">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    🍜
                  </div>
                )}
                <div className="absolute top-5 left-5 bg-primary/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-white fill-white" />
                  ĐẶC BIỆT
                </div>
                <div className="absolute bottom-5 right-5 bg-white text-zinc-900 font-black px-4 py-2 rounded-2xl shadow-xl border border-orange-50">
                  {Number(item.price).toLocaleString("vi-VN")}đ
                </div>
              </div>
              <div className="p-8">
                <h4 className="font-black text-zinc-900 text-xl leading-tight mb-3 group-hover:text-primary transition-colors uppercase tracking-tight">
                  {item.name}
                </h4>
                {item.description && (
                  <p className="text-zinc-500 text-sm font-medium line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* === SERVICE SECTION === */}
      <section className="py-24 bg-zinc-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative h-96 rounded-[3rem] overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80" 
                alt="Menu"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-12">
                <h3 className="text-3xl font-black text-white mb-4">Thực đơn phong phú</h3>
                <p className="text-zinc-300 mb-8 font-medium">Hơn 50 món ăn truyền thống chuẩn vị.</p>
                <Link href="/menu" className="w-fit px-8 py-4 bg-white text-primary rounded-2xl font-black hover:bg-primary hover:text-white transition-all shadow-lg">
                  KHÁM PHÁ NGAY
                </Link>
              </div>
            </div>
            
            <div className="relative h-96 rounded-[3rem] overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80" 
                alt="Table"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-stone-900/60 flex flex-col justify-end p-12">
                <h3 className="text-3xl font-black text-white mb-4">Không gian ấm cúng</h3>
                <p className="text-white/90 mb-8 font-medium">Vị trí đắc địa tại trung tâm thành phố.</p>
                <Link href="/reservation" className="w-fit px-8 py-4 bg-primary text-white rounded-2xl font-black hover:bg-white hover:text-primary transition-all shadow-lg">
                  ĐẶT BÀN NGAY
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === REVIEWS SECTION === */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.2em] mb-4">
              <Star className="w-4 h-4 fill-primary" />
              Đánh giá từ thực khách
            </div>
            <h2 className="text-5xl font-black text-zinc-900 leading-tight mb-6">
              Khách hàng nói gì về <br/>
              <span className="text-primary font-serif italic">Quán Ngon?</span>
            </h2>
            <div className="flex justify-center gap-1.5 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 text-primary fill-primary" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              {
                name: "Anh Tuấn",
                comment: "Bò Wagyu ở đây thực sự là tuyệt phẩm, mềm tan trong miệng. Không gian rất ấm cúng và sang trọng.",
                rating: 5,
                date: "2 ngày trước"
              },
              {
                name: "Chị Lan Hương",
                comment: "Dịch vụ rất chuyên nghiệp, đặt bàn qua website rất nhanh chóng. Món lẩu thái hải sản đậm đà, rất tươi.",
                rating: 5,
                date: "1 tuần trước"
              },
              {
                name: "Minh Quang",
                comment: "Nhân viên nhiệt tình, chu đáo. Đồ ăn ra nhanh và nóng hổi. Sẽ còn quay lại nhiều lần nữa!",
                rating: 5,
                date: "2 tuần trước"
              }
            ].map((rev, i) => (
              <div key={i} className="bg-zinc-50 rounded-[2.5rem] p-10 border border-zinc-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: rev.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-zinc-600 text-lg font-medium leading-relaxed mb-8 italic">
                  "{rev.comment}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center font-black text-primary">
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-zinc-900">{rev.name}</h4>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">{rev.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-6">
            <p className="text-zinc-500 font-medium">Bạn đã từng trải nghiệm tại Quán Ngon?</p>
            <Link 
              href="/reservation/history"
              className="px-12 py-5 bg-primary text-white rounded-2xl font-black text-xl hover:bg-orange-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/50 transition-all shadow-xl shadow-orange-500/30 active:scale-95 flex items-center gap-3"
            >
              GỬI ĐÁNH GIÁ CỦA BẠN
              <ArrowRight className="w-6 h-6" />
            </Link>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
              Đánh giá của bạn giúp chúng tôi hoàn thiện hơn mỗi ngày
            </p>
          </div>
        </div>
      </section>

      <Footer />
      <ChatbotWidget />
    </main>
  );
}


