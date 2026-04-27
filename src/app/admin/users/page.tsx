"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Search, Shield, User as UserIcon, Trash2, Mail, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("STAFF");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (error) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Đã tạo người dùng mới");
        setShowAddModal(false);
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        fetchUsers();
      } else {
        toast.error(data.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Lỗi kết nối server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-amber-500" />
            Quản Lý Người Dùng
          </h2>
          <p className="text-zinc-500 font-medium mt-1">Quản lý tài khoản ADMIN và STAFF của hệ thống.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-amber-500 text-white font-black px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-md shadow-amber-500/20 active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          THÊM NHÂN VIÊN
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-zinc-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            className="w-full bg-zinc-50 border-2 border-transparent focus:border-amber-400/50 focus:bg-white rounded-2xl py-3 pl-14 pr-6 text-sm transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-8 rounded-[40px] border border-zinc-100 animate-pulse">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-zinc-100 rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-zinc-100 rounded" />
                  <div className="h-3 w-32 bg-zinc-100 rounded" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 w-full bg-zinc-50 rounded" />
                <div className="h-3 w-2/3 bg-zinc-50 rounded" />
              </div>
            </div>
          ))
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${
                    user.role === "ADMIN" ? "bg-amber-100 text-amber-600" : "bg-zinc-100 text-zinc-600"
                  }`}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-zinc-900 group-hover:text-amber-600 transition-colors">{user.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {user.role === "ADMIN" ? (
                        <span className="flex items-center gap-1 text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          <Shield className="w-3 h-3" /> ADMIN
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          <UserIcon className="w-3 h-3" /> STAFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-50">
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  {user.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  Tham gia: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </div>
              </div>

              {user.role !== "ADMIN" && (
                <div className="mt-6 flex justify-end">
                  <button className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-20 rounded-[48px] border-2 border-dashed border-zinc-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-zinc-300" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Không tìm thấy người dùng</h3>
            <p className="text-zinc-500 max-w-sm">Thử thay đổi từ khóa tìm kiếm hoặc thêm nhân viên mới.</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10 pointer-events-auto">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-10 md:p-12">
              <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <UserPlus className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-2xl font-black text-zinc-900">Thêm nhân viên mới</h3>
                <p className="text-zinc-500 font-medium">Tạo tài khoản để nhân viên truy cập dashboard.</p>
              </div>

              <form onSubmit={handleAddUser} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Họ tên</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-zinc-50 border-2 border-transparent focus:border-amber-400/50 focus:bg-white rounded-2xl py-4 px-6 text-sm transition-all outline-none"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Vai trò</label>
                    <select
                      className="w-full bg-zinc-50 border-2 border-transparent focus:border-amber-400/50 focus:bg-white rounded-2xl py-4 px-6 text-sm transition-all outline-none appearance-none cursor-pointer font-bold"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                    >
                      <option value="STAFF">NHÂN VIÊN (STAFF)</option>
                      <option value="ADMIN">QUẢN TRỊ (ADMIN)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="staff@quanngon.vn"
                    className="w-full bg-zinc-50 border-2 border-transparent focus:border-amber-400/50 focus:bg-white rounded-2xl py-4 px-6 text-sm transition-all outline-none"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Mật khẩu ban đầu</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 border-2 border-transparent focus:border-amber-400/50 focus:bg-white rounded-2xl py-4 px-6 text-sm transition-all outline-none"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-zinc-100 text-zinc-600 font-black py-4 rounded-2xl hover:bg-zinc-200 transition-all active:scale-95"
                  >
                    HỦY
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] bg-amber-500 text-white font-black py-4 rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? "ĐANG TẠO..." : "TẠO TÀI KHOẢN"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
