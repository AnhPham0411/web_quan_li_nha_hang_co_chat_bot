"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Plus, Loader2, Package, PackageX } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string;
  stockQuantity: number;
  isAvailable: boolean;
  isFeatured: boolean;
}

const CATEGORIES = ["Khai vị", "Món chính", "Lẩu & Nướng", "Cơm & Bún", "Tráng miệng", "Đồ uống"];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  category: "Món chính",
  stockQuantity: "10",
  isAvailable: true,
  isFeatured: false,
};

export function MenuClient({ initialItems }: { initialItems: MenuItem[] }) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [isPending, startTransition] = useTransition();

  const filtered =
    activeCategory === "Tất cả"
      ? items
      : items.filter((i) => i.category === activeCategory);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      imageUrl: item.imageUrl ?? "",
      category: item.category,
      stockQuantity: String(item.stockQuantity),
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
    });
    setShowForm(true);
  };

  const submitForm = () => {
    startTransition(async () => {
      const payload = {
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        imageUrl: form.imageUrl || null,
        category: form.category,
        stockQuantity: Number(form.stockQuantity),
        isAvailable: form.isAvailable,
        isFeatured: form.isFeatured,
      };

      if (editing) {
        const res = await fetch(`/api/menu/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { item } = await res.json();
          setItems((prev) => prev.map((i) => (i.id === editing.id ? { ...i, ...item, price: Number(item.price) } : i)));
        }
      } else {
        const res = await fetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { item } = await res.json();
          setItems((prev) => [{ ...item, price: Number(item.price) }, ...prev]);
        }
      }
      setShowForm(false);
    });
  };

  const toggleAvailable = async (item: MenuItem) => {
    const res = await fetch(`/api/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !item.isAvailable }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isAvailable: !item.isAvailable } : i))
      );
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Xóa món này?")) return;
    const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div>
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["Tất cả", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              activeCategory === cat
                ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                : "bg-white border border-zinc-200 text-zinc-600 hover:border-amber-300"
            }`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={openAdd}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Thêm món
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
              item.isAvailable ? "border-zinc-100" : "border-zinc-200 opacity-60"
            }`}
          >
            {/* Image */}
            <div className="h-36 bg-zinc-100 relative overflow-hidden">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  🍜
                </div>
              )}
              <div className="absolute top-2 left-2 flex gap-1">
                {item.isFeatured && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ⭐ Đặc biệt
                  </span>
                )}
                {!item.isAvailable && (
                  <span className="bg-zinc-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Hết hàng
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-black text-zinc-900 text-sm leading-tight">{item.name}</h3>
                <span className="text-xs font-bold text-amber-600 whitespace-nowrap">
                  {item.price.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                {item.category}
              </span>

              {/* Stock indicator — PM FIX */}
              <div className="flex items-center gap-1.5 mt-2">
                {item.stockQuantity > 0 ? (
                  <Package className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <PackageX className="w-3.5 h-3.5 text-red-500" />
                )}
                <span
                  className={`text-xs font-bold ${
                    item.stockQuantity === 0
                      ? "text-red-500"
                      : item.stockQuantity <= 3
                      ? "text-amber-500"
                      : "text-emerald-600"
                  }`}
                >
                  Còn {item.stockQuantity} suất
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => toggleAvailable(item)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    item.isAvailable
                      ? "border-red-200 text-red-600 hover:bg-red-50"
                      : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  {item.isAvailable ? "Tạm hết" : "Mở bán"}
                </button>
                <button
                  onClick={() => openEdit(item)}
                  className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-zinc-900 mb-5">
              {editing ? "Sửa món ăn" : "Thêm món mới"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-zinc-700 block mb-1">Tên món *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="VD: Bò Wagyu nướng"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-zinc-700 block mb-1">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-zinc-700 block mb-1">Giá (VNĐ) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-zinc-700 block mb-1">
                    Số suất còn
                  </label>
                  <input
                    type="number"
                    value={form.stockQuantity}
                    onChange={(e) => setForm((p) => ({ ...p, stockQuantity: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-zinc-700 block mb-1">Danh mục</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-zinc-700 block mb-1">URL ảnh</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(e) => setForm((p) => ({ ...p, isAvailable: e.target.checked }))}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <span className="text-sm font-bold text-zinc-700">Đang bán</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <span className="text-sm font-bold text-zinc-700">⭐ Đặc biệt</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              >
                Hủy
              </button>
              <button
                onClick={submitForm}
                disabled={isPending || !form.name || !form.price}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Lưu thay đổi" : "Thêm món"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
