import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReservationForm } from "@/components/ReservationForm";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { Utensils, CalendarCheck, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Đặt bàn - Quán Ngon",
  description: "Đặt bàn trực tuyến dễ dàng và nhanh chóng tại Quán Ngon.",
};

export default async function ReservationPage() {
  const session = await auth();
  
  const tables = await prisma.table.findMany({
    orderBy: { tableNumber: "asc" },
    select: { id: true, tableNumber: true, capacity: true, status: true },
  });

  return (
    <main className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-primary text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-secondary/20 mix-blend-overlay" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-secondary/30 border border-orange-400/40 rounded-full px-4 py-1.5 text-white text-xs font-bold mb-6 tracking-widest uppercase">
            <CalendarCheck className="w-3.5 h-3.5" />
            Trải nghiệm ẩm thực hoàn hảo
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            Đặt bàn <span className="text-white font-serif italic border-b-4 border-secondary pb-1">Trực Tuyến</span>
          </h1>
          <p className="text-orange-100 max-w-2xl mx-auto text-lg">
            Để đảm bảo có vị trí ngồi ưng ý nhất, quý khách vui lòng điền thông tin bên dưới. 
            Đội ngũ nhân viên sẽ liên hệ xác nhận trong giây lát.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-grow py-16 bg-orange-50/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left side: Information */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
                <h2 className="text-2xl font-black text-zinc-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                    <Utensils className="w-5 h-5" />
                  </div>
                  Tại sao nên đặt trước?
                </h2>
                
                <div className="space-y-6">
                  {[
                    { title: "Ưu tiên chỗ ngồi", desc: "Được sắp xếp view đẹp nhất và vị trí thoáng mát.", icon: ShieldCheck },
                    { title: "Phục vụ nhanh hơn", desc: "Đội ngũ bếp và phục vụ chuẩn bị sẵn sàng đón tiếp bạn.", icon: CalendarCheck },
                    { title: "Quản lý tiệc dễ dàng", desc: "Hỗ trợ trang trí và chuẩn bị thực đơn riêng cho các buổi tiệc.", icon: Utensils }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center mt-1">
                        <item.icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900">{item.title}</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary p-8 rounded-3xl text-white relative overflow-hidden group shadow-xl shadow-orange-600/20">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Utensils className="w-32 h-32" />
                </div>
                <h3 className="text-xl font-black mb-2">Hỗ trợ trực tiếp?</h3>
                <p className="font-bold opacity-80 mb-4">Gọi ngay hotline để được hỗ trợ nhanh nhất.</p>
                <div className="text-3xl font-black">0909 123 456</div>
              </div>
            </div>

            {/* Right side: Form */}
            <div className="lg:col-span-7">
              <div className="bg-white p-8 md:p-12 rounded-3xl border border-zinc-200 shadow-xl relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-black px-6 py-2 rounded-full tracking-widest uppercase shadow-lg shadow-orange-500/30">
                  Phiếu thông tin
                </div>
                <ReservationForm 
                  userId={session?.user?.id} 
                  defaultName={session?.user?.name || ""} 
                  tables={tables} 
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
      <ChatbotWidget />
    </main>
  );
}
