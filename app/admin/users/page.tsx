"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";
import { api } from "@/lib/api";

type UserRole = "Customer" | "Photographer" | "Admin";
type UserStatus = "Active" | "Inactive" | "Pending";
type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  bookings: number;
  lastSeen: string;
  joined: string;
  avatar: string;
};

const statusStyles: Record<UserStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-700",
  Pending: "bg-amber-100 text-amber-700",
};

const roleStyles: Record<UserRole, string> = {
  Customer: "bg-[#eef2ff] text-[#4338ca]",
  Photographer: "bg-[#ecfdf5] text-[#166534]",
  Admin: "bg-[#fef2f2] text-[#b91c1c]",
};

const statusFilters: Array<"Tất cả" | UserStatus> = ["Tất cả", "Active", "Pending", "Inactive"];
const roleFilters: Array<"Tất cả" | UserRole> = ["Tất cả", "Customer", "Photographer", "Admin"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, photographers: 0 });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | UserStatus>("Tất cả");
  const [roleFilter, setRoleFilter] = useState<"Tất cả" | UserRole>("Tất cả");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [statusFilter, roleFilter]);

  async function loadUsers() {
    setLoading(true);
    try {
      const params: Record<string, any> = { page: 1, pageSize: 100 };
      if (statusFilter !== "Tất cả") params.status = statusFilter;
      if (roleFilter !== "Tất cả") params.role = roleFilter;

      const result = await api.users.getAll(params);
      if (result.success && result.data) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const result = await api.users.getStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const keyword = query.trim().toLowerCase();
        return (
          !keyword ||
          [user.name, user.email, user.id].some((value) =>
            value.toLowerCase().includes(keyword)
          )
        );
      }),
    [users, query]
  );

  function notify(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 2000);
  }

  function handleEdit(user: User) {
    setSelectedUser(user);
    setEditModalOpen(true);
  }

  async function handleDelete(userId: string) {
    if (!confirm("Bạn có chắc muốn vô hiệu hóa user này?")) return;

    try {
      const result = await api.users.delete(userId);
      if (result.success) {
        notify("Đã vô hiệu hóa user");
        loadUsers();
        loadStats();
      }
    } catch (error) {
      notify("Lỗi khi xóa user");
    }
  }

  return (
    <AdminLayout active="Người dùng">
      {toast && <Toast text={toast} />}
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#ff8d28]">
            Quản lý người dùng
          </p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-[#0f172a]">
            Danh sách tài khoản
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#596174]">
            Tìm kiếm, lọc và quản lý tất cả tài khoản khách hàng, photographer và quản trị viên.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#ff8d28] px-4 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(255,141,40,0.16)] transition hover:bg-[#f47f16]"
          >
            <AdminIcon name="add" className="h-4 w-4" />
            Thêm tài khoản
          </button>
          <IconButton label="Làm mới" icon="refresh" size="md" onClick={loadUsers} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng tài khoản"
          value={formatNumber(stats.total)}
          icon="user"
          description="Toàn bộ tài khoản"
        />
        <StatCard
          title="Đang hoạt động"
          value={formatNumber(stats.active)}
          icon="check"
          description="Người dùng hoạt động"
          tone="green"
        />
        <StatCard
          title="Photographer"
          value={formatNumber(stats.photographers)}
          icon="camera"
          description="Tài khoản nhiếp ảnh gia"
        />
        <StatCard
          title="Chờ phê duyệt"
          value={formatNumber(stats.pending)}
          icon="archive"
          description="Tài khoản cần xác thực"
          tone="neutral"
        />
      </div>

      <div className="mt-5">
        <section className="rounded-[28px] border border-[#e7e9f1] bg-white p-5 shadow-[0_14px_34px_rgba(12,18,32,0.05)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-[420px]">
              <AdminIcon
                name="search"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a93a5]"
              />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo tên, email hoặc mã người dùng"
                className="h-12 w-full rounded-2xl border border-[#dfe3ec] bg-[#f9fafc] px-12 text-sm text-[#0f172a] outline-none transition focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {statusFilters.map((status) => (
                <FilterButton
                  key={status}
                  active={statusFilter === status}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </FilterButton>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-[#596174]">
            <span className="rounded-full bg-[#f8fafc] px-3 py-2">
              {filteredUsers.length} kết quả
            </span>
            <span className="rounded-full bg-[#f8fafc] px-3 py-2">
              {roleFilter === "Tất cả" ? "Tất cả vai trò" : `Vai trò: ${roleFilter}`}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-[#697086]">Đang tải...</div>
          ) : (
            <>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-[13px]">
                  <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-[0.18em] text-[#596174]">
                    <tr>
                      <th className="py-4 pr-4 pl-5">Người dùng</th>
                      <th className="py-4 pr-4">Vai trò</th>
                      <th className="py-4 pr-4">Trạng thái</th>
                      <th className="py-4 pr-4 text-right">Booking</th>
                      <th className="py-4 pr-4">Ngày tham gia</th>
                      <th className="py-4 pr-5">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf0f5]">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="transition hover:bg-[#fff8ef]">
                        <td className="py-4 pr-4 pl-5">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400" />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#0f172a]">
                                {user.name}
                              </p>
                              <p className="truncate text-[#697086]">{user.email}</p>
                              <p className="mt-1 text-[11px] text-[#8a93a5]">{user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 align-middle">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
                              roleStyles[user.role]
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 pr-4 align-middle">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
                              statusStyles[user.status]
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-right font-semibold text-[#0f172a]">
                          {user.bookings}
                        </td>
                        <td className="py-4 pr-4 text-[#596174]">{user.joined}</td>
                        <td className="py-4 pr-5">
                          <div className="flex justify-end gap-2">
                            <IconButton
                              label="Sửa"
                              icon="edit"
                              size="sm"
                              onClick={() => handleEdit(user)}
                            />
                            <IconButton
                              label="Xóa"
                              icon="delete"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="mt-8 rounded-[26px] border border-dashed border-[#d6dce5] bg-[#f8fafc] p-8 text-center text-sm text-[#596174]">
                  Không tìm thấy người dùng phù hợp với bộ lọc.
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <CreateUserModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            loadUsers();
            loadStats();
            notify("Đã tạo user thành công");
          }}
        />
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setEditModalOpen(false);
            setSelectedUser(null);
            loadUsers();
            loadStats();
            notify("Đã cập nhật user thành công");
          }}
        />
      )}
    </AdminLayout>
  );
}

// Create User Modal
function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
    status: "active",
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await api.users.create(formData);
      if (result.success) {
        onSuccess();
      } else {
        alert(result.message || "Lỗi khi tạo user");
      }
    } catch (error) {
      alert("Lỗi khi tạo user");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tạo tài khoản mới</h2>
          <IconButton label="Đóng" icon="close" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Họ tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="0901234567"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="Ít nhất 6 ký tự"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Vai trò</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none"
              >
                <option value="customer">Customer</option>
                <option value="photographer">Photographer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {submitting ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit User Modal
function EditUserModal({
  user,
  onClose,
  onSuccess,
}: {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    full_name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role.toLowerCase(),
    status: user.status.toLowerCase(),
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await api.users.update(user.id, formData);
      if (result.success) {
        onSuccess();
      } else {
        alert(result.message || "Lỗi khi cập nhật user");
      }
    } catch (error) {
      alert("Lỗi khi cập nhật user");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Chỉnh sửa tài khoản</h2>
          <IconButton label="Đóng" icon="close" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Họ tên</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Vai trò</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none"
              >
                <option value="customer">Customer</option>
                <option value="photographer">Photographer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {submitting ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({
  title,
  value,
  description,
  icon,
  tone = "orange",
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
  tone?: "orange" | "green" | "neutral";
}) {
  const color =
    tone === "green"
      ? "bg-emerald-50 text-emerald-600"
      : tone === "neutral"
      ? "bg-slate-50 text-slate-700"
      : "bg-orange-50 text-orange-500";
  return (
    <div className="rounded-3xl border border-[#e7e9f1] bg-white p-5 shadow-[0_14px_34px_rgba(12,18,32,0.05)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#596174]">{title}</p>
          <p className="mt-3 text-[28px] font-semibold text-[#0f172a]">{value}</p>
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${color}`}>
          <AdminIcon name={icon as any} className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm text-[#697086]">{description}</p>
    </div>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-3 py-2 text-sm font-medium transition ${
        active
          ? "border-[#ff8d28] bg-[#fff3e8] text-[#ff8d28]"
          : "border-[#dfe3ec] bg-white text-[#536078] hover:border-[#ff8d28] hover:text-[#ff8d28]"
      }`}
    >
      {children}
    </button>
  );
}

function Toast({ text }: { text: string }) {
  return (
    <div className="fixed right-6 top-20 z-50 rounded-xl border bg-white px-4 py-3 font-medium text-emerald-700 shadow-xl">
      {text}
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}
