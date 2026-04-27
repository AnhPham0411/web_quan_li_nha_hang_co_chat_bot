import { prisma } from "@/lib/prisma";
import MenuClient from "./MenuClient";
import Link from "next/link";
import { UtensilsCrossed, ChefHat } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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

        <MenuClient 
          items={JSON.parse(JSON.stringify(menuItems))} 
          categories={categories} 
          tables={tables}
        />
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

      <Footer />
    </div>
  );
}
