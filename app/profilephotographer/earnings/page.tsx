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

    return {
      gross,
      platformFee,
      payout: Math.max(gross - platformFee, 0),
      pending,
      paidCount: paid.length,
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
