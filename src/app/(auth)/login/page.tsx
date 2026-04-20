"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, ArrowRight, UtensilsCrossed, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered")) {
      setRegistered(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        throw new Error("Thông tin đăng nhập không chính xác");
      }

      const callbackUrl = searchParams.get("callbackUrl") || "/admin";
      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white p-10 md:p-12 rounded-[48px] shadow-2xl relative overflow-hidden">
          <div className="flex flex-col items-center mb-10">
            <Link href="/" className="flex items-center gap-2 mb-8 group">
              <div className="bg-amber-500 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform">
                <UtensilsCrossed className="text-white w-6 h-6" />
              </div>
              <span className="text-3xl font-black tracking-tight text-zinc-900">Quán Ngon</span>
            </Link>
            <h1 className="text-2xl font-black text-zinc-900">Đăng nhập</h1>
            <p className="text-zinc-500 font-medium mt-2">Dành cho Khách hàng & Nhân viên</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {registered && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-600 text-sm flex items-center gap-3 font-bold"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>Đăng ký thành công! Hãy đăng nhập ngay.</span>
              </motion.div>
            )}
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm font-bold">
                {error}
              </div>
            )}

            <div className="space-y-4">
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
                  placeholder="Mật khẩu"
                  required
                  className="w-full bg-zinc-50 border-2 border-transparent focus:border-amber-400/50 focus:bg-white rounded-2xl py-4 pl-14 pr-6 text-sm transition-all outline-none"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm font-semibold text-zinc-500 hover:text-amber-500 transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-600 transition-all disabled:opacity-50 mt-4 active:scale-95"
            >
              {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <p className="text-center text-zinc-500 text-sm mt-10 font-medium">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-amber-500 hover:underline font-black">
              Đăng ký
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
