"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  formatCurrency,
  formatDate,
  getMyPhotographerProfile,
  getPhotographerBookings,
  type PhotographerBooking,
  type PhotographerProfile,
} from "../photographer-api";

export default function PhotographerDashboardPage() {
  const [profile, setProfile] = useState<PhotographerProfile | null>(null);
  const [bookings, setBookings] = useState<PhotographerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const me = await getMyPhotographerProfile();
        const photographerId = String(me.photographer_id || me.photographer?.id || "");
        const bookingRows = photographerId
          ? await getPhotographerBookings(photographerId)
          : [];

        if (!alive) return;
        setProfile(me);
        setBookings(bookingRows);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Không thể tải dashboard.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();

    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const paid = bookings.filter((item) =>
      ["fully_paid", "completed", "confirmed"].includes(item.status),
    );

    return {
      today: bookings.filter((item) => String(item.shoot_date || "").slice(0, 10) === today).length,
      monthRevenue: paid.reduce((sum, item) => sum + Number(item.estimated_total || 0), 0),
      active: bookings.filter((item) =>
        ["awaiting_payment", "accepted", "confirmed", "completed"].includes(item.status),
      ).length,
      paid: bookings.filter((item) => item.status === "fully_paid").length,
    };
  }, [bookings]);

  const recent = bookings.slice(0, 5);

  return (
    <main className="px-6 py-7 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1080px] space-y-6 pb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">
              {profile?.photographer?.full_name || "Bảng điều khiển"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Tổng quan hoạt động booking, doanh thu và trạng thái hồ sơ.
            </p>
          </div>
          <Link
            href="/profilephotographer/bookings"
            className="w-fit rounded-xl bg-[#ff8d28] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e07820]"
          >
            Quản lý booking
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Đặt lịch hôm nay" value={loading ? "..." : String(stats.today)} />
          <Stat label="Doanh thu ghi nhận" value={loading ? "..." : formatCurrency(stats.monthRevenue)} />
          <Stat label="Đơn đang xử lý" value={loading ? "..." : String(stats.active)} />
          <Stat label="Đã thanh toán đủ" value={loading ? "..." : String(stats.paid)} />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1a1a2e]">Hoạt động gần đây</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {bookings.length} booking
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
              ))
            ) : recent.length ? (
              recent.map((booking) => (
                <Link
                  key={booking.booking_code}
                  href="/profilephotographer/bookings"
                  className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-orange-200 hover:bg-orange-50/40 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{booking.service_name}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {booking.booking_code} · {booking.customer_full_name} · {formatDate(booking.shoot_date)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-black text-[#ff8d28]">
                      {formatCurrency(booking.estimated_total)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{booking.status}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                Chưa có booking mới. Khi khách đặt lịch, hoạt động sẽ hiển thị tại đây.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[#1a1a2e]">{value}</p>
    </article>
  );
}
