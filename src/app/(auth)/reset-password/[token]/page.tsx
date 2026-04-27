"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Lock, ArrowRight, UtensilsCrossed, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        const error = await res.json();
        alert(error.error || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      alert("Lỗi kết nối server.");
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
          <div className="flex flex-col items-center mb-10 text-center">
            <Link href="/" className="flex items-center gap-2 mb-8 group">
              <div className="bg-blue-500 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform">
                <UtensilsCrossed className="text-white w-6 h-6" />
              </div>
              <span className="text-3xl font-black tracking-tight text-zinc-900">Quán Ngon</span>
            </Link>
            <h1 className="text-2xl font-black text-zinc-900">Đặt lại mật khẩu</h1>
            <p className="text-zinc-500 font-medium mt-2 text-sm">Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu mới"
                  required
                  className="w-full bg-zinc-50 border-2 border-transparent focus:border-blue-400/50 focus:bg-white rounded-2xl py-4 pl-14 pr-14 text-sm transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu mới"
                  required
                  className="w-full bg-zinc-50 border-2 border-transparent focus:border-blue-400/50 focus:bg-white rounded-2xl py-4 pl-14 pr-6 text-sm transition-all outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50 mt-4 active:scale-95"
              >
                {loading ? "ĐANG TIẾN HÀNH..." : "ĐỔI MẬT KHẨU"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-black text-zinc-900 mb-2">Thành công!</h3>
              <p className="text-zinc-500 text-sm mb-8">Mật khẩu của bạn đã được thay đổi. Đang quay lại trang đăng nhập...</p>
              <Link href="/login" className="text-blue-500 font-black hover:underline flex items-center justify-center gap-2">
                Đến trang đăng nhập
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
