"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, UtensilsCrossed, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setSuccess(true);
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
            <h1 className="text-2xl font-black text-zinc-900">Khôi phục mật khẩu</h1>
            <p className="text-zinc-500 font-medium mt-2 text-sm">Nhập email đăng ký, chúng tôi sẽ gửi liên kết khôi phục cho bạn.</p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="email"
                  placeholder="Email của bạn"
                  required
                  className="w-full bg-zinc-50 border-2 border-transparent focus:border-blue-400/50 focus:bg-white rounded-2xl py-4 pl-14 pr-6 text-sm transition-all outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50 mt-4 active:scale-95"
              >
                {loading ? "ĐANG GỬI..." : "GỬI LIÊN KẾT"}
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
              <h3 className="text-lg font-black text-zinc-900 mb-2">Đã gửi liên kết!</h3>
              <p className="text-zinc-500 text-sm mb-8">Vui lòng kiểm tra hộp thư email của bạn (bao gồm cả thư mục Spam) và làm theo hướng dẫn.</p>
              <Link href="/login" className="text-blue-500 font-black hover:underline flex items-center justify-center gap-2">
                Quay lại đăng nhập
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}

          {!success && (
            <p className="text-center text-zinc-500 text-sm mt-10 font-medium">
              Nhớ ra mật khẩu?{" "}
              <Link href="/login" className="text-blue-500 hover:underline font-black">
                Đăng nhập
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </main>
  );
}
