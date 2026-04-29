"use client";

import { useState } from "react";
import { 
  Star, 
  MessageSquare, 
  Calendar, 
  User, 
  ChevronRight,
  TrendingUp,
  ThumbsUp,
  MessageCircle,
  Clock,
  Search
} from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  order: {
    id: string;
    table: {
      tableNumber: number;
    };
    items: {
      menuItem: {
        name: string;
      };
    }[];
  };
}

export default function ReviewsClient({ initialReviews }: { initialReviews: Review[] }) {
  const [search, setSearch] = useState("");
  
  const averageRating = initialReviews.length > 0 
    ? (initialReviews.reduce((sum, r) => sum + r.rating, 0) / initialReviews.length).toFixed(1)
    : "0.0";

  const filteredReviews = initialReviews.filter(r => 
    r.comment?.toLowerCase().includes(search.toLowerCase()) ||
    r.order.items.some(i => i.menuItem.name.toLowerCase().includes(search.toLowerCase()))
  );

  const getStarArray = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  };

  return (
    <div className="space-y-8 font-sans pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-blue-50 flex items-center justify-center">
            <MessageSquare className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Đánh giá & Phản hồi</h2>
            <p className="text-zinc-500 font-medium">Lắng nghe ý kiến từ khách hàng để cải thiện dịch vụ.</p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-white px-8 py-4 rounded-[24px] border border-zinc-100 shadow-sm">
           <div className="text-center border-r border-zinc-100 pr-6">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Trung bình</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-zinc-900">{averageRating}</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
           </div>
           <div className="text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tổng số</p>
              <p className="text-2xl font-black text-zinc-900">{initialReviews.length}</p>
           </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Tìm kiếm nội dung đánh giá hoặc tên món ăn..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-zinc-100 rounded-3xl py-5 pl-16 pr-6 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-[40px] border border-zinc-100 p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {getStarArray(review.rating).map((active, i) => (
                      <Star key={i} className={`w-5 h-5 ${active ? "fill-amber-400 text-amber-400" : "text-zinc-100"}`} />
                    ))}
                  </div>
                  <span className="text-zinc-300">•</span>
                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>

                <p className="text-lg font-bold text-zinc-800 leading-relaxed italic">
                  "{review.comment || "Khách hàng không để lại lời nhắn."}"
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {review.order.items.map((item, i) => (
                    <span key={i} className="px-3 py-1 bg-zinc-50 rounded-lg text-[10px] font-black text-zinc-500 uppercase tracking-tight">
                      {item.menuItem.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:w-64 space-y-4 border-l border-zinc-50 md:pl-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mã hóa đơn</p>
                  <p className="text-xs font-bold text-zinc-900 truncate">#{review.order.id.split('-')[0]}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Bàn phục vụ</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black">
                      {review.order.table.tableNumber}
                    </div>
                    <span className="text-xs font-bold text-zinc-600">Khu vực sảnh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="py-20 text-center bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-100">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <MessageCircle className="w-10 h-10 text-zinc-200" />
            </div>
            <p className="text-zinc-400 font-bold">Chưa có đánh giá nào phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
}
