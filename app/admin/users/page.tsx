"use client";

import { useMemo, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";

type UserRole = "Customer" | "Photographer" | "Admin";
type UserStatus = "Active" | "Inactive" | "Pending";
type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  bookings: number;
  lastSeen: string;
  joined: string;
  avatar: string;
};

const users: User[] = [
  { id: "U-1001", name: "Nguyễn Hoàng Nam", email: "nam.nguyen@example.com", role: "Customer", status: "Active", bookings: 12, lastSeen: "15 phút trước", joined: "2024-02-14", avatar: "/Overlay+Shadow.png" },
  { id: "U-1002", name: "Trần Thu Hà", email: "ha.tran@example.com", role: "Photographer", status: "Pending", bookings: 8, lastSeen: "1 giờ trước", joined: "2024-07-04", avatar: "/logo_sudion.jpg" },
  { id: "U-1003", name: "Lê Quang Huy", email: "huy.le@example.com", role: "Customer", status: "Active", bookings: 4, lastSeen: "3 giờ trước", joined: "2024-08-22", avatar: "/screen%201.png" },
  { id: "U-1004", name: "Phạm Thanh Tâm", email: "tam.pham@example.com", role: "Admin", status: "Active", bookings: 0, lastSeen: "Vừa xong", joined: "2023-11-10", avatar: "/Overlay+Border+Shadow.png" },
  { id: "U-1005", name: "Vũ Minh Anh", email: "anh.vu@example.com", role: "Photographer", status: "Inactive", bookings: 21, lastSeen: "2 ngày trước", joined: "2023-12-18", avatar: "/Overlay+Shadow.png" },
  { id: "U-1006", name: "Lê Phương Anh", email: "anh.le@example.com", role: "Customer", status: "Active", bookings: 16, lastSeen: "20 phút trước", joined: "2024-04-01", avatar: "/logo_sudion.jpg" },
  { id: "U-1007", name: "Nguyễn Thị Mai", email: "mai.nguyen@example.com", role: "Customer", status: "Pending", bookings: 3, lastSeen: "5 giờ trước", joined: "2024-10-30", avatar: "/screen%201.png" },
  { id: "U-1008", name: "Đặng Quốc Bảo", email: "bao.dang@example.com", role: "Photographer", status: "Active", bookings: 29, lastSeen: "30 phút trước", joined: "2024-01-22", avatar: "/Overlay+Border+Shadow.png" },
];

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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | UserStatus>("Tất cả");
  const [roleFilter, setRoleFilter] = useState<"Tất cả" | UserRole>("Tất cả");

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const keyword = query.trim().toLowerCase();
        const matchesSearch =
          !keyword ||
          [user.name, user.email, user.id].some((value) => value.toLowerCase().includes(keyword));
        const matchesStatus = statusFilter === "Tất cả" || user.status === statusFilter;
        const matchesRole = roleFilter === "Tất cả" || user.role === roleFilter;
        return matchesSearch && matchesStatus && matchesRole;
      }),
    [query, statusFilter, roleFilter]
  );

  const activeUsers = users.filter((user) => user.status === "Active").length;
  const pendingUsers = users.filter((user) => user.status === "Pending").length;
  const photographers = users.filter((user) => user.role === "Photographer").length;

  return (
    <AdminLayout active="Người dùng">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#ff8d28]">Quản lý người dùng</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-[#0f172a]">Danh sách tài khoản</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#596174]">Tìm kiếm, lọc và quản lý tất cả tài khoản khách hàng, photographer và quản trị viên ngay trong một trang.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#ff8d28] px-4 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(255,141,40,0.16)] transition hover:bg-[#f47f16]">
            <AdminIcon name="add" className="h-4 w-4" />
            Thêm tài khoản
          </button>
          <IconButton label="Làm mới" icon="refresh" size="md" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Tổng tài khoản" value={formatNumber(users.length)} icon="user" description="Toàn bộ tài khoản" />
        <StatCard title="Đang hoạt động" value={formatNumber(activeUsers)} icon="check" description="Người dùng hoạt động" tone="green" />
        <StatCard title="Photographer" value={formatNumber(photographers)} icon="camera" description="Tài khoản nhiếp ảnh gia" />
        <StatCard title="Chờ phê duyệt" value={formatNumber(pendingUsers)} icon="archive" description="Tài khoản cần xác thực" tone="neutral" />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-[28px] border border-[#e7e9f1] bg-white p-5 shadow-[0_14px_34px_rgba(12,18,32,0.05)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-[420px]">
              <AdminIcon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a93a5]" />
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
                <FilterButton key={status} active={statusFilter === status} onClick={() => setStatusFilter(status)}>
                  {status}
                </FilterButton>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-[#596174]">
            <span className="rounded-full bg-[#f8fafc] px-3 py-2">{filteredUsers.length} kết quả</span>
            <span className="rounded-full bg-[#f8fafc] px-3 py-2">{roleFilter === "Tất cả" ? "Tất cả vai trò" : `Vai trò: ${roleFilter}`}</span>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-[13px]">
              <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-[0.18em] text-[#596174]">
                <tr>
                  <th className="py-4 pr-4 pl-5">Người dùng</th>
                  <th className="py-4 pr-4">Vai trò</th>
                  <th className="py-4 pr-4">Trạng thái</th>
                  <th className="py-4 pr-4 text-right">Booking</th>
                  <th className="py-4 pr-4">Hoạt động</th>
                  <th className="py-4 pr-5">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0f5]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="transition hover:bg-[#fff8ef]">
                    <td className="py-4 pr-4 pl-5">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="h-11 w-11 rounded-2xl object-cover" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#0f172a]">{user.name}</p>
                          <p className="truncate text-[#697086]">{user.email}</p>
                          <p className="mt-1 text-[11px] text-[#8a93a5]">{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 align-middle">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${roleStyles[user.role]}`}>{user.role}</span>
                    </td>
                    <td className="py-4 pr-4 align-middle">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyles[user.status]}`}>{user.status}</span>
                    </td>
                    <td className="py-4 pr-4 text-right font-semibold text-[#0f172a]">{user.bookings}</td>
                    <td className="py-4 pr-4 text-[#596174]">{user.lastSeen}</td>
                    <td className="py-4 pr-5">
                      <div className="flex justify-end gap-2">
                        <IconButton label="Xem" icon="eye" size="sm" />
                        <IconButton label="Sửa" icon="edit" size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="mt-8 rounded-[26px] border border-dashed border-[#d6dce5] bg-[#f8fafc] p-8 text-center text-sm text-[#596174]">
              Không tìm thấy người dùng phù hợp với bộ lọc.
            </div>
          ) : null}
        </section>

        <aside className="space-y-4">
          <section className="rounded-[28px] border border-[#e7e9f1] bg-white p-5 shadow-[0_14px_34px_rgba(12,18,32,0.05)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">Hoạt động mới</p>
                <p className="mt-1 text-sm text-[#596174]">Theo dõi các hành vi tài khoản gần đây.</p>
              </div>
              <IconButton label="Làm mới" icon="refresh" size="md" />
            </div>
            <div className="mt-5 space-y-4">
              <ActivityItem title="Nguyễn Hoàng Nam đặt booking mới" subtitle="10 phút trước" tone="green" />
              <ActivityItem title="Tài khoản photographer mới chờ duyệt" subtitle="1 giờ trước" tone="orange" />
              <ActivityItem title="Đăng nhập thất bại: trần.thu hà" subtitle="2 giờ trước" tone="red" />
            </div>
          </section>

          <section className="rounded-[28px] border border-[#e7e9f1] bg-white p-5 shadow-[0_14px_34px_rgba(12,18,32,0.05)]">
            <p className="text-sm font-semibold text-[#0f172a]">Báo cáo nhanh</p>
            <div className="mt-5 space-y-3 text-[13px] text-[#596174]">
              <QuickStat label="Tài khoản mới trong tuần" value="18" />
              <QuickStat label="Yêu cầu chờ xử lý" value="5" />
              <QuickStat label="Phản hồi cần xem" value="3" />
            </div>
          </section>
        </aside>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, description, icon, tone = "orange" }: { title: string; value: string; description: string; icon: string; tone?: "orange" | "green" | "neutral" }) {
  const color = tone === "green" ? "bg-emerald-50 text-emerald-600" : tone === "neutral" ? "bg-slate-50 text-slate-700" : "bg-orange-50 text-orange-500";
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

function FilterButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-2xl border px-3 py-2 text-sm font-medium transition ${active ? "border-[#ff8d28] bg-[#fff3e8] text-[#ff8d28]" : "border-[#dfe3ec] bg-white text-[#536078] hover:border-[#ff8d28] hover:text-[#ff8d28]"}`}>
      {children}
    </button>
  );
}

function ActivityItem({ title, subtitle, tone }: { title: string; subtitle: string; tone: "green" | "orange" | "red" }) {
  return (
    <div className="flex items-start gap-3 rounded-3xl border border-[#edf0f5] bg-[#fcfcff] p-4">
      <span className={`mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl ${tone === "green" ? "bg-emerald-50 text-emerald-600" : tone === "orange" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
        <AdminIcon name={tone === "green" ? "check" : tone === "orange" ? "filter" : "close"} className="h-4 w-4" />
      </span>
      <div>
        <p className="font-medium text-[#0f172a]">{title}</p>
        <p className="mt-1 text-sm text-[#697086]">{subtitle}</p>
      </div>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#edf0f5] bg-[#f8fafc] px-4 py-3">
      <span className="text-sm text-[#596174]">{label}</span>
      <span className="text-sm font-semibold text-[#0f172a]">{value}</span>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}
