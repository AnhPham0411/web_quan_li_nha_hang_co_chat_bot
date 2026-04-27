"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  TableProperties,
  CalendarCheck,
  LogOut,
  ChefHat,
  Package,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Users } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Gọi món", icon: Package },
  { href: "/admin/tables", label: "Sơ đồ bàn", icon: TableProperties },
  { href: "/admin/menu", label: "Thực đơn", icon: UtensilsCrossed },
  { href: "/admin/reservations", label: "Đặt bàn", icon: CalendarCheck },
  { href: "/admin/users", label: "Người dùng", icon: Users, adminOnly: true },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const filteredNavItems = navItems.filter(item => !item.adminOnly || role === "ADMIN");

  return (
    <aside className="w-72 bg-zinc-900 min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-black text-white tracking-tight text-lg leading-none">
              Quản Lý Quán
            </p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
              Restaurant Admin
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredNavItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
