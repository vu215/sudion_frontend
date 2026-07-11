"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSession, getToken, type AuthSession } from "../auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Booking = {
  id: number;
  booking_code: string;
  service_name?: string;
  photographer_name?: string;
  shoot_date?: string | null;
  shoot_time?: string | null;
  estimated_total?: number;
  status?: string;
};

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatCurrency(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function formatDate(value?: string | null) {
  if (!value) return "Chưa chọn";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

export default function UserPage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const current = getSession();
    setSession(current);

    async function load() {
      if (!current?.email) {
        setLoading(false);
        setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem lịch của bạn.");
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await fetch(
          `${API_URL}/bookings/customer/${encodeURIComponent(current.email)}`,
          {
            headers: authHeaders(),
            cache: "no-store",
          },
        );
        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.message || "Không thể tải lịch đặt.");
        }

        setBookings(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải lịch đặt.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      active: bookings.filter((item) =>
        ["awaiting_payment", "accepted", "confirmed", "completed"].includes(item.status || ""),
      ).length,
      paid: bookings.filter((item) => item.status === "fully_paid").length,
      spending: bookings.reduce((sum, item) => sum + Number(item.estimated_total || 0), 0),
    };
  }, [bookings]);

  const avatarText = (session?.fullName || session?.email || "U").slice(0, 1).toUpperCase();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-orange-50 to-white/95 px-4 py-8 sm:px-6 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-white bg-[#ff8d28] text-3xl font-black text-white shadow-md">
              {avatarText}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {session?.fullName || "Tài khoản khách hàng"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {session?.email || "Chưa đăng nhập"} · {session?.role || "customer"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/notification"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Thông báo
            </Link>
            <Link
              href="/photographer"
              className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600"
            >
              Tạo đặt lịch
            </Link>
          </div>
        </header>

        {error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Tổng quan</h2>
              <p className="mt-2 text-sm text-slate-500">
                Theo dõi lịch đặt, thanh toán và các booking đang xử lý.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <Stat label="Tổng booking" value={loading ? "..." : String(stats.total)} />
                <Stat label="Đang xử lý" value={loading ? "..." : String(stats.active)} />
                <Stat label="Hoàn tất" value={loading ? "..." : String(stats.paid)} />
                <Stat label="Tổng giá trị" value={loading ? "..." : formatCurrency(stats.spending)} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-500">Booking</p>
                  <h3 className="text-lg font-semibold text-slate-900">Lịch đặt của bạn</h3>
                </div>
                <Link href="/bookings" className="text-sm font-semibold text-orange-500">
                  Xem tất cả
                </Link>
              </div>

              <div className="mt-4">
                {loading ? (
                  <div className="grid gap-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-16 animate-pulse rounded-lg bg-slate-100" />
                    ))}
                  </div>
                ) : bookings.length ? (
                  <ul className="space-y-2">
                    {bookings.slice(0, 5).map((booking) => (
                      <li
                        key={booking.booking_code || booking.id}
                        className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {booking.service_name || "Booking dịch vụ"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {booking.booking_code} · {booking.photographer_name || "Photographer"} · {formatDate(booking.shoot_date)}
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-slate-600">
                          {booking.status || "Chi tiết"}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Bạn chưa có booking nào. Hãy chọn photographer để bắt đầu đặt lịch.
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">Tài khoản</h4>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>Họ tên: <b>{session?.fullName || "Chưa có"}</b></p>
                <p>Email: <b>{session?.email || "Chưa có"}</b></p>
                <p>Vai trò: <b>{session?.role || "customer"}</b></p>
              </div>
              <Link
                href="/profile"
                className="mt-4 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
              >
                Cập nhật hồ sơ
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">Mẹo nhanh</h4>
              <p className="mt-2 text-sm text-slate-500">
                Sau khi photographer xác nhận lịch và bạn thanh toán cọc, tính năng chat sẽ được mở.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
