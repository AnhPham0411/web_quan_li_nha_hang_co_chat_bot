"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, Send, CheckCircle2, Loader2 } from "lucide-react";

export default function ReviewPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const router = useRouter();

  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if order exists and is paid
    const checkOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error("Không tìm thấy đơn hàng");
        const data = await res.json();
        
        // Cho phép đánh giá nếu đơn đã phục vụ xong hoặc đã thanh toán
        const allowStatus = ["SERVED", "PAID"];
        if (!allowStatus.includes(data.status)) {
          setError("Bạn hãy trải nghiệm món ăn xong rồi hãy để lại đánh giá nhé! Lúc này bếp vẫn đang chuẩn bị hoặc món đang trên đường ra bàn của bạn. (Trạng thái: " + data.status + ")");
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải thông tin đơn hàng.");
      } finally {
        setIsLoading(false);
      }
    };
    checkOrder();
  }, [orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, rating, comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl p-10 text-center animate-fade-in border border-zinc-100 dark:border-zinc-800">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Cảm ơn bạn rất nhiều!</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            Đánh giá của bạn giúp quán ngày càng hoàn thiện hơn. Chúc bạn một ngày tuyệt vời!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
        <div className="p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-2xl">
              🍜
            </div>
            <div>
              <h1 className="text-xl font-black text-zinc-900 dark:text-white leading-none">Quán Ngon</h1>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mt-1">Đánh giá dịch vụ</p>
            </div>
          </div>

          {error ? (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl text-sm font-bold border border-red-100 dark:border-red-500/20 mb-6">
              {error}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="text-center">
                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-4">
                  Bạn thấy món ăn hôm nay thế nào?
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`transition-all duration-300 transform ${
                        (hover || rating) >= star ? "scale-110" : "scale-100 opacity-30"
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                    >
                      <Star
                        className={`w-10 h-10 ${
                          (hover || rating) >= star
                            ? "fill-primary text-primary"
                            : "text-zinc-300 dark:text-zinc-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs font-black text-primary uppercase">
                  {rating === 5 && "Tuyệt vời! 😍"}
                  {rating === 4 && "Rất ngon! 😊"}
                  {rating === 3 && "Tạm ổn 👌"}
                  {rating === 2 && "Cần cải thiện 😕"}
                  {rating === 1 && "Không hài lòng 😢"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">
                  Lời nhắn gửi quán
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Món ăn ngon, nhân viên nhiệt tình..."
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-3xl p-6 text-sm font-medium focus:ring-2 focus:ring-primary dark:text-white outline-none min-h-[120px] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-[24px] py-4 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Gửi đánh giá
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
