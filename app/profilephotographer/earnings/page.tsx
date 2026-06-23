"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/auth-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Booking = {
  id: number;
  booking_code: string;
  service_name: string;
  shoot_date: string | null;
  estimated_total: number;
  deposit_amount: number;
  remaining_amount: number;
  status: string;
  customer_full_name: string;
};
type ApiResponse<T> = { success: boolean; message: string; data: T };

function fmtMoney(v: number) { return v.toLocaleString("vi-VN") + "đ"; }
function fmtDate(v: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleDateString("vi-VN");
}

async function fetchBookings(photographerId: string): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/bookings/photographer/${encodeURIComponent(photographerId)}`, { cache: "no-store" });
  const json: ApiResponse<Booking[]> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message);
  return json.data;
}

const STATUS_LABEL: Record<string, string> = {
  fully_paid: "Đã thanh toán đủ",
  completed: "Hoàn thành",
  confirmed: "Đã cọc",
  accepted: "Chờ cọc",
  awaiting_payment: "Chờ xác nhận",
  rejected: "Từ chối",
  cancelled: "Đã hủy",
};
const STATUS_STYLE: Record<string, string> = {
  fully_paid: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  accepted: "bg-blue-50 text-blue-500",
  awaiting_payment: "bg-orange-100 text-orange-600",
  rejected: "bg-red-100 text-red-500",
  cancelled: "bg-slate-100 text-slate-400",
};

// Mini bar chart
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md bg-orange-400 transition-all"
            style={{ height: `${Math.max(4, (d.value / max) * 72)}px` }}
          />
          <span className="text-[9px] text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function PhotographerEarningsPage() {
  const { session, isPhotographer } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "fully_paid" | "confirmed">("all");

  const photographerId = useMemo(() => {
    if (isPhotographer && session?.photographerId) return session.photographerId;
    if (typeof window !== "undefined") return window.localStorage.getItem("sudion_photographer_id") ?? "";
    return "";
  }, [isPhotographer, session]);

  useEffect(() => {
    if (!photographerId) return;
    setLoading(true);
    fetchBookings(photographerId)
      .then((data) => { setBookings(data); setError(""); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [photographerId]);

  const stats = useMemo(() => {
    const paid = bookings.filter((b) => b.status === "fully_paid");
    const deposited = bookings.filter((b) => ["confirmed", "completed", "fully_paid"].includes(b.status));
    const totalRevenue = paid.reduce((s, b) => s + (b.estimated_total ?? 0), 0);
    const depositRevenue = deposited.reduce((s, b) => s + (b.deposit_amount ?? 0), 0);
    const pendingRevenue = bookings
      .filter((b) => b.status === "completed")
      .reduce((s, b) => s + (b.remaining_amount ?? 0), 0);
    return { totalRevenue, depositRevenue, pendingRevenue, totalBookings: bookings.length };
  }, [bookings]);

  // Monthly breakdown (last 6 months)
  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = `T${d.getMonth() + 1}`;
      const value = bookings
        .filter((b) => {
          if (b.status !== "fully_paid" || !b.shoot_date) return false;
          const bd = new Date(b.shoot_date);
          return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
        })
        .reduce((s, b) => s + (b.estimated_total ?? 0), 0);
      return { label, value };
    });
  }, [bookings]);

  const filtered = useMemo(() => {
    if (filter === "all") return bookings.filter((b) => !["rejected","cancelled"].includes(b.status));
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  return (
    <div className="px-5 py-6 lg:px-8">
      <div className="mx-auto max-w-[1100px] space-y-6 pb-10">
        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500">Doanh thu</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">Thu nhập & lịch sử thanh toán</h1>
          <p className="mt-1 text-sm text-slate-400">Theo dõi doanh thu từ các booking đã hoàn tất.</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            { label: "Tổng doanh thu", value: fmtMoney(stats.totalRevenue), icon: "💰", note: "Đã thanh toán đủ" },
            { label: "Tiền cọc đã nhận", value: fmtMoney(stats.depositRevenue), icon: "🏦", note: "Tất cả booking cọc" },
            { label: "Chờ thanh toán", value: fmtMoney(stats.pendingRevenue), icon: "⏳", note: "Còn lại chưa thu" },
            { label: "Tổng đơn", value: String(stats.totalBookings), icon: "📋", note: "Tất cả trạng thái" },
          ].map((s) => (
            <article key={s.label} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xl">{s.icon}</div>
              <div>
                <p className="text-[11px] text-slate-400">{s.label}</p>
                <p className="text-lg font-bold text-slate-800">{loading ? "..." : s.value}</p>
                <p className="text-[10px] text-slate-400">{s.note}</p>
              </div>
            </article>
          ))}
        </section>

        {/* Chart + breakdown */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-800">Doanh thu 6 tháng gần nhất</h2>
            {loading ? <div className="h-20 animate-pulse rounded-xl bg-slate-100" /> : <BarChart data={monthlyData} />}
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-800">Tóm tắt</h2>
            <div className="space-y-2.5">
              {[
                { label: "Booking đã hoàn tất (fully_paid)", value: bookings.filter((b) => b.status === "fully_paid").length },
                { label: "Đang chờ thanh toán còn lại", value: bookings.filter((b) => b.status === "completed").length },
                { label: "Đã cọc, chưa chụp", value: bookings.filter((b) => b.status === "confirmed").length },
                { label: "Đã từ chối / hủy", value: bookings.filter((b) => ["rejected","cancelled"].includes(b.status)).length },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                  <span className="text-xs text-slate-500">{r.label}</span>
                  <span className="text-sm font-bold text-slate-700">{loading ? "..." : r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History table */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-bold text-slate-800">Lịch sử thanh toán</h2>
            <div className="flex gap-1.5">
              {(["all","fully_paid","confirmed"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${filter === f ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                  {f === "all" ? "Tất cả" : f === "fully_paid" ? "Đã hoàn tất" : "Đã cọc"}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="space-y-2 p-4">
              {[1,2,3].map(i => <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">
              {photographerId ? "Chưa có dữ liệu thanh toán." : "Nhập Photographer ID để xem dữ liệu."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3 text-left">Mã booking</th>
                    <th className="px-3 py-3 text-left">Khách hàng</th>
                    <th className="px-3 py-3 text-left">Dịch vụ</th>
                    <th className="px-3 py-3 text-left">Ngày chụp</th>
                    <th className="px-3 py-3 text-right">Tổng tiền</th>
                    <th className="px-3 py-3 text-right">Đã nhận</th>
                    <th className="px-3 py-3 text-left">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => {
                    const received = ["fully_paid"].includes(b.status) ? b.estimated_total : ["confirmed","completed"].includes(b.status) ? b.deposit_amount : 0;
                    return (
                      <tr key={b.booking_code} className="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td className="px-5 py-3 text-xs font-bold text-orange-500">{b.booking_code}</td>
                        <td className="px-3 py-3 text-xs text-slate-600">{b.customer_full_name}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{b.service_name}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{fmtDate(b.shoot_date)}</td>
                        <td className="px-3 py-3 text-right text-xs font-semibold text-slate-700">{fmtMoney(b.estimated_total)}</td>
                        <td className="px-3 py-3 text-right text-xs font-bold text-emerald-600">{fmtMoney(received)}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_STYLE[b.status] ?? "bg-slate-100 text-slate-400"}`}>
                            {STATUS_LABEL[b.status] ?? b.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
