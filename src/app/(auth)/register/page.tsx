"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Lock, ArrowRight, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      const callbackUrl = searchParams.get("callbackUrl");
      const redirectUrl = `/login?registered=true${callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`;
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-blue-50/50 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white p-10 md:p-12 rounded-[48px] shadow-2xl shadow-blue-900/10 relative overflow-hidden">
          <div className="flex flex-col items-center mb-10">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="bg-blue-600 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-blue-200">
                <UtensilsCrossed className="text-white w-6 h-6" />
              </div>
              <span className="text-3xl font-black tracking-tight text-zinc-900">Quán Ngon</span>
            </Link>
            <h1 className="text-2xl font-black text-zinc-900">Tạo tài khoản</h1>
            <p className="text-zinc-500 font-medium mt-2">Đăng ký để nhận ưu đãi từ Quán Ngon</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm font-bold">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Họ và tên"
                  required
                  className="w-full bg-zinc-50 border-2 border-transparent focus:border-amber-400/50 focus:bg-white rounded-2xl py-4 pl-14 pr-6 text-sm transition-all outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full bg-zinc-50 border-2 border-transparent focus:border-amber-400/50 focus:bg-white rounded-2xl py-4 pl-14 pr-6 text-sm transition-all outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="password"
                  placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                  required
                  minLength={6}
                  className="w-full bg-zinc-50 border-2 border-transparent focus:border-amber-400/50 focus:bg-white rounded-2xl py-4 pl-14 pr-6 text-sm transition-all outline-none"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 mt-4 active:scale-95 shadow-xl shadow-blue-600/20"
            >
              {loading ? "ĐANG TẠO..." : "ĐĂNG KÝ"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <p className="text-center text-zinc-500 text-sm mt-10 font-medium">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-black">
              Đăng nhập
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
