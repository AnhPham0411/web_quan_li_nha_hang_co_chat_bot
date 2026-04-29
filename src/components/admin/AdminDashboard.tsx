"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { TrendingUp, Users, Calendar, ArrowUpRight } from "lucide-react";

interface AdminDashboardProps {
  reservationStats: {
    date: string;
    count: number;
    revenue: number;
  }[];
  tableStats: {
    name: string;
    value: number;
    color: string;
  }[];
}

import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher-client";
import { useRouter } from "next/navigation";

export function AdminDashboard({ reservationStats, tableStats }: AdminDashboardProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!pusherClient) return;

    const channel = pusherClient.subscribe("admin-channel");
    
    channel.bind("table-updated", () => {
      // Khi có bàn update (checkout xong), refresh dữ liệu để cập nhật doanh thu
      router.refresh();
    });

    return () => {
      pusherClient.unsubscribe("admin-channel");
    };
  }, [router]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
      {/* Reservation Chart */}
      <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Doanh thu & Đặt bàn (7 ngày qua)
            </h3>
            <p className="text-xs text-zinc-400 font-medium mt-1">Xu hướng kinh doanh thực tế</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Doanh thu</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Đặt bàn</span>
             </div>
          </div>
        </div>

        <div className="h-[300px] w-full min-h-[300px]">
          {isMounted && (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={reservationStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#10b981', fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(value) => `${value/1000}k`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#3b82f6', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 12 }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontWeight: 'bold'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === "revenue") return [formatCurrency(value), "Doanh thu"];
                    if (name === "count") return [value, "Lượt đặt"];
                    return [value, name];
                  }}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="revenue" 
                  fill="#10b981" 
                  radius={[8, 8, 0, 0]} 
                  barSize={24}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="count" 
                  fill="#3b82f6" 
                  radius={[8, 8, 0, 0]} 
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Table Status Pie Chart */}
      <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm flex flex-col">
        <div className="mb-8">
          <h3 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Tỷ lệ bàn
          </h3>
          <p className="text-xs text-zinc-400 font-medium mt-1">Phân bổ trạng thái hiện tại</p>
        </div>

        <div className="flex-1 min-h-[250px] relative">
          {isMounted && (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={tableStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {tableStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-2xl font-black text-zinc-900">
                {tableStats.reduce((a, b) => a + b.value, 0)}
              </p>
              <p className="text-[10px] font-black text-zinc-400 uppercase">Tổng bàn</p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-2">
          {tableStats.map((stat) => (
            <div key={stat.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                <span className="text-xs font-black text-zinc-500 uppercase tracking-tighter">{stat.name}</span>
              </div>
              <span className="text-xs font-black text-zinc-900">{stat.value} bàn</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
