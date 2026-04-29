"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Star, ShoppingCart, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: any;
  imageUrl: string | null;
  category: string;
  stockQuantity: number;
  isAvailable: boolean;
  isFeatured: boolean;
}

interface MenuClientProps {
  items: MenuItem[];
  categories: string[];
  tables: Array<{ id: string, tableNumber: number, status: string }>;
}

export default function MenuClient({ items, categories, tables }: MenuClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showTableSelect, setShowTableSelect] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const itemId = searchParams.get("itemId");
    if (itemId) {
      const item = items.find(i => i.id === itemId);
      if (item) {
        setSelectedItem(item);
      }
    }
  }, [searchParams, items]);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tất cả" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoriesWithAll = ["Tất cả", ...categories];

  return (
    <div className="space-y-10">
      {/* Search and Categories */}
      <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-xl p-4 -mx-4 rounded-3xl shadow-sm border border-zinc-100 flex flex-col gap-6">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm kiếm món ăn ngon..."
            className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/50 focus:bg-white rounded-2xl py-4 pl-14 pr-6 text-sm transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {categoriesWithAll.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-black whitespace-nowrap transition-all active:scale-95 ${
                selectedCategory === cat
                  ? "bg-primary text-white shadow-lg shadow-orange-500/20"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group cursor-pointer"
            >
              <div className="h-48 bg-zinc-100 overflow-hidden relative">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl group-hover:rotate-12 transition-transform duration-300">
                    🍜
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-xs font-black flex items-center gap-1.5 translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Info className="w-4 h-4" /> XEM CHI TIẾT
                  </span>
                </div>

                {item.isFeatured && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                    <Star className="w-3 h-3 fill-white" />
                    ĐẶC BIỆT
                  </div>
                )}
                
                <div className="absolute top-4 right-4 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                   <div className="w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center shadow-lg text-primary">
                     <ShoppingCart className="w-5 h-5" />
                   </div>
                </div>

                {item.stockQuantity <= 3 && item.stockQuantity > 0 && (
                  <div className="absolute bottom-4 left-4 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg">
                    CHỈ CÒN {item.stockQuantity} SUẤT
                  </div>
                )}
                
                {item.stockQuantity === 0 && (
                  <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="text-white font-black text-sm bg-red-600 px-4 py-1.5 rounded-full shadow-xl">
                      HẾT HÀNG
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-1">
                <div className="flex items-start justify-between">
                  <h4 className="font-black text-zinc-900 leading-tight group-hover:text-primary transition-colors">
                    {item.name}
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 min-h-[32px]">{item.description}</p>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-lg font-black text-primary">
                    {Number(item.price).toLocaleString("vi-VN")}đ
                  </span>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-100">
                    {item.category}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-32 bg-zinc-50 rounded-[48px] border-2 border-dashed border-zinc-200">
          <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-8">
            <Filter className="w-10 h-10 text-zinc-200" />
          </div>
          <h3 className="text-2xl font-black text-zinc-900 mb-2">Không tìm thấy món bạn cần</h3>
          <p className="text-zinc-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm khác nhé!</p>
        </div>
      )}

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-md"
              onClick={() => setSelectedItem(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg hover:rotate-90 transition-transform duration-300"
              >
                <X className="w-6 h-6 text-zinc-900" />
              </button>

              {/* Modal Image */}
              <div className="w-full md:w-1/2 h-64 md:h-auto bg-zinc-100 relative">
                {selectedItem.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    🍜
                  </div>
                )}
                {selectedItem.isFeatured && (
                  <div className="absolute top-8 left-8 bg-blue-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-xl">
                    MÓN ĐẶC BIỆT
                  </div>
                )}
              </div>

              {/* Modal Content */}
              <div className="w-full md:w-1/2 p-10 md:p-14 overflow-y-auto">
                <div className="inline-block px-3 py-1 bg-orange-50 text-primary text-[10px] font-black tracking-widest uppercase rounded-full mb-4">
                  {selectedItem.category}
                </div>
                <h3 className="text-4xl font-black text-zinc-900 mb-6 leading-tight">
                  {selectedItem.name}
                </h3>
                
                <div className="space-y-6">
                  <p className="text-zinc-500 text-lg leading-relaxed">
                    {selectedItem.description || "Hương vị truyền thống được chế biến từ những nguyên liệu tươi ngon nhất trong ngày, mang đến trải nghiệm ẩm thực khó quên."}
                  </p>

                  <div className="flex items-center gap-6 py-8 border-y border-zinc-50">
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Giá bán</p>
                      <p className="text-3xl font-black text-primary">
                        {Number(selectedItem.price).toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Số lượng còn</p>
                      <p className={`text-3xl font-black ${selectedItem.stockQuantity > 0 ? "text-zinc-900" : "text-red-500"}`}>
                        {selectedItem.stockQuantity > 0 ? selectedItem.stockQuantity : "Hết hàng"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <button
                      onClick={() => setShowTableSelect(true)}
                      className="w-full bg-zinc-900 text-white font-black py-5 rounded-3xl text-lg hover:bg-amber-500 transition-all shadow-xl shadow-zinc-900/10 active:scale-95"
                    >
                      GỌI MÓN TẠI BÀN (NHANH)
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(null);
                        window.location.href = "/reservation";
                      }}
                      className="w-full bg-primary text-white font-black py-5 rounded-3xl text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-500/30 active:scale-95"
                    >
                      ĐẶT BÀN TRƯỚC
                    </button>
                    <p className="text-center text-xs text-zinc-400 font-medium">Bạn có thể đặt trước để đảm bảo còn món nhé!</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Table Selection Modal for Demo */}
      <AnimatePresence>
        {showTableSelect && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm"
              onClick={() => setShowTableSelect(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] shadow-2xl relative overflow-hidden p-10 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-black text-zinc-900 mb-2">Bạn đang ngồi ở bàn nào?</h3>
              <p className="text-zinc-500 text-sm mb-8 font-medium">Chọn bàn của bạn để bắt đầu gọi món ngay nhé.</p>
              
              <div className="grid grid-cols-3 gap-3 mb-10">
                {tables.map((t) => (
                  <a
                    key={t.id}
                    href={`/order/${t.id}`}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 group ${
                      t.status === "SERVING" 
                        ? "bg-red-50 border-red-100" 
                        : t.status === "BOOKED"
                        ? "bg-amber-50 border-amber-100"
                        : t.status === "CLEANING"
                        ? "bg-zinc-50 border-zinc-100 opacity-50 cursor-not-allowed"
                        : "bg-slate-50 border-transparent hover:border-primary hover:bg-white"
                    }`}
                  >
                    <span className={`text-lg font-black ${
                      t.status === "SERVING" ? "text-red-500" : 
                      t.status === "BOOKED" ? "text-amber-600" : 
                      "text-zinc-900"
                    }`}>
                      #{t.tableNumber}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                      {t.status === "SERVING" ? "BẬN" : 
                       t.status === "BOOKED" ? "ĐÃ ĐẶT" : 
                       t.status === "CLEANING" ? "DỌN DẸP" : "TRỐNG"}
                    </span>
                  </a>
                ))}
              </div>

              <button
                onClick={() => setShowTableSelect(false)}
                className="w-full py-4 text-sm font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
              >
                Hủy bỏ
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
