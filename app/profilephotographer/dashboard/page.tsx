"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/auth-context";
import { getBookingsByPhotographer, getReviewsByPhotographer, type BookingItem, type ReviewItem } from "../api";

/* ── Helpers ────────────────────────────────────────────── */
function fmtDate(v: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleDateString("vi-VN");
}
function fmtTime(v: string | null) {
  return v ? String(v).slice(0, 5) : "—";
}
function fmtMoney(v: number) {
  return v.toLocaleString("vi-VN") + "đ";
}
function isUpcoming(shoot_date: string | null) {
  if (!shoot_date) return false;
  return new Date(shoot_date) >= new Date(new Date().toDateString());
}

/* ── Status badge ───────────────────────────────────────── */
const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  awaiting_payment: { bg: "bg-orange-100", text: "text-orange-600", label: "Chờ xác nhận" },
  accepted:         { bg: "bg-blue-100",   text: "text-blue-600",   label: "Chờ khách cọc" },
  confirmed:        { bg: "bg-emerald-100",text: "text-emerald-700",label: "Đã xác nhận" },
  completed:        { bg: "bg-yellow-100", text: "text-yellow-700", label: "Chờ thanh toán" },
  fully_paid:       { bg: "bg-green-100",  text: "text-green-700",  label: "Đã thanh toán đủ" },
  rejected:         { bg: "bg-red-100",    text: "text-red-600",    label: "Đã từ chối" },
  cancelled:        { bg: "bg-slate-100",  text: "text-slate-500",  label: "Đã hủy" },
};
function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { bg: "bg-slate-100", text: "text-slate-500", label: status };
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

/* ── Stat card ──────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, subGreen = true }: {
  icon: string; label: string; value: string; sub: string; subGreen?: boolean;
}) {
  return (
    <article className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xl">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-400 truncate">{label}</p>
        <p className="mt-0.5 text-[20px] font-bold text-slate-800 leading-tight truncate">{value}</p>
        <p className={`text-[11px] font-semibold ${subGreen ? "text-emerald-500" : "text-slate-400"}`}>{sub}</p>
      </div>
    </article>
  );
}

/* ── Mini Calendar ──────────────────────────────────────── */
const DOW = ["T2","T3","T4","T5","T6","T7","CN"];

function MiniCalendar({ bookedDays }: { bookedDays: number[] }) {
  const today = new Date();
  const [cur, setCur] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const y = cur.getFullYear(), m = cur.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  let startDow = new Date(y, m, 1).getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  const cells: (number | null)[] = [...Array(startDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const sameMonth = today.getMonth() === m && today.getFullYear() === y;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => setCur(new Date(y, m - 1, 1))}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-bold text-slate-700">Tháng {m + 1}, {y}</span>
        <button onClick={() => setCur(new Date(y, m + 1, 1))}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {DOW.map((d) => <div key={d} className="py-1 text-[10px] font-bold text-slate-400">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const isToday = sameMonth && day === today.getDate();
          const isBooked = bookedDays.includes(day);
          return (
            <div key={day}
              className={`relative mx-auto flex h-7 w-7 cursor-pointer select-none items-center justify-center rounded-full text-xs font-semibold transition
                ${isToday ? "bg-orange-500 text-white font-bold" : "text-slate-600 hover:bg-orange-50"}`}>
              {day}
              {isBooked && !isToday && (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-orange-400" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Revenue Sparkline ──────────────────────────────────── */
function RevenueChart({ data }: { data: number[] }) {
  if (!data.length) return <div className="h-20 rounded-xl bg-slate-50 animate-pulse" />;
  const max = Math.max(...data, 1);
  const W = 260, H = 80, P = 4;
  const stepX = (W - P * 2) / (data.length - 1);
  const sy = (v: number) => H - P - (v / max) * (H - P * 2);
  const lineD = data.map((v, i) => `${i === 0 ? "M" : "L"}${P + i * stepX},${sy(v)}`).join(" ");
  const areaD = `${lineD} L${P + (data.length - 1) * stepX},${H} L${P},${H} Z`;
  const xLabels = ["1/6","8/6","15/6","22/6","30/6"];
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#rg)" />
        <path d={lineD} fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        {xLabels.map((l) => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

/* ── Avatar colours ─────────────────────────────────────── */
const AVT = ["bg-orange-100 text-orange-600","bg-blue-100 text-blue-600","bg-emerald-100 text-emerald-600","bg-purple-100 text-purple-600","bg-pink-100 text-pink-600"];

/* ── Main Page ──────────────────────────────────────────── */
export default function DashboardPage() {
  const { session, isPhotographer } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const photographerId = useMemo(() => {
    if (isPhotographer && session?.photographerId) return session.photographerId;
    if (typeof window !== "undefined") return window.localStorage.getItem("sudion_photographer_id") ?? "";
    return "";
  }, [isPhotographer, session]);

  useEffect(() => {
    if (!photographerId) return;
    setLoading(true);
    setError("");

    Promise.all([
      getBookingsByPhotographer(photographerId),
      getReviewsByPhotographer(photographerId),
    ])
      .then(([bookingData, reviewData]) => {
        setBookings(bookingData);
        setReviews(reviewData);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu.");
        setBookings([]);
        setReviews([]);
      })
      .finally(() => setLoading(false));
  }, [photographerId]);

  /* ── Computed stats ── */
  const stats = useMemo(() => {
    const total = bookings.length;
    const upcoming = bookings.filter((b) => isUpcoming(b.shoot_date) && !["rejected","cancelled"].includes(b.status)).length;
    const completed = bookings.filter((b) => ["fully_paid","completed"].includes(b.status)).length;
    const revenue = bookings
      .filter((b) => b.status === "fully_paid")
      .reduce((s, b) => s + (b.estimated_total ?? 0), 0);
    return { total, upcoming, completed, revenue };
  }, [bookings]);

  /* ── Upcoming bookings (next 5) ── */
  const upcomingList = useMemo(() =>
    bookings
      .filter((b) => isUpcoming(b.shoot_date) && !["rejected","cancelled"].includes(b.status))
      .sort((a, b) => (a.shoot_date ?? "").localeCompare(b.shoot_date ?? ""))
      .slice(0, 5),
    [bookings]
  );

  /* ── Calendar: booked days in current month ── */
  const today = new Date();
  const bookedDays = useMemo(() =>
    bookings
      .filter((b) => {
        if (!b.shoot_date) return false;
        const d = new Date(b.shoot_date);
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      })
      .map((b) => new Date(b.shoot_date!).getDate()),
    [bookings]
  );

  /* ── Revenue chart data — actual daily revenue for the last 14 days ── */
  const chartData = useMemo(() => {
    const days = 14;
    const now = new Date();

    return Array.from({ length: days }, (_, idx) => {
      const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1 - idx));
      return bookings
        .filter((b) => b.status === "fully_paid" && b.shoot_date && new Date(b.shoot_date).toDateString() === target.toDateString())
        .reduce((sum, b) => sum + (b.estimated_total ?? 0), 0);
    });
  }, [bookings]);

  const latestReview = useMemo(() => {
    if (!reviews.length) return null;
    return [...reviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  }, [reviews]);

  const name = session?.fullName ?? "Photographer";

  return (
    <div className="px-5 py-6 lg:px-8">
      <div className="mx-auto max-w-[1160px]">
        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* ── LEFT ── */}
          <div className="space-y-5">
            {/* Greeting */}
            <div>
              <h1 className="text-[22px] font-bold text-slate-800">Xin chào, {name}! 👋</h1>
              <p className="mt-0.5 text-sm text-slate-400">Đây là tổng quan về công việc của bạn hôm nay.</p>
            </div>

            {/* Stats */}
            <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <StatCard icon="📷" label="Tổng booking" value={loading ? "..." : String(stats.total)} sub={stats.total ? "Từ trước tới nay" : "Chưa có dữ liệu"} />
              <StatCard icon="🗓️" label="Sắp tới" value={loading ? "..." : String(stats.upcoming)} sub={stats.upcoming ? "Lịch chưa diễn ra" : "Không có lịch"} />
              <StatCard icon="✅" label="Hoàn thành" value={loading ? "..." : String(stats.completed)} sub={stats.completed ? "Đã hoàn tất" : "Chưa có"} />
              <StatCard icon="💰" label="Doanh thu" value={loading ? "..." : fmtMoney(stats.revenue)} sub={stats.revenue ? "↑ Đã thanh toán đủ" : "Chưa có doanh thu"} />
            </section>

            {/* Upcoming bookings */}
            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-800">Bookings sắp tới</h2>
                <Link href="/profilephotographer/bookings" className="text-xs font-semibold text-orange-500 hover:underline">
                  Xem tất cả
                </Link>
              </div>
              {loading ? (
                <div className="space-y-2 p-4">
                  {[1,2,3].map(i => <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100" />)}
                </div>
              ) : upcomingList.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-400">
                  {photographerId ? "Không có lịch sắp tới." : "Nhập Photographer ID để xem booking."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="px-5 py-3 text-left">Khách hàng</th>
                        <th className="px-3 py-3 text-left">Dịch vụ</th>
                        <th className="px-3 py-3 text-left">Ngày giờ</th>
                        <th className="px-3 py-3 text-left">Địa điểm</th>
                        <th className="px-3 py-3 text-left">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingList.map((b, i) => (
                        <tr key={b.booking_code} className="border-b border-slate-50 hover:bg-slate-50 transition">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${AVT[i % AVT.length]}`}>
                                {b.customer_full_name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-700">{b.customer_full_name}</p>
                                <p className="text-[10px] text-slate-400">{b.customer_phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-600">{b.service_name}</td>
                          <td className="px-3 py-3 text-xs font-semibold text-slate-700">
                            {fmtDate(b.shoot_date)}<br />
                            <span className="font-normal text-slate-400">{fmtTime(b.shoot_time)}</span>
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-500">{b.location || "—"}</td>
                          <td className="px-3 py-3"><StatusBadge status={b.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white shadow-sm px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-800">Đánh giá mới nhất</h2>
                <Link href="/profilephotographer/reviews" className="text-xs font-semibold text-orange-500 hover:underline">Xem tất cả</Link>
              </div>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                </div>
              ) : latestReview ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                      {latestReview.customer_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{latestReview.customer_name}</p>
                      <p className="text-[10px] text-slate-400">{new Date(latestReview.created_at).toLocaleDateString("vi-VN")}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-800">{latestReview.rating} sao</p>
                    <p className="mt-2 leading-6">{latestReview.comment || "Không có nhận xét."}</p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-400">Chưa có đánh giá nào. Khách hàng sẽ gửi đánh giá sau khi booking hoàn tất.</div>
              )}
            </section>
          </div>

          {/* ── RIGHT ── */}
          <div className="space-y-5">
            {/* Calendar */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Lịch làm việc</h3>
              <MiniCalendar bookedDays={bookedDays} />
            </div>

            {/* Revenue */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="text-sm font-bold text-slate-800">Doanh thu tháng</h3>
                <span className="text-xs text-slate-400">Tháng 6 ▾</span>
              </div>
              <p className="text-xl font-bold text-slate-800">{fmtMoney(stats.revenue)}</p>
              <p className="mb-3 text-xs font-semibold text-emerald-500">↑ Cập nhật từ booking đã thanh toán đủ</p>
              <RevenueChart data={chartData} />
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Thao tác nhanh</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { icon: "➕", label: "Thêm dịch vụ",   href: "/profilephotographer/services" },
                  { icon: "📅", label: "Thêm lịch trống", href: "/profilephotographer/bookings" },
                  { icon: "🏷️", label: "Tạo ưu đãi",     href: "/profilephotographer/services" },
                  { icon: "✉️", label: "Gửi tin nhắn",   href: "/profilephotographer/messages" },
                ].map((a) => (
                  <Link key={a.label} href={a.href}
                    className="group flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 px-1 py-3 hover:bg-orange-50 transition">
                    <span className="text-xl">{a.icon}</span>
                    <span className="text-[10px] font-semibold leading-tight text-slate-500 group-hover:text-orange-500">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Link to bookings if no id */}
            {!photographerId && (
              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm text-orange-700">
                <p className="font-bold">Chưa liên kết Photographer ID</p>
                <p className="mt-1 text-xs leading-5">Vào trang Bookings để nhập ID và tải dữ liệu booking của bạn.</p>
                <Link href="/profilephotographer/bookings"
                  className="mt-2 inline-block rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 transition">
                  Đi tới Bookings
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
