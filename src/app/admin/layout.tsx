import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PusherListener } from "@/components/admin/PusherListener";
import { ChefHat } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 ml-72">
        <header className="h-20 bg-white border-b border-zinc-100 flex items-center justify-between px-10 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <ChefHat className="w-5 h-5" />
            </div>
            <h1 className="font-black text-zinc-900 tracking-tight">
              Quản Lý Quán Ăn
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* 🚨 PM FIX: PusherListener — nhân viên không cần F5 để thấy đơn mới */}
            <PusherListener />

            <div className="w-px h-6 bg-zinc-200" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-zinc-900">
                  {(session.user as any)?.name ?? "Admin"}
                </p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Quản lý
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-black shadow-sm">
                {((session.user as any)?.name?.[0] ?? "A").toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
