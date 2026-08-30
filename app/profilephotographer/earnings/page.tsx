"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatCurrency,
  formatDate,
  getMyPhotographerProfile,
  getPhotographerBookings,
  type PhotographerBooking,
} from "../photographer-api";

export default function PhotographerEarningsPage() {
  const [bookings, setBookings] = useState<PhotographerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const profile = await getMyPhotographerProfile();
        const id = String(profile.photographer_id || profile.photographer?.id || "");
        const rows = id ? await getPhotographerBookings(id) : [];
        if (alive) setBookings(rows);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Không thể tải thu nhập.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, []);

  const summary = useMemo(() => {
    const paid = bookings.filter((item) => item.status === "fully_paid");
    const inProgress = bookings.filter((item) =>
      ["confirmed", "completed"].includes(item.status),
    );
    const gross = paid.reduce((sum, item) => sum + Number(item.estimated_total || 0), 0);
    const pending = inProgress.reduce((sum, item) => sum + Number(item.estimated_total || 0), 0);
    const platformFee = Math.round(gross * 0.1);
    const payout = Math.max(gross - platformFee, 0);
    const totalBalance = payout + pending; // Total từ cả booking hoàn thành và chưa hoàn thành
    const availableWithdraw = payout; // Số dư có thể rút (từ booking hoàn thành)
    const bookingBalance = pending; // Số dư có thể dùng để booking (từ booking chưa hoàn thành)

    return {
      gross,
      platformFee,
      payout,
      pending,
      paidCount: paid.length,
      totalBalance,
      availableWithdraw,
      bookingBalance,
    };
  }, [bookings]);

  return (
    <main className="px-6 py-7 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1080px] space-y-6 pb-10">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Thu nhập</h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi doanh thu từ các booking đã thanh toán đủ và khoản đang chờ.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Doanh thu đã chốt" value={loading ? "..." : formatCurrency(summary.gross)} />
          <Metric label="Phí sàn ước tính" value={loading ? "..." : formatCurrency(summary.platformFee)} />
          <Metric label="Dự kiến nhận" value={loading ? "..." : formatCurrency(summary.payout)} />
          <Metric label="Đang chờ hoàn tất" value={loading ? "..." : formatCurrency(summary.pending)} />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-7">
            <div>
              <h2 className="text-2xl font-bold text-[#1a1a2e]">Số dư & Rút tiền</h2>
              <p className="mt-2 text-sm text-slate-500">
                Quản lý số dư của bạn từ các booking hoàn thành và chưa hoàn thành
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="rounded-[24px] border border-[#dfeae2] bg-[#edf8f1] p-5 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1da56a] text-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v7A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5v-7Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a7d52]">Cash</p>
                </div>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a7d52]">Khả dụng để rút</p>
                <p className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[#1a7d52]">
                  {loading ? "..." : formatCurrency(summary.availableWithdraw)}
                </p>
                <p className="mt-2 text-xs text-slate-500">Từ booking đã hoàn thành</p>
              </div>

              <div className="rounded-[24px] border border-[#dfe7f5] bg-[#f1f7ff] p-5 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2f6eea] text-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2d5bc4]">Book</p>
                </div>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#2d5bc4]">Dành cho booking</p>
                <p className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[#2d5bc4]">
                  {loading ? "..." : formatCurrency(summary.bookingBalance)}
                </p>
                <p className="mt-2 text-xs text-slate-500">Chờ hoàn thành</p>
              </div>

              <div className="rounded-[24px] border border-[#e6e7eb] bg-[#f7f7f8] p-5 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f1f25] text-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9.5h8M8 13.5h8M12 5v14" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#465065]">Total</p>
                </div>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#465065]">Tổng số dư</p>
                <p className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[#1f1f25]">
                  {loading ? "..." : formatCurrency(summary.totalBalance)}
                </p>
                <p className="mt-2 text-xs text-slate-500">Tổng cộng</p>
              </div>
            </div>

            <button className="w-full rounded-2xl bg-emerald-600 px-6 py-4 font-semibold text-white shadow-md transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              Rút tiền ngay
            </button>

            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Thống kê booking</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3">
                  <span className="text-sm text-slate-600">Hoàn thành & thanh toán</span>
                  <span className="font-bold text-emerald-600">{summary.paidCount}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3">
                  <span className="text-sm text-slate-600">Đang chờ hoàn tất</span>
                  <span className="font-bold text-blue-600">
                    {bookings.filter((item) => ["confirmed", "completed"].includes(item.status)).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1a1a2e]">Lịch sử thanh toán</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {summary.paidCount} giao dịch
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {loading ? (
              <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            ) : bookings.filter((item) => item.status === "fully_paid").length ? (
              bookings
                .filter((item) => item.status === "fully_paid")
                .map((booking) => (
                  <div
                    key={booking.booking_code}
                    className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">{booking.service_name}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {booking.booking_code} · {formatDate(booking.shoot_date)}
                      </p>
                    </div>
                    <p className="text-sm font-black text-emerald-600">
                      {formatCurrency(Number(booking.estimated_total || 0) * 0.9)}
                    </p>
                  </div>
                ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                Chưa có booking nào thanh toán đủ.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[#1a1a2e]">{value}</p>
    </article>
  );
}
