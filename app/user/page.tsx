"use client";

import React, { useEffect, useState } from "react";
import { getSession } from "../auth-store";

const Avatar = ({ src, alt }: { src: string; alt: string }) => (
  <img
    src={src}
    alt={alt}
    className="h-20 w-20 rounded-full border-2 border-white object-cover shadow-md"
  />
);

function IconBell({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

const mockUser = {
  name: "Nguyễn Minh Anh",
  role: "Khách hàng",
  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  location: "Hà Nội, Việt Nam",
};

let upcoming = [
  { id: 1, title: "Chụp ảnh tạp chí", date: "05/07/2026", time: "10:00" },
  { id: 2, title: "Chụp ảnh sản phẩm", date: "12/07/2026", time: "14:30" },
];

const favorites = [
  { id: "f1", name: "Portrait Pro - 2h", price: "$250" },
  { id: "f2", name: "Interior Premium", price: "$600" },
];

export default function UserPage() {
  const [bookings, setBookings] = useState<typeof upcoming | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = getSession();

  useEffect(() => {
    async function load() {
      const session = getSession();
      if (!session) {
        setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem lịch của bạn.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_URL}/bookings?userId=${encodeURIComponent(session.userId)}`);
        if (!res.ok) throw new Error(`Server trả về ${res.status}`);
        const payload = await res.json();

        // Expect payload.data or payload.bookings or raw array
        const list = payload?.data || payload?.bookings || payload || [];
        if (Array.isArray(list)) {
          setBookings(list);
        } else {
          setBookings([]);
        }
      } catch (err: any) {
        setError(err?.message || "Không thể tải lịch.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-orange-50 to-white/95 py-8 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar src={mockUser.avatar} alt={mockUser.name} />
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{mockUser.name}</h1>
              <p className="mt-1 text-sm text-slate-500">{mockUser.role} • {mockUser.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
              <IconBell className="h-5 w-5 text-slate-600" />
              Thông báo
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">3</span>
            </button>
            <button className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600">Tạo đặt lịch</button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Tổng quan</h2>
              <p className="mt-2 text-sm text-slate-500">Xem nhanh lịch trình, yêu thích và hoạt động gần đây của bạn.</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-100 bg-gradient-to-br from-orange-50 to-white p-4">
                  <p className="text-sm text-slate-500">Booking sắp tới</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{upcoming.length}</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-white p-4">
                  <p className="text-sm text-slate-500">Dịch vụ đã lưu</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{favorites.length}</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-white p-4">
                  <p className="text-sm text-slate-500">Xếp hạng</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">4.9</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-500">Tài khoản</p>
                  <h3 className="text-lg font-semibold text-slate-900">Thông tin cá nhân</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-sm font-medium text-slate-600 hover:underline">Chỉnh sửa</button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-4">
                  <img src={mockUser.avatar} alt={mockUser.name} className="h-16 w-16 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-slate-900">{session?.fullName || mockUser.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{session?.email || "--@--.com"}</p>
                    <p className="mt-1 text-sm text-slate-500">{mockUser.location}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="text-sm text-slate-500">Vai trò</p>
                    <p className="font-medium text-slate-900 mt-1">{session?.role || mockUser.role}</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="text-sm text-slate-500">Tùy chọn</p>
                    <div className="mt-2 flex gap-2">
                      <button className="rounded-md bg-orange-500 px-3 py-1 text-sm font-semibold text-white">Tạo booking</button>
                      <button className="rounded-md border border-slate-200 px-3 py-1 text-sm">Cài đặt</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">Lịch đặt của bạn</h4>
                  <p className="text-sm text-slate-500">Cập nhật tự động</p>
                </div>

                <div className="mt-3">
                  {loading && <p className="text-sm text-slate-500">Đang tải lịch...</p>}
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  {!loading && !error && (
                    <ul className="space-y-2">
                      {(bookings ?? upcoming).slice(0, 3).map((b: any) => (
                        <li key={b.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                          <div>
                            <p className="font-medium text-slate-900">{b.title || b.service_name || "Untitled"}</p>
                            <p className="mt-1 text-sm text-slate-500">{b.date || b.start_date || "-"} • {b.time || b.start_time || "-"}</p>
                          </div>
                          <div className="text-sm text-slate-600">{b.status || "Chi tiết"}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">Yêu thích của bạn</h4>
              <ul className="mt-3 space-y-2">
                {favorites.map((f) => (
                  <li key={f.id} className="flex items-center justify-between rounded-md bg-slate-50 p-2">
                    <div>
                      <p className="font-medium text-slate-900">{f.name}</p>
                      <p className="text-sm text-slate-500">{f.price}</p>
                    </div>
                    <button className="text-sm text-orange-500 font-semibold">Đặt ngay</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">Mẹo nhanh</h4>
              <p className="mt-2 text-sm text-slate-500">Cập nhật hồ sơ và sử dụng bộ lọc để tìm nhiếp ảnh gia phù hợp với nhu cầu.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
