import { prisma } from "@/lib/prisma";
import MenuClient from "./MenuClient";
import Link from "next/link";
import { UtensilsCrossed, ChefHat, Loader2, Star, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Suspense } from "react";

export const metadata = {
  title: "Thực đơn - Quán Ngon",
  description: "Khám phá danh sách món ăn đa dạng tại Quán Ngon. Ẩm thực Việt truyền thống đậm đà bản sắc.",
};

export default async function MenuPage() {
  const menuItems = await prisma.menuItem.findMany({
    where: { isAvailable: true },
    orderBy: [{ isFeatured: "desc" }, { category: "asc" }, { name: "asc" }],
  });

  const categories = Array.from(new Set(menuItems.map((item) => item.category)));
  
  const tables = await prisma.table.findMany({
    select: { id: true, tableNumber: true, status: true },
    orderBy: { tableNumber: 'asc' }
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero Content */}
      <section className="bg-zinc-900 text-white py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
        <div className="relative container mx-auto">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
              Thực Đơn <br />
              <span className="text-secondary">Tinh Hoa Ẩm Thực</span>
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed">
              Mỗi món ăn là một câu chuyện, được chọn lọc từ những nguyên liệu tươi sạch nhất để mang đến hương vị Việt thuần khiết.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 md:px-12 py-16 flex-grow">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-14 h-14 bg-orange-50 rounded-[1.5rem] flex items-center justify-center border border-orange-100">
            <UtensilsCrossed className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight uppercase">Khám phá món ngon</h2>
            <p className="text-zinc-500 font-medium">Lọc theo danh mục để tìm món ăn yêu thích của bạn.</p>
          </div>
        </div>

        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-400 font-bold">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            Đang tải thực đơn...
          </div>
        }>
          <MenuClient 
            items={JSON.parse(JSON.stringify(menuItems))} 
            categories={categories} 
            tables={tables}
          />
        </Suspense>
      </main>

      {/* CTA Box */}
      <section className="container mx-auto px-6 mb-20">
        <div className="bg-zinc-900 rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 p-8 opacity-5">
             <ChefHat className="w-64 h-64 text-white" />
          </div>
          <h4 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tight relative z-10">
            Bạn đã chọn được món ưng ý?
          </h4>
          <p className="text-zinc-400 mb-10 max-w-md mx-auto font-medium relative z-10">
            Đặt bàn ngay hôm nay để nhận được sự phục vụ tốt nhất từ đội ngũ nhân viên Quán Ngon.
          </p>
          <Link
            href="/reservation"
            className="inline-flex bg-primary text-white font-black px-12 py-5 rounded-2xl hover:bg-orange-700 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-orange-500/20 relative z-10 uppercase tracking-widest text-sm"
          >
            ĐẶT BÀN NGAY
          </Link>
        </div>
      </section>

      {/* === REVIEWS SECTION === */}
      <section className="py-24 bg-white relative overflow-hidden border-t border-zinc-100">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.2em] mb-4">
              <Star className="w-4 h-4 fill-primary" />
              Đánh giá từ thực khách
            </div>
            <h2 className="text-4xl font-black text-zinc-900 leading-tight">
              Khách hàng nói gì về <br/>
              <span className="text-primary font-serif italic">Quán Ngon?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
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
              <div key={i} className="bg-zinc-50 rounded-[2rem] p-8 border border-zinc-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rev.rating }).map((_, j) => (
                    <Star key={j} className="w-3 h-3 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-zinc-600 font-medium leading-relaxed mb-6 italic">
                  "{rev.comment}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center font-black text-primary text-sm">
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-zinc-900 text-sm">{rev.name}</h4>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{rev.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-6">
            <Link 
              href="/reservation/history"
              className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-lg hover:bg-orange-700 hover:-translate-y-1 hover:shadow-2xl transition-all shadow-xl shadow-orange-500/30 flex items-center gap-3"
            >
              GỬI ĐÁNH GIÁ CỦA BẠN
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
